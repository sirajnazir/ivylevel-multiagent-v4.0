import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { safeJsonParse } from "../../../packages/llm/safeJsonParse";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------------
   Schema
-------------------------- */

export const eqPatternSchema = z.array(
  z.object({
    id: z.string(),
    category: z.string(),
    pattern: z.string(),
    example: z.string(),
    explanation: z.string()
  })
);

export type EqPattern = z.infer<typeof eqPatternSchema>;

/* -------------------------
   Extractor
-------------------------- */

export async function extractEQPatterns(text: string, fileName: string): Promise<EqPattern> {
  const promptPath = path.join(
    __dirname,
    "../prompts/eqPatternExtract.prompt.md"
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

  const parseResult = safeJsonParse(cleaned, eqPatternSchema, { logErrors: true });

  if (!parseResult.success) {
    throw new Error(`EQ Pattern extraction failed for ${fileName}: ${parseResult.error}`);
  }

  return parseResult.data!;
}
