import { tacticsArraySchema } from "../schemas/tactics.schema";
import fs from "fs";

/**
 * Validates a tactics JSON file against the schema
 * Used as a quality gate before accepting extracted tactics
 */
export function validateTacticsFile(path: string): void {
  const raw = fs.readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  const parsed = tacticsArraySchema.safeParse(json);

  if (!parsed.success) {
    console.error("❌ Tactics schema validation failed:", path);
    console.error(parsed.error.format());
    process.exit(1);
  }

  console.log("✅ Tactics file valid:", path);
}

/**
 * CLI entry point for validation
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: ts-node tactics.validate.ts <path-to-tactics.json>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    process.exit(1);
  }

  validateTacticsFile(filePath);
}
