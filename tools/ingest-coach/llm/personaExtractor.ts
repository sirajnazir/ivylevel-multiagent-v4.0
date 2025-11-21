import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { safeJsonParse } from "../../../packages/llm/safeJsonParse";
import {
  personaBundleSchema,
  PersonaBundle
} from "../schemas/persona.schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* -------------------------
   Extractor
-------------------------- */

export async function extractPersona(
  text: string,
  fileName: string
): Promise<PersonaBundle> {
  const promptPath = path.join(
    __dirname,
    "../prompts/personaExtract.prompt.md"
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
    personaTraits: [],
    voiceCharacteristics: [],
    signaturePhrases: [],
    eqMicroPatterns: [],
    studentAdaptationBehaviors: [],
    exampleSnippets: []
  });

  const parseResult = safeJsonParse(cleaned, personaBundleSchema, { logErrors: true });

  if (!parseResult.success) {
    throw new Error(`Persona extraction failed for ${fileName}: ${parseResult.error}`);
  }

  return parseResult.data!;
}
