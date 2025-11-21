import { templateScriptBundleSchema } from "../schemas/templateScript.schema";
import fs from "fs";

/**
 * Validates a template/script JSON file against the schema
 * Used as a quality gate before accepting extracted templates/scripts
 */
export function validateTemplateScriptFile(path: string): void {
  const raw = fs.readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  const parsed = templateScriptBundleSchema.safeParse(json);

  if (!parsed.success) {
    console.error("❌ Template/Script schema validation failed:", path);
    console.error(parsed.error.format());
    process.exit(1);
  }

  console.log("✅ Template/Script file valid:", path);
}

/**
 * CLI entry point for validation
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: ts-node templateScript.validate.ts <path-to-templates.json>");
    process.exit(1);
  }

  const filePath = args[0];

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File does not exist: ${filePath}`);
    process.exit(1);
  }

  validateTemplateScriptFile(filePath);
}
