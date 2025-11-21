/**
 * jennyVocab/substitutionEngine.ts
 *
 * Jenny Substitution Engine - rewrites neutral AI responses using Jenny idioms.
 * Transforms generic LLM language into Jenny's distinctive voice patterns.
 */

import { SubstitutionRule } from "./types";

/**
 * Substitution rules - maps generic AI phrases to Jenny-style replacements
 */
export const SUBSTITUTION_RULES: SubstitutionRule[] = [
  // Directives → Invitations
  { neutral: "you should", jenny: "what serves you better here is" },
  { neutral: "you must", jenny: "what matters most is" },
  { neutral: "you need to", jenny: "what will help here is" },
  { neutral: "it's important to", jenny: "what actually matters is" },
  { neutral: "make sure you", jenny: "let's make sure we" },

  // Weak language → Confident language
  { neutral: "try to", jenny: "let's shape this into" },
  { neutral: "maybe you could", jenny: "here's what could work:" },
  { neutral: "you might want to", jenny: "what I'd suggest is" },

  // Generic reassurance → Grounded validation
  { neutral: "don't worry", jenny: "you're not behind" },
  { neutral: "it'll be fine", jenny: "this is manageable" },
  { neutral: "just relax", jenny: "let's slow this down" },
  { neutral: "calm down", jenny: "let's ground this moment" },

  // Vague → Precise
  { neutral: "stay focused", jenny: "anchor to one idea" },
  { neutral: "work hard", jenny: "build consistent momentum" },
  { neutral: "do your best", jenny: "aim for your sharpest work" },
  { neutral: "be positive", jenny: "look for traction signals" },

  // Corporate/formal → Human
  { neutral: "optimize", jenny: "improve" },
  { neutral: "leverage", jenny: "use" },
  { neutral: "execute", jenny: "do" },
  { neutral: "utilize", jenny: "use" },
  { neutral: "implement", jenny: "put into practice" },

  // Therapy clichés → Grounded language
  { neutral: "your inner child", jenny: "the part of you that" },
  { neutral: "shadow work", jenny: "working through" },
  { neutral: "manifest", jenny: "build toward" },
  { neutral: "set an intention", jenny: "clarify what matters" },

  // Generic GPT → Jenny
  { neutral: "as an AI", jenny: "" },  // Strip entirely
  { neutral: "in summary", jenny: "here's the core:" },
  { neutral: "overall", jenny: "what matters most is" },
  { neutral: "it's worth noting", jenny: "here's what's important:" },

  // Weak framing → Strong framing
  { neutral: "I think", jenny: "what I'm seeing is" },
  { neutral: "perhaps", jenny: "what could work here is" },
  { neutral: "sort of", jenny: "" },  // Strip
  { neutral: "kind of", jenny: "" },  // Strip
];

/**
 * Jenny Substitution Engine
 *
 * Rewrites text using substitution rules to transform generic AI language
 * into Jenny's voice.
 */
export class JennySubstitutionEngine {
  private rules: SubstitutionRule[];

  constructor(customRules?: SubstitutionRule[]) {
    this.rules = customRules || SUBSTITUTION_RULES;
  }

  /**
   * Rewrite text using substitution rules
   */
  rewrite(text: string): string {
    let output = text;

    for (const rule of this.rules) {
      // Create regex for case-insensitive matching
      const flags = rule.caseSensitive ? "g" : "gi";
      const regex = new RegExp(this.escapeRegex(rule.neutral), flags);

      // Apply substitution
      output = output.replace(regex, rule.jenny);
    }

    // Clean up multiple spaces
    output = output.replace(/\s+/g, " ").trim();

    // Clean up double punctuation
    output = output.replace(/([.!?])\s*\1+/g, "$1");

    return output;
  }

  /**
   * Apply specific substitution rule
   */
  applyRule(text: string, neutral: string, jenny: string): string {
    const regex = new RegExp(this.escapeRegex(neutral), "gi");
    return text.replace(regex, jenny);
  }

  /**
   * Check if text contains patterns that need substitution
   */
  needsSubstitution(text: string): boolean {
    for (const rule of this.rules) {
      const regex = new RegExp(this.escapeRegex(rule.neutral), "gi");
      if (regex.test(text)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get list of patterns found in text
   */
  findPatterns(text: string): string[] {
    const found: string[] = [];

    for (const rule of this.rules) {
      const regex = new RegExp(this.escapeRegex(rule.neutral), "gi");
      if (regex.test(text)) {
        found.push(rule.neutral);
      }
    }

    return found;
  }

  /**
   * Add custom substitution rule
   */
  addRule(rule: SubstitutionRule): void {
    this.rules.push(rule);
  }

  /**
   * Get all substitution rules
   */
  getRules(): SubstitutionRule[] {
    return [...this.rules];
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Get statistics about substitutions made
   */
  getSubstitutionStats(originalText: string, rewrittenText: string): {
    substitutionCount: number;
    patternsReplaced: string[];
  } {
    let count = 0;
    const patterns: string[] = [];

    for (const rule of this.rules) {
      const regex = new RegExp(this.escapeRegex(rule.neutral), "gi");
      const matches = originalText.match(regex);

      if (matches) {
        count += matches.length;
        patterns.push(rule.neutral);
      }
    }

    return {
      substitutionCount: count,
      patternsReplaced: patterns,
    };
  }
}

/**
 * Helper function to quickly rewrite text
 */
export function quickSubstitute(text: string): string {
  const engine = new JennySubstitutionEngine();
  return engine.rewrite(text);
}
