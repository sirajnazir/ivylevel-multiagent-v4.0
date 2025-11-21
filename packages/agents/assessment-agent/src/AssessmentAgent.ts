import { AssessmentInput_v1 } from '../../../schema/assessmentInput_v1';
import { AssessmentOutput_v1 } from '../../../schema/assessmentOutput_v1';
import { AssessmentOutput_v2, assessmentOutputSchema_v2 } from '../../../schema/assessmentOutput_v2';
import { AssessmentInternalState_v1 } from '../../../schema/assessmentInternalState_v1';
import { ExtractedProfile_v2, extractedProfileSchema_v2 } from '../../../schema/extractedProfile_v2';
import { OracleResults_v2 } from '../../../schema/oracleResults_v2';
import { NarrativeBlocks_v2 } from '../../../schema/narrativeBlocks_v2';
import { StrategyBlocks_v2, strategyBlocksSchema_v2 } from '../../../schema/strategyBlocks_v2';
import { StudentTypeClassification, StudentTypeInput } from '../../../schema/studentType_v1';
import { EQTonePlan } from '../../../schema/eqTonePlan_v1';
import { ChatTurnResponse, ChatMessage } from '../../../schema/chatTurnResponse_v1';
import { ConversationMemory_v1, initializeConversationMemory } from '../../../schema/conversationMemory_v1';
import { ToneInstruction_v1 } from '../../../schema/toneInstruction_v1';
import { PersonaInstruction_v3 } from '../../../schema/coachPersona_v3';
import { runLLMExtraction, safeJsonParse } from '../../../llm';
import { runAptitudeOracle, runPassionOracle, runServiceOracle } from '../../../adapters/v3-intelligence-oracles';
import { retrieveAssessmentContext } from '../../../rag/assessmentRag';
import { classifyStudentType } from './classifiers/studentTypeClassifier';
import { buildEQTonePlan } from './eqModulationEngine';
import { generateEQIntegratedResponse } from './responseGenerator';
import { updateConversationMemory } from './updateConversationMemory';
import { generateToneInstruction } from './eqFeedbackLoop';
import { correctToneIfNeeded } from './toneDriftCorrector';
import { buildJennyPersonaInstruction } from './personaComposer';
import { detectPersonaDrift, shouldRewriteMessage } from './personaDriftAlert';
import { EQRuntime, buildStyleOverlay } from './eqRuntime';
import { MomentumEngine } from '../../../eq/momentumEngine';
import { StructuringEngine } from '../../../eq/structuringEngine';
import { MicroCoachingEngine, buildCoachingHints } from '../../../eq/microCoachingEngine';
import { ToneModulationEngine, convertEQStateForTone, convertArchetypeToProfile, buildToneHints } from '../../../eq/toneModulationEngine';
import { JennyPhrasebankEngine, buildStyleHints } from '../../../eq/jennyPhrasebankEngine';
import { JennyRewriter, RewriteOptions, EmotionalState, RhythmPacing, ArchetypeLabel } from '../../../eq/jennyRhythm';
import { JennyVocabEngine, VocabTransformOptions, VocabContext, VocabMode } from '../../../eq/jennyVocab';
import { PersonaEmbeddingEngine, PersonaRetrievalContext, createDefaultConfig } from '../../../persona';
import { runPersonaTuner, checkDriftOnly as checkPersonaDriftOnly, getPersonaDriftStats } from '../../../../scripts/persona_weights';
import {
  detectStudentArchetype,
  detectStudentArchetypeLLM,
  detectArchetypeHybrid,
  buildModulationEnvelope,
  getModulationSummary,
  type DetectedArchetype,
  type ModulationEnvelope
} from '../../../persona/archetype_modulation';
import {
  generateAssessmentTurn,
  getPhaseObjectives,
  createInitialDataStatus,
  fsmStageToDialoguePhase,
  dialoguePhaseToFSMStage,
  type AssessmentPhase,
  type MessageTurn,
  type DataCollectionStatus,
  type DialogueEngineInput,
  type DialogueEngineOutput
} from '../dialogue';
import {
  AssessmentSessionFSM,
  type AssessmentStage,
  type StageTransitionResult
} from '../session';

class AssessmentAgent {
  private state: AssessmentInternalState_v1;
  private input: AssessmentInput_v1;
  private chatHistory: ChatMessage[];
  private conversationMemory: ConversationMemory_v1;
  private lastToneInstruction?: ToneInstruction_v1;
  private lastPersonaInstruction?: PersonaInstruction_v3;
  private eqRuntime: EQRuntime;
  private momentum: MomentumEngine;
  private structuring: StructuringEngine;
  private microcoach: MicroCoachingEngine;
  private toneEngine: ToneModulationEngine;
  private jennyPhrasebank: JennyPhrasebankEngine;
  private jennyRewriter: JennyRewriter;
  private jennyVocab: JennyVocabEngine;
  private personaEngine: PersonaEmbeddingEngine;
  private detectedArchetype?: DetectedArchetype;
  private modulationEnvelope?: ModulationEnvelope;
  private currentPhase: AssessmentPhase;
  private dataCollectionStatus: DataCollectionStatus;
  private sessionFSM: AssessmentSessionFSM;

  constructor(input: AssessmentInput_v1) {
    this.input = input;
    this.state = {};
    this.chatHistory = [];
    this.conversationMemory = initializeConversationMemory();
    this.lastToneInstruction = undefined;
    this.lastPersonaInstruction = undefined;
    this.eqRuntime = new EQRuntime();
    this.momentum = new MomentumEngine();
    this.structuring = new StructuringEngine();
    this.microcoach = new MicroCoachingEngine();
    this.toneEngine = new ToneModulationEngine();
    this.jennyPhrasebank = new JennyPhrasebankEngine();
    this.jennyRewriter = new JennyRewriter();
    this.jennyVocab = new JennyVocabEngine();

    // Initialize persona engine with Jenny's data
    const personaConfig = createDefaultConfig('jenny', './data/personas/jenny');
    this.personaEngine = new PersonaEmbeddingEngine(personaConfig);

    // Initialize Component 45 - Dialogue Engine state
    this.currentPhase = 'rapport_and_safety';
    this.dataCollectionStatus = createInitialDataStatus();

    // Initialize Component 46 - Assessment Session FSM
    this.sessionFSM = new AssessmentSessionFSM();
  }

  initialize(): void {
    this.state.step = 'init';
    console.log('[AssessmentAgent] Initialized');
    console.log('[AssessmentAgent] Conversation memory initialized');
  }

