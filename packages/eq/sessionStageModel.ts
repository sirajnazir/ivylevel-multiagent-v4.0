/**
 * Session Stage Model v4.0
 *
 * Defines the 7 stages of a Jenny assessment session.
 *
 * These stages represent the natural flow of an effective coaching conversation:
 * warm opening → rapport → probing → analysis → strategy → motivation → closing
 *
 * Each stage has different emotional requirements.
 */

/**
 * Session Stage
 *
 * The 7 stages of an assessment session, in typical order.
 */
export type SessionStage =
  | "opening" // First 5-10 minutes: warm welcome, set tone
  | "rapport-building" // Get student comfortable, establish trust
  | "diagnostic-probing" // Ask questions, understand situation
  | "analysis" // Think critically, identify patterns
  | "strategy-reveal" // Present insights and recommendations
  | "motivation" // Rally energy, build confidence
  | "closing"; // Wrap up, ensure clarity, send off strong

/**
 * Stage Descriptions
 *
 * Detailed purpose of each stage.
 */
export const STAGE_DESCRIPTIONS: Record<SessionStage, string> = {
  opening: "Warm welcome, establish safety, set conversational tone",
  "rapport-building": "Build trust, get student comfortable sharing vulnerably",
  "diagnostic-probing": "Ask probing questions, understand deeper situation",
  analysis: "Think critically, identify patterns, honest assessment",
  "strategy-reveal": "Present key insights and strategic recommendations",
  motivation: "Rally energy, build confidence, inspire action",
  closing: "Wrap up clearly, ensure understanding, send off strong"
};

/**
 * Stage Duration Estimates
 *
 * Typical duration for each stage in a 60-minute session (in minutes).
 */
export const STAGE_DURATIONS: Record<SessionStage, number> = {
  opening: 5,
  "rapport-building": 10,
  "diagnostic-probing": 15,
  analysis: 10,
  "strategy-reveal": 10,
  motivation: 5,
  closing: 5
};

/**
 * Get Stage Order
 *
 * Returns the canonical ordering of session stages.
 *
 * @returns Array of stages in typical session order
 */
export function getStageOrder(): SessionStage[] {
  return [
    "opening",
    "rapport-building",
    "diagnostic-probing",
    "analysis",
    "strategy-reveal",
    "motivation",
    "closing"
  ];
}

/**
 * Get Next Stage
 *
 * Returns the next stage after the given stage.
 *
 * @param current - Current session stage
 * @returns Next stage, or null if already at closing
 */
export function getNextStage(current: SessionStage): SessionStage | null {
  const order = getStageOrder();
  const currentIndex = order.indexOf(current);

  if (currentIndex === -1 || currentIndex === order.length - 1) {
    return null; // Invalid stage or already at closing
  }

  return order[currentIndex + 1];
}

/**
 * Get Previous Stage
 *
 * Returns the previous stage before the given stage.
 *
 * @param current - Current session stage
 * @returns Previous stage, or null if already at opening
 */
export function getPreviousStage(current: SessionStage): SessionStage | null {
  const order = getStageOrder();
  const currentIndex = order.indexOf(current);

  if (currentIndex <= 0) {
    return null; // Invalid stage or already at opening
  }

  return order[currentIndex - 1];
}

/**
 * Get Stage Progress
 *
 * Returns progress through session (0-1) based on current stage.
 *
 * @param current - Current session stage
 * @returns Progress from 0 (opening) to 1 (closing)
 */
export function getStageProgress(current: SessionStage): number {
  const order = getStageOrder();
  const currentIndex = order.indexOf(current);

  if (currentIndex === -1) {
    return 0;
  }

  return currentIndex / (order.length - 1);
}

/**
 * Is Early Stage
 *
 * Returns true if in opening or rapport-building stages.
 *
 * @param stage - Session stage
 * @returns True if early stage
 */
export function isEarlyStage(stage: SessionStage): boolean {
  return stage === "opening" || stage === "rapport-building";
}

/**
 * Is Middle Stage
 *
 * Returns true if in diagnostic-probing, analysis, or strategy-reveal stages.
 *
 * @param stage - Session stage
 * @returns True if middle stage
 */
export function isMiddleStage(stage: SessionStage): boolean {
  return (
    stage === "diagnostic-probing" || stage === "analysis" || stage === "strategy-reveal"
  );
}

/**
 * Is Late Stage
 *
 * Returns true if in motivation or closing stages.
 *
 * @param stage - Session stage
 * @returns True if late stage
 */
export function isLateStage(stage: SessionStage): boolean {
  return stage === "motivation" || stage === "closing";
}

/**
 * Estimate Stage From Time
 *
 * Estimates which stage we should be at based on elapsed session time.
 *
 * @param elapsedMinutes - Minutes elapsed in session
 * @returns Estimated current stage
 */
export function estimateStageFromTime(elapsedMinutes: number): SessionStage {
  let cumulative = 0;
  const order = getStageOrder();

  for (const stage of order) {
    cumulative += STAGE_DURATIONS[stage];
    if (elapsedMinutes < cumulative) {
      return stage;
    }
  }

  // If elapsed time exceeds total, we're in closing
  return "closing";
}
