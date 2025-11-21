import PDFDocument from "pdfkit";
import fs from "fs";
import { TranscriptExportParams, ExportResult } from "./exporter.types";

/**
 * PDF Export v1.0
 *
 * Exports transcripts to PDF format.
 *
 * Use cases:
 * - Parent assessment summary reports
 * - Student downloadable notes
 * - Official documentation
 * - Archival/record-keeping
 * - Print-ready format
 *
 * Uses `pdfkit` for PDF generation.
 */

/**
 * Export PDF
 *
 * Converts SessionTranscript → PDF document.
 *
 * Format:
 * - Title page with metadata
 * - Summary section
 * - Turn-by-turn conversation with formatting
 * - Professional layout with margins, spacing
 */
export async function exportPdf(
  params: TranscriptExportParams
): Promise<ExportResult> {
  try {
    const { transcript, outputPath, inline } = params;

    console.log("[PdfExport] Exporting transcript to PDF");
    console.log(`  - Session ID: ${transcript.sessionId}`);
    console.log(`  - Turns: ${transcript.turns.length}`);
    console.log(`  - Inline mode: ${inline}`);

    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({
          margin: 50,
          size: "LETTER"
        });

        const buffers: Buffer[] = [];

        // Set up output handling
        if (inline) {
          // Collect buffers for inline mode
          doc.on("data", (chunk) => buffers.push(chunk));
          doc.on("end", () => {
            const buffer = Buffer.concat(buffers);
            console.log("[PdfExport] PDF buffer generated");
            resolve({
              success: true,
              buffer,
              format: "pdf"
            });
          });
        } else {
          // Write to file
          const finalPath = outputPath ?? `./transcript_${transcript.sessionId}.pdf`;
          const stream = fs.createWriteStream(finalPath);

          doc.pipe(stream);

          stream.on("finish", () => {
            console.log("[PdfExport] PDF exported successfully");
            console.log(`  - Path: ${finalPath}`);
            resolve({
              success: true,
              path: finalPath,
              format: "pdf"
            });
          });

          stream.on("error", (err) => {
            reject(err);
          });
        }

        doc.on("error", (err) => {
          reject(err);
        });

        // Build PDF content

        // Title
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text("Assessment Transcript", { align: "center" });

        doc.moveDown(2);

        // Metadata section
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Session Information");

        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica");

        doc.text(`Coach: ${transcript.coachId}`);
        doc.text(`Student: ${transcript.studentId}`);
        doc.text(`Session ID: ${transcript.sessionId}`);
        doc.text(`Date: ${new Date(transcript.metadata.startedAt).toLocaleDateString()}`);
        doc.text(`Duration: ${transcript.metadata.totalDurationMinutes} minutes`);

        doc.moveDown(2);

        // Summary section
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Summary");

        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .font("Helvetica")
          .text(transcript.metadata.summary, {
            align: "left"
          });

        doc.moveDown(2);

        // Conversation section
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Conversation");

        doc.moveDown(1);

        // Turns
        transcript.turns.forEach((turn, idx) => {
          const speaker = turn.role === "coach" ? "Coach" : "Student";
          const time = new Date(turn.timestamp).toLocaleTimeString();

          // Check if we need a new page
          if (doc.y > 650) {
            doc.addPage();
          }

          // Turn header
          doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .text(`${speaker} • ${time}`, {
              underline: true
            });

          doc.moveDown(0.3);

          // Turn content
          doc
            .fontSize(11)
            .font("Helvetica")
            .text(turn.text, {
              align: "left"
            });

          doc.moveDown(0.8);
        });

        // Footer
        doc.moveDown(2);
        doc
          .fontSize(10)
          .font("Helvetica-Oblique")
          .text(`Generated on ${new Date().toLocaleString()}`, {
            align: "center"
          });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error("[PdfExport] Export failed:", error);
    return {
      success: false,
      format: "pdf",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
