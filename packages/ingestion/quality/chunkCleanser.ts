/**
 * Chunk Cleanser v1.0
 *
 * Final normalization step before indexing:
 * - Whitespace normalization
 * - Special character handling
 * - Line break merging
 * - Token bounding per chunk
 * - Unicode cleanup
 *
 * This ensures consistent, clean text enters Pinecone.
 */

/**
 * Cleanse Chunk
 *
 * Main entry point for chunk cleaning.
 */
export function cleanseChunk(text: string): string {
  console.log("[ChunkCleanser] Cleansing chunk");
  console.log(`  - Input length: ${text.length}`);

  let cleaned = text;

  // Step 1: Remove trailing whitespace from each line
  cleaned = cleaned.replace(/\s+$/gm, "");

  // Step 2: Remove carriage returns (Windows line endings)
  cleaned = cleaned.replace(/\r/g, "");

  // Step 3: Normalize tabs to spaces
  cleaned = cleaned.replace(/\t+/g, " ");

  // Step 4: Collapse multiple spaces (but preserve paragraph breaks)
  cleaned = cleaned.replace(/[^\S\r\n]{2,}/g, " ");

  // Step 5: Remove excessive newlines (max 2)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Step 6: Remove Unicode replacement characters
  cleaned = cleaned.replace(/\uFFFD/g, "");

  // Step 7: Remove null bytes
  cleaned = cleaned.replace(/\x00/g, "");

  // Step 8: Remove other control characters (except newline)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  // Step 9: Normalize quotes
  cleaned = normalizeQuotes(cleaned);

  // Step 10: Normalize dashes
  cleaned = normalizeDashes(cleaned);

  // Step 11: Merge broken lines (heuristic)
  cleaned = mergeBrokenLines(cleaned);

  // Step 12: Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  console.log("[ChunkCleanser] Cleansing complete");
  console.log(`  - Output length: ${cleaned.length}`);
  console.log(`  - Reduction: ${Math.round((1 - cleaned.length / text.length) * 100)}%`);

  return cleaned;
}

/**
 * Normalize Quotes
 *
 * Convert smart quotes to straight quotes for consistency.
 */
function normalizeQuotes(text: string): string {
  return text
    .replace(/[""]/g, '"')  // Smart double quotes → straight
    .replace(/['']/g, "'"); // Smart single quotes → straight
}

/**
 * Normalize Dashes
 *
 * Convert em dashes, en dashes to hyphens for consistency.
 */
function normalizeDashes(text: string): string {
  return text
    .replace(/—/g, "-")  // Em dash
    .replace(/–/g, "-"); // En dash
}

/**
 * Merge Broken Lines
 *
 * Heuristically merges lines that were broken mid-sentence.
 * Common in PDF extraction.
 */
function mergeBrokenLines(text: string): string {
  const lines = text.split("\n");
  const merged: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : "";

    if (line.length === 0) {
      // Empty line - preserve as paragraph break
      merged.push("");
      continue;
    }

    // Check if line ends mid-sentence (no punctuation)
    const endsWithPunctuation = /[.!?:;]$/.test(line);
    const nextStartsWithLower = nextLine.length > 0 && /^[a-z]/.test(nextLine);

    if (!endsWithPunctuation && nextStartsWithLower && nextLine.length > 0) {
      // Likely broken line - merge with next
      merged.push(line + " " + nextLine);
      i++; // Skip next line since we merged it
    } else {
      merged.push(line);
    }
  }

  return merged.join("\n");
}

/**
 * Bound Token Count
 *
 * Ensures chunk doesn't exceed token limit.
 * Uses rough 4-chars-per-token heuristic.
 */
export function boundTokenCount(text: string, maxTokens: number = 8000): string {
  const maxChars = maxTokens * 4; // Rough approximation

  if (text.length <= maxChars) {
    return text;
  }

  console.log(`[ChunkCleanser] Bounding to ${maxTokens} tokens`);

  // Truncate at sentence boundary if possible
  const truncated = text.substring(0, maxChars);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );

  if (lastSentenceEnd > maxChars * 0.8) {
    // Good sentence boundary found
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  // No good boundary - hard truncate with ellipsis
  return truncated.substring(0, maxChars - 3) + "...";
}

/**
 * Split into Chunks
 *
 * Splits long text into multiple chunks with overlap.
 */
export function splitIntoChunks(
  text: string,
  chunkSize: number = 6000,
  overlapSize: number = 200
): string[] {
  const maxChars = chunkSize * 4; // Token → char approximation
  const overlapChars = overlapSize * 4;

  if (text.length <= maxChars) {
    return [text.trim()];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    let chunkText = text.substring(start, end);

    // Try to end at sentence boundary
    if (end < text.length) {
      const lastSentenceEnd = Math.max(
        chunkText.lastIndexOf("."),
        chunkText.lastIndexOf("!"),
        chunkText.lastIndexOf("?")
      );

      if (lastSentenceEnd > maxChars * 0.7) {
        chunkText = chunkText.substring(0, lastSentenceEnd + 1);
      }
    }

    chunks.push(chunkText.trim());

    // Move start forward with overlap
    start += chunkText.length - overlapChars;

    // Ensure we make progress
    if (start <= chunks[chunks.length - 1].length) {
      start = chunks[chunks.length - 1].length + 1;
    }
  }

  return chunks;
}

/**
 * Remove Duplicate Chunks
 *
 * Removes exact duplicate chunks (from OCR errors).
 */
export function removeDuplicateChunks(chunks: string[]): string[] {
  const seen = new Set<string>();
  return chunks.filter(chunk => {
    const normalized = chunk.trim().toLowerCase();
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}