  /**
   * Extract student profile from transcript and context documents
   * Uses LLM extraction with structured JSON output
   * Validates against ExtractedProfile_v2 schema
   */
  async extractProfile(): Promise<ExtractedProfile_v2> {
    console.log('[AssessmentAgent] Starting profile extraction');

    try {
      // Step 1: Prepare LLM prompt context
      const { rawMessages, transcriptText } = this.input;

      // Step 1.5: Optional RAG context retrieval
      // Retrieve relevant context from knowledge base for profile extraction
      const ragChunks = await retrieveAssessmentContext(
        `Student profile extraction: focus on ${this.input.studentId}`,
        {
          studentId: this.input.studentId,
          topicTags: ['assessment', 'diagnostic']
        },
        {
          topKInitial: 12,
          topKReranked: 5,
          includeEQ: false // Phase 1: default to base namespaces only
        }
      );

      // Enhanced RAG logging for Phase 1 MVP
      const eqChunks = ragChunks.filter(c => c.metadata?.chip_family === 'eq').length;
      console.log(
        `[RAG] student=${this.input.studentId} chunks=${ragChunks.length} eqChunks=${eqChunks}`
      );
      console.log(`[AssessmentAgent] Retrieved ${ragChunks.length} RAG context chunks`);

      // Step 2: Call LLM extraction wrapper
      const llmResponse = await runLLMExtraction({
        rawMessages: rawMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        transcriptText,
        maxRetries: 1,
        temperature: 0.3,
      });

      console.log('[AssessmentAgent] LLM extraction completed, parsing response');

      // Step 3: Parse and validate JSON response
      const parseResult = safeJsonParse(
        llmResponse,
        extractedProfileSchema_v2,
        { logErrors: true }
      );

      if (!parseResult.success) {
        throw new Error(
          `Profile extraction failed: ${parseResult.error}\nRaw input: ${parseResult.rawInput}`
        );
      }

      // Step 4: Save to internal state
      this.state.extractedProfile = parseResult.data;
      this.state.step = 'extract';

      console.log('[AssessmentAgent] Profile extraction successful');

      return parseResult.data!;
    } catch (error) {
      console.error('[AssessmentAgent] Profile extraction error:', error);
      throw new Error(`Failed to extract student profile: ${(error as Error).message}`);
    }
  }

  /**
   * Run APS intelligence oracles (Aptitude, Passion, Service)
   * Calls all three oracles sequentially and aggregates results
   * Validates output against OracleResults_v2 schema
   */
  async runIntelligenceOracles(): Promise<OracleResults_v2> {
    console.log('[AssessmentAgent] Starting oracle pipeline');

    try {
      // Step 1: Validate presence of extracted profile
      if (!this.state.extractedProfile) {
        throw new Error('No extracted profile found. Must call extractProfile() first.');
      }

      const profile = this.state.extractedProfile;

      // Step 2: Call APS oracles sequentially
      console.log('[AssessmentAgent] Calling Aptitude Oracle');
      const aptitude = await runAptitudeOracle(profile);

      console.log('[AssessmentAgent] Calling Passion Oracle');
      const passion = await runPassionOracle(profile);

      console.log('[AssessmentAgent] Calling Service Oracle');
      const service = await runServiceOracle(profile);

      // Step 3: Construct OracleResults_v2 object
      const oracleResults: OracleResults_v2 = {
        aptitude,
        passion,
        service,
        // Future integrations (optional fields)
        ivyScore: undefined,
        weakSpots: undefined,
      };

      // Step 4: Save to internal state
      this.state.oracleResults = oracleResults;
      this.state.step = 'oracles';

      console.log('[AssessmentAgent] Oracle pipeline completed successfully');

      return oracleResults;
    } catch (error) {
      console.error('[AssessmentAgent] Oracle pipeline error:', error);
      throw new Error(`Failed to run intelligence oracles: ${(error as Error).message}`);
    }
  }

  /**
   * Determine student type archetype
   * Classifies student into one of 7 archetypes using hybrid LLM + heuristic approach
   * This classification drives coaching strategy adaptation and EQ modulation
   * Must be called after extractProfile() and runIntelligenceOracles()
   */
  async determineStudentType(): Promise<StudentTypeClassification> {
    console.log('[AssessmentAgent] Determining student type archetype');

    try {
      // Validate that required data is present
      if (!this.state.extractedProfile) {
        throw new Error('No extracted profile found. Must call extractProfile() first.');
      }
      if (!this.state.oracleResults) {
        throw new Error('No oracle results found. Must call runIntelligenceOracles() first.');
      }

      const profile = this.state.extractedProfile;
      const oracles = this.state.oracleResults;

      // Build student type input from existing state
      const input: StudentTypeInput = {
        profile: {
          gpa: profile.academics.gpa,
          rigorLevel: profile.academics.rigorLevel,
          rigorDelta: profile.diagnostics.rigorDelta,
          ecDepth: profile.diagnostics.ecDepthGaps.length > 0 ? 'shallow' : 'deep',
          leadershipSignals: profile.activities
            .filter((a: any) => a.leadership)
            .map((a: any) => `${a.name}: ${a.role}`),
          personalityMarkers: [
            `Creativity: ${profile.personality.creativity}`,
            `Resilience: ${profile.personality.resilience}`,
            ...profile.personality.coreValues.map((v: string) => `Value: ${v}`),
          ],
          motivationSignals: profile.personality.motivationMarkers || [],
          executionGaps: profile.diagnostics.executionGaps || [],
          gradeLevel: profile.academics.gradeLevel,
        },
        oracleResults: {
          aptitudeScore: oracles.aptitude.score,
          passionScore: oracles.passion.score,
          serviceScore: oracles.service.score,
        },
        narrative: {
          toneMarkers: this.state.narrativeBlocks?.risks || [],
          responsiveness: profile.personality.workStyle || 'unknown',
          confidenceMarkers: [profile.personality.resilience],
          selfAwarenessSignals: profile.personality.coreValues,
          valueStatements: profile.personality.coreValues,
        },
      };

      // Call classifier
      const classification = await classifyStudentType(input);

      // Save to internal state
      this.state.studentType = classification;

      console.log(
        `[AssessmentAgent] Student classified as: ${classification.primaryType} (confidence: ${classification.confidence})`
      );

      return classification;
    } catch (error) {
      console.error('[AssessmentAgent] Student type classification error:', error);
      throw new Error(`Failed to determine student type: ${(error as Error).message}`);
    }
  }

  /**
   * Apply EQ modulation to generate adaptive tone plan
   * Uses student type + profile + narrative + optional EQ chips
   * to create personalized conversational style guidelines
   * Must be called after determineStudentType() and generateNarrativeBlocks()
   */
  async applyEQModulation(eqChips?: any): Promise<EQTonePlan> {
    console.log('[AssessmentAgent] Applying EQ modulation to generate tone plan');

    try {
      // Validate that required data is present
      if (!this.state.studentType) {
        throw new Error('No student type found. Must call determineStudentType() first.');
      }
      if (!this.state.extractedProfile) {
        throw new Error('No extracted profile found. Must call extractProfile() first.');
      }
      if (!this.state.narrativeBlocks) {
        throw new Error('No narrative blocks found. Must call generateNarrativeBlocks() first.');
      }

      // Build EQ tone plan
      const eqPlan = await buildEQTonePlan(
        this.state.studentType,
        this.state.extractedProfile,
        this.state.narrativeBlocks,
        eqChips
      );

      // Save to internal state
      this.state.eqTonePlan = eqPlan;
      this.state.step = 'eqModulation';

      console.log('[AssessmentAgent] EQ tone plan generated successfully');
      console.log(`  - Warmth level: ${eqPlan.warmthLevel}/5`);
      console.log(`  - Directive level: ${eqPlan.directiveLevel}/5`);
      console.log(`  - Language patterns: ${eqPlan.languagePatterns.length}`);
      console.log(`  - Micro-wins structure: ${eqPlan.microWinsStructure.length} weeks`);

      return eqPlan;
    } catch (error) {
      console.error('[AssessmentAgent] EQ modulation error:', error);
      throw new Error(`Failed to apply EQ modulation: ${(error as Error).message}`);
    }
  }

