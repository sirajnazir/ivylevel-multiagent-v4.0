/**
 * EQ Weighting v4.0
 *
 * Boosts or downweights chunks based on EQ mode and EQ signals.
 *
 * This is where the adaptive magic happens:
 * - Struggling students → gentle, supportive chips
 * - High performers → direct, tactical chips
 * - Mid-performers → motivational, momentum-building chips
 */

import { EQMode, ChipMetadata } from "./ragTypes";

/**
 * Apply EQ Weight
 *
 * Returns a multiplier (0.8 - 1.4) based on how well the chip's
 * EQ signals align with the requested EQ mode.
 *
 * EQ Mode Mapping:
 * - gentle: Boost supportive, empathetic, validating signals
 * - direct: Boost straightforward, tactical, challenger signals
 * - motivational: Boost uplifting, momentum, agency signals
 *
 * @param chip - The chip metadata from Pinecone
 * @param eqMode - The requested EQ mode
 * @returns Weight multiplier (0.8 - 1.4)
 */
export function applyEQWeight(chip: ChipMetadata, eqMode: EQMode): number {
  console.log(`[EQWeighting] Calculating EQ weight for mode: ${eqMode}`);

  const eq = chip.eqSignals || [];
  let weight = 1.0;

  // Gentle mode: Boost supportive, empathetic signals
  if (eqMode === "gentle") {
    if (eq.includes("supportive") || eq.includes("empathy") || eq.includes("validating")) {
      weight = 1.3;
      console.log(`[EQWeighting] Gentle mode boost: ${weight}`);
    }
    if (eq.includes("resilience") || eq.includes("encouragement")) {
      weight = 1.2;
      console.log(`[EQWeighting] Gentle mode secondary boost: ${weight}`);
    }
    // Penalize overly direct or challenging chips in gentle mode
    if (eq.includes("challenger") || eq.includes("direct")) {
      weight = 0.8;
      console.log(`[EQWeighting] Gentle mode penalty for direct signals: ${weight}`);
    }
  }

  // Direct mode: Boost straightforward, tactical signals
  if (eqMode === "direct") {
    if (eq.includes("straight") || eq.includes("tactical") || eq.includes("challenger")) {
      weight = 1.3;
      console.log(`[EQWeighting] Direct mode boost: ${weight}`);
    }
    if (eq.includes("leadership") || eq.includes("agency")) {
      weight = 1.2;
      console.log(`[EQWeighting] Direct mode secondary boost: ${weight}`);
    }
    // Penalize overly gentle or emotional chips in direct mode
    if (eq.includes("supportive") || eq.includes("empathy")) {
      weight = 0.9;
      console.log(`[EQWeighting] Direct mode slight penalty for gentle signals: ${weight}`);
    }
  }

  // Motivational mode: Boost uplifting, momentum signals
  if (eqMode === "motivational") {
    if (eq.includes("uplifting") || eq.includes("momentum") || eq.includes("passion")) {
      weight = 1.4;
      console.log(`[EQWeighting] Motivational mode boost: ${weight}`);
    }
    if (eq.includes("agency") || eq.includes("growth-mindset")) {
      weight = 1.25;
      console.log(`[EQWeighting] Motivational mode secondary boost: ${weight}`);
    }
    // Slight penalty for overly tactical chips in motivational mode
    if (eq.includes("tactical") && !eq.includes("momentum")) {
      weight = 0.95;
      console.log(`[EQWeighting] Motivational mode slight penalty for pure tactical: ${weight}`);
    }
  }

  console.log(`[EQWeighting] Final weight: ${weight}`);
  return weight;
}

/**
 * Get EQ Signal Match Count
 *
 * Returns how many EQ signals in the chip match the desired mode.
 * Used for additional ranking signals.
 *
 * @param chip - The chip metadata
 * @param eqMode - The requested EQ mode
 * @returns Number of matching signals
 */
export function getEQSignalMatchCount(chip: ChipMetadata, eqMode: EQMode): number {
  const eq = chip.eqSignals || [];

  const modeSignals: Record<EQMode, string[]> = {
    gentle: ["supportive", "empathy", "validating", "resilience", "encouragement"],
    direct: ["straight", "tactical", "challenger", "leadership", "agency"],
    motivational: ["uplifting", "momentum", "passion", "agency", "growth-mindset"]
  };

  const targetSignals = modeSignals[eqMode];
  const matches = eq.filter(signal => targetSignals.includes(signal));

  console.log(`[EQWeighting] EQ signal matches for ${eqMode}: ${matches.length}`);
  return matches.length;
}

/**
 * Is EQ Compatible
 *
 * Returns true if the chip's EQ signals are compatible with the mode.
 * Used to filter out completely mismatched chips.
 *
 * @param chip - The chip metadata
 * @param eqMode - The requested EQ mode
 * @returns True if compatible, false otherwise
 */
export function isEQCompatible(chip: ChipMetadata, eqMode: EQMode): boolean {
  const eq = chip.eqSignals || [];

  // If no EQ signals, allow it (neutral)
  if (eq.length === 0) {
    return true;
  }

  // Gentle mode: Reject strongly challenger/direct chips
  if (eqMode === "gentle") {
    const hasDirectSignals = eq.includes("challenger") || eq.includes("direct");
    const hasGentleSignals =
      eq.includes("supportive") || eq.includes("empathy") || eq.includes("validating");

    // Reject if ONLY direct signals, no gentle signals
    if (hasDirectSignals && !hasGentleSignals) {
      console.log(`[EQWeighting] Chip incompatible with gentle mode (too direct)`);
      return false;
    }
  }

  // Direct mode: Reject overly emotional/supportive chips
  if (eqMode === "direct") {
    const hasEmotionalSignals = eq.includes("empathy") || eq.includes("validating");
    const hasDirectSignals =
      eq.includes("straight") || eq.includes("tactical") || eq.includes("challenger");

    // Reject if ONLY emotional signals, no direct signals
    if (hasEmotionalSignals && !hasDirectSignals && eq.length === 1) {
      console.log(`[EQWeighting] Chip incompatible with direct mode (too emotional)`);
      return false;
    }
  }

  // Motivational mode: Accept most chips (it's a broad mode)
  // Only reject chips with zero energy/momentum
  if (eqMode === "motivational") {
    // All chips are generally acceptable for motivational mode
    return true;
  }

  return true;
}
