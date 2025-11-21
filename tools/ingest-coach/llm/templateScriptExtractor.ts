import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { safeJsonParse } from "../../../packages/llm/safeJsonParse";
import {
  templateScriptBundleSchema,
  TemplateScriptBundle
} from "../schemas/templateScript.schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------------
   Extractor
-------------------------- */

export async function extractTemplatesAndScripts(
  text: string,
  fileName: string
): Promise<TemplateScriptBundle> {
  const promptPath = path.join(
    __dirname,
    "../prompts/templateScriptExtract.prompt.md"
  );

  const systemPrompt = fs.readFileSync(promptPath, "utf8");

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
    temperature: 0.3
  });

  const cleaned = response.choices[0].message.content || JSON.stringify({
    templates: [],
    scripts: [],
    scaffolds: [],
    rubrics: []
  });

  const parseResult = safeJsonParse(cleaned, templateScriptBundleSchema, { logErrors: true });

  if (!parseResult.success) {
    throw new Error(`Template/Script extraction failed for ${fileName}: ${parseResult.error}`);
  }

  return parseResult.data!;
}