  /**
   * Generate narrative blocks from profile and oracle results
   * Deterministic implementation extracting thematic hubs from profile
   * Uses oracle scores to identify positioning and risks
   * Returns NarrativeBlocks_v2 object
   */
  generateNarrativeBlocks(profile: ExtractedProfile_v2, oracleResults: OracleResults_v2): NarrativeBlocks_v2 {
    console.log('[AssessmentAgent] Generating narrative blocks');

    // Extract thematic hubs from profile
    const thematicHubs = this.extractThematicHubs(profile);

    // Build flagship narrative from passions and top activity
    const topPassion = profile.personality.passions[0] || 'academic excellence';
    const topActivity = profile.activities[0]?.name || 'student leadership';
    const flagshipNarrative = `A ${topPassion} enthusiast leveraging ${topActivity} to create meaningful impact`;

    // Generate positioning based on oracle scores
    const positioning = this.generatePositioning(oracleResults);

    // Build identity thread from core values and passions
    const coreValue = profile.personality.coreValues[0] || 'integrity';
    const identityThread = `${coreValue}-driven ${topPassion} advocate`;

    // Identify narrative risks based on oracle scores
    const risks = this.identifyNarrativeRisks(oracleResults, profile);

    // Identify narrative opportunities
    const opportunities = this.identifyNarrativeOpportunities(profile);

    const narrativeBlocks: NarrativeBlocks_v2 = {
      thematicHubs,
      flagshipNarrative,
      positioning,
      identityThread,
      risks,
      opportunities,
    };

    // Save to internal state
    this.state.narrativeBlocks = narrativeBlocks;
    this.state.step = 'narrative';

    console.log('[AssessmentAgent] Narrative blocks generated successfully');

    return narrativeBlocks;
  }

  /**
   * Extract three thematic hubs from student profile
   * Uses narrativeScaffolding if available and non-empty, otherwise infers from activities
   */
  private extractThematicHubs(profile: ExtractedProfile_v2): [string, string, string] {
    // Use narrativeScaffolding.thematicHubs if available and non-empty
    if (
      profile.narrativeScaffolding?.thematicHubs?.length === 3 &&
      profile.narrativeScaffolding.thematicHubs.every((hub) => hub.trim().length > 0)
    ) {
      return profile.narrativeScaffolding.thematicHubs as [string, string, string];
    }

    // Fallback: Infer from top activities
    const hub1 = profile.activities[0]?.type || 'Academic Pursuit';
    const hub2 = profile.activities[1]?.type || 'Leadership';
    const hub3 = profile.activities[2]?.type || 'Community Engagement';

    return [hub1, hub2, hub3];
  }

  /**
   * Generate positioning statement based on oracle scores
   * High scores across all three dimensions = "Well-rounded leader"
   * Spiky profile = "Deep specialist"
   */
  private generatePositioning(oracleResults: OracleResults_v2): string {
    const { aptitude, passion, service } = oracleResults;
    const avgScore = (aptitude.score + passion.score + service.score) / 3;

    if (avgScore >= 85) {
      return 'Exceptional well-rounded leader with strength across all dimensions';
    } else if (aptitude.score >= 90) {
      return 'High-aptitude specialist with exceptional academic depth';
    } else if (passion.score >= 90) {
      return 'Passion-driven achiever with deep commitment to their field';
    } else if (service.score >= 90) {
      return 'Service-oriented leader with proven community impact';
    } else {
      return 'Developing student with emerging strengths';
    }
  }

  /**
   * Identify narrative risks based on oracle scores and profile gaps
   */
  private identifyNarrativeRisks(oracleResults: OracleResults_v2, profile: ExtractedProfile_v2): string[] {
    const risks: string[] = [];

    // Check for low oracle scores
    if (oracleResults.aptitude.score < 70) {
      risks.push('Lacks clear academic rigor or intellectual depth');
    }
    if (oracleResults.passion.score < 70) {
      risks.push('Passion and commitment may not be evident to admissions officers');
    }
    if (oracleResults.service.score < 70) {
      risks.push('Limited evidence of community engagement or service');
    }

    // Check for profile diagnostics
    if (profile.diagnostics.rigorGaps.length > 0) {
      risks.push('Academic rigor gaps may weaken competitive positioning');
    }
    if (profile.diagnostics.ecDepthGaps.length > 0) {
      risks.push('Extracurricular activities lack depth or leadership signals');
    }

    return risks;
  }

  /**
   * Identify narrative opportunities based on profile
   */
  private identifyNarrativeOpportunities(profile: ExtractedProfile_v2): string[] {
    const opportunities: string[] = [];

    // Check for high-signal activities
    const leadershipActivities = profile.activities.filter((a) => a.leadership);
    if (leadershipActivities.length > 0) {
      opportunities.push('Leverage leadership roles to demonstrate initiative and impact');
    }

    // Check for unique personality traits
    if (profile.personality.creativity === 'High') {
      opportunities.push('Showcase creative projects to differentiate from typical applicants');
    }

    // Check for planned courses
    if (profile.academics.plannedCourses.length > 0) {
      opportunities.push('Use senior year course selection to demonstrate continued academic ambition');
    }

    // Check for narrative scaffolding
    if (profile.narrativeScaffolding?.flagshipNarrative) {
      opportunities.push('Build essay strategy around existing flagship narrative thread');
    }

    return opportunities;
  }

