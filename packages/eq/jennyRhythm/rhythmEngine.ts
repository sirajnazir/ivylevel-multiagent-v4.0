/**
 * jennyRhythm/rhythmEngine.ts
 *
 * Jenny Rhythm Engine - builds sentence arcs using clause generator.
 * Implements Jenny's distinctive rhythm patterns:
 * - Two-sentence arcs (validation → direction)
 * - Three-sentence arcs (validation → direction → encouragement)
 * - Emotional cadence control
 */

import { JennyClauseGenerator } from "./clauseGenerator";
import { ClauseOptions, RhythmPattern, SentenceArc, RhythmPacing } from "./types";
import { ToneDirective } from "../toneModulationEngine";

/**
 * Jenny Rhythm Engine
 *
 * Orchestrates clause generation into coherent sentence arcs
 * that follow Jenny's rhythm DNA.
 */
export class JennyRhythmEngine {
  private clauseGen = new JennyClauseGenerator();

  /**
   * Build two-sentence arc (validation → direction)
   * This is Jenny's core rhythm pattern: acknowledge → aim
   *
   * Example: "That tension is real. Here's the move I'd focus on next."
   */
  buildTwoSentenceArc(tone: ToneDirective, opts: ClauseOptions): SentenceArc {
    const validation = this.clauseGen.generateValidationClause(opts);
    const direction = this.clauseGen.generateDirectionClause(opts);

    return {
      validation,
      direction,
      pattern: "validation-direction",
    };
  }

  /**
   * Build three-sentence arc (validation → direction → encouragement)
   * Extended rhythm for higher-stakes moments: acknowledge → aim → act
   *
   * Example: "This is a lot to hold. Let's anchor to the simplest next move. You can absolutely handle this."
   */
  buildThreeSentenceArc(tone: ToneDirective, opts: ClauseOptions): SentenceArc {
    const validation = this.clauseGen.generateValidationClause(opts);
    const direction = this.clauseGen.generateDirectionClause(opts);
    const encouragement = this.clauseGen.generateEncouragementClause(opts);

    return {
      validation,
      direction,
      encouragement,
      pattern: "validation-direction-encouragement",
    };
  }

  /**
   * Build grounding-clarity arc (emotion → structure)
   * Used when student needs stabilization before action
   */
  buildGroundingClarityArc(tone: ToneDirective, opts: ClauseOptions): SentenceArc {
    // Use breath marker to create pause
    const breathMarker = this.clauseGen.generateBreathMarker(opts.pacing);

    // Validation with breath marker
    const validation = `${breathMarker} ${this.clauseGen.generateValidationClause(opts)}`;

    // Direction with softener
    const softener = this.clauseGen.generateSoftener();
    const directionCore = this.clauseGen.generateDirectionClause(opts);
    const direction = `${softener} ${directionCore.charAt(0).toLowerCase()}${directionCore.slice(1)}`;

    return {
      validation,
      direction,
      pattern: "grounding-clarity",
    };
  }

  /**
   * Build empathy-action arc (feeling → doing)
   * Used when emotional state requires extra validation
   */
  buildEmpathyActionArc(tone: ToneDirective, opts: ClauseOptions): SentenceArc {
    const validation = this.clauseGen.generateValidationClause(opts);

    // Direction is softer, more invitational
    const softener = this.clauseGen.generateSoftener();
    const directionCore = this.clauseGen.generateDirectionClause(opts);
    const direction = `${softener} ${directionCore.charAt(0).toLowerCase()}${directionCore.slice(1)}`;

    const encouragement = this.clauseGen.generateEncouragementClause(opts);

    return {
      validation,
      direction,
      encouragement,
      pattern: "empathy-action",
    };
  }

  /**
   * Select appropriate arc pattern based on tone and emotional state
   * This is the core routing logic for rhythm patterns
   */
  selectArcPattern(tone: ToneDirective, opts: ClauseOptions): RhythmPattern {
    const { emotionalState, pacing } = opts;

    // Overwhelmed students need grounding-clarity (emotion → structure)
    if (emotionalState === "overwhelmed") {
      return "grounding-clarity";
    }

    // Stressed students with slow pacing need empathy-action
    if (emotionalState === "stressed" && pacing === "slow") {
      return "empathy-action";
    }

    // High warmth + low assertiveness → empathy-action
    if (tone.warmth >= 7 && tone.assertiveness <= 4) {
      return "empathy-action";
    }

    // Fast pacing + high assertiveness → validation-direction (crisp)
    if (pacing === "fast" && tone.assertiveness >= 7) {
      return "validation-direction";
    }

    // High directness → validation-direction (efficient)
    if (tone.directness >= 8) {
      return "validation-direction";
    }

    // Default: three-sentence arc for balanced support
    return "validation-direction-encouragement";
  }

  /**
   * Build arc using selected pattern
   */
  buildArc(tone: ToneDirective, opts: ClauseOptions, pattern?: RhythmPattern): SentenceArc {
    const selectedPattern = pattern || this.selectArcPattern(tone, opts);

    switch (selectedPattern) {
      case "validation-direction":
        return this.buildTwoSentenceArc(tone, opts);

      case "validation-direction-encouragement":
        return this.buildThreeSentenceArc(tone, opts);

      case "grounding-clarity":
        return this.buildGroundingClarityArc(tone, opts);

      case "empathy-action":
        return this.buildEmpathyActionArc(tone, opts);

      default:
        return this.buildTwoSentenceArc(tone, opts);
    }
  }

  /**
   * Convert sentence arc to formatted string
   */
  arcToString(arc: SentenceArc): string {
    const parts: string[] = [];

    if (arc.validation) {
      parts.push(arc.validation);
    }

    if (arc.direction) {
      parts.push(arc.direction);
    }

    if (arc.encouragement) {
      parts.push(arc.encouragement);
    }

    return parts.join(" ");
  }

  /**
   * Get clause generator (for external access)
   */
  getClauseGenerator(): JennyClauseGenerator {
    return this.clauseGen;
  }

  /**
   * Reset engine state
   */
  reset(): void {
    this.clauseGen.reset();
  }

  /**
   * Get engine state for debugging
   */
  getState() {
    return {
      clauseGenState: this.clauseGen.getState(),
    };
  }
}

/**
 * Helper function to quickly build a two-sentence arc
 */
export function buildQuickArc(tone: ToneDirective, opts: ClauseOptions): string {
  const engine = new JennyRhythmEngine();
  const arc = engine.buildTwoSentenceArc(tone, opts);
  return engine.arcToString(arc);
}

/**
 * Helper function to build arc with auto-selected pattern
 */
export function buildAutoArc(tone: ToneDirective, opts: ClauseOptions): string {
  const engine = new JennyRhythmEngine();
  const arc = engine.buildArc(tone, opts);
  return engine.arcToString(arc);
}
