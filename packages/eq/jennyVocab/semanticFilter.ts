/**
 * jennyVocab/semanticFilter.ts
 *
 * Jenny Semantic Filter - strips non-Jenny language patterns.
 * Removes corporate jargon, therapy clichés, robotic directives, and generic GPT tones.
 */

import { FilterRule } from "./types";

/**
 * Filter rules - patterns to detect and optionally replace
 */
export const FILTER_RULES: FilterRule[] = [
  // Corporate jargon
  { pattern: /\b(synergy|leverage|optimize|utilize|implement)\b/gi, reason: "Corporate jargon", replacement: "" },
  { pattern: /\bexecute (?:on |the )?pipeline\b/gi, reason: "Corporate jargon", replacement: "work through" },
  { pattern: /\bdrilling down\b/gi, reason: "Corporate jargon", replacement: "looking closely at" },
  { pattern: /\bcircle back\b/gi, reason: "Corporate jargon", replacement: "come back to" },
  { pattern: /\blow-hanging fruit\b/gi, reason: "Corporate jargon", replacement: "easy wins" },
  { pattern: /\bmove the needle\b/gi, reason: "Corporate jargon", replacement: "make progress" },

  // Therapy clichés
  { pattern: /\binner child\b/gi, reason: "Therapy cliché", replacement: "the part of you that" },
  { pattern: /\bshadow work\b/gi, reason: "Therapy cliché", replacement: "working through" },
  { pattern: /\bmanifest(?:ing|ation)?\b/gi, reason: "Therapy cliché", replacement: "build toward" },
  { pattern: /\btrigger(?:ed|ing)?\b/gi, reason: "Therapy cliché", replacement: "activates" },
  { pattern: /\bholding space\b/gi, reason: "Therapy cliché", replacement: "being present" },

  // Robotic directives
  { pattern: /\byou must\b/gi, reason: "Robotic directive", replacement: "what matters is" },
  { pattern: /\byou have to\b/gi, reason: "Robotic directive", replacement: "what will help is" },
  { pattern: /\bit is essential that you\b/gi, reason: "Robotic directive", replacement: "what's important is" },
  { pattern: /\bit is imperative\b/gi, reason: "Robotic directive", replacement: "what's critical is" },

  // Generic GPT patterns
  { pattern: /\bas an AI(?:\s+(?:language model|assistant))?\b/gi, reason: "Generic GPT", replacement: "" },
  { pattern: /\bin summary,?\b/gi, reason: "Generic GPT", replacement: "Here's the core:" },
  { pattern: /\boverall,?\b/gi, reason: "Generic GPT", replacement: "What matters most:" },
  { pattern: /\bit'?s worth noting that\b/gi, reason: "Generic GPT", replacement: "Here's what's important:" },
  { pattern: /\blet me clarify\b/gi, reason: "Generic GPT", replacement: "Here's what I mean:" },
  { pattern: /\bin conclusion\b/gi, reason: "Generic GPT", replacement: "Bottom line:" },

  // Educational buzzwords
  { pattern: /\bgrowth mindset\b/gi, reason: "Educational buzzword", replacement: "mindset for growth" },
  { pattern: /\blearning outcomes\b/gi, reason: "Educational buzzword", replacement: "results" },
  { pattern: /\bcompetencies\b/gi, reason: "Educational buzzword", replacement: "skills" },
  { pattern: /\bscaffold(?:ing)?\b/gi, reason: "Educational buzzword", replacement: "support" },

  // Excessive qualifiers
  { pattern: /\bvery very\b/gi, reason: "Excessive qualifier", replacement: "" },
  { pattern: /\breally really\b/gi, reason: "Excessive qualifier", replacement: "" },
  { pattern: /\bextremely\b/gi, reason: "Excessive qualifier", replacement: "" },
  { pattern: /\babsolutely critical\b/gi, reason: "Excessive qualifier", replacement: "critical" },

  // Weak/hedging language (in some contexts)
  { pattern: /\bkind of\b/gi, reason: "Weak language", replacement: "" },
  { pattern: /\bsort of\b/gi, reason: "Weak language", replacement: "" },
  { pattern: /\bI guess\b/gi, reason: "Weak language", replacement: "What I'm seeing is" },
  { pattern: /\bmaybe possibly\b/gi, reason: "Weak language", replacement: "possibly" },
];

/**
 * Jenny Semantic Filter
 *
 * Detects and removes non-Jenny language patterns.
 * Ensures output sounds like Jenny, not generic AI or corporate speak.
 */
export class JennySemanticFilter {
  private rules: FilterRule[];

  constructor(customRules?: FilterRule[]) {
    this.rules = customRules || FILTER_RULES;
  }

  /**
   * Filter text by removing/replacing non-Jenny patterns
   */
  filter(text: string): string {
    let output = text;

    for (const rule of this.rules) {
      const pattern = typeof rule.pattern === "string"
        ? new RegExp(this.escapeRegex(rule.pattern), "gi")
        : rule.pattern;

      if (rule.replacement !== undefined) {
        // Replace with specified replacement
        output = output.replace(pattern, rule.replacement);
      } else {
        // Remove entirely
        output = output.replace(pattern, "");
      }
    }

    // Clean up whitespace
    output = output.replace(/\s+/g, " ").trim();

    // Clean up double punctuation
    output = output.replace(/([.!?])\s*\1+/g, "$1");

    // Clean up orphaned commas/periods
    output = output.replace(/\s+([,.])/g, "$1");

    return output;
  }

  /**
   * Check if text contains filtered patterns
   */
  containsFilteredPatterns(text: string): boolean {
    for (const rule of this.rules) {
      const pattern = typeof rule.pattern === "string"
        ? new RegExp(this.escapeRegex(rule.pattern), "gi")
        : rule.pattern;

      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find all filtered patterns in text
   */
  findFilteredPatterns(text: string): Array<{ pattern: string; reason: string; matches: string[] }> {
    const found: Array<{ pattern: string; reason: string; matches: string[] }> = [];

    for (const rule of this.rules) {
      const pattern = typeof rule.pattern === "string"
        ? new RegExp(this.escapeRegex(rule.pattern), "gi")
        : rule.pattern;

      const matches = text.match(pattern);

      if (matches) {
        found.push({
          pattern: rule.pattern.toString(),
          reason: rule.reason,
          matches: [...new Set(matches)], // Deduplicate
        });
      }
    }

    return found;
  }

  /**
   * Validate that text is Jenny-safe (no filtered patterns)
   */
  validate(text: string): { isValid: boolean; violations: string[] } {
    const found = this.findFilteredPatterns(text);

    return {
      isValid: found.length === 0,
      violations: found.map(f => f.reason),
    };
  }

  /**
   * Add custom filter rule
   */
  addRule(rule: FilterRule): void {
    this.rules.push(rule);
  }

  /**
   * Get all filter rules
   */
  getRules(): FilterRule[] {
    return [...this.rules];
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Get filter statistics
   */
  getFilterStats(text: string): {
    patternCount: number;
    patternsFound: string[];
    filteredText: string;
  } {
    const patterns = this.findFilteredPatterns(text);
    const filteredText = this.filter(text);

    return {
      patternCount: patterns.length,
      patternsFound: patterns.map(p => p.reason),
      filteredText,
    };
  }
}

/**
 * Helper function to quickly filter text
 */
export function quickFilter(text: string): string {
  const filter = new JennySemanticFilter();
  return filter.filter(text);
}

/**
 * Helper function to validate text
 */
export function validateJennyVoice(text: string): boolean {
  const filter = new JennySemanticFilter();
  return filter.validate(text).isValid;
}
