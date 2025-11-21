import { frameworkArraySchema } from "../schemas/framework.schema";
import fs from "fs";

/**
 * Validates a framework JSON file against the schema
 * Used as a quality gate before accepting extracted frameworks
 */
export function validateFrameworkFile(path: string): void {
  const raw = fs.readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  const parsed = frameworkArraySchema.safeParse(json);

  if (!parsed.success) {
    console.error("❌ Framework schema validation failed:", path);
    console.error(parsed.error.format());
    process.exit(1);
  }

  console.log("✅ Framework file valid:", path);
}

/**
 * CLI entry point for validation
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: ts-node framework.validate.ts <path-to-framework.json>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    process.exit(1);
  }

  validateFrameworkFile(filePath);
}
