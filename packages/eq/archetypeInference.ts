/**
 * Archetype Inference v4.0
 *
 * Lightweight heuristic detection of student archetypes from messages.
 *
 * This is NOT LLM-based - it uses simple keyword/pattern matching
 * to infer which archetype the student likely belongs to based on
 * their language patterns, emotional signals, and self-description.
 *
 * Purpose: Enable real-time archetype detection during conversation
 * without requiring expensive LLM calls or complex analysis.
 */

import { StudentArchetype } from "./archetypeModel";

/**
 * Infer Archetype
 *
 * Analyzes a student message and attempts to infer their archetype
 * based on keyword patterns and emotional signals.
 *
 * Returns null if no clear archetype can be inferred.
 *
 * @param msg - Student message text
 * @returns Detected archetype or null
 */
export function inferArchetype(msg: string): StudentArchetype | null {
  const m = msg.toLowerCase();

  // Low-confidence-builder: Expresses self-doubt, feels behind, lacks belief
  if (
    m.includes("i'm not good") ||
    m.includes("i feel behind") ||
    m.includes("not smart enough") ||
    m.includes("can't do this") ||
    m.includes("everyone else is better") ||
    m.includes("i'll probably fail") ||
    m.includes("i'm bad at")
  ) {
    return "low-confidence-builder";
  }

  // High-achiever-anxious: High standards + anxiety, perfectionism, panic
  if (
    m.includes("i need to get into") ||
    m.includes("i must") ||
    m.includes("panic") ||
    m.includes("not good enough") ||
    m.includes("what if i don't") ||
    m.includes("i'm so stressed about") ||
    m.includes("perfect score") ||
    m.includes("anything less than")
  ) {
    return "high-achiever-anxious";
  }

  // Overconfident-spiky: Overestimates ability, dismissive, already knows it all
  if (
    m.includes("i already know") ||
    m.includes("i'm ahead") ||
    m.includes("this is easy") ||
    m.includes("don't need help") ||
    m.includes("i got this") ||
    m.includes("pretty sure i'm fine") ||
    m.includes("way ahead of")
  ) {
    return "overconfident-spiky";
  }

  // Late-starter: Behind but motivated, catching up, urgency
  if (
    m.includes("starting late") ||
    m.includes("fell behind") ||
    m.includes("need to catch up") ||
    m.includes("behind my peers") ||
    m.includes("just started thinking about") ||
    m.includes("wish i had started earlier")
  ) {
    return "late-starter";
  }

  // Underdog-high-ceiling: Underestimated, proving potential, non-traditional
  if (
    m.includes("people don't expect") ||
    m.includes("first generation") ||
    m.includes("first in my family") ||
    m.includes("no one thinks i can") ||
    m.includes("prove them wrong") ||
    m.includes("from a small school")
  ) {
    return "underdog-high-ceiling";
  }

  // No clear archetype detected
  return null;
}

/**
 * Infer Archetype With Confidence
 *
 * Returns both the inferred archetype and a confidence score (0-1).
 *
 * Higher confidence means stronger signal match.
 *
 * @param msg - Student message text
 * @returns Object with archetype and confidence score
 */
