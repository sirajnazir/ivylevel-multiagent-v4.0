/**
 * Ingestion Configuration v1.0
 *
 * Preconfigured ingestion settings for each coach.
 */

import { IngestionConfig } from "./batch.types";

/**
 * Jenny Ingestion Config
 *
 * Default configuration for ingesting Jenny's coaching content.
 */
export const JennyIngestionConfig: IngestionConfig = {
  coachId: "jenny",
  rootDir: "/Users/snazir/ivylevel-multiagents-v4.0/data/v4_organized/coaches/jenny",
  fileTypes: ["pdf", "vtt", "txt", "docx"],
  maxRetries: 2,
  concurrentLimit: 2
};

/**
 * Get Ingestion Config
 *
 * Returns configuration for a specific coach.
 */
export function getIngestionConfig(coachId: string): IngestionConfig {
  switch (coachId.toLowerCase()) {
    case "jenny":
      return JennyIngestionConfig;
    default:
      throw new Error(`No ingestion config found for coach: ${coachId}`);
  }
}
