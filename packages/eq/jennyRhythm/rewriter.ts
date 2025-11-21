/**
 * jennyRhythm/rewriter.ts
 *
 * Jenny Rewriter - transforms raw LLM output into Jenny's rhythm.
 * Takes any text and rebuilds it into Jenny's distinctive pacing:
 * - Short punch → Medium expansion → Soft landing
 * - Two-sentence arcs
 * - Emotional cadence
 * - No run-ons, no paragraph dumps
 */

import { JennyRhythmEngine } from "./rhythmEngine";
import { RewriteOptions, ThoughtUnit, ClauseOptions } from "./types";
import { ToneDirective } from "../toneModulationEngine";

/**
 * Jenny Rewriter
 *
 * Transforms LLM output into Jenny-rhythmed text.
 * Core transformation: generic AI output → human-paced coaching voice
 */
export class JennyRewriter {
  private engine = new JennyRhythmEngine();

  /**
   * Main rewrite function
   * Takes raw content and rebuilds it with Jenny's rhythm
   */
  rewrite(content: string, opts: RewriteOptions): string {
    // 1. Parse content into thought units
    const thoughts = this.parseThoughts(content);

    // 2. Apply length constraint if specified
    let targetThoughts = thoughts;
    if (opts.maxSentences) {
      targetThoughts = thoughts.slice(0, Math.ceil(opts.maxSentences / 2));
    }

    // 3. Rebuild each thought into Jenny arc
    const arcs: string[] = [];
    for (const thought of targetThoughts) {
      const arc = this.rebuildThought(thought, opts);
      arcs.push(arc);
    }

    // 4. Join with proper spacing
    return arcs.join(" ");
  }

  /**
   * Parse raw content into thought units
   * Splits on sentence boundaries and identifies coherent ideas
   */
  private parseThoughts(content: string): ThoughtUnit[] {
    // Split on sentence boundaries (., !, ?)
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const thoughts: ThoughtUnit[] = [];

    for (const sentence of sentences) {
      // Detect if sentence requires validation (contains emotional/struggle words)
      const requiresValidation = this.detectsEmotionalContent(sentence);

      // Detect if sentence requires direction (contains actionable language)
      const requiresDirection = this.detectsDirectionalContent(sentence);

      // Determine sentiment
      const sentiment = this.analyzeSentiment(sentence);

      thoughts.push({
        content: sentence,
        sentiment,
        requiresValidation,
        requiresDirection,
      });
    }

    return thoughts;
  }

  /**
   * Rebuild a single thought unit into Jenny arc
   */
  private rebuildThought(thought: ThoughtUnit, opts: RewriteOptions): string {
    const clauseOpts: ClauseOptions = {
      emotionalState: opts.emotionalState,
      pacing: opts.pacing,
      archetype: opts.archetype,
    };

    // Build arc using rhythm engine
    const arc = this.engine.buildArc(opts.tone, clauseOpts);

    // Convert to string
    return this.engine.arcToString(arc);
  }

  /**
   * Detect emotional content in sentence
   * Returns true if sentence contains emotional language
   */
  private detectsEmotionalContent(sentence: string): boolean {
    const emotionalPatterns = [
      /feel/i,
      /emotion/i,
      /stress/i,
      /overwhelm/i,
      /anxious/i,
      /worry/i,
      /scared/i,
      /confused/i,
      /stuck/i,
      /lost/i,
      /difficult/i,
      /hard/i,
      /struggle/i,
      /challenging/i,
    ];

    return emotionalPatterns.some(pattern => pattern.test(sentence));
  }

  /**
   * Detect directional content in sentence
   * Returns true if sentence contains actionable language
   */
  private detectsDirectionalContent(sentence: string): boolean {
    const directionalPatterns = [
      /should/i,
      /need to/i,
      /have to/i,
      /must/i,
      /going to/i,
      /will/i,
      /plan/i,
      /do/i,
      /action/i,
      /step/i,
      /move/i,
      /next/i,
    ];

    return directionalPatterns.some(pattern => pattern.test(sentence));
  }

  /**
   * Analyze sentiment of sentence
   * Simple heuristic based on word patterns
   */
  private analyzeSentiment(sentence: string): "positive" | "neutral" | "negative" {
    const positiveWords = /good|great|excited|happy|confident|ready|can|able|progress/i;
    const negativeWords = /bad|terrible|anxious|worried|can't|unable|stuck|lost|overwhelmed/i;

    if (negativeWords.test(sentence)) {
      return "negative";
    } else if (positiveWords.test(sentence)) {
      return "positive";
    }

    return "neutral";
  }

  /**
   * Light rewrite - just add Jenny rhythm markers without full rebuild
   * Useful when LLM output is already pretty good
   */
  lightRewrite(content: string, opts: RewriteOptions): string {
    // Add breath markers at appropriate points
    const sentences = content.split(/([.!?]+)/).filter(s => s.trim().length > 0);

    const result: string[] = [];
    let sentenceCount = 0;

    for (let i = 0; i < sentences.length; i++) {
      const chunk = sentences[i];

      // If it's a sentence (not punctuation)
      if (!/^[.!?]+$/.test(chunk)) {
        sentenceCount++;

        // Add breath marker every 2-3 sentences if pacing is slow
        if (opts.pacing === "slow" && sentenceCount % 2 === 0 && i > 0) {
          const breathMarker = this.engine.getClauseGenerator().generateBreathMarker(opts.pacing);
          result.push(` ${breathMarker} `);
        }

        result.push(chunk);
      } else {
        result.push(chunk);
      }
    }

    return result.join("").trim();
  }

  /**
   * Reset rewriter state
   */
  reset(): void {
    this.engine.reset();
  }

  /**
   * Get rewriter state for debugging
   */
  getState() {
    return {
      engineState: this.engine.getState(),
    };
  }
}

/**
 * Helper function to quickly rewrite content
 */
export function quickRewrite(content: string, opts: RewriteOptions): string {
  const rewriter = new JennyRewriter();
  return rewriter.rewrite(content, opts);
}

/**
 * Helper function for light rewrite
 */
export function lightRewrite(content: string, opts: RewriteOptions): string {
  const rewriter = new JennyRewriter();
  return rewriter.lightRewrite(content, opts);
}
