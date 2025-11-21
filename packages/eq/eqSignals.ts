/**
 * EQ Signals v4.0
 *
 * Categorizes the raw EQ flags we track from student messages.
 *
 * These signals are grounded in Jenny's real coaching sessions.
 * NOT psychobabble, NOT hallucinated emotional states.
 *
 * Each signal maps to specific coaching behaviors:
 * - ANXIETY → slow pacing, reassurance, scaffolding
 * - EAGERNESS → faster pace, challenge, momentum
 * - RESISTANCE → firm boundaries, "coach energy"
 * - OVERWHELM → tactical breakdown, smaller steps
 * - etc.
 */

/**
 * EQ Signal
 *
 * The 12 emotional intelligence signals we track.
 *
 * Negative Spectrum:
 * - ANXIETY: Nervousness, worry, fear
 * - INSECURITY: Self-doubt, imposter syndrome
 * - CONFUSION: Lack of clarity, uncertain
 * - OVERWHELM: Too much, burnt out, can't handle
 * - APATHY: Disengaged, "why bother"
 * - FRUSTRATION: Annoyed, stuck, not working
 * - RESISTANCE: Pushback, refusal, defiance
 *
 * Positive Spectrum:
 * - EAGERNESS: Excited, ready, let's go
 * - CONFIDENCE: Self-assured, capable
 * - CURIOSITY: Questioning, exploring, learning
 * - PRIDE: Achievement, success, accomplishment
 * - DISCIPLINE: Consistency, follow-through, structure
 */
export type EQSignal =
  | "ANXIETY"
  | "INSECURITY"
  | "CONFUSION"
  | "OVERWHELM"
  | "APATHY"
  | "EAGERNESS"
  | "CONFIDENCE"
  | "CURIOSITY"
  | "PRIDE"
  | "DISCIPLINE"
  | "FRUSTRATION"
  | "RESISTANCE";

/**
 * EQ Keywords
 *
 * Deterministic keyword patterns for each EQ signal.
 * Used for fast, rule-based detection before LLM refinement.
 *
 * These patterns are derived from analyzing Jenny's real transcripts
 * to see what language patterns students use when experiencing each signal.
 */
export const EQ_KEYWORDS: Record<EQSignal, string[]> = {
  ANXIETY: [
    "nervous",
    "anxious",
    "worried",
    "scared",
    "afraid",
    "panic",
    "stress",
    "freaking out",
    "terrified"
  ],

  INSECURITY: [
    "i'm not good enough",
    "not smart enough",
    "i can't do it",
    "others are better",
    "everyone else",
    "i'm behind",
    "not qualified",
    "don't deserve",
    "imposter"
  ],

  CONFUSION: [
    "i don't get",
    "not sure",
    "confused",
    "don't understand",
    "unclear",
    "what does that mean",
    "lost",
    "how do i",
    "which one"
  ],

  OVERWHELM: [
    "too much",
    "can't handle",
    "burnt out",
    "overwhelmed",
    "drowning",
    "can't keep up",
    "exhausted",
    "so much to do",
    "never ending"
  ],

  APATHY: [
    "don't care",
    "whatever",
    "why bother",
    "doesn't matter",
    "who cares",
    "not motivated",
    "meh",
    "uninspired",
    "going through motions"
  ],

  EAGERNESS: [
    "excited",
    "let's do it",
    "ready",
    "can't wait",
    "pumped",
    "motivated",
    "let's go",
    "bring it on",
    "i want to start"
  ],

  CONFIDENCE: [
    "i can do this",
    "i feel good",
    "i got it",
    "i know i can",
    "i'm ready",
    "i'm capable",
    "i believe",
    "i'll succeed",
    "i'm strong"
  ],

  CURIOSITY: [
    "why",
    "how does",
    "can you explain",
    "tell me more",
    "what if",
    "i wonder",
    "interested in",
    "want to learn",
    "what about"
  ],

  PRIDE: [
    "i achieved",
    "i won",
    "i built",
    "i accomplished",
    "proud of",
    "i did it",
    "i finished",
    "i succeeded",
    "i completed"
  ],

  DISCIPLINE: [
    "i followed",
    "i stayed consistent",
    "i stuck with",
    "i kept going",
    "i didn't give up",
    "i maintained",
    "i practiced",
    "i committed",
    "i held myself"
  ],

  FRUSTRATION: [
    "annoyed",
    "this sucks",
    "not working",
    "fed up",
    "irritated",
    "sick of",
    "hate this",
    "so annoying",
    "pissed off"
  ],

  RESISTANCE: [
    "i don't want",
    "i refuse",
    "stop telling me",
    "not doing that",
    "won't do it",
    "don't make me",
    "no way",
    "i'm not going to",
    "leave me alone"
  ]
};

/**
 * Get EQ Signal Label
 *
 * Returns human-readable label for an EQ signal.
 *
 * @param signal - EQ signal
 * @returns Label string
 */
export function getEQSignalLabel(signal: EQSignal): string {
  const labels: Record<EQSignal, string> = {
    ANXIETY: "Anxious/Nervous",
    INSECURITY: "Insecure/Self-Doubt",
    CONFUSION: "Confused/Uncertain",
    OVERWHELM: "Overwhelmed/Burnt Out",
    APATHY: "Apathetic/Disengaged",
    EAGERNESS: "Eager/Excited",
    CONFIDENCE: "Confident/Self-Assured",
    CURIOSITY: "Curious/Questioning",
    PRIDE: "Proud/Accomplished",
    DISCIPLINE: "Disciplined/Consistent",
    FRUSTRATION: "Frustrated/Annoyed",
    RESISTANCE: "Resistant/Defiant"
  };

  return labels[signal];
}

/**
 * Get EQ Signal Category
 *
 * Groups signals into broader categories.
 *
 * @param signal - EQ signal
 * @returns Category string
 */
export function getEQSignalCategory(signal: EQSignal): "negative" | "positive" | "neutral" {
  const negative: EQSignal[] = [
    "ANXIETY",
    "INSECURITY",
    "CONFUSION",
    "OVERWHELM",
    "APATHY",
    "FRUSTRATION",
    "RESISTANCE"
  ];

  const positive: EQSignal[] = ["EAGERNESS", "CONFIDENCE", "PRIDE", "DISCIPLINE"];

  const neutral: EQSignal[] = ["CURIOSITY"];

  if (negative.includes(signal)) return "negative";
  if (positive.includes(signal)) return "positive";
  return "neutral";
}

/**
 * Is Supportive Signal Needed
 *
 * Determines if this signal requires high warmth/empathy response.
 *
 * @param signal - EQ signal
 * @returns True if supportive response needed
 */
export function isSupportiveSignalNeeded(signal: EQSignal): boolean {
  return ["ANXIETY", "INSECURITY", "OVERWHELM", "FRUSTRATION"].includes(signal);
}

/**
 * Is Challenging Signal Appropriate
 *
 * Determines if this signal allows for higher challenge/firmness.
 *
 * @param signal - EQ signal
 * @returns True if challenge appropriate
 */
export function isChallengingSignalAppropriate(signal: EQSignal): boolean {
  return ["CONFIDENCE", "EAGERNESS", "DISCIPLINE", "PRIDE"].includes(signal);
}