  /**
   * Generate strategy blocks from profile, oracles, and narrative
   * Creates 12-month plan, summer planning scenarios, and awards targets
   * Returns StrategyBlocks_v2 object
   */
  generateStrategyBlocks(
    extracted: ExtractedProfile_v2,
    oracles: OracleResults_v2,
    narrative: NarrativeBlocks_v2
  ): StrategyBlocks_v2 {
    console.log('[AssessmentAgent] Generating strategy blocks');

    // Derive key values from oracles
    const aptitude = oracles.aptitude.score;
    const passion = oracles.passion.score;
    const service = oracles.service.score;

    // Deterministic rigor target based on aptitude score
    const rigorTarget =
      aptitude > 75
        ? 'Increase AP/IB rigor'
        : aptitude > 50
        ? 'Stabilize academic performance'
        : 'Reinforce fundamentals first';

    // Derive identity themes from narrative
    const themes = narrative.thematicHubs;

    // Create 12-month plan
    const twelveMonthPlan = Array.from({ length: 12 }).map((_, idx) => ({
      month: `Month ${idx + 1}`,
      priorities: [rigorTarget, `Deepen narrative theme: ${themes[idx % themes.length]}`],
      tasks: ['Weekly progress tracking', 'Monthly reflection', 'Deliver one tangible output'],
      risks: [
        passion < 40 ? 'Low engagement risk' : '',
        service < 30 ? 'Weak service footprint risk' : '',
      ].filter(Boolean),
    }));

    // Summer planning scenarios
    const summerPlanning = [
      {
        scenario: 'baseline' as const,
        focusAreas: [themes[0]],
        commitments: ['1 project', '2–3 hrs/week'],
        risks: ['Might not stand out'],
      },
      {
        scenario: 'stretch' as const,
        focusAreas: [themes[1]],
        commitments: ['1 major output', 'Leadership pursuit'],
        risks: ['Time conflict', 'Execution consistency'],
      },
      {
        scenario: 'moonshot' as const,
        focusAreas: [themes[2]],
        commitments: ['High-impact deliverable', 'External publication attempt'],
        risks: ['High failure chance'],
      },
    ];

    // Awards targets
    const likelihood: 'low' | 'medium' | 'high' = aptitude > 70 ? 'medium' : 'low';
    const awardsTargets = [
      {
        name: 'Theme-Aligned Award',
        tier: 'state' as const,
        likelihood: likelihood,
        rationale: 'Theme depth + projected outputs',
      },
    ];

    const result: StrategyBlocks_v2 = {
      twelveMonthPlan,
      summerPlanning,
      awardsTargets,
    };

    // Validate with Zod schema
    const parsed = strategyBlocksSchema_v2.parse(result);

    // Save to internal state
    this.state.strategyBlocks = parsed;
    this.state.step = 'strategy';

    console.log('[AssessmentAgent] Strategy blocks generated successfully');

    return parsed;
  }

  /**
   * Generate Chat Turn
   *
   * Generates an EQ-integrated response to a student message.
   * Uses student type, EQ tone plan, and full context to create
   * adaptive coaching language that sounds natural and authentic.
   *
   * Also updates conversation memory with emotional signals and patterns.
   *
   * Must be called after applyEQModulation().
   */
  async generateChatTurn(studentMessage: string, sessionHistorySummary?: string): Promise<string> {
    console.log('[AssessmentAgent] Generating chat turn response');

    try {
      // Validate that EQ tone plan exists
      if (!this.state.eqTonePlan) {
        throw new Error('EQ Tone Plan missing. Must run applyEQModulation() first.');
      }

      // 1. Update EQ Runtime state from student message
      this.eqRuntime.updateFromStudentMessage(studentMessage);

      // 2. Update Momentum Engine from student message
      const momentumState = this.momentum.updateWithMessage(studentMessage);

      // 3. Evaluate conversation structure
      const eqState = this.eqRuntime.getState();
      const structuringDirectives = this.structuring.evaluate(
        studentMessage,
        momentumState,
        eqState
      );

      // 4. Evaluate micro-coaching move
      const coachingDirective = this.microcoach.evaluate(
        studentMessage,
        momentumState,
        eqState
      );

      // 5. Compute tone modulation directive
      const archetypeProfile = convertArchetypeToProfile(eqState.archetype);
      const eqStateForTone = convertEQStateForTone(eqState);
      const toneDirective = this.toneEngine.modulate(
        archetypeProfile,
        eqStateForTone,
        coachingDirective.move
      );

      // 6. Select Jenny-style phrases based on tone directive and coaching move
      const selectedPhrases = this.jennyPhrasebank.selectPhrases(
        toneDirective,
        coachingDirective.move
      );

      // 7. Compute dynamic EQ curve directives with momentum modulation
      const baseDirectives = {
        warmthLevel: 'medium' as const,
        empathyLevel: 'medium' as const,
        firmnessLevel: 'medium' as const,
        cheerLevel: momentumState.trend === 'down' || momentumState.momentumScore < 40 ? 'high' as const : 'medium' as const,
        paceLevel: momentumState.disengaged ? 'slow' as const : 'normal' as const,
        intensityLevel: momentumState.trend === 'up' && momentumState.momentumScore > 60 ? 'high' as const : 'medium' as const
      };
      const eqDirectives = this.eqRuntime.computeDirectives(baseDirectives);

      // Log EQ, Momentum, Structuring, Coaching, Tone, and Jenny Phrasebank state
      console.log(`[AssessmentAgent] EQ State: stage=${eqState.stage}, archetype=${eqState.archetype}, anxiety=${eqState.anxietyLevel}, confidence=${eqState.confidenceSignal}`);
      console.log(`[AssessmentAgent] Momentum: score=${momentumState.momentumScore}, trend=${momentumState.trend}, disengaged=${momentumState.disengaged}, focusLost=${momentumState.focusLost}`);
      console.log(`[AssessmentAgent] Structure: step=${structuringDirectives.agendaStep}, progress=${structuringDirectives.agendaProgress}%, drift=${structuringDirectives.driftDetected}, summarize=${structuringDirectives.shouldSummarize}`);
      console.log(`[AssessmentAgent] Coaching: move=${coachingDirective.move}, intensity=${coachingDirective.intensity || 'default'}, rationale=${coachingDirective.rationale}`);
      console.log(`[AssessmentAgent] Tone: warmth=${toneDirective.warmth}, directness=${toneDirective.directness}, assertiveness=${toneDirective.assertiveness}, pacing=${toneDirective.pacing}`);
      console.log(`[AssessmentAgent] Jenny Phrases: body=[${selectedPhrases.body.length} phrases], pacingMarker=${selectedPhrases.pacingMarker || 'none'}, styleMarkers=[${selectedPhrases.styleMarkers.join(', ')}]`);

      // Add student message to chat history
      this.chatHistory.push({
        role: 'user',
        content: studentMessage,
        timestamp: new Date().toISOString()
      });

      // Generate base response
      const turn: ChatTurnResponse = await generateEQIntegratedResponse(
        this.state,
        studentMessage,
        sessionHistorySummary || this.conversationMemory.rollingSummary
      );

      // Get last assistant message for tone drift detection
      const lastAssistantMessage = this.chatHistory
        .filter(m => m.role === 'assistant')
        .slice(-1)[0]?.content || '';

      // Generate tone instruction based on emotional signals and tone drift
      const toneInstruction = generateToneInstruction(
        this.conversationMemory,
        lastAssistantMessage
      );

      // Build persona instruction (Layer 1-4 composition)
      const personaInstruction = buildJennyPersonaInstruction(
        this.conversationMemory.emotionalSignals,
        toneInstruction
      );

      // Apply tone correction if needed
      const correctedMessage = await correctToneIfNeeded(
        turn.assistantMessage,
        toneInstruction
      );

      // Check for persona drift
      const driftAlert = detectPersonaDrift(correctedMessage, personaInstruction);

      // If severe drift detected, rewrite the message
      let finalMessage = correctedMessage;
      if (shouldRewriteMessage(driftAlert)) {
        console.log('[AssessmentAgent] Persona drift detected - applying additional correction');
        finalMessage = await correctToneIfNeeded(correctedMessage, toneInstruction);
      }

      // Store instructions for next turn and debugging
      this.lastToneInstruction = toneInstruction;
      this.lastPersonaInstruction = personaInstruction;

      // Add final message to chat history
      this.chatHistory.push({
        role: 'assistant',
        content: finalMessage,
        timestamp: new Date().toISOString()
      });

      // Update conversation memory with emotional signals and patterns
      this.conversationMemory = await updateConversationMemory(
        this.conversationMemory,
        studentMessage,
        finalMessage,
        false // Use LLM for signal extraction
      );

      console.log('[AssessmentAgent] Chat turn generated successfully');
      console.log(`  - Message length: ${finalMessage.length} chars`);
      console.log(`  - Reasoning notes: ${turn.reasoningNotes.length}`);
      console.log(`  - Memory updated: ${this.conversationMemory.detectedPatterns.length} patterns`);
      console.log(`  - Tone instruction: warmth=${toneInstruction.warmth}, empathy=${toneInstruction.empathy}`);
      console.log(`  - Persona: archetype=${personaInstruction.identity.archetype}, warmth=${personaInstruction.tone.warmth}`);
      console.log(`  - Persona drift: ${driftAlert.hasDrift ? driftAlert.summary : 'none'}`);

      return finalMessage;
    } catch (error) {
      console.error('[AssessmentAgent] Chat turn generation error:', error);
      throw new Error(`Failed to generate chat turn: ${(error as Error).message}`);
    }
  }

