import { toolingArraySchema } from "../schemas/tooling.schema";
import fs from "fs";

/**
 * Validates a tooling JSON file against the schema
 * Used as a quality gate before accepting extracted tooling
 */
export function validateToolingFile(path: string): void {
  const raw = fs.readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  const parsed = toolingArraySchema.safeParse(json);

  if (!parsed.success) {
    console.error("❌ Tooling schema validation failed:", path);
    console.error(parsed.error.format());
    process.exit(1);
  }

  console.log("✅ Tooling file valid:", path);
}

/**
 * CLI entry point for validation
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: ts-node tooling.validate.ts <path-to-tooling.json>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    process.exit(1);
  }

  validateToolingFile(filePath);
}
