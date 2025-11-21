/**
 * eqEngine.ts
 *
 * Component 3 - EQ Engine
 *
 * Main EQ adaptation engine that:
 * - Detects student archetype
 * - Maps archetype to EQ style
 * - Maintains EQ state
 * - Provides style recommendations
 */

import { detectArchetype } from "./archetypeDetector";
import { EQ_STYLES } from "./eqProfiles";
import type { EQState, EQStyle, Archetype } from "./types";

export class EQEngine {
  private state: EQState = {
    archetype: null,
    style: null,
    lastUpdated: Date.now(),
  };

  /**
   * Get State
   *
   * Returns current EQ state.
   */
  getState(): EQState {
    return this.state;
  }

  /**
   * Update Student Archetype
   *
   * Analyzes latest student message and updates archetype + EQ style.
   *
   * @param latestUserMsg - Latest message from student
   * @returns Updated EQ state
   */
  async updateStudentArchetype(latestUserMsg: string): Promise<EQState> {
    const detectionResult = await detectArchetype(latestUserMsg);
    const archetype = detectionResult.archetype;

    // Map archetype → EQ style
    const style = this.mapArchetypeToStyle(archetype);

    this.state = {
      archetype,
      style,
      lastUpdated: Date.now(),
    };

    console.log(`[EQEngine] Detected archetype: ${archetype} → Style: ${style.name}`);

    return this.state;
  }

  /**
   * Map Archetype to Style
   *
   * Maps a student archetype to the appropriate EQ communication style.
   *
   * @param archetype - Student archetype
   * @returns EQ style
   */
  private mapArchetypeToStyle(archetype: Archetype): EQStyle {
    const mapping: Record<Archetype, EQStyle> = {
      OverwhelmedStarter: EQ_STYLES.WarmEmpathic,
      QuietHighPotential: EQ_STYLES.WarmEmpathic,
      BurntOutAchiever: EQ_STYLES.PacingSlow,
      Explorer: EQ_STYLES.RelatableCurious,
      LateBloomer: EQ_STYLES.EncouragingBuilder,
      Hacker: EQ_STYLES.PrecisionDirect,
      ReluctantDoer: EQ_STYLES.StructuredMotivator,
      HighFlyingGeneralist: EQ_STYLES.AnalystMode,
      HyperPerfectionist: EQ_STYLES.PacingSlow,
      AnxiousPlanner: EQ_STYLES.WarmEmpathic,
      CreativeBuilder: EQ_STYLES.CheerfullyRelatable,
      DistractedMultitasker: EQ_STYLES.StructuredDirect,
      UnderconfidentStriver: EQ_STYLES.ConfidenceBuilder,
      IndependentThinker: EQ_STYLES.AnalystMode,
      StructuredExecutor: EQ_STYLES.PrecisionDirect,
    };

    return mapping[archetype];
  }

  /**
   * Get Style for Archetype
   *
   * Returns the EQ style for a given archetype without updating state.
   *
   * @param archetype - Student archetype
   * @returns EQ style
   */
  getStyleForArchetype(archetype: Archetype): EQStyle {
    return this.mapArchetypeToStyle(archetype);
  }

  /**
   * Set Style Manually
   *
   * Manually override the EQ style (for testing or edge cases).
   *
   * @param styleName - Name of EQ style from EQ_STYLES
   */
  setStyleManually(styleName: string): void {
    const style = EQ_STYLES[styleName];

    if (!style) {
      console.warn(`[EQEngine] Unknown style: ${styleName}`);
      return;
    }

    this.state = {
      ...this.state,
      style,
      lastUpdated: Date.now(),
    };

    console.log(`[EQEngine] Manually set style to: ${styleName}`);
  }

  /**
   * Reset State
   *
   * Resets EQ state to initial values.
   */
  reset(): void {
    this.state = {
      archetype: null,
      style: null,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Get Available Styles
   *
   * Returns all available EQ styles.
   *
   * @returns Record of EQ styles
   */
  static getAvailableStyles(): Record<string, EQStyle> {
    return EQ_STYLES;
  }
}