export function inferArchetypeWithConfidence(msg: string): {
  archetype: StudentArchetype | null;
  confidence: number;
} {
  const m = msg.toLowerCase();
  let maxScore = 0;
  let detected: StudentArchetype | null = null;

  // Count matches for each archetype
  const scores = {
    "low-confidence-builder": 0,
    "high-achiever-anxious": 0,
    "overconfident-spiky": 0,
    "late-starter": 0,
    "underdog-high-ceiling": 0
  };

  // Low-confidence patterns
  if (m.includes("i'm not good")) scores["low-confidence-builder"] += 3;
  if (m.includes("i feel behind")) scores["low-confidence-builder"] += 2;
  if (m.includes("not smart enough")) scores["low-confidence-builder"] += 3;
  if (m.includes("can't do this")) scores["low-confidence-builder"] += 2;
  if (m.includes("everyone else is better")) scores["low-confidence-builder"] += 3;

  // High-achiever-anxious patterns
  if (m.includes("i need to get into")) scores["high-achiever-anxious"] += 3;
  if (m.includes("panic")) scores["high-achiever-anxious"] += 2;
  if (m.includes("perfect")) scores["high-achiever-anxious"] += 2;
  if (m.includes("what if i don't")) scores["high-achiever-anxious"] += 2;
  if (m.includes("i must")) scores["high-achiever-anxious"] += 1;

  // Overconfident-spiky patterns
  if (m.includes("i already know")) scores["overconfident-spiky"] += 3;
  if (m.includes("i'm ahead")) scores["overconfident-spiky"] += 2;
  if (m.includes("this is easy")) scores["overconfident-spiky"] += 2;
  if (m.includes("don't need help")) scores["overconfident-spiky"] += 3;
  if (m.includes("i got this")) scores["overconfident-spiky"] += 1;

  // Late-starter patterns
  if (m.includes("starting late")) scores["late-starter"] += 3;
  if (m.includes("fell behind")) scores["late-starter"] += 2;
  if (m.includes("need to catch up")) scores["late-starter"] += 2;
  if (m.includes("behind my peers")) scores["late-starter"] += 2;

  // Underdog-high-ceiling patterns
  if (m.includes("first generation")) scores["underdog-high-ceiling"] += 3;
  if (m.includes("first in my family")) scores["underdog-high-ceiling"] += 3;
  if (m.includes("no one thinks i can")) scores["underdog-high-ceiling"] += 3;
  if (m.includes("prove them wrong")) scores["underdog-high-ceiling"] += 2;

  // Find highest scoring archetype
  for (const [archetype, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detected = archetype as StudentArchetype;
    }
  }

  // Normalize confidence to 0-1 (max possible score is ~10)
  const confidence = Math.min(maxScore / 10, 1.0);

  return { archetype: detected, confidence };
}

/**
 * Get Archetype Signals
 *
 * Returns all archetype signals detected in a message with their strengths.
 *
 * Useful for debugging and understanding why an archetype was detected.
 *
 * @param msg - Student message text
 * @returns Array of detected signals
 */
export function getArchetypeSignals(msg: string): Array<{
  archetype: StudentArchetype;
  pattern: string;
  strength: number;
}> {
  const m = msg.toLowerCase();
  const signals: Array<{ archetype: StudentArchetype; pattern: string; strength: number }> = [];

  // Low-confidence patterns
  if (m.includes("i'm not good")) {
    signals.push({ archetype: "low-confidence-builder", pattern: "i'm not good", strength: 3 });
  }
  if (m.includes("i feel behind")) {
    signals.push({ archetype: "low-confidence-builder", pattern: "i feel behind", strength: 2 });
  }
  if (m.includes("not smart enough")) {
    signals.push({
      archetype: "low-confidence-builder",
      pattern: "not smart enough",
      strength: 3
    });
  }

  // High-achiever-anxious patterns
  if (m.includes("i need to get into")) {
    signals.push({
      archetype: "high-achiever-anxious",
      pattern: "i need to get into",
      strength: 3
    });
  }
  if (m.includes("panic")) {
    signals.push({ archetype: "high-achiever-anxious", pattern: "panic", strength: 2 });
  }
  if (m.includes("perfect")) {
    signals.push({ archetype: "high-achiever-anxious", pattern: "perfect", strength: 2 });
  }

  // Overconfident-spiky patterns
  if (m.includes("i already know")) {
    signals.push({ archetype: "overconfident-spiky", pattern: "i already know", strength: 3 });
  }
  if (m.includes("this is easy")) {
    signals.push({ archetype: "overconfident-spiky", pattern: "this is easy", strength: 2 });
  }
  if (m.includes("don't need help")) {
    signals.push({ archetype: "overconfident-spiky", pattern: "don't need help", strength: 3 });
  }

  // Late-starter patterns
  if (m.includes("starting late")) {
    signals.push({ archetype: "late-starter", pattern: "starting late", strength: 3 });
  }
  if (m.includes("fell behind")) {
    signals.push({ archetype: "late-starter", pattern: "fell behind", strength: 2 });
  }
  if (m.includes("need to catch up")) {
    signals.push({ archetype: "late-starter", pattern: "need to catch up", strength: 2 });
  }

  // Underdog-high-ceiling patterns
  if (m.includes("first generation")) {
    signals.push({
      archetype: "underdog-high-ceiling",
      pattern: "first generation",
      strength: 3
    });
  }
  if (m.includes("first in my family")) {
    signals.push({
      archetype: "underdog-high-ceiling",
      pattern: "first in my family",
      strength: 3
    });
  }
  if (m.includes("prove them wrong")) {
    signals.push({
      archetype: "underdog-high-ceiling",
      pattern: "prove them wrong",
      strength: 2
    });
  }

  return signals;
}
