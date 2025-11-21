/**
 * uiAdapter.ts
 *
 * Component 4 - UI Adapter
 *
 * Main UI adaptation engine called after every agent message.
 * Updates UI state based on archetype, EQ style, and stage.
 */

import { getUIRules } from "./uiRules";
import type { UIAdaptationContext, UIState } from "./types";

export class UIAdapter {
  private state: UIState = {
    archetype: null,
    eqStyle: null,
    colorTheme: "#4A8CF7",
    microcopyTone: "neutral",
    chipDensity: "medium",
    showEvidence: true,
    showProgressStepper: true,
    pacing: "normal",
  };

  /**
   * Update
   *
   * Updates UI state based on current context.
   * Called after every agent response.
   *
   * @param ctx - UI adaptation context
   * @returns Updated UI state
   */
  update(ctx: UIAdaptationContext): UIState {
    const newState = getUIRules(ctx);
    this.state = newState;

    console.log(`[UIAdapter] Updated UI state for archetype: ${ctx.archetype}`);
    console.log(`  - Microcopy tone: ${newState.microcopyTone}`);
    console.log(`  - Chip density: ${newState.chipDensity}`);
    console.log(`  - Pacing: ${newState.pacing}`);
    console.log(`  - Show evidence: ${newState.showEvidence}`);

    return newState;
  }

  /**
   * Get State
   *
   * Returns current UI state.
   *
   * @returns Current UI state
   */
  getState(): UIState {
    return this.state;
  }

  /**
   * Reset
   *
   * Resets UI state to defaults.
   */
  reset(): void {
    this.state = {
      archetype: null,
      eqStyle: null,
      colorTheme: "#4A8CF7",
      microcopyTone: "neutral",
      chipDensity: "medium",
      showEvidence: true,
      showProgressStepper: true,
      pacing: "normal",
    };

    console.log("[UIAdapter] UI state reset to defaults");
  }

  /**
   * Get Microcopy for Tone
   *
   * Returns appropriate microcopy message for the current tone.
   *
   * @returns Microcopy message
   */
  getMicrocopy(): string {
    const tone = this.state.microcopyTone;

    const microcopyMap: Record<string, string> = {
      calming: "You're doing great — let's take this step by step.",
      gentle: "No rush, let's explore this together.",
      reassuring: "You're on the right track. Let's build on this.",
      curious: "Interesting! Let's unpack that more.",
      direct: "Got it. Let's cut to the core insight.",
      directive: "Here's exactly what we'll do next.",
      "soft-direct": "I'll guide you clearly, but we'll keep things light.",
      neutral: "",
    };

    return microcopyMap[tone] || "";
  }

  /**
   * Get Max Chips
   *
   * Returns maximum number of chips to show based on density.
   *
   * @returns Maximum chip count
   */
  getMaxChips(): number {
    const density = this.state.chipDensity;

    const densityMap = {
      low: 2,
      medium: 4,
      high: 8,
    };

    return densityMap[density];
  }

  /**
   * Should Slow Animations
   *
   * Returns whether animations should be slowed based on pacing.
   *
   * @returns True if animations should be slow
   */
  shouldSlowAnimations(): boolean {
    return this.state.pacing === "slow";
  }

  /**
   * Get Animation Duration
   *
   * Returns appropriate animation duration based on pacing.
   *
   * @returns Duration in milliseconds
   */
  getAnimationDuration(): number {
    const pacingMap = {
      slow: 600,
      normal: 300,
      fast: 150,
    };

    return pacingMap[this.state.pacing];
  }
}