  /**
   * Get Chat History
   *
   * Returns the complete conversation history.
   */
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  /**
   * Clear Chat History
   *
   * Resets the conversation history (for testing or new sessions).
   */
  clearChatHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Get Conversation Memory
   *
   * Returns the current conversation memory state.
   */
  getConversationMemory(): ConversationMemory_v1 {
    return { ...this.conversationMemory };
  }

  /**
   * Reset Conversation Memory
   *
   * Resets conversation memory to initial state.
   */
  resetConversationMemory(): void {
    this.conversationMemory = initializeConversationMemory();
  }

  /**
   * Get Last Tone Instruction
   *
   * Returns the most recent tone instruction used in chat generation.
   * Useful for debugging and monitoring tone drift correction.
   */
  getLastToneInstruction(): ToneInstruction_v1 | undefined {
    return this.lastToneInstruction;
  }

  /**
   * Get Last Persona Instruction
   *
   * Returns the most recent persona instruction used in chat generation.
   * Useful for debugging and monitoring persona composition.
   */
  getLastPersonaInstruction(): PersonaInstruction_v3 | undefined {
    return this.lastPersonaInstruction;
  }

  /**
   * Get EQ Runtime State
   *
   * Returns the current EQ runtime state including:
   * - Detected student archetype
   * - Current session stage
   * - Anxiety level
   * - Confidence signal (cumulative)
   * - Last computed directives
   *
   * Useful for debugging and monitoring emotional calibration.
   */
  getEQRuntimeState() {
    return this.eqRuntime.getState();
  }

  /**
   * Reset EQ Runtime
   *
   * Resets the EQ runtime to initial state.
   * Use when starting a new conversation session.
   */
  resetEQRuntime(): void {
    this.eqRuntime.reset();
  }

  /**
   * Get Momentum State
   *
   * Returns the current conversation momentum state including:
   * - Momentum score (0-100)
   * - Trend (up/down/flat)
   * - Spike and dip counts
   * - Disengagement and focus-loss flags
   * - Energy history
   *
   * Useful for debugging and monitoring student engagement.
   */
  getMomentumState() {
    return this.momentum.getState();
  }

  /**
   * Get Momentum Level
   *
   * Returns categorical momentum level:
   * - critical: <20 (dropout risk)
   * - low: 20-39 (needs boost)
   * - medium: 40-59 (neutral)
   * - high: 60-79 (good energy)
   * - excellent: 80+ (peak engagement)
   */
  getMomentumLevel() {
    return this.momentum.getMomentumLevel();
  }

  /**
   * Needs Momentum Intervention
   *
   * Returns true if agent should intervene to boost engagement.
   */
  needsMomentumIntervention(): boolean {
    return this.momentum.needsIntervention();
  }

  /**
   * Get Momentum Intervention Suggestions
   *
   * Returns array of suggested interventions based on momentum state.
   */
  getMomentumInterventionSuggestions(): string[] {
    return this.momentum.getInterventionSuggestions();
  }

  /**
   * Reset Momentum
   *
   * Resets the momentum engine to initial state.
   * Use when starting a new conversation session.
   */
  resetMomentum(): void {
    this.momentum.reset();
  }

  /**
   * Get Coaching State
   *
   * Returns current coaching engine state.
   */
  getCoachingState() {
    return this.microcoach.getState();
  }

  /**
   * Get Last Coaching Move
   *
   * Returns the most recently selected coaching move.
   */
  getLastCoachingMove() {
    return this.microcoach.getLastMove();
  }

  /**
   * Get Coaching Move Frequency
   *
   * Returns how many times each coaching move has been used.
   */
  getCoachingMoveFrequency() {
    return this.microcoach.getMoveFrequency();
  }

  /**
   * Reset Micro-Coaching
   *
   * Resets the micro-coaching engine to initial state.
   * Use when starting a new conversation session.
   */
  resetMicroCoaching(): void {
    this.microcoach.reset();
  }

  /**
   * Get Tone Engine State
   *
   * Returns current tone modulation engine state.
   */
  getToneEngineState() {
    return this.toneEngine.getState();
  }

  /**
   * Get Jenny Phrasebank State
   *
   * Returns current Jenny phrasebank engine state including recently used phrase count.
   */
  getJennyPhrasebankState() {
    return this.jennyPhrasebank.getState();
  }

  /**
   * Get Jenny Linguistic Fingerprint
   *
   * Returns Jenny's linguistic fingerprint (tone anchors, signature devices, etc.)
   */
  getJennyFingerprint() {
    return this.jennyPhrasebank.getFingerprint();
  }

  /**
   * Reset Jenny Phrasebank
   *
   * Resets the phrasebank engine to initial state.
   * Clears recently used phrase tracking.
   * Use when starting a new conversation session.
   */
  resetJennyPhrasebank(): void {
    this.jennyPhrasebank.reset();
  }

  /**
   * Get Jenny Rewriter State
   *
   * Returns current Jenny rewriter state.
   */
  getJennyRewriterState() {
    return this.jennyRewriter.getState();
  }

  /**
   * Reset Jenny Rewriter
   *
   * Resets the rewriter engine to initial state.
   * Clears clause generator tracking.
   * Use when starting a new conversation session.
   */
  resetJennyRewriter(): void {
    this.jennyRewriter.reset();
  }

