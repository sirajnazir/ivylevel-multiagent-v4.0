/**
 * assessmentDialogueEngine.llm.ts
 *
 * Component 45 - Assessment Session Dialogue Engine
 * Archetype-aware, EQ-modulated conversation brain for assessment sessions
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  DialogueEngineInput,
  DialogueEngineOutput,
  AssessmentPhase,
  DataCollectionStatus
} from './types';

/**
 * Generate next assessment turn
 *
 * This is the core dialogue engine that powers Jenny's assessment conversations.
 * It uses the full context (transcript, archetype, modulation, phase) to generate
 * the next message with appropriate tone, pacing, and data collection strategy.
 *
 * @param input - Dialogue engine input (phase, history, profile, archetype, modulation)
 * @returns Next message with updated phase and data status
 */
export async function generateAssessmentTurn(
  input: DialogueEngineInput
): Promise<DialogueEngineOutput> {
  // Load system prompt
  const systemPrompt = fs.readFileSync(
    path.join(__dirname, 'assessmentDialoguePrompt.md'),
    'utf8'
  );

  // Build user prompt with full context
  const userPrompt = buildDialogueUserPrompt(input);

  // Call LLM (in production, this would use runClaude from anthropicClient)
  // For now, we'll use a mock implementation
  const rawResponse = await callDialogueLLM(systemPrompt, userPrompt, input);

  // Parse JSON response
  try {
    const output = JSON.parse(rawResponse) as DialogueEngineOutput;

    // Validate output
    if (!validateDialogueOutput(output)) {
      throw new Error('Invalid dialogue output structure');
    }

    return output;
  } catch (error) {
    console.error('[DialogueEngine] Failed to parse LLM response:', error);
    throw new Error(`Failed to generate assessment turn: ${error}`);
  }
}

/**
 * Build comprehensive user prompt with all context
 */
function buildDialogueUserPrompt(input: DialogueEngineInput): string {
  const {
    phase,
    messageHistory,
    profile,
    archetype,
    modulation,
    eqChips = [],
    dataStatus,
    intakeForm
  } = input;

  let prompt = ``;

  // Add current phase
  prompt += `<<<CURRENT_PHASE>>>\n${phase}\n<<<END_PHASE>>>\n\n`;

  // Add message history
  prompt += `<<<MESSAGE_HISTORY>>>\n`;
  messageHistory.forEach((turn, idx) => {
    prompt += `[Turn ${idx + 1}] ${turn.role.toUpperCase()}: ${turn.content}\n`;
  });
  prompt += `<<<END_HISTORY>>>\n\n`;

  // Add student profile
  prompt += `<<<STUDENT_PROFILE>>>\n`;
  prompt += JSON.stringify(profile, null, 2);
  prompt += `\n<<<END_PROFILE>>>\n\n`;

  // Add archetype classification
  prompt += `<<<ARCHETYPE_CLASSIFICATION>>>\n`;
  prompt += `Primary: ${archetype.primaryArchetype}\n`;
  if (archetype.secondaryArchetype) {
    prompt += `Secondary: ${archetype.secondaryArchetype}\n`;
  }
  prompt += `Confidence: ${archetype.confidence.toFixed(2)}\n`;
  prompt += `Evidence:\n`;
  archetype.evidence.forEach(e => prompt += `- ${e}\n`);
  prompt += `\nTone Overrides:\n`;
  prompt += `  Tone: ${archetype.toneOverrides.tone}\n`;
  prompt += `  Pacing: ${archetype.toneOverrides.pacing}\n`;
  prompt += `  Structure: ${archetype.toneOverrides.structure}\n`;
  prompt += `  Warmth: ${archetype.toneOverrides.warmth}\n`;
  prompt += `\nStyle Constraints:\n`;
  prompt += `  Avoid: ${archetype.styleConstraints.avoidPhrases.join(', ')}\n`;
  prompt += `  Increase: ${archetype.styleConstraints.increasePhrases.join(', ')}\n`;
  prompt += `<<<END_ARCHETYPE>>>\n\n`;

  // Add modulation envelope
  prompt += `<<<MODULATION_ENVELOPE>>>\n`;
  prompt += `Archetype: ${modulation.archetype}\n`;
  prompt += `Secondary: ${modulation.secondary || 'none'}\n`;
  prompt += `Confidence: ${modulation.confidence.toFixed(2)}\n`;
  prompt += `Tone Profile:\n`;
  prompt += `  Tone: ${modulation.toneProfile.tone}\n`;
  prompt += `  Structure: ${modulation.toneProfile.structure}\n`;
  prompt += `  Warmth: ${modulation.toneProfile.warmth}\n`;
  prompt += `  Pacing: ${modulation.toneProfile.pacing}\n`;
  prompt += `Directives:\n`;
  prompt += `  Reduce: ${modulation.toneProfile.directives.reduce.join(', ')}\n`;
  prompt += `  Increase: ${modulation.toneProfile.directives.increase.join(', ')}\n`;
  prompt += `  Emphasize: ${modulation.toneProfile.directives.emphasize.join(', ')}\n`;
  prompt += `<<<END_MODULATION>>>\n\n`;

  // Add EQ chips if available
  if (eqChips.length > 0) {
    prompt += `<<<EQ_CHIPS>>>\n`;
    eqChips.forEach(chip => prompt += `- ${chip}\n`);
    prompt += `<<<END_EQ_CHIPS>>>\n\n`;
  }

  // Add data collection status
  prompt += `<<<DATA_COLLECTION_STATUS>>>\n`;
  prompt += `Academics Complete: ${dataStatus.academicsComplete}\n`;
  prompt += `Extracurriculars Complete: ${dataStatus.extracurricularsComplete}\n`;
  prompt += `Stress Level Mapped: ${dataStatus.stressLevelMapped}\n`;
  prompt += `Motivation Probed: ${dataStatus.motivationProbed}\n`;
  prompt += `Identity Threads Explored: ${dataStatus.identityThreadsExplored}\n`;
  prompt += `Gaps Identified: ${dataStatus.gapsIdentified}\n`;
  prompt += `Commitment Level: ${dataStatus.commitmentLevel}\n`;
  prompt += `Confidence: ${dataStatus.confidence}\n`;
  prompt += `<<<END_DATA_STATUS>>>\n\n`;

  // Add intake form if available
  if (intakeForm) {
    prompt += `<<<INTAKE_FORM>>>\n`;
    prompt += JSON.stringify(intakeForm, null, 2);
    prompt += `\n<<<END_INTAKE_FORM>>>\n\n`;
  }

  prompt += `\nGenerate the next assessment turn as Jenny. Return the JSON output.`;

  return prompt;
}

