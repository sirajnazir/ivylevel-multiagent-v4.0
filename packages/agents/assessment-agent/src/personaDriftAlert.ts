import { PersonaInstruction_v3 } from "../../../schema/coachPersona_v3";

/**
 * Persona Drift Alert System
 *
 * Detects when LLM output drifts away from persona guidelines.
 * Triggers alerts and flags messages for rewriting.
 *
 * Drift types detected:
 * - Too formal (academic/corporate language)
 * - Too robotic (AI self-reference, generic phrases)
 * - Too long (walls of text, over-explaining)
 * - Too generic (lack of personalization)
 * - Forbidden phrases (direct violations of boundaries)
 */

/**
 * Persona Drift Alert
 *
 * Structure for drift detection results.
 */
export interface PersonaDriftAlert {
  /**
   * Whether drift was detected
   */
  hasDrift: boolean;

  /**
   * Severity level (0 = none, 1 = minor, 2 = moderate, 3 = severe)
   */
  severity: number;

  /**
   * Specific violations detected
   */
  violations: PersonaDriftViolation[];

  /**
   * Recommended action
   */
  action: "allow" | "warn" | "rewrite";

  /**
   * Human-readable summary
   */
  summary: string;
}

/**
 * Persona Drift Violation
 *
 * Individual violation detected.
 */
export interface PersonaDriftViolation {
  type: PersonaDriftType;
  description: string;
  severity: number;
}

/**
 * Persona Drift Type
 */
export type PersonaDriftType =
  | "too_formal"
  | "too_robotic"
  | "too_long"
  | "too_generic"
  | "forbidden_phrase"
  | "wrong_tone"
  | "over_chatty"
  | "lacks_empathy";

/**
 * Detect Persona Drift
 *
 * Analyzes an assistant message for drift from persona guidelines.
 * Returns alert with violations and recommended action.
 */
export function detectPersonaDrift(
  assistantMessage: string,
  persona: PersonaInstruction_v3
): PersonaDriftAlert {
  console.log("[PersonaDriftAlert] Checking for persona drift");

  const violations: PersonaDriftViolation[] = [];

  // Check for forbidden phrases
  for (const phrase of persona.boundaries.neverSay) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (regex.test(assistantMessage)) {
      violations.push({
        type: "forbidden_phrase",
        description: `Contains forbidden phrase: "${phrase}"`,
        severity: 3 // Severe
      });
    }
  }

  // Check for avoid patterns
  for (const pattern of persona.boundaries.avoid) {
    const detected = checkAvoidPattern(assistantMessage, pattern);
    if (detected) {
      violations.push({
        type: detectPatternType(pattern),
        description: `Violates avoid pattern: ${pattern}`,
        severity: 2 // Moderate
      });
    }
  }

  // Check message length (over 600 chars = too long)
  if (assistantMessage.length > 600) {
    violations.push({
      type: "too_long",
      description: `Message too long (${assistantMessage.length} chars)`,
      severity: 1 // Minor
    });
  }

  // Check paragraph count (over 4 paragraphs = wall of text)
  const paragraphs = assistantMessage.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 4) {
    violations.push({
      type: "too_long",
      description: `Too many paragraphs (${paragraphs.length})`,
      severity: 2 // Moderate
    });
  }

  // Check for generic phrases
  const genericPhrases = [
    "here are some tips",
    "here's what you should do",
    "it's important to",
    "you might want to consider",
    "have you thought about",
    "let me know if you have questions"
  ];

  for (const phrase of genericPhrases) {
    if (new RegExp(phrase, 'i').test(assistantMessage)) {
      violations.push({
        type: "too_generic",
        description: `Generic phrase detected: "${phrase}"`,
        severity: 1 // Minor
      });
    }
  }

  // Check for empathy markers (absence = lacks empathy)
  const empathyMarkers = /\b(i hear you|that makes sense|i get it|totally|i understand|makes sense|i see|valid)\b/i;
  if (assistantMessage.length > 100 && !empathyMarkers.test(assistantMessage)) {
    violations.push({
      type: "lacks_empathy",
      description: "No empathy markers detected in longer message",
      severity: 1 // Minor
    });
  }

  // Calculate overall severity
  const maxSeverity = violations.length > 0
    ? Math.max(...violations.map(v => v.severity))
    : 0;

  // Determine action
  let action: "allow" | "warn" | "rewrite" = "allow";
  if (maxSeverity >= 3) {
    action = "rewrite"; // Severe violations require rewrite
  } else if (maxSeverity >= 2 || violations.length >= 3) {
    action = "rewrite"; // Multiple moderate violations require rewrite
  } else if (violations.length > 0) {
    action = "warn"; // Minor violations get warning
  }

  // Build summary
  const summary = violations.length > 0
    ? `Detected ${violations.length} violation(s): ${violations.map(v => v.type).join(", ")}`
    : "No drift detected";

  const alert: PersonaDriftAlert = {
    hasDrift: violations.length > 0,
    severity: maxSeverity,
    violations,
    action,
    summary
  };

  if (alert.hasDrift) {
    console.log(`[PersonaDriftAlert] ${summary} → action: ${action}`);
  } else {
    console.log("[PersonaDriftAlert] No drift detected");
  }

  return alert;
}

