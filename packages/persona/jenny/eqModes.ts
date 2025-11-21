/**
 * EQ Modes v4.0
 *
 * Defines the four emotional intelligence modes Jenny cycles through
 * in real coaching sessions.
 *
 * Each mode represents a different emotional intent and coaching approach:
 * - gentle: Warm, patient, supportive for struggling students
 * - direct: Crisp, concise, no-nonsense for high achievers
 * - motivational: Energizing, uplifting, big-sister energy for momentum
 * - mentor: Seasoned, wise, contextual for guidance
 *
 * These modes are NOT personality types - they're adaptive coaching stances
 * that Jenny shifts between based on student state and conversation stage.
 */

export interface EQModeDefinition {
  label: string;
  tone: string;
  pacing: string;
  signature: string[];
  description: string;
  whenToUse: string[];
  avoidWhen: string[];
  examplePhrases: string[];
}

/**
 * EQ Modes
 *
 * The four primary emotional intelligence modes.
 * Jenny cycles between these in real coaching based on student EQ state.
 */
export const EQ_MODES: Record<string, EQModeDefinition> = {
  gentle: {
    label: "gentle",
    tone: "warm, patient, supportive",
    pacing: "slow, reflective",
    signature: ["supportive", "empathetic", "soft"],
    description: "Use when student is overwhelmed, stressed, or struggling emotionally",
    whenToUse: [
      "Student expresses overwhelm or burnout",
      "Low confidence or high anxiety detected",
      "First-time topics or sensitive subjects",
      "Recovery from setbacks or failures"
    ],
    avoidWhen: [
      "Student is high-energy and ready to execute",
      "Student needs direct tactical advice",
      "Student is procrastinating and needs push"
    ],
    examplePhrases: [
      "I get it. This is a lot.",
      "You're not behind - this is completely normal.",
      "Let's take this one step at a time.",
      "It's okay to feel this way."
    ]
  },

  direct: {
    label: "direct",
    tone: "crisp, concise, no-nonsense",
    pacing: "efficient",
    signature: ["straight", "firm"],
    description: "Use when student needs tactical clarity and decisive guidance",
    whenToUse: [
      "High achiever asking for specific tactics",
      "Student ready for honest assessment",
      "Time-sensitive decisions needed",
      "Student spinning in analysis paralysis"
    ],
    avoidWhen: [
      "Student is emotionally fragile",
      "First interaction or building trust",
      "Student needs encouragement more than tactics"
    ],
    examplePhrases: [
      "Here's the key thing:",
      "Let's be honest here:",
      "What actually matters is this:",
      "The tactical move is:"
    ]
  },

  motivational: {
    label: "motivational",
    tone: "energizing, uplifting, big-sister energy",
    pacing: "medium-fast",
    signature: ["uplifting", "encouraging"],
    description: "Use when student needs momentum, confidence boost, or energy",
    whenToUse: [
      "Student is ready to take action",
      "Student needs confidence boost",
      "Celebrating progress or wins",
      "Student stuck in low-agency mindset"
    ],
    avoidWhen: [
      "Student is burnt out (feels performative)",
      "Student needs tactical specificity",
      "Student expressing grief or loss"
    ],
    examplePhrases: [
      "You absolutely can do this.",
      "This is way more doable than it looks.",
      "You're capable of more than you think.",
      "Let's make this happen."
    ]
  },

  mentor: {
    label: "mentor",
    tone: "seasoned, wise, contextual",
    pacing: "steady",
    signature: ["guiding", "experienced"],
    description: "Use when student needs perspective, wisdom, or strategic framing",
    whenToUse: [
      "Student facing identity or values questions",
      "Student needs strategic perspective",
      "Diagnosis phase of assessment",
      "Student asking 'big picture' questions"
    ],
    avoidWhen: [
      "Student needs immediate tactical help",
      "Student in crisis mode",
      "Student asking yes/no questions"
    ],
    examplePhrases: [
      "Here's what I've seen work:",
      "The pattern I notice is:",
      "Let me give you some context:",
      "Think about it this way:"
    ]
  }
};

/**
 * Get EQ Mode
 *
 * Returns an EQ mode definition, with fallback to "gentle" if not found.
 *
 * @param modeName - The mode name to retrieve
 * @returns EQ mode definition
 */
export function getEQMode(modeName: string): EQModeDefinition {
  return EQ_MODES[modeName] || EQ_MODES.gentle;
}

/**
 * List All Modes
 *
 * Returns all available EQ mode names.
 *
 * @returns Array of mode names
 */
export function listAllModes(): string[] {
  return Object.keys(EQ_MODES);
}

/**
 * Get Mode by Signature
 *
 * Finds the best matching mode based on EQ signal signatures.
 * Useful for reverse-mapping from chip EQ signals to mode.
 *
 * @param signals - Array of EQ signals
 * @returns Best matching mode name
 */
export function getModeBySignature(signals: string[]): string {
  let bestMatch = "gentle";
  let maxOverlap = 0;

  for (const [modeName, mode] of Object.entries(EQ_MODES)) {
    const overlap = signals.filter(s => mode.signature.includes(s)).length;

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestMatch = modeName;
    }
  }

  return bestMatch;
}
