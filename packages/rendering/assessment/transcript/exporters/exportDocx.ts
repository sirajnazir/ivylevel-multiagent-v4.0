import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun } from "docx";
import fs from "fs";
import { TranscriptExportParams, ExportResult } from "./exporter.types";

/**
 * DOCX Export v1.0
 *
 * Exports transcripts to Microsoft Word (.docx) format.
 *
 * Use cases:
 * - Parent summary reports
 * - Internal coach QA reviews
 * - Professional documentation
 * - Offline editing/annotation
 * - Enterprise distribution
 *
 * Uses the `docx` NPM package for .docx generation.
 */

/**
 * Export DOCX
 *
 * Converts SessionTranscript → Word document.
 *
 * Format:
 * - Title page with metadata
 * - Summary section
 * - Turn-by-turn conversation with formatting
 * - Professional styling
 */
export async function exportDocx(
  params: TranscriptExportParams
): Promise<ExportResult> {
  try {
    const { transcript, outputPath, inline } = params;

    console.log("[DocxExport] Exporting transcript to DOCX");
    console.log(`  - Session ID: ${transcript.sessionId}`);
    console.log(`  - Turns: ${transcript.turns.length}`);
    console.log(`  - Inline mode: ${inline}`);

    // Build document sections
    const children: Paragraph[] = [];

    // Title
    children.push(
      new Paragraph({
        text: "Assessment Transcript",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER
      })
    );

    children.push(new Paragraph({ text: "" })); // Spacer

    // Metadata section
    children.push(
      new Paragraph({
        text: "Session Information",
        heading: HeadingLevel.HEADING_1
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Coach: ", bold: true }),
          new TextRun(transcript.coachId)
        ]
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Student: ", bold: true }),
          new TextRun(transcript.studentId)
        ]
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Session ID: ", bold: true }),
          new TextRun(transcript.sessionId)
        ]
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Date: ", bold: true }),
          new TextRun(new Date(transcript.metadata.startedAt).toLocaleDateString())
        ]
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Duration: ", bold: true }),
          new TextRun(`${transcript.metadata.totalDurationMinutes} minutes`)
        ]
      })
    );

    children.push(new Paragraph({ text: "" })); // Spacer

    // Summary section
    children.push(
      new Paragraph({
        text: "Summary",
        heading: HeadingLevel.HEADING_1
      })
    );

    children.push(new Paragraph(transcript.metadata.summary));

    children.push(new Paragraph({ text: "" })); // Spacer

    // Conversation section
    children.push(
      new Paragraph({
        text: "Conversation",
        heading: HeadingLevel.HEADING_1
      })
    );

    children.push(new Paragraph({ text: "" })); // Spacer

    transcript.turns.forEach((turn, idx) => {
      const speaker = turn.role === "coach" ? "Coach" : "Student";
      const time = new Date(turn.timestamp).toLocaleTimeString();

      // Turn header
      children.push(
        new Paragraph({
          text: `${speaker} • ${time}`,
          heading: HeadingLevel.HEADING_3
        })
      );

      // Turn content
      children.push(new Paragraph(turn.text));

      children.push(new Paragraph({ text: "" })); // Spacer
    });

    // Footer
    children.push(new Paragraph({ text: "" }));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on ${new Date().toLocaleString()}`,
            italics: true
          })
        ],
        alignment: AlignmentType.CENTER
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Return inline buffer or write to file
    if (inline) {
      console.log("[DocxExport] Returning inline buffer");
      return {
        success: true,
        buffer,
        format: "docx"
      };
    }

    const finalPath = outputPath ?? `./transcript_${transcript.sessionId}.docx`;
    fs.writeFileSync(finalPath, buffer);

    console.log("[DocxExport] DOCX exported successfully");
    console.log(`  - Path: ${finalPath}`);

    return {
      success: true,
      path: finalPath,
      format: "docx"
    };
  } catch (error) {
    console.error("[DocxExport] Export failed:", error);
    return {
      success: false,
      format: "docx",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