/**
 * Check Avoid Pattern
 *
 * Determines if a message violates a specific avoid pattern.
 */
function checkAvoidPattern(message: string, pattern: string): boolean {
  switch (pattern) {
    case "robotic phrasing":
    case "AI self-reference":
      return /\b(as an ai|i'm an ai|as a language model|i am programmed|i don't have feelings)\b/i.test(message);

    case "lecturing":
    case "directive language":
      return /\b(you should|you need to|you must|it's important that you)\b/i.test(message);

    case "academic tone":
    case "formal transitions":
      return /\b(however|moreover|therefore|thus|consequently|furthermore|nevertheless)\b/i.test(message);

    case "corporate speak":
      return /\b(leverage|synergy|optimize|utilize|facilitate|stakeholder|circle back)\b/i.test(message);

    case "therapy-speak":
      return /\b(let's unpack that|hold space|sit with that|journey|healing)\b/i.test(message);

    case "forced positivity":
      return /\b(you've got this|you're amazing|you can do anything|everything will be fine)\b/i.test(message);

    case "babying language":
      return /\b(sweetie|honey|dear|kiddo)\b/i.test(message);

    case "cringe gen-z slang":
      return /\b(bestie|slay|no cap|periodt|it's giving|ate)\b/i.test(message);

    case "over-explaining":
      return message.length > 500;

    case "giving long lists without context":
      const listItems = message.match(/[-•]\s+/g);
      return listItems !== null && listItems.length > 5;

    default:
      return false;
  }
}

/**
 * Detect Pattern Type
 *
 * Maps avoid pattern to drift type.
 */
function detectPatternType(pattern: string): PersonaDriftType {
  if (pattern.includes("robotic") || pattern.includes("AI")) {
    return "too_robotic";
  } else if (pattern.includes("formal") || pattern.includes("academic") || pattern.includes("corporate")) {
    return "too_formal";
  } else if (pattern.includes("over-explaining") || pattern.includes("long")) {
    return "too_long";
  } else if (pattern.includes("generic")) {
    return "too_generic";
  } else {
    return "wrong_tone";
  }
}

/**
 * Should Rewrite Message
 *
 * Quick check if message needs rewriting based on drift alert.
 */
export function shouldRewriteMessage(alert: PersonaDriftAlert): boolean {
  return alert.action === "rewrite";
}

/**
 * Format Drift Alert
 *
 * Human-readable format for debugging.
 */
export function formatDriftAlert(alert: PersonaDriftAlert): string {
  if (!alert.hasDrift) {
    return "✓ No drift detected";
  }

  const lines: string[] = [];
  lines.push(`⚠️  Persona Drift Detected (severity: ${alert.severity})`);
  lines.push(`Action: ${alert.action.toUpperCase()}`);
  lines.push("");
  lines.push("Violations:");
  alert.violations.forEach((v, i) => {
    lines.push(`${i + 1}. [${v.type}] ${v.description} (severity: ${v.severity})`);
  });

  return lines.join("\n");
}
