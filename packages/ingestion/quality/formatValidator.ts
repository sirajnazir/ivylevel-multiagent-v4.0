import { QualityGateInput, GateResult } from "./quality.types";

/**
 * Format Validator v1.0
 *
 * Catches common ingestion nightmares:
 * - Broken Unicode
 * - Duplicated lines (OCR artifacts)
 * - Timestamp fragmentation
 * - Null bytes
 * - Invisible control characters
 * - Corrupted extracts
 *
 * This is the first line of defense against garbage.
 */

/**
 * Validate Format
 *
 * Checks for format-level issues that indicate corrupted extraction.
 */
export async function validateFormat(
  input: QualityGateInput
): Promise<GateResult> {
  console.log("[FormatValidator] Validating format");
  console.log(`  - Source: ${input.sourcePath}`);
  console.log(`  - File type: ${input.metadata.fileType}`);
  console.log(`  - Text length: ${input.rawText.length}`);

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: Minimum length
  if (input.rawText.length < 20) {
    errors.push("File too short to be meaningful (< 20 chars)");
  }

  // Check 2: Maximum reasonable length (catches runaway extraction)
  if (input.rawText.length > 1_000_000) {
    errors.push("File suspiciously large (> 1M chars) - likely extraction error");
  }

  // Check 3: Unicode replacement characters (indicates encoding issues)
  const replacementChars = (input.rawText.match(/\uFFFD/g) || []).length;
  if (replacementChars > 0) {
    if (replacementChars > 10) {
      errors.push(`High number of Unicode replacement characters (${replacementChars}) - corrupted encoding`);
    } else {
      warnings.push(`Unicode replacement characters detected (${replacementChars})`);
    }
  }

  // Check 4: Null bytes (indicates binary corruption)
  if (input.rawText.includes("\x00")) {
    errors.push("Null bytes detected - likely corrupted binary extract");
  }

  // Check 5: Excessive control characters
  const controlChars = (input.rawText.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
  if (controlChars > 50) {
    errors.push(`Excessive control characters (${controlChars}) - corrupted extract`);
  } else if (controlChars > 10) {
    warnings.push(`Some control characters detected (${controlChars})`);
  }

  // Check 6: Line duplication (OCR artifacts)
  const lineDuplication = detectLineDuplication(input.rawText);
  if (lineDuplication > 0.3) {
    errors.push(`High line duplication (${Math.round(lineDuplication * 100)}%) - OCR artifacts`);
  } else if (lineDuplication > 0.15) {
    warnings.push(`Moderate line duplication (${Math.round(lineDuplication * 100)}%)`);
  }

  // Check 7: Timestamp fragmentation (for VTT files)
  if (input.metadata.fileType === "vtt") {
    const timestampFragmentation = detectTimestampFragmentation(input.rawText);
    if (timestampFragmentation > 0.5) {
      errors.push("Excessive timestamp fragmentation - VTT parsing failed");
    } else if (timestampFragmentation > 0.3) {
      warnings.push("Some timestamp fragmentation detected");
    }
  }

  // Check 8: Whitespace ratio (catches OCR noise)
  const whitespaceRatio = calculateWhitespaceRatio(input.rawText);
  if (whitespaceRatio > 0.5) {
    errors.push(`Excessive whitespace (${Math.round(whitespaceRatio * 100)}%) - likely OCR noise`);
  } else if (whitespaceRatio > 0.3) {
    warnings.push(`High whitespace ratio (${Math.round(whitespaceRatio * 100)}%)`);
  }

  // Check 9: Character set diversity (catches repeated garbage)
  const diversity = calculateCharDiversity(input.rawText);
  if (diversity < 0.01) {
    errors.push("Extremely low character diversity - likely corrupted or repeated garbage");
  } else if (diversity < 0.05) {
    warnings.push("Low character diversity");
  }

  // Calculate score
  const score = calculateFormatScore(errors, warnings, input.rawText.length);

  const passed = errors.length === 0;

  console.log("[FormatValidator] Validation complete");
  console.log(`  - Passed: ${passed}`);
  console.log(`  - Score: ${score}`);
  console.log(`  - Errors: ${errors.length}`);
  console.log(`  - Warnings: ${warnings.length}`);

  return {
    passed,
    errors,
    warnings,
    score
  };
}

/**
 * Detect Line Duplication
 *
 * Calculates ratio of duplicate lines (OCR artifacts).
 */
function detectLineDuplication(text: string): number {
  const lines = text.split("\n").filter(line => line.trim().length > 0);

  if (lines.length === 0) return 0;

  const uniqueLines = new Set(lines);
  const duplicates = lines.length - uniqueLines.size;

  return duplicates / lines.length;
}

/**
 * Detect Timestamp Fragmentation
 *
 * For VTT files, checks if timestamps are fragmented across lines.
 */
function detectTimestampFragmentation(text: string): number {
  // VTT timestamp pattern: HH:MM:SS.mmm --> HH:MM:SS.mmm
  const timestampPattern = /\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/g;
  const timestamps = text.match(timestampPattern) || [];

  // Fragmented timestamps: standalone numbers that look like times
  const fragmentPattern = /^\d{2}:\d{2}:\d{2}/gm;
  const fragments = text.match(fragmentPattern) || [];

  const fragmentedCount = fragments.length - timestamps.length;

  if (timestamps.length === 0) return 0;

  return fragmentedCount / timestamps.length;
}

/**
 * Calculate Whitespace Ratio
 *
 * Ratio of whitespace characters to total characters.
 */
function calculateWhitespaceRatio(text: string): number {
  if (text.length === 0) return 0;

  const whitespaceCount = (text.match(/\s/g) || []).length;
  return whitespaceCount / text.length;
}

/**
 * Calculate Character Diversity
 *
 * Ratio of unique characters to total characters.
 * Low diversity indicates repeated garbage.
 */
function calculateCharDiversity(text: string): number {
  if (text.length === 0) return 0;

  const uniqueChars = new Set(text);
  return uniqueChars.size / text.length;
}

/**
 * Calculate Format Score
 *
 * Converts errors/warnings into 0-100 score.
 */
function calculateFormatScore(
  errors: string[],
  warnings: string[],
  textLength: number
): number {
  if (errors.length > 0) return 0;

  let score = 100;

  // Deduct for warnings
  score -= warnings.length * 10;

  // Bonus for reasonable length
  if (textLength > 100 && textLength < 100000) {
    score += 0; // Neutral
  } else {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}
