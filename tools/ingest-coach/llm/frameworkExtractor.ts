import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { safeJsonParse } from "../../../packages/llm/safeJsonParse";
import { frameworkArraySchema, FrameworkChipArray } from "../schemas/framework.schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------------
   Extractor
-------------------------- */

export async function extractFrameworks(
  text: string,
  fileName: string
): Promise<FrameworkChipArray> {
  const promptPath = path.join(
    __dirname,
    "../prompts/frameworkExtract.prompt.md"
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

  const cleaned = response.choices[0].message.content || "[]";

  const parseResult = safeJsonParse(cleaned, frameworkArraySchema, { logErrors: true });

  if (!parseResult.success) {
    throw new Error(`Framework extraction failed for ${fileName}: ${parseResult.error}`);
  }

  return parseResult.data!;
}
