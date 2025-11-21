/**
 * Chunk Classifier v1.0
 *
 * Fallback classification for chunks when LLM fails or doesn't provide semantic type.
 * Uses pattern matching to categorize content into semantic types.
 */

/**
 * Classify Fallback
 *
 * Fallback classifier using heuristic pattern matching.
 * Safety net when LLM doesn't provide semantic_type.
 *
 * Semantic types:
 * - academics: GPA, test scores, coursework, rigor
 * - activities: ECs, projects, research, leadership, clubs
 * - awards: Competitions, recognitions, achievements
 * - eq: Values, identity, struggles, motivation, personal growth
 * - narrative: Story-telling, personal context, background
 * - framework: Jenny's coaching frameworks and methodologies
 * - general: Everything else
 *
 * @param text - Chunk text to classify
 * @returns Semantic type
 */
export function classifyFallback(text: string): string {
  console.log(`[ChunkClassifier] Running fallback classification`);

  const lowerText = text.toLowerCase();

  // Academics
  if (
    /\b(gpa|grades?|sat|act|ap|ib|rigor|coursework|transcript|test score)\b/i.test(
      text
    )
  ) {
    return "academics";
  }

  // Activities
  if (
    /\b(project|research|leadership|club|extracurricular|volunteer|internship|work experience)\b/i.test(
      text
    )
  ) {
    return "activities";
  }

  // Awards
  if (
    /\b(award|competition|winner|finalist|recognition|honor|prize|medal)\b/i.test(
      text
    )
  ) {
    return "awards";
  }

  // EQ / Personal
  if (
    /\b(value|identity|struggle|motivation|passion|challenge|growth|resilience|immigrant|background)\b/i.test(
      text
    )
  ) {
    return "eq";
  }

  // Narrative
  if (
    /\b(story|experience|journey|moment|realize|discover|learn|understand)\b/i.test(
      text
    )
  ) {
    return "narrative";
  }

  // Framework
  if (
    /\b(framework|principle|pillar|step|phase|approach|methodology|strategy|system)\b/i.test(
      text
    )
  ) {
    return "framework";
  }

  // Default
  return "general";
}

/**
 * Extract EQ Signals
 *
 * Extracts emotional intelligence signals from text.
 * Used as fallback when LLM doesn't provide eq_signals.
 *
 * @param text - Chunk text
 * @returns Array of EQ signal keywords
 */
export function extractEQSignalsFallback(text: string): string[] {
  const signals: string[] = [];

  // Check for specific EQ markers
  if (/\b(passion|love|care deeply)\b/i.test(text)) {
    signals.push("passion");
  }

  if (/\b(challenge|struggle|difficult|obstacle)\b/i.test(text)) {
    signals.push("resilience");
  }

  if (/\b(impact|difference|help|serve|contribute)\b/i.test(text)) {
    signals.push("impact-driven");
  }

  if (/\b(curiosity|wonder|question|explore|discover)\b/i.test(text)) {
    signals.push("curiosity");
  }

  if (/\b(leader|leadership|initiative|organize)\b/i.test(text)) {
    signals.push("leadership");
  }

  if (/\b(value|believe|principle|integrity)\b/i.test(text)) {
    signals.push("values");
  }

  return signals;
}
