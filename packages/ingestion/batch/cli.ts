#!/usr/bin/env node
/**
 * Batch Ingestion CLI v1.0
 *
 * Command-line interface for running batch ingestion.
 *
 * Usage:
 *   npm run ingest:jenny
 *   ts-node packages/ingestion/batch/cli.ts --coach=jenny
 */

import { getIngestionConfig } from "./ingestConfig";
import { runIngestion } from "./ingestRunner";

/**
 * Main CLI Entry Point
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const coachArg = args.find(arg => arg.startsWith("--coach="));

  let coachId = "jenny"; // Default

  if (coachArg) {
    coachId = coachArg.split("=")[1];
  }

  console.log(`\n🎯 Running ingestion for coach: ${coachId}\n`);

  try {
    // Get configuration
    const config = getIngestionConfig(coachId);

    // Run ingestion
    const results = await runIngestion(config);

    // Exit with appropriate code
    if (results.failed > 0) {
      console.log(`\n⚠ Ingestion completed with ${results.failed} failures\n`);
      process.exit(1);
    } else {
      console.log(`\n✓ Ingestion completed successfully!\n`);
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Fatal error during ingestion:\n");
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main };
