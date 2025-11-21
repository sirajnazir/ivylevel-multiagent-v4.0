import fs from "fs";
import { TranscriptExportParams, ExportResult } from "./exporter.types";

/**
 * Markdown Export v1.0
 *
 * Exports transcripts to Markdown format.
 *
 * Use cases:
 * - UI session history display
 * - GitHub/wiki documentation
 * - Student downloadable notes
 * - Quick preview/sharing
 *
 * This is the canonical baseline format - simplest and most readable.
 */

/**
 * Export Markdown
 *
 * Converts SessionTranscript → Markdown format.
 *
 * Format:
 * - Title header
 * - Metadata table
 * - Summary section
 * - Turn-by-turn conversation with timestamps
 */
export async function exportMarkdown(
  params: TranscriptExportParams
): Promise<ExportResult> {
  try {
    const { transcript, outputPath, inline } = params;

    console.log("[MarkdownExport] Exporting transcript to Markdown");
    console.log(`  - Session ID: ${transcript.sessionId}`);
    console.log(`  - Turns: ${transcript.turns.length}`);
    console.log(`  - Inline mode: ${inline}`);

    // Build Markdown content
    let md = "";

    // Title
    md += `# Assessment Transcript\n\n`;

    // Metadata
    md += `**Coach:** ${transcript.coachId}\n`;
    md += `**Student:** ${transcript.studentId}\n`;
    md += `**Session:** ${transcript.sessionId}\n`;
    md += `**Date:** ${new Date(transcript.metadata.startedAt).toLocaleDateString()}\n`;
    md += `**Duration:** ${transcript.metadata.totalDurationMinutes} minutes\n\n`;

    // Summary
    md += `## Summary\n\n`;
    md += `${transcript.metadata.summary}\n\n`;

    md += `---\n\n`;

    // Conversation
    md += `## Conversation\n\n`;

    transcript.turns.forEach((turn, idx) => {
      const speaker = turn.role === "coach" ? "🎓 Coach" : "👤 Student";
      const time = new Date(turn.timestamp).toLocaleTimeString();

      md += `### ${speaker} (${time})\n\n`;
      md += `${turn.text}\n\n`;
    });

    // Footer
    md += `---\n\n`;
    md += `*Generated on ${new Date().toLocaleString()}*\n`;

    // Return inline buffer or write to file
    if (inline) {
      console.log("[MarkdownExport] Returning inline buffer");
      return {
        success: true,
        buffer: Buffer.from(md, "utf-8"),
        format: "md"
      };
    }

    const finalPath = outputPath ?? `./transcript_${transcript.sessionId}.md`;
    fs.writeFileSync(finalPath, md, "utf-8");

    console.log("[MarkdownExport] Markdown exported successfully");
    console.log(`  - Path: ${finalPath}`);

    return {
      success: true,
      path: finalPath,
      format: "md"
    };
  } catch (error) {
    console.error("[MarkdownExport] Export failed:", error);
    return {
      success: false,
      format: "md",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
