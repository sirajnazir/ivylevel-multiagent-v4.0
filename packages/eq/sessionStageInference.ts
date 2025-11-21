/**
 * Session Stage Inference v4.0
 *
 * Automatic session stage progression based on conversation flow.
 *
 * This module detects when to transition between session stages by
 * analyzing student messages for stage-specific signals and patterns.
 *
 * Purpose: Enable dynamic emotional arc without requiring manual
 * stage advancement - the conversation naturally flows through stages.
 */

import { SessionStage } from "./sessionStageModel";

/**
 * Detect Session Stage
 *
 * Analyzes current message to determine if session should advance to next stage.
 *
 * Stage progression is generally one-way (opening → closing), but can stay
 * at current stage if no advancement signal is detected.
 *
 * @param msg - Student message text
 * @param currentStage - Current session stage
 * @returns Updated session stage
 */
export function detectSessionStage(msg: string, currentStage: SessionStage): SessionStage {
  const m = msg.toLowerCase();

  switch (currentStage) {
    case "opening":
      // After opening, always move to rapport-building
      // (Opening is just the first greeting/exchange)
      return "rapport-building";

    case "rapport-building":
      // Move to diagnostic-probing when student starts sharing details
      if (
        m.includes("grades") ||
        m.includes("gpa") ||
        m.includes("profile") ||
        m.includes("activities") ||
        m.includes("extracurriculars") ||
        m.includes("sat") ||
        m.includes("act") ||
        m.includes("my school") ||
        m.includes("what i've done")
      ) {
        return "diagnostic-probing";
      }
      return currentStage;

    case "diagnostic-probing":
      // Move to analysis when student asks for assessment/interpretation
      if (
        m.includes("so what does this mean") ||
        m.includes("so am i on track") ||
        m.includes("how do i look") ||
        m.includes("what are my chances") ||
        m.includes("be honest") ||
        m.includes("where do i stand") ||
        m.includes("assess my profile")
      ) {
        return "analysis";
      }
      return currentStage;

    case "analysis":
      // Move to strategy-reveal when student asks what to do
      if (
        m.includes("what should i do") ||
        m.includes("what do you recommend") ||
        m.includes("plan") ||
        m.includes("next steps") ||
        m.includes("how do i improve") ||
        m.includes("what can i change") ||
        m.includes("strategy")
      ) {
        return "strategy-reveal";
      }
      return currentStage;

    case "strategy-reveal":
      // Move to motivation after strategy is presented
      // (typically after 1-2 exchanges)
      if (
        m.includes("okay") ||
        m.includes("got it") ||
        m.includes("makes sense") ||
        m.includes("i understand") ||
        m.includes("thank") ||
        m.includes("appreciate")
      ) {
        return "motivation";
      }
      return currentStage;

    case "motivation":
      // Move to closing when student signals readiness to end
      if (
        m.includes("thank you") ||
        m.includes("this helps") ||
        m.includes("i feel better") ||
        m.includes("i'm ready") ||
        m.includes("let me get started") ||
        m.includes("i'll work on")
      ) {
        return "closing";
      }
      return currentStage;

    case "closing":
      // Stay in closing - end of conversation
      return "closing";

    default:
      return currentStage;
  }
}

/**
 * Detect Stage From Time
 *
 * Alternative stage detection based on elapsed session time.
 *
 * Useful as a fallback if message-based detection doesn't trigger.
 *
 * @param elapsedMinutes - Minutes elapsed in session
 * @param currentStage - Current session stage
 * @returns Updated session stage
 */
export function detectStageFromTime(
  elapsedMinutes: number,
  currentStage: SessionStage
): SessionStage {
  // Don't regress stages based on time
  const stageOrder: SessionStage[] = [
    "opening",
    "rapport-building",
    "diagnostic-probing",
    "analysis",
    "strategy-reveal",
    "motivation",
    "closing"
  ];

  const currentIndex = stageOrder.indexOf(currentStage);

  // Time-based stage boundaries (cumulative)
  if (elapsedMinutes < 5) {
    return stageOrder[Math.max(currentIndex, 0)]; // opening
  } else if (elapsedMinutes < 15) {
    return stageOrder[Math.max(currentIndex, 1)]; // rapport-building
  } else if (elapsedMinutes < 30) {
    return stageOrder[Math.max(currentIndex, 2)]; // diagnostic-probing
  } else if (elapsedMinutes < 40) {
    return stageOrder[Math.max(currentIndex, 3)]; // analysis
  } else if (elapsedMinutes < 50) {
    return stageOrder[Math.max(currentIndex, 4)]; // strategy-reveal
  } else if (elapsedMinutes < 55) {
    return stageOrder[Math.max(currentIndex, 5)]; // motivation
  } else {
    return stageOrder[Math.max(currentIndex, 6)]; // closing
  }
}