  /**
   * Apply Jenny Rhythm Rewrite
   *
   * Takes raw text and applies Jenny's rhythm model.
   * Can be used to transform LLM output or any text into Jenny's voice.
   */
  applyJennyRhythm(content: string, opts: RewriteOptions): string {
    return this.jennyRewriter.rewrite(content, opts);
  }

  /**
   * Get Jenny Vocab Engine State
   *
   * Returns current Jenny vocab engine state.
   */
  getJennyVocabState() {
    return this.jennyVocab.getState();
  }

  /**
   * Reset Jenny Vocab
   *
   * Resets the vocab engine to initial state.
   * Clears word choice and idiom tracking.
   */
  resetJennyVocab(): void {
    this.jennyVocab.reset();
  }

  /**
   * Apply Jenny Vocabulary Transform
   *
   * Transforms text using Jenny's vocabulary, idioms, and filters.
   * This applies phrase substitutions and semantic filtering.
   */
  applyJennyVocab(content: string, opts?: VocabTransformOptions): string {
    return this.jennyVocab.transform(content, opts);
  }

  /**
   * Validate Jenny Voice
   *
   * Checks if text follows Jenny's voice patterns.
   * Returns validation result with any issues found.
   */
  validateJennyVoice(content: string): { isValid: boolean; issues: string[] } {
    return this.jennyVocab.validateVoice(content);
  }

  /**
   * Initialize Persona Engine
   *
   * Loads Jenny's persona data and generates embeddings.
   * Must be called before using persona conditioning.
   */
  async initializePersonaEngine(rawData: {
    coreLanguage: string;
    eqPatterns: string;
    heuristics: any;
    coachingPatterns: any;
    archetypeMappings: any;
    negativeExamples: string;
    goldenThread: string;
  }): Promise<void> {
    await this.personaEngine.initialize(rawData);
  }

  /**
   * Get Persona Conditioning Context
   *
   * Retrieves top persona chunks for a given context.
   * Used to condition LLM responses with Jenny's persona.
   */
  async getPersonaConditioningContext(context: PersonaRetrievalContext): Promise<any> {
    return await this.personaEngine.buildConditioningContext(context, {
      rhythmLayer: this.jennyRewriter,
      eqLayer: this.eqRuntime,
      archetypeLayer: this.state.studentType,
    });
  }

  /**
   * Check Persona Drift
   *
   * Detects if agent output has drifted from Jenny's persona.
   * Returns drift detection result with suggestions for fixing.
   */
  async checkPersonaDrift(output: string) {
    return await this.personaEngine.checkDrift(output);
  }

  /**
   * Get Persona Composite Vector
   *
   * Returns Jenny's composite persona vector.
   * Can be used for similarity comparisons or analysis.
   */
  getPersonaComposite() {
    return this.personaEngine.getCompositeVector();
  }

  /**
   * Get Persona Stats
   *
   * Returns statistics about loaded persona chunks.
   */
  getPersonaStats() {
    return this.personaEngine.getStats();
  }

  /**
   * Export Persona Index
   *
   * Exports persona embeddings for persistence.
   * Can be saved and reloaded to avoid recomputing embeddings.
   */
  exportPersonaIndex() {
    return this.personaEngine.exportIndex();
  }

  /**
   * Import Persona Index
   *
   * Imports pre-computed persona embeddings.
   * Faster than re-generating from raw data.
   */
  importPersonaIndex(index: any): void {
    this.personaEngine.importIndex(index);
  }

  /**
   * Apply Persona Tuner (Component 42)
   *
   * Checks agent output for persona drift and applies corrections if needed.
   * This ensures consistent Jenny voice across all responses.
   *
   * @param output - Agent output text to check
   * @param outputEmbedding - Optional pre-computed embedding
   * @returns Corrected output (or original if no correction needed)
   */
  async applyPersonaTuner(output: string, outputEmbedding?: number[]): Promise<string> {
    return await runPersonaTuner(output, outputEmbedding, {
      verbose: false,
      auto_correct_threshold: 'orange' // Only correct orange/red drift
    });
  }

  /**
   * Check Drift Without Correction
   *
   * Checks output for drift but doesn't apply corrections.
   * Useful for monitoring and analysis.
   */
  async checkDriftOnly(output: string): Promise<any> {
    return await checkPersonaDriftOnly(output);
  }

  /**
   * Get Persona Drift Statistics
   *
   * Returns aggregated drift statistics from logs.
   */
  getDriftStats(): any {
    return getPersonaDriftStats();
  }

  /**
   * Detect Student Archetype (Component 43 - Rule-Based)
   *
   * Analyzes ExtractedProfile to determine student archetype using rule-based heuristics.
   * Fast and deterministic. Use this when transcript is not available.
   *
   * @param profile - Extracted student profile
   * @returns Detected archetype with confidence
   */
  detectArchetype(profile: ExtractedProfile_v2): DetectedArchetype {
    this.detectedArchetype = detectStudentArchetype(profile);
    return this.detectedArchetype;
  }

  /**
   * Detect Student Archetype with LLM (Component 44 - LLM-Powered)
   *
   * High-fidelity archetype detection using full transcript analysis + EQ chips.
   * More accurate than rule-based, but requires transcript.
   *
   * @param profile - Extracted student profile
   * @param transcript - Full assessment transcript
   * @param eqChips - Optional EQ chips from Component 41
   * @returns Detected archetype with confidence and evidence
   */
  async detectArchetypeLLM(
    profile: ExtractedProfile_v2,
    transcript: string,
    eqChips?: string[]
  ): Promise<DetectedArchetype> {
    this.detectedArchetype = await detectStudentArchetypeLLM(profile, transcript, eqChips);
    return this.detectedArchetype;
  }

  /**
   * Detect Student Archetype (Hybrid - Component 43 + 44)
   *
   * Uses LLM if transcript available, falls back to rule-based if not.
   * Best of both worlds: accuracy when possible, speed when needed.
   *
   * @param profile - Extracted student profile
   * @param transcript - Optional assessment transcript
   * @param eqChips - Optional EQ chips
   * @returns Detected archetype
   */
  async detectArchetypeHybrid(
    profile: ExtractedProfile_v2,
    transcript?: string,
    eqChips?: string[]
  ): Promise<DetectedArchetype> {
    this.detectedArchetype = await detectArchetypeHybrid(profile, transcript, eqChips);
    return this.detectedArchetype;
  }

  /**
   * Build Modulation Envelope (Component 43)
   *
   * Creates archetype-specific modulation settings for persona rewriting.
   * Should be called after archetype detection.
   *
   * @param profile - Extracted student profile
   * @param driftResult - Optional drift detection result
   * @returns Modulation envelope for Component 42
   */
  buildArchetypeModulation(profile: ExtractedProfile_v2, driftResult?: any): ModulationEnvelope {
    this.modulationEnvelope = buildModulationEnvelope(profile, driftResult);
    return this.modulationEnvelope;
  }

  /**
   * Get Detected Archetype
   *
   * Returns the currently detected archetype, if any.
   */
  getDetectedArchetype(): DetectedArchetype | undefined {
    return this.detectedArchetype;
  }

