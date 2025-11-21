import { Turn } from "./transcript.types";

/**
 * Transcript Formatter v1.0
 *
 * Makes transcripts look like real Jenny coaching sessions.
 * Removes LLM noise, JSON blobs, formatting artifacts.
 *
 * Current approach: Heuristic-based cleaning
 * Future enhancement: LLM-powered summarization
 */
export class TranscriptFormatter {
  /**
   * Clean Text
   *
   * Removes LLM artifacts and formatting noise from message text.
   *
   * Removes:
   * - Code fences (```json, ```, etc.)
   * - Excessive whitespace
   * - JSON blob remnants
   * - System tags
   */
  cleanText(text: string): string {
    let cleaned = text;

    // Remove code fences
    cleaned = cleaned.replace(/```(?:json|typescript|javascript)?/g, "");
    cleaned = cleaned.replace(/```/g, "");

    // Remove system tags (if any leaked through)
    cleaned = cleaned.replace(/<\/?system>/g, "");
    cleaned = cleaned.replace(/<\/?assistant>/g, "");
    cleaned = cleaned.replace(/<\/?user>/g, "");

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, " ");

    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }

  /**
   * Generate Summary
   *
   * Creates a high-level summary of the session.
   *
   * Current: Simple heuristic-based theme extraction
   * Future: LLM-powered semantic summarization
   */
  generateSummary(turns: Turn[]): string {
    const studentTurns = turns.filter(t => t.role === "student").length;
    const coachTurns = turns.filter(t => t.role === "coach").length;

    const themes = this.extractThemes(turns);

    const lines: string[] = [];
    lines.push(`This assessment included ${turns.length} total turns.`);
    lines.push(`Student spoke ${studentTurns} times; coach spoke ${coachTurns} times.`);

    if (themes.length > 0) {
      lines.push(`Key themes: ${themes.join(", ")}.`);
    } else {
      lines.push("Session focused on initial rapport-building and diagnostic intake.");
    }

    return lines.join(" ");
  }

  /**
   * Extract Themes
   *
   * Identifies key themes discussed in the session.
   *
   * Uses simple keyword matching for now.
   * Future: Use NER + LLM for semantic theme extraction.
   */
  extractThemes(turns: Turn[]): string[] {
    const allText = turns
      .map(t => t.text.toLowerCase())
      .join(" ");

    const themes: string[] = [];

    // Research/intellectual signals
    if (
      allText.includes("research") ||
      allText.includes("lab") ||
      allText.includes("paper") ||
      allText.includes("publication")
    ) {
      themes.push("research interest");
    }

    // Leadership signals
    if (
      allText.includes("leader") ||
      allText.includes("president") ||
      allText.includes("captain") ||
      allText.includes("founded")
    ) {
      themes.push("leadership");
    }

    // Service signals
    if (
      allText.includes("volunteer") ||
      allText.includes("community service") ||
      allText.includes("non-profit") ||
      allText.includes("outreach")
    ) {
      themes.push("service orientation");
    }

    // Activity involvement
    if (
      allText.includes("club") ||
      allText.includes("team") ||
      allText.includes("activity") ||
      allText.includes("extracurricular")
    ) {
      themes.push("activity involvement");
    }

    // Academic passion
    if (
      allText.includes("love") ||
      allText.includes("passionate") ||
      allText.includes("fascinated") ||
      allText.includes("obsessed")
    ) {
      themes.push("academic passion");
    }

    // College anxiety
    if (
      allText.includes("worried") ||
      allText.includes("anxious") ||
      allText.includes("stressed") ||
      allText.includes("overwhelmed")
    ) {
      themes.push("college anxiety");
    }

    // Family pressure
    if (
      allText.includes("parents want") ||
      allText.includes("family pressure") ||
      allText.includes("expected to")
    ) {
      themes.push("family expectations");
    }

    // Identity exploration
    if (
      allText.includes("immigrant") ||
      allText.includes("first-gen") ||
      allText.includes("background") ||
      allText.includes("identity")
    ) {
      themes.push("identity exploration");
    }

    return themes;
  }

  /**
   * Format for Parent Report
   *
   * Generates a parent-friendly version of the transcript.
   * Highlights key insights without overwhelming detail.
   */
  formatForParentReport(turns: Turn[]): string {
    const lines: string[] = [];

    lines.push("=== Session Highlights ===\n");

    // Get coach's opening
    const opening = turns.find(t => t.role === "coach");
    if (opening) {
      lines.push(`Coach: ${this.truncate(opening.text, 200)}\n`);
    }

    // Get key student revelations
    const studentTurns = turns.filter(t => t.role === "student");
    const midpoint = Math.floor(studentTurns.length / 2);
    const keyTurns = [studentTurns[0], studentTurns[midpoint], studentTurns[studentTurns.length - 1]].filter(Boolean);

    lines.push("Key Student Insights:");
    keyTurns.forEach((turn, idx) => {
      lines.push(`${idx + 1}. ${this.truncate(turn.text, 150)}`);
    });

    lines.push("\n=== Themes Discussed ===");
    const themes = this.extractThemes(turns);
    themes.forEach(theme => {
      lines.push(`- ${theme}`);
    });

    return lines.join("\n");
  }

  /**
   * Truncate
   *
   * Truncates text to max length with ellipsis.
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }
}

/**
 * Create Transcript Formatter
 *
 * Factory function for creating formatter instances.
 */
export function createTranscriptFormatter(): TranscriptFormatter {
  return new TranscriptFormatter();
}