/**
 * Get Stage Advancement Signals
 *
 * Returns signals detected in the message that suggest stage advancement.
 *
 * Useful for debugging and understanding why stage changed.
 *
 * @param msg - Student message text
 * @param currentStage - Current session stage
 * @returns Array of detected advancement signals
 */
export function getStageAdvancementSignals(
  msg: string,
  currentStage: SessionStage
): Array<{ pattern: string; targetStage: SessionStage }> {
  const m = msg.toLowerCase();
  const signals: Array<{ pattern: string; targetStage: SessionStage }> = [];

  switch (currentStage) {
    case "opening":
      // Opening always advances
      signals.push({ pattern: "auto-advance", targetStage: "rapport-building" });
      break;

    case "rapport-building":
      if (m.includes("grades")) {
        signals.push({ pattern: "grades", targetStage: "diagnostic-probing" });
      }
      if (m.includes("profile")) {
        signals.push({ pattern: "profile", targetStage: "diagnostic-probing" });
      }
      if (m.includes("activities")) {
        signals.push({ pattern: "activities", targetStage: "diagnostic-probing" });
      }
      break;

    case "diagnostic-probing":
      if (m.includes("what does this mean")) {
        signals.push({ pattern: "what does this mean", targetStage: "analysis" });
      }
      if (m.includes("am i on track")) {
        signals.push({ pattern: "am i on track", targetStage: "analysis" });
      }
      if (m.includes("where do i stand")) {
        signals.push({ pattern: "where do i stand", targetStage: "analysis" });
      }
      break;

    case "analysis":
      if (m.includes("what should i do")) {
        signals.push({ pattern: "what should i do", targetStage: "strategy-reveal" });
      }
      if (m.includes("plan")) {
        signals.push({ pattern: "plan", targetStage: "strategy-reveal" });
      }
      if (m.includes("next steps")) {
        signals.push({ pattern: "next steps", targetStage: "strategy-reveal" });
      }
      break;

    case "strategy-reveal":
      if (m.includes("okay") || m.includes("got it")) {
        signals.push({ pattern: "okay/got it", targetStage: "motivation" });
      }
      if (m.includes("makes sense")) {
        signals.push({ pattern: "makes sense", targetStage: "motivation" });
      }
      if (m.includes("thank")) {
        signals.push({ pattern: "thank", targetStage: "motivation" });
      }
      break;

    case "motivation":
      if (m.includes("thank you")) {
        signals.push({ pattern: "thank you", targetStage: "closing" });
      }
      if (m.includes("this helps")) {
        signals.push({ pattern: "this helps", targetStage: "closing" });
      }
      if (m.includes("i'm ready")) {
        signals.push({ pattern: "i'm ready", targetStage: "closing" });
      }
      break;
  }

  return signals;
}

/**
 * Should Force Stage Advancement
 *
 * Determines if stage should be forcibly advanced based on message count.
 *
 * Prevents getting stuck in early stages if student doesn't trigger
 * normal advancement signals.
 *
 * @param currentStage - Current session stage
 * @param messageCount - Number of messages in current stage
 * @returns True if stage should advance
 */
export function shouldForceStageAdvancement(
  currentStage: SessionStage,
  messageCount: number
): boolean {
  const maxMessagesPerStage: Record<SessionStage, number> = {
    opening: 2, // Just greeting
    "rapport-building": 5, // Build trust
    "diagnostic-probing": 10, // Gather info
    analysis: 5, // Share assessment
    "strategy-reveal": 5, // Present plan
    motivation: 3, // Rally energy
    closing: 3 // Wrap up
  };

  return messageCount >= maxMessagesPerStage[currentStage];
}
