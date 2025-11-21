/**
 * Intent Detector v4.0
 *
 * Determines the semantic intent of a query.
 * This is the "don't let the agent embarrass itself" detector.
 *
 * Maps user queries to semantic chunk types to ensure
 * retrieved chips match the conversation context.
 */

import { IntentType } from "./ragTypes";

/**
 * Detect Intent
 *
 * Analyzes a query string and returns the most likely semantic intent.
 *
 * Intent Mapping:
 * - academics: GPA, test scores, coursework, rigor
 * - activities: Projects, clubs, leadership, extracurriculars
 * - awards: Competitions, recognition, achievements
 * - eq: Identity, values, motivation, personal struggles
 * - narrative: Story-building, essay themes, background
 * - framework: Strategic advice, principles, approaches
 * - general: Fallback for mixed or unclear queries
 *
 * @param query - The user's query string
 * @returns The detected intent type
 */
export function detectIntent(query: string): IntentType {
  console.log(`[IntentDetector] Analyzing query: "${query.substring(0, 50)}..."`);

  const q = query.toLowerCase();

  // Academics: GPA, test scores, coursework, rigor
  if (q.match(/\b(gpa|grades?|sat|act|ap|ib|rigor|coursework|transcript|classes?)\b/i)) {
    console.log(`[IntentDetector] Detected intent: academics`);
    return "academics";
  }

  // Activities: Projects, clubs, leadership, extracurriculars
  if (
    q.match(/\b(project|club|leadership|extracurricular|research|volunteer|internship)\b/i)
  ) {
    console.log(`[IntentDetector] Detected intent: activities`);
    return "activities";
  }

  // Awards: Competitions, recognition, achievements
  if (q.match(/\b(award|competition|winner|finalist|recognition|achievement|honor)\b/i)) {
    console.log(`[IntentDetector] Detected intent: awards`);
    return "awards";
  }

  // EQ: Identity, values, motivation, personal struggles
  if (
    q.match(
      /\b(identity|values?|motivation|struggle|passion|background|immigrant|challenge)\b/i
    )
  ) {
    console.log(`[IntentDetector] Detected intent: eq`);
    return "eq";
  }

  // Narrative: Story-building, essay themes, background
  if (q.match(/\b(story|essay|narrative|theme|background|experience|journey)\b/i)) {
    console.log(`[IntentDetector] Detected intent: narrative`);
    return "narrative";
  }

  // Framework: Strategic advice, principles, approaches
  if (
    q.match(
      /\b(framework|principle|approach|strategy|step|phase|method|pillar|how to)\b/i
    )
  ) {
    console.log(`[IntentDetector] Detected intent: framework`);
    return "framework";
  }

  // General: Fallback
  console.log(`[IntentDetector] Detected intent: general (fallback)`);
  return "general";
}

/**
 * Get Intent Confidence
 *
 * Returns a confidence score (0-1) for the detected intent.
 * Higher confidence means stronger keyword matching.
 *
 * @param query - The user's query string
 * @param intent - The detected intent
 * @returns Confidence score between 0 and 1
 */
export function getIntentConfidence(query: string, intent: IntentType): number {
  const q = query.toLowerCase();
  let keywordCount = 0;

  const patterns: Record<IntentType, RegExp[]> = {
    academics: [
      /\bgpa\b/i,
      /\bgrades?\b/i,
      /\bsat\b/i,
      /\bact\b/i,
      /\bap\b/i,
      /\bib\b/i,
      /\brigor\b/i
    ],
    activities: [
      /\bproject\b/i,
      /\bclub\b/i,
      /\bleadership\b/i,
      /\bresearch\b/i,
      /\bvolunteer\b/i
    ],
    awards: [
      /\baward\b/i,
      /\bcompetition\b/i,
      /\bwinner\b/i,
      /\bfinalist\b/i,
      /\brecognition\b/i
    ],
    eq: [
      /\bidentity\b/i,
      /\bvalues?\b/i,
      /\bmotivation\b/i,
      /\bstruggle\b/i,
      /\bpassion\b/i
    ],
    narrative: [/\bstory\b/i, /\bessay\b/i, /\bnarrative\b/i, /\btheme\b/i, /\bjourney\b/i],
    framework: [
      /\bframework\b/i,
      /\bprinciple\b/i,
      /\bapproach\b/i,
      /\bstrategy\b/i,
      /\bstep\b/i
    ],
    general: []
  };

  const intentPatterns = patterns[intent];
  for (const pattern of intentPatterns) {
    if (pattern.test(q)) {
      keywordCount++;
    }
  }

  // Normalize to 0-1 range
  // More than 3 keyword matches = very high confidence
  const confidence = Math.min(keywordCount / 3, 1.0);

  console.log(
    `[IntentDetector] Confidence for "${intent}": ${confidence.toFixed(2)} (${keywordCount} keywords)`
  );

  return confidence;
}
