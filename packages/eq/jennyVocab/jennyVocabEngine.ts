/**
 * jennyVocab/jennyVocabEngine.ts
 *
 * Integrated Jenny Vocabulary Engine - combines word choice, idioms, substitution, and filtering.
 * This is the main interface for transforming text with Jenny's vocabulary & idioms.
 */

import { JennyWordChoiceEngine } from "./wordChoiceEngine";
import { JennyIdiomSelector } from "./idiomClusters";
import { JennySubstitutionEngine } from "./substitutionEngine";
import { JennySemanticFilter } from "./semanticFilter";
import { VocabContext, IdiomCluster } from "./types";

/**
 * Options for vocabulary transformation
 */
export interface VocabTransformOptions {
  applySubstitutions?: boolean;  // Apply phrase substitutions (default: true)
  applyFilters?: boolean;         // Apply semantic filters (default: true)
  addIdioms?: boolean;            // Add Jenny idioms (default: false)
  context?: VocabContext;         // Context for vocab selection
}

/**
 * Integrated Jenny Vocabulary Engine
 *
 * Combines all vocabulary components into a single interface.
 * Transforms text through multiple passes:
 * 1. Semantic filtering (removes non-Jenny patterns)
 * 2. Phrase substitution (replaces generic AI with Jenny phrases)
 * 3. Idiom injection (adds Jenny-specific patterns)
 * 4. Word choice enhancement (uses vocabulary domains)
 */
export class JennyVocabEngine {
  private wordChoice: JennyWordChoiceEngine;
  private idioms: JennyIdiomSelector;
  private substitution: JennySubstitutionEngine;
  private filter: JennySemanticFilter;

  constructor() {
    this.wordChoice = new JennyWordChoiceEngine();
    this.idioms = new JennyIdiomSelector();
    this.substitution = new JennySubstitutionEngine();
    this.filter = new JennySemanticFilter();
  }

  /**
   * Transform text using all vocabulary components
   */
  transform(text: string, opts: VocabTransformOptions = {}): string {
    const {
      applySubstitutions = true,
      applyFilters = true,
      addIdioms = false,
      context,
    } = opts;

    let output = text;

    // Step 1: Apply semantic filters (remove non-Jenny patterns)
    if (applyFilters) {
      output = this.filter.filter(output);
    }

    // Step 2: Apply phrase substitutions (replace generic AI with Jenny phrases)
    if (applySubstitutions) {
      output = this.substitution.rewrite(output);
    }

    // Step 3: Add idioms if requested and context provided
    if (addIdioms && context) {
      output = this.addIdiomToText(output, context);
    }

    return output;
  }

  /**
   * Add Jenny idiom to text based on context
   */
  private addIdiomToText(text: string, context: VocabContext): string {
    // Select appropriate idiom based on vocab mode
    let idiom: string;

    switch (context.mode) {
      case "validate":
        idiom = this.idioms.getValidationIdiom();
        break;
      case "guide":
        idiom = this.idioms.getGuidanceIdiom();
        break;
      case "reframe":
        idiom = this.idioms.getReframeIdiom();
        break;
      case "identity":
        idiom = this.idioms.getFutureSelfIdiom();
        break;
      default:
        idiom = this.idioms.getGroundingStarter();
    }

    // Prepend idiom to text
    return `${idiom} ${text}`;
  }

  /**
   * Get vocabulary phrase for context
   */
  getVocabPhrase(context: VocabContext): string {
    const selection = this.wordChoice.generate(context);
    return selection.phrase;
  }

  /**
   * Get idiom by type
   */
  getIdiom(type: IdiomCluster["type"]): string {
    return this.idioms.getIdiom(type);
  }

  /**
   * Check if text needs transformation
   */
  needsTransformation(text: string): boolean {
    return (
      this.substitution.needsSubstitution(text) ||
      this.filter.containsFilteredPatterns(text)
    );
  }

  /**
   * Validate that text follows Jenny's voice
   */
  validateVoice(text: string): { isValid: boolean; issues: string[] } {
    const filterValidation = this.filter.validate(text);
    const substitutionPatterns = this.substitution.findPatterns(text);

    return {
      isValid: filterValidation.isValid && substitutionPatterns.length === 0,
      issues: [
        ...filterValidation.violations,
        ...substitutionPatterns.map(p => `Generic pattern: ${p}`),
      ],
    };
  }

  /**
   * Get transformation preview (before/after)
   */
  previewTransformation(
    text: string,
    opts: VocabTransformOptions = {}
  ): {
    original: string;
    transformed: string;
    changes: string[];
  } {
    const original = text;
    const transformed = this.transform(text, opts);

    const changes: string[] = [];

    // Find filter changes
    const filterPatterns = this.filter.findFilteredPatterns(original);
    changes.push(...filterPatterns.map(p => `Filtered: ${p.reason}`));

    // Find substitution changes
    const subPatterns = this.substitution.findPatterns(original);
    changes.push(...subPatterns.map(p => `Substituted: ${p}`));

    return {
      original,
      transformed,
      changes,
    };
  }

  /**
   * Reset all components
   */
  reset(): void {
    this.wordChoice.reset();
    this.idioms.reset();
  }

  /**
   * Get state of all components
   */
  getState() {
    return {
      wordChoice: this.wordChoice.getState(),
      idioms: this.idioms.getState(),
    };
  }

  /**
   * Get individual engines for advanced use
   */
  getWordChoiceEngine(): JennyWordChoiceEngine {
    return this.wordChoice;
  }

  getIdiomSelector(): JennyIdiomSelector {
    return this.idioms;
  }

  getSubstitutionEngine(): JennySubstitutionEngine {
    return this.substitution;
  }

  getSemanticFilter(): JennySemanticFilter {
    return this.filter;
  }
}

/**
 * Helper function to quickly transform text
 */
export function quickTransform(text: string, context?: VocabContext): string {
  const engine = new JennyVocabEngine();
  return engine.transform(text, { context });
}

/**
 * Helper function to validate Jenny voice
 */
export function quickValidate(text: string): boolean {
  const engine = new JennyVocabEngine();
  return engine.validateVoice(text).isValid;
}