/**
 * Call dialogue LLM
 *
 * In production, this would use:
 * import { runClaude } from '../../../llm/anthropicClient';
 *
 * For now, we provide a mock implementation that demonstrates
 * the dialogue generation logic.
 */
async function callDialogueLLM(
  systemPrompt: string,
  userPrompt: string,
  input: DialogueEngineInput
): Promise<string> {
  // In production:
  // const response = await runClaude({
  //   model: 'claude-3-5-sonnet-20241022',
  //   system: systemPrompt,
  //   messages: [{ role: 'user', content: userPrompt }],
  //   temperature: 0.7, // Higher temperature for natural conversation
  //   max_tokens: 1000
  // });
  // return response.content[0].text;

  // Mock implementation for testing
  return mockGenerateTurn(input);
}

/**
 * Mock dialogue generation for testing
 *
 * This simulates what the LLM would return based on phase and archetype.
 * In production, this is replaced by actual LLM call.
 */
function mockGenerateTurn(input: DialogueEngineInput): string {
  const { phase, messageHistory, archetype, dataStatus } = input;

  // Get last student message
  const lastStudentMessage = messageHistory
    .filter(m => m.role === 'student')
    .slice(-1)[0]?.content || '';

  const lowerMessage = lastStudentMessage.toLowerCase();
  const primaryArchetype = archetype.primaryArchetype;

  // Phase 1: Rapport & Safety
  if (phase === 'rapport_and_safety') {
    let message = '';
    const coachTurnCount = messageHistory.filter(m => m.role === 'coach').length;

    if (coachTurnCount === 0) {
      // Opening message - archetype-aware
      if (primaryArchetype === 'anxious_overthinker') {
        message = "Hey, I'm Jenny. I hear you. A lot of students feel that way — it's a big thing to navigate, and there's so much noise out there about what you're 'supposed' to do.\n\nThis conversation is just us figuring out where you are, what actually matters to you, and what makes sense for YOUR situation. No pressure, no judgment.\n\nLet's start with something simple: what's been on your mind lately about the whole college thing?";
      } else if (primaryArchetype === 'high_achieving_robot') {
        message = "Hey! I'm Jenny. I coach students through this whole college thing — the strategy, the stress, the stuff no one tells you.\n\nThis conversation is diagnostic, not evaluative. We're just mapping out where you are, what's working, what's not. No judgment.\n\nLet's start: what's your biggest stress point right now?";
      } else if (primaryArchetype === 'lost_dreamer') {
        message = "Hey! I'm Jenny. I work with students who are trying to figure out this whole college thing — what they want, what makes sense, what actually matters to them.\n\nThis conversation is exploratory. No pressure to have it all figured out. We're just going to map where you are and see what emerges.\n\nSo, first question: where are you at with the college stuff? Excited? Confused? Somewhere in between?";
      } else {
        message = "Hey! I'm Jenny. I coach students through college admissions — the strategy, the stress, all of it.\n\nThis is just a diagnostic conversation. We're figuring out where you are, what you care about, and what makes sense for you. No pressure.\n\nLet's start simple: what's top of mind for you about college right now?";
      }
    } else {
      // Follow-up in rapport phase
      message = "Got it. That makes sense.\n\nBefore we dive into the details, I want to get a feel for where you're at. On a scale of 1-10, how stressed are you about this whole college thing right now?";
    }

    // Advance phase if we have 2+ student messages (indicating good rapport established)
    const studentTurnCount = messageHistory.filter(m => m.role === 'student').length;
    const shouldAdvance = studentTurnCount >= 2;

    return JSON.stringify({
      message,
      nextPhase: shouldAdvance ? 'current_state_mapping' : 'rapport_and_safety',
      updatedDataStatus: {
        ...dataStatus,
        confidence: lowerMessage.includes('nervous') || lowerMessage.includes('stress') ? 'low' : 'unknown'
      },
      diagnosticNotes: [
        coachTurnCount === 0 ? 'Opening rapport message tailored to archetype' : 'Building trust, probing stress level',
        `Archetype: ${primaryArchetype}`
      ],
      followUpQuestions: ['What specific aspects are causing the most stress?'],
      phaseCompletionConfidence: shouldAdvance ? 0.8 : 0.4
    });
  }

  // Phase 2: Current State Mapping
  if (phase === 'current_state_mapping') {
    let message = '';
    const { academicsComplete, extracurricularsComplete, stressLevelMapped } = dataStatus;

    if (!academicsComplete) {
      message = "Let's start with the basics. Walk me through your academics — GPA, courseload, the rigor level. What are you taking this year?";
    } else if (!extracurricularsComplete) {
      if (primaryArchetype === 'high_achieving_robot') {
        message = "Okay, so you're carrying a LOT academically. Let's talk about your activities.\n\nWhat are you doing outside of class? And here's the real question: which of those things do you actually care about, and which ones feel like you're just checking a box?";
      } else {
        message = "Got it on the academics. Now let's talk about what else you're doing.\n\nWalk me through your activities — what you're involved in, how much time it takes, and whether you actually care about it or if it just feels like an obligation.";
      }
    } else if (!stressLevelMapped) {
      message = "Okay, I have a picture of what you're doing. Now I want to know how it FEELS.\n\nOn a scale of 1-10, how fried are you right now? And where does your time actually go during a typical week?";
    } else {
      // Ready to move to diagnostic phase
      message = "Alright, I'm getting a clear picture of your current state. Before we go deeper, tell me this: what are you doing that you actually care about? Like, what lights you up?";
    }

    const allDataGathered = academicsComplete && extracurricularsComplete && stressLevelMapped;

    return JSON.stringify({
      message,
      nextPhase: allDataGathered ? 'diagnostic_insights' : 'current_state_mapping',
      updatedDataStatus: {
        ...dataStatus,
        academicsComplete: lowerMessage.includes('gpa') || lowerMessage.includes('ap') || academicsComplete,
        extracurricularsComplete: lowerMessage.includes('club') || lowerMessage.includes('activity') || extracurricularsComplete,
        stressLevelMapped: lowerMessage.match(/\d+\/10|\d+ out of 10|really stressed|not stressed/i) !== null || stressLevelMapped
      },
      diagnosticNotes: [
        `Gathering ${!academicsComplete ? 'academic data' : !extracurricularsComplete ? 'EC data' : 'stress mapping'}`,
        `Archetype: ${primaryArchetype}`
      ],
      followUpQuestions: [
        !academicsComplete ? 'GPA and courseload details' : 'Activity breakdown'
      ],
      phaseCompletionConfidence: allDataGathered ? 0.85 : 0.6
    });
  }

  // Phase 3: Diagnostic Insights
  if (phase === 'diagnostic_insights') {
    let message = '';
    const { motivationProbed, identityThreadsExplored, gapsIdentified } = dataStatus;

    if (!motivationProbed) {
      if (primaryArchetype === 'high_achieving_robot') {
        message = "Here's what I'm noticing: you're doing a lot, and it's all high-level. But I want to know WHY.\n\nAre you doing this stuff because YOU care about it, or because it looks good? Be honest.";
      } else if (primaryArchetype === 'lost_dreamer') {
        message = "Okay, so you're doing a bunch of things, but I'm not hearing a clear thread yet. And that's okay — most students don't have it figured out.\n\nBut let me ask you this: if college admissions didn't exist, what would you actually be spending your time on?";
      } else {
        message = "I'm getting a picture of WHAT you're doing. Now I want to understand WHY.\n\nWhat's driving you? Is it internal (you care about this stuff) or external (it looks good, parents want it, etc.)?";
      }
    } else if (!identityThreadsExplored) {
      message = "Got it. So let me reflect this back: it sounds like you're doing X, but you actually care about Y. Is that right?\n\nWho do you think you are? And who do you want colleges to see?";
    } else if (!gapsIdentified) {
      message = "Okay, here's what I'm seeing so far. You've got strengths in [X], but I'm noticing some gaps or misalignments.\n\nWhat's something you're curious about but haven't explored yet? Or something you're doing that doesn't actually fit?";
    } else {
      // Ready to move to strategic preview
      if (primaryArchetype === 'high_achieving_robot') {
        message = "Alright, I'm seeing the full picture now. You're capable, you're driven, but you're also carrying too much. And some of it doesn't even align with what you care about.\n\nLet's talk about what comes next. What if we dropped something? What would that free up?";
      } else {
        message = "Okay, I think I'm seeing the pattern here. You've got [strength], but there's also [gap/misalignment].\n\nLet's start thinking about what makes sense moving forward. What's one thing you could do that would feel both authentic AND strategic?";
      }
    }

    // Detect if motivation has been revealed in the message
    const motivationRevealed = lowerMessage.includes('because') ||
                                lowerMessage.includes('for college') ||
                                lowerMessage.includes('parents') ||
                                lowerMessage.includes('looks good') ||
                                lowerMessage.includes('i guess');

    const updatedMotivationProbed = motivationProbed || motivationRevealed;
    const allInsightsGathered = updatedMotivationProbed && identityThreadsExplored && gapsIdentified;

    return JSON.stringify({
      message,
      nextPhase: allInsightsGathered ? 'strategic_preview' : 'diagnostic_insights',
      updatedDataStatus: {
        ...dataStatus,
        motivationProbed: updatedMotivationProbed,
        identityThreadsExplored: lowerMessage.includes('i am') || lowerMessage.includes('i care') || identityThreadsExplored,
        gapsIdentified: true,
        commitmentLevel: lowerMessage.includes('really care') || lowerMessage.includes('passionate') ? 'high' : 'medium'
      },
      diagnosticNotes: [
        `Probing ${!motivationProbed ? 'motivation' : !identityThreadsExplored ? 'identity' : 'gaps'}`,
        `Archetype: ${primaryArchetype}`,
        'Detecting patterns and misalignments'
      ],
      followUpQuestions: [
        'What drives this student intrinsically?',
        'Where are the gaps between actions and values?'
      ],
      phaseCompletionConfidence: allInsightsGathered ? 0.9 : 0.7
    });
  }

  // Phase 4: Strategic Preview
  if (phase === 'strategic_preview') {
    let message = '';

    if (primaryArchetype === 'high_achieving_robot') {
      message = "Okay, here's what I'm seeing. You're carrying a lot — maybe too much. Your GPA is strong, your activities are solid, but I'm hearing exhaustion more than excitement. That's not sustainable, and colleges won't buy it either.\n\nHere's what I think we should do: let's map out what you actually care about, drop what's dead weight, and build a strategy that doesn't burn you out. Sound good?";
    } else if (primaryArchetype === 'anxious_overthinker') {
      message = "Alright, here's the truth: you're more capable than you think. I'm seeing [specific strengths], but you're so focused on what could go wrong that you're not seeing what's already working.\n\nHere's the plan: let's build a strategy that feels manageable — one step at a time, no overwhelm. We'll focus on what you can control and let go of the rest. Deal?";
    } else if (primaryArchetype === 'lost_dreamer') {
      message = "Okay, here's what I'm noticing: you don't have it all figured out yet, and that's actually okay. Colleges aren't looking for students who have their whole life mapped out at 17 — they're looking for students who are curious and willing to explore.\n\nHere's what we'll do: let's design some lightweight experiments — small things you can try to see what resonates. No commitments, just exploration. Sound good?";
    } else {
      message = "Alright, here's what I'm seeing. You've got [strengths], but there are also some [gaps/misalignments] we need to address.\n\nHere's the plan: let's build a strategy that's both authentic AND competitive. We'll focus on [specific area], and we'll make sure your application tells a coherent story. Ready?";
    }

    return JSON.stringify({
      message,
      nextPhase: 'strategic_preview', // Stay in preview until session ends
      updatedDataStatus: {
        ...dataStatus,
        gapsIdentified: true
      },
      diagnosticNotes: [
        'Strategic preview delivered',
        `Archetype: ${primaryArchetype}`,
        'Next step: move to strategy building phase'
      ],
      followUpQuestions: [
        'What is the one concrete next step for this student?'
      ],
      phaseCompletionConfidence: 0.95
    });
  }

  // Fallback (shouldn't reach here)
  return JSON.stringify({
    message: "Let's keep going. What else should I know?",
    nextPhase: phase,
    updatedDataStatus: dataStatus,
    diagnosticNotes: ['Fallback response'],
    followUpQuestions: [],
    phaseCompletionConfidence: 0.5
  });
}

