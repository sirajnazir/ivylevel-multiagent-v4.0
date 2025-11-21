import { personaBundleSchema } from "../schemas/persona.schema";
import fs from "fs";

/**
 * Validates a persona JSON file against the schema
 * Used as a quality gate before accepting extracted persona
 */
export function validateCoachPersona(path: string): void {
  const raw = fs.readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  const parsed = personaBundleSchema.safeParse(json);

  if (!parsed.success) {
    console.error("❌ Persona schema validation failed:", path);
    console.error(parsed.error.format());
    process.exit(1);
  }

  console.log("✅ Persona file valid:", path);
}

/**
 * CLI entry point for validation
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: ts-node persona.validate.ts <path-to-persona.json>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    process.exit(1);
  }

  validateCoachPersona(filePath);
}
