import { AssessmentInput_v1 } from '../../../schema/assessmentInput_v1';
import { AssessmentOutput_v1 } from '../../../schema/assessmentOutput_v1';
import { AssessmentInternalState_v1 } from '../../../schema/assessmentInternalState_v1';
import { ExtractedProfile_v2, extractedProfileSchema_v2 } from '../../../schema/extractedProfile_v2';
import { runLLMExtraction, safeJsonParse } from '../../../llm';

class AssessmentAgent {
  private state: AssessmentInternalState_v1;
  private input: AssessmentInput_v1;

  constructor(input: AssessmentInput_v1) {
    this.input = input;
    this.state = {};
  }

  initialize(): void {
    this.state.step = 'init';
    console.log('[AssessmentAgent] Initialized');
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
   * Run v3 intelligence oracles (IvyScore, WeakSpots, etc.)
   * TODO: Call IvyScore oracle via adapter
   * TODO: Call WeakSpots oracle via adapter
   * TODO: Aggregate oracle results
   */
  runIntelligenceOracles(profile: { academics: object; activities: object; awards: object; personality: object }): object {
    // TODO: Implement oracle integration
    return {};
  }

  /**
   * Generate narrative blocks (themes, identity thread, positioning)
   * TODO: Call narrative modeling engine
   * TODO: Extract thematic hubs from profile
   * TODO: Build identity arc
   * TODO: Generate positioning statement
   */
  generateNarrativeBlocks(profile: object, oracleResults: object): { themes: string[]; identityThread: string; positioning: string } {
    // TODO: Implement narrative generation logic
    return {
      themes: [],
      identityThread: '',
      positioning: '',
    };
  }

  /**
   * Generate strategy blocks (12-month plan, summer planning, awards targets)
   * TODO: Call strategy engine
   * TODO: Generate 12-month action plan
   * TODO: Generate summer planning recommendations
   * TODO: Generate awards targets based on profile
   */
  generateStrategyBlocks(profile: object, oracleResults: object, narrative: object): { '12MonthPlan': string[]; summerPlanning: string[]; awardsTargets: string[] } {
    // TODO: Implement strategy generation logic
    return {
      '12MonthPlan': [],
      summerPlanning: [],
      awardsTargets: [],
    };
  }

  callOracles(): void {}

  buildNarrative(): void {}

  buildPlan(): void {}

  buildOutput(): AssessmentOutput_v1 | undefined {
    return undefined;
  }
}

export { AssessmentAgent };