  /**
   * Get Modulation Summary
   *
   * Returns human-readable summary of current modulation settings.
   */
  getArchetypeModulationSummary(): string | undefined {
    if (this.modulationEnvelope) {
      return getModulationSummary(this.modulationEnvelope);
    }
    return undefined;
  }

  /**
   * Apply Persona Tuner with Archetype Modulation
   *
   * Enhanced version that includes archetype-specific modulation.
   * Use this instead of applyPersonaTuner() for archetype-aware rewriting.
   *
   * @param output - Agent output text to check
   * @param outputEmbedding - Optional pre-computed embedding
   * @returns Corrected output with archetype modulation applied
   */
  async applyPersonaTunerWithArchetype(output: string, outputEmbedding?: number[]): Promise<string> {
    // For now, this is a placeholder - full integration requires passing envelope to rewriter
    // In production, Component 42's runPersonaTuner would accept modulationEnvelope
    return await runPersonaTuner(output, outputEmbedding, {
      verbose: false,
      auto_correct_threshold: 'orange'
    });
  }

  // ============================================================================
  // COMPONENT 45 - ASSESSMENT SESSION DIALOGUE ENGINE
  // ============================================================================

  /**
   * Generate Assessment Turn (Component 45)
   *
   * Uses the full assessment dialogue engine to generate Jenny's next message
   * with proper archetype modulation, phase tracking, and data collection.
   *
   * This is the primary method for assessment session conversations.
   *
   * @param studentMessage - Latest message from student
   * @param eqChips - Optional EQ chips from prior analysis
   * @returns Dialogue engine output with next message and updated state
   */
  async generateAssessmentDialogueTurn(
    studentMessage: string,
    eqChips?: string[]
  ): Promise<DialogueEngineOutput> {
    console.log('[AssessmentAgent] Generating assessment dialogue turn');
    console.log(`  - Current phase: ${this.currentPhase}`);
    console.log(`  - Student message: ${studentMessage.substring(0, 50)}...`);

    // Add student message to history
    const studentTurn: MessageTurn = {
      role: 'student',
      content: studentMessage,
      timestamp: new Date().toISOString()
    };
    this.chatHistory.push(studentTurn as ChatMessage);

    // Ensure we have profile and archetype
    if (!this.state.extractedProfile) {
      throw new Error('Cannot generate dialogue turn: profile not extracted');
    }
    if (!this.detectedArchetype) {
      // Auto-detect archetype if not already done
      this.detectedArchetype = detectStudentArchetype(this.state.extractedProfile);
      console.log(`  - Auto-detected archetype: ${this.detectedArchetype.primary}`);
    }
    if (!this.modulationEnvelope) {
      // Auto-build modulation envelope if not already done
      this.modulationEnvelope = buildModulationEnvelope(this.state.extractedProfile);
      console.log(`  - Auto-built modulation envelope`);
    }

    // Build archetype classification for dialogue engine
    const archetypeClassification = {
      primaryArchetype: this.detectedArchetype.primary,
      secondaryArchetype: this.detectedArchetype.secondary,
      confidence: this.detectedArchetype.confidence,
      evidence: this.detectedArchetype.signals,
      toneOverrides: {
        tone: this.modulationEnvelope.toneProfile.tone,
        pacing: this.modulationEnvelope.toneProfile.pacing,
        structure: this.modulationEnvelope.toneProfile.structure,
        warmth: this.modulationEnvelope.toneProfile.warmth
      },
      styleConstraints: {
        avoidPhrases: this.modulationEnvelope.toneProfile.directives.reduce,
        increasePhrases: this.modulationEnvelope.toneProfile.directives.increase
      }
    };

    // Convert chat history to message turns
    const messageHistory: MessageTurn[] = this.chatHistory.map(msg => ({
      role: msg.role as 'student' | 'coach',
      content: msg.content,
      timestamp: msg.timestamp
    }));

    // Build dialogue engine input
    const dialogueInput: DialogueEngineInput = {
      phase: this.currentPhase,
      messageHistory,
      profile: this.state.extractedProfile,
      archetype: archetypeClassification,
      modulation: this.modulationEnvelope,
      eqChips,
      dataStatus: this.dataCollectionStatus,
      intakeForm: this.input.intake_data
    };

    // Generate turn using dialogue engine
    const dialogueOutput = await generateAssessmentTurn(dialogueInput);

    // Update internal state
    this.currentPhase = dialogueOutput.nextPhase;
    this.dataCollectionStatus = dialogueOutput.updatedDataStatus;

    // Add coach message to history
    const coachTurn: MessageTurn = {
      role: 'coach',
      content: dialogueOutput.message,
      timestamp: new Date().toISOString()
    };
    this.chatHistory.push(coachTurn as ChatMessage);

    console.log('[AssessmentAgent] Assessment dialogue turn generated');
    console.log(`  - Next phase: ${dialogueOutput.nextPhase}`);
    console.log(`  - Phase completion: ${dialogueOutput.phaseCompletionConfidence.toFixed(2)}`);
    console.log(`  - Message length: ${dialogueOutput.message.length} chars`);

    return dialogueOutput;
  }

  /**
   * Get Current Assessment Phase
   *
   * Returns the current phase of the assessment conversation.
   */
  getCurrentPhase(): AssessmentPhase {
    return this.currentPhase;
  }

  /**
   * Set Assessment Phase
   *
   * Manually set the current assessment phase (for testing or manual control).
   *
   * @param phase - New assessment phase
   */
  setAssessmentPhase(phase: AssessmentPhase): void {
    console.log(`[AssessmentAgent] Setting phase: ${this.currentPhase} → ${phase}`);
    this.currentPhase = phase;
  }

  /**
   * Get Data Collection Status
   *
   * Returns the current data collection status (what information has been gathered).
   */
  getDataCollectionStatus(): DataCollectionStatus {
    return { ...this.dataCollectionStatus };
  }

  /**
   * Get Phase Objectives
   *
   * Returns the objectives for a given assessment phase.
   *
   * @param phase - Assessment phase (defaults to current phase)
   * @returns Array of phase objectives
   */
  getAssessmentPhaseObjectives(phase?: AssessmentPhase): string[] {
    return getPhaseObjectives(phase || this.currentPhase);
  }

  /**
   * Reset Dialogue State
   *
   * Resets the dialogue engine state (phase and data status).
   * Useful for starting a new assessment session.
   */
  resetDialogueState(): void {
    console.log('[AssessmentAgent] Resetting dialogue state');
    this.currentPhase = 'rapport_and_safety';
    this.dataCollectionStatus = createInitialDataStatus();
  }

  // ============================================================================
  // COMPONENT 46 - ASSESSMENT SESSION FSM
  // ============================================================================

  /**
   * Get Session FSM
   *
   * Returns the assessment session FSM instance.
   *
   * @returns AssessmentSessionFSM instance
   */
  getSessionFSM(): AssessmentSessionFSM {
    return this.sessionFSM;
  }