/**
 * Validate dialogue output
 */
function validateDialogueOutput(output: DialogueEngineOutput): boolean {
  // Check required fields
  if (!output.message || typeof output.message !== 'string') return false;
  if (!output.nextPhase) return false;
  if (!output.updatedDataStatus) return false;
  if (!Array.isArray(output.diagnosticNotes)) return false;

  // Check data status
  const ds = output.updatedDataStatus;
  if (typeof ds.academicsComplete !== 'boolean') return false;
  if (typeof ds.extracurricularsComplete !== 'boolean') return false;
  if (typeof ds.stressLevelMapped !== 'boolean') return false;
  if (typeof ds.motivationProbed !== 'boolean') return false;
  if (typeof ds.identityThreadsExplored !== 'boolean') return false;
  if (typeof ds.gapsIdentified !== 'boolean') return false;

  // Check phase completion confidence
  if (typeof output.phaseCompletionConfidence !== 'number') return false;
  if (output.phaseCompletionConfidence < 0 || output.phaseCompletionConfidence > 1) return false;

  return true;
}

/**
 * Helper: Get phase objectives
 */
export function getPhaseObjectives(phase: AssessmentPhase): string[] {
  const objectives: Record<AssessmentPhase, string[]> = {
    rapport_and_safety: [
      'Build trust and set expectations',
      'Make student feel heard and understood',
      'Establish diagnostic (not evaluative) frame',
      'Get first vulnerability signal'
    ],
    current_state_mapping: [
      'Map complete academic picture (GPA, courseload, scores)',
      'Understand all extracurricular commitments',
      'Assess stress level and time allocation',
      'Identify what student genuinely cares about'
    ],
    diagnostic_insights: [
      'Probe motivation (intrinsic vs. extrinsic)',
      'Explore identity threads and values',
      'Identify patterns (perfectionism, avoidance, etc.)',
      'Detect gaps and misalignments'
    ],
    strategic_preview: [
      'Reflect back what you see',
      'Name patterns or archetype (if appropriate)',
      'Offer one concrete next step',
      'Set tone for ongoing coaching'
    ]
  };

  return objectives[phase];
}

/**
 * Helper: Create initial data status
 */
export function createInitialDataStatus(): DataCollectionStatus {
  return {
    academicsComplete: false,
    extracurricularsComplete: false,
    stressLevelMapped: false,
    motivationProbed: false,
    identityThreadsExplored: false,
    gapsIdentified: false,
    commitmentLevel: 'unknown',
    confidence: 'unknown'
  };
}
