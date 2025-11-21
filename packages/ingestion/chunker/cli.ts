#!/usr/bin/env node
/**
 * Chunk Pipeline CLI v1.0
 *
 * Command-line interface for running the chunk pipeline.
 * Processes .cleaned.txt files and indexes them into Pinecone.
 *
 * Usage:
 *   npm run chunks:jenny
 *   ts-node packages/ingestion/chunker/cli.ts --coach=jenny
 */

import fs from "fs";
import path from "path";
import { runChunkPipeline, runBatchChunkPipeline } from "./chunkPipeline";
import { ChunkInput } from "./chunk.types";

/**
 * Main CLI Entry Point
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const coachArg = args.find(arg => arg.startsWith("--coach="));
  const dirArg = args.find(arg => arg.startsWith("--dir="));

  let coachId = "jenny"; // Default
  let baseDir = `/Users/snazir/ivylevel-multiagents-v4.0/data/coaches/${coachId}`;

  if (coachArg) {
    coachId = coachArg.split("=")[1];
    baseDir = `/Users/snazir/ivylevel-multiagents-v4.0/data/coaches/${coachId}`;
  }

  if (dirArg) {
    baseDir = dirArg.split("=")[1];
  }

  console.log(`\n🎯 Running chunk pipeline for coach: ${coachId}\n`);
  console.log(`📁 Looking for .cleaned.txt files in: ${baseDir}\n`);

  try {
    // Check if directory exists
    if (!fs.existsSync(baseDir)) {
      console.error(`❌ Directory not found: ${baseDir}\n`);
      console.log("💡 Tip: Run ingestion first to generate .cleaned.txt files:");
      console.log(`   npm run ingest:jenny\n`);
      process.exit(1);
    }

    // Find all .cleaned.txt files
    const cleanedFiles = findCleanedFiles(baseDir);

    if (cleanedFiles.length === 0) {
      console.log("⚠ No .cleaned.txt files found\n");
      console.log("💡 Tip: Run ingestion first to generate .cleaned.txt files:");
      console.log(`   npm run ingest:jenny\n`);
      process.exit(0);
    }

    console.log(`Found ${cleanedFiles.length} cleaned files:\n`);
    cleanedFiles.forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${path.basename(file)}`);
    });
    console.log("");

    // Prepare chunk inputs
    const inputs: ChunkInput[] = cleanedFiles.map(filePath => ({
      coachId,
      sourcePath: filePath,
      cleanedText: fs.readFileSync(filePath, "utf-8")
    }));

    // Run batch pipeline
    const result = await runBatchChunkPipeline(inputs);

    // Exit with appropriate code
    if (!result.success || result.failed > 0) {
      console.log(`\n⚠ Chunk pipeline completed with ${result.failed} failures\n`);
      process.exit(1);
    } else {
      console.log(`\n✓ All chunks successfully indexed to Pinecone!\n`);
      console.log(`📊 Namespace: coach-${coachId}-v4`);
      console.log(`🔢 Total Vectors: ${result.indexedIds.length}\n`);
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Fatal error during chunk processing:\n");
    console.error(error);
    console.log("");
    process.exit(1);
  }
}

/**
 * Find Cleaned Files
 *
 * Recursively finds all .cleaned.txt files in a directory.
 *
 * @param dir - Directory to search
 * @returns Array of file paths
 */
function findCleanedFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) {
      return;
    }

    const entries = fs.readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(".cleaned.txt")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main };