  /**
   * Get FSM Stage
   *
   * Returns current FSM stage (rapport, current_state, diagnostic, preview, complete).
   *
   * @returns Current FSM stage
   */
  getFSMStage(): AssessmentStage {
    return this.sessionFSM.getStage();
  }

  /**
   * Mark Data Slot Collected
   *
   * Marks a required data slot as collected in the FSM.
   * Updates FSM state and attempts stage transition if all slots collected.
   *
   * @param slot - Slot name (e.g., 'student_background', 'academics_rigor')
   * @returns Collection result
   */
  markDataSlotCollected(slot: string) {
    const result = this.sessionFSM.markSlotCollected(slot);

    // Attempt stage transition
    const transitionResult = this.sessionFSM.tryAdvanceStage();

    if (transitionResult.transitioned) {
      // Sync dialogue phase with FSM stage
      this.currentPhase = fsmStageToDialoguePhase(transitionResult.toStage);

      console.log(`[AssessmentAgent] FSM stage transition: ${transitionResult.fromStage} → ${transitionResult.toStage}`);
      console.log(`  - Synced dialogue phase: ${this.currentPhase}`);
    }

    return { slotResult: result, transitionResult };
  }

  /**
   * Mark Multiple Data Slots Collected
   *
   * Convenience method to mark multiple slots at once.
   *
   * @param slots - Array of slot names
   * @returns Results for each slot and final transition result
   */
  markDataSlotsCollected(slots: string[]) {
    const slotResults = slots.map(slot => this.sessionFSM.markSlotCollected(slot));
    const transitionResult = this.sessionFSM.tryAdvanceStage();

    if (transitionResult.transitioned) {
      this.currentPhase = fsmStageToDialoguePhase(transitionResult.toStage);

      console.log(`[AssessmentAgent] FSM stage transition: ${transitionResult.fromStage} → ${transitionResult.toStage}`);
      console.log(`  - Synced dialogue phase: ${this.currentPhase}`);
    }

    return { slotResults, transitionResult };
  }

  /**
   * Get FSM Progress
   *
   * Returns completion percentage for current FSM stage.
   *
   * @returns Progress as decimal (0.0 - 1.0)
   */
  getFSMProgress(): number {
    return this.sessionFSM.getStageProgress();
  }

  /**
   * Get Missing FSM Slots
   *
   * Returns data slots still needed to complete current FSM stage.
   *
   * @returns Array of missing slot names
   */
  getMissingFSMSlots(): string[] {
    return this.sessionFSM.getMissingSlots();
  }

  /**
   * Is Assessment Complete (FSM)
   *
   * Returns true if FSM has reached terminal 'complete' stage.
   *
   * @returns True if assessment is complete
   */
  isAssessmentComplete(): boolean {
    return this.sessionFSM.isComplete();
  }

  /**
   * Get FSM Summary
   *
   * Returns human-readable summary of FSM state.
   *
   * @returns Summary string
   */
  getFSMSummary(): string {
    return this.sessionFSM.getSummary();
  }

  /**
   * Reset Session FSM
   *
   * Resets FSM to initial state (rapport stage, no collected slots).
   * Also resets dialogue state to maintain sync.
   */
  resetSessionFSM(): void {
    console.log('[AssessmentAgent] Resetting session FSM');
    this.sessionFSM.reset();
    this.currentPhase = 'rapport_and_safety';
    this.dataCollectionStatus = createInitialDataStatus();
  }

  /**
   * Validate FSM Sync
   *
   * Checks that dialogue phase and FSM stage are in sync.
   * Useful for debugging.
   *
   * @returns True if dialogue phase matches FSM stage
   */
  validateFSMSync(): { synced: boolean; fsmStage: string; dialoguePhase: string } {
    const fsmStage = this.sessionFSM.getStage();
    const expectedPhase = fsmStageToDialoguePhase(fsmStage);
    const synced = this.currentPhase === expectedPhase;

    return {
      synced,
      fsmStage,
      dialoguePhase: this.currentPhase
    };
  }

  callOracles(): void {}

  /**
   * Build narrative blocks from current state
   * Calls generateNarrativeBlocks() with profile and oracle results
   * Updates internal state with generated narrative
   */
  buildNarrative(): void {
    if (!this.state.extractedProfile) {
      throw new Error('Cannot build narrative: No extracted profile found');
    }
    if (!this.state.oracleResults) {
      throw new Error('Cannot build narrative: No oracle results found');
    }

    console.log('[AssessmentAgent] Building narrative blocks...');

    this.state.narrativeBlocks = this.generateNarrativeBlocks(
      this.state.extractedProfile,
      this.state.oracleResults
    );

    console.log(`[AssessmentAgent] Generated ${this.state.narrativeBlocks.thematicHubs.length} thematic hubs`);
  }

  /**
   * Build strategy blocks from current state
   * Calls generateStrategyBlocks() with profile, oracles, and narrative
   * Updates internal state with generated strategy
   */
  buildPlan(): void {
    if (!this.state.extractedProfile) {
      throw new Error('Cannot build plan: No extracted profile found');
    }
    if (!this.state.oracleResults) {
      throw new Error('Cannot build plan: No oracle results found');
    }
    if (!this.state.narrativeBlocks) {
      throw new Error('Cannot build plan: No narrative blocks found. Call buildNarrative() first');
    }

    console.log('[AssessmentAgent] Building strategy blocks...');

    this.state.strategyBlocks = this.generateStrategyBlocks(
      this.state.extractedProfile,
      this.state.oracleResults,
      this.state.narrativeBlocks
    );

    console.log(`[AssessmentAgent] Generated ${this.state.strategyBlocks.twelveMonthPlan.length} month strategy plan`);
  }

  /**
   * Build final assessment output from internal state
   * Aggregates profile, oracles, narrative, and strategy into single output object
   * Returns AssessmentOutput_v2 with metadata
   */
  buildOutput(): AssessmentOutput_v2 {
    console.log('[AssessmentAgent] Building final output');

    // Validate that all required state is present
    if (!this.state.extractedProfile) {
      throw new Error('Cannot build output: extractedProfile is missing');
    }
    if (!this.state.oracleResults) {
      throw new Error('Cannot build output: oracleResults is missing');
    }
    if (!this.state.narrativeBlocks) {
      throw new Error('Cannot build output: narrativeBlocks is missing');
    }
    if (!this.state.strategyBlocks) {
      throw new Error('Cannot build output: strategyBlocks is missing');
    }

    const output: AssessmentOutput_v2 = {
      profile: this.state.extractedProfile,
      oracles: this.state.oracleResults,
      narrative: this.state.narrativeBlocks,
      strategy: this.state.strategyBlocks,
      metadata: {
        modelVersion: '2.0.0',
        generatedAt: new Date().toISOString(),
        agentVersion: '3.0.0',
      },
    };

    // Validate with Zod schema
    const parsed = assessmentOutputSchema_v2.parse(output);

    // Save to internal state
    this.state.output = parsed;
    this.state.step = 'output';

    console.log('[AssessmentAgent] Final output built successfully');

    return parsed;
  }
}

export { AssessmentAgent };
