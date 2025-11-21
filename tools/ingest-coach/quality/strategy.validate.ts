import { strategyBundleSchema } from "../schemas/strategy.schema";
import fs from "fs";

/**
 * Validates a strategy JSON file against the schema
 * Used as a quality gate before accepting extracted strategies
 */
export function validateCoachStrategies(path: string): void {
  const raw = fs.readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  const parsed = strategyBundleSchema.safeParse(json);

  if (!parsed.success) {
    console.error("❌ Strategy schema validation failed:", path);
    console.error(parsed.error.format());
    process.exit(1);
  }

  console.log("✅ Strategy file valid:", path);
}

/**
 * CLI entry point for validation
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: ts-node strategy.validate.ts <path-to-strategies.json>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    process.exit(1);
  }

  validateCoachStrategies(filePath);
}
