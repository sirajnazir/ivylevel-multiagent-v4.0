import fs from "fs";
import { TranscriptExportParams, ExportResult } from "./exporter.types";

/**
 * JSONL Export v1.0
 *
 * Exports transcripts to JSON Lines format.
 *
 * Use cases:
 * - RAG pipeline ingestion (Pinecone/vector DBs)
 * - Fine-tuning dataset preparation
 * - Knowledge Base chip creation
 * - Coach Twin training data
 * - Batch processing
 *
 * This is the HEART OF THE KNOWLEDGE MOAT.
 *
 * JSONL Format:
 * Each line = one complete JSON object (one turn)
 * No commas between lines
 * Easy streaming, parallel processing, incremental indexing
 */

/**
 * Export JSONL
 *
 * Converts SessionTranscript → JSONL format.
 *
 * Each line contains:
 * - Session metadata
 * - Turn content
 * - Phase/step context
 * - Emotional signals
 *
 * This makes each line self-contained and indexable.
 */
export async function exportJsonl(
  params: TranscriptExportParams
): Promise<ExportResult> {
  try {
    const { transcript, outputPath, inline } = params;

    console.log("[JsonlExport] Exporting transcript to JSONL");
    console.log(`  - Session ID: ${transcript.sessionId}`);
    console.log(`  - Turns: ${transcript.turns.length}`);
    console.log(`  - Inline mode: ${inline}`);

    // Build JSONL lines
    const lines = transcript.turns.map((turn, idx) => {
      const record = {
        // Session context
        sessionId: transcript.sessionId,
        coachId: transcript.coachId,
        studentId: transcript.studentId,

        // Turn metadata
        turnIndex: idx,
        timestamp: turn.timestamp,
        role: turn.role,

        // Content
        text: turn.text,

        // Context
        phase: turn.phase,
        step: turn.step,

        // Emotional state
        emotionalSignals: {
          frustration: turn.emotionalSignals.frustration,
          confidence: turn.emotionalSignals.confidence,
          overwhelm: turn.emotionalSignals.overwhelm,
          motivation: turn.emotionalSignals.motivation,
          agency: turn.emotionalSignals.agency
        },

        // Persona context (for coaching style analysis)
        persona: {
          warmth: turn.personaSnapshot.tone.warmth,
          energy: turn.personaSnapshot.tone.energy,
          empathyType: turn.personaSnapshot.tone.empathyType,
          firmness: turn.personaSnapshot.tone.firmness
        }
      };

      return JSON.stringify(record);
    });

    const jsonlContent = lines.join("\n");

    // Return inline buffer or write to file
    if (inline) {
      console.log("[JsonlExport] Returning inline buffer");
      return {
        success: true,
        buffer: Buffer.from(jsonlContent, "utf-8"),
        format: "jsonl"
      };
    }

    const finalPath = outputPath ?? `./transcript_${transcript.sessionId}.jsonl`;
    fs.writeFileSync(finalPath, jsonlContent, "utf-8");

    console.log("[JsonlExport] JSONL exported successfully");
    console.log(`  - Path: ${finalPath}`);
    console.log(`  - Records: ${lines.length}`);

    return {
      success: true,
      path: finalPath,
      format: "jsonl"
    };
  } catch (error) {
    console.error("[JsonlExport] Export failed:", error);
    return {
      success: false,
      format: "jsonl",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
