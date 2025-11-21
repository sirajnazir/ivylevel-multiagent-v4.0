import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { safeJsonParse } from "../../../packages/llm/safeJsonParse";
import {
  strategyBundleSchema,
  StrategyBundle
} from "../schemas/strategy.schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------------
   Extractor
-------------------------- */

export async function extractStrategies(
  text: string,
  fileName: string
): Promise<StrategyBundle> {
  const promptPath = path.join(
    __dirname,
    "../prompts/strategyExtract.prompt.md"
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
    frameworks: [],
    tacticalSequences: [],
    playbooks: [],
    decisionHeuristics: [],
    studentTypeAdaptations: [],
    examples: []
  });

  const parseResult = safeJsonParse(cleaned, strategyBundleSchema, { logErrors: true });

  if (!parseResult.success) {
    throw new Error(`Strategy extraction failed for ${fileName}: ${parseResult.error}`);
  }

  return parseResult.data!;
}
