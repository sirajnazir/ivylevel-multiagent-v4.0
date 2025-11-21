import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { safeJsonParse } from "../../../llm/safeJsonParse";
import {
  eqTonePlanSchema,
  eqModulationInputSchema,
  warmthDirectiveMatrix,
  type EQTonePlan,
  type EQModulationInput
} from "../../../schema/eqTonePlan_v1";
import { StudentTypeClassification } from "../../../schema/studentType_v1";
import { ExtractedProfile_v2 } from "../../../schema/extractedProfile_v2";
import { NarrativeBlocks_v2 } from "../../../schema/narrativeBlocks_v2";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * EQ Modulation Engine
 *
 * Transforms student archetype + profile + narrative + EQ chips
 * into a precise conversational tone profile.
 *
 * This is the "signature sauce" — the engine that ensures agents never
 * speak in generic LLM voice, but instead adapt dynamically to each student's
 * psychology, communication style, and coaching needs.
 *
 * Key outputs:
 * - Tone guidelines (how to speak)
 * - Language patterns (what to say)
 * - Forbidden patterns (what NOT to say)
 * - Warmth/directive calibration (1-5 scales)
 * - Relatability hooks (context-specific phrases)
 * - Accountability style (how to follow up)
 * - Micro-wins structure (weekly goals)
 */

/**
 * Build EQ Tone Plan
 *
 * Main entry point for EQ modulation.
 * Uses LLM + system prompt to generate adaptive tone profile.
 */
export async function buildEQTonePlan(
  studentType: StudentTypeClassification,
  profile: ExtractedProfile_v2,
  narrative: NarrativeBlocks_v2,
  eqChips?: any
): Promise<EQTonePlan> {
  console.log(`[EQModulationEngine] Building tone plan for: ${studentType.primaryType}`);

  try {
    // Build input object
    const input: EQModulationInput = {
      studentType: {
        primaryType: studentType.primaryType,
        confidence: studentType.confidence,
        secondaryType: studentType.secondaryType,
        evidence: studentType.evidence,
        coachingAdaptations: studentType.coachingAdaptations,
        frameworkPriority: studentType.frameworkPriority,
        eqModulation: studentType.eqModulation
      },
      profile: {
        academics: profile.academics,
        activities: profile.activities,
        personality: profile.personality,
        diagnostics: profile.diagnostics
      },
      narrative: {
        thematicHubs: narrative.thematicHubs,
        flagshipNarrative: narrative.flagshipNarrative,
        positioning: narrative.positioning,
        identityThread: narrative.identityThread,
        risks: narrative.risks,
        opportunities: narrative.opportunities
      },
      eqChips: eqChips || undefined
    };

    // Validate input
    const validatedInput = eqModulationInputSchema.parse(input);

    // Load system prompt
    const promptPath = path.join(__dirname, "../../../prompts/eqModulation.prompt.md");
    const systemPrompt = fs.readFileSync(promptPath, "utf8");

    // Call LLM
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(validatedInput, null, 2) }
      ],
      temperature: 0.4 // Slightly higher for creative language patterns
    });

    const cleaned = response.choices[0].message.content || JSON.stringify(
      buildFallbackTonePlan(studentType, profile, narrative)
    );

    // Parse and validate response
    const parseResult = safeJsonParse(cleaned, eqTonePlanSchema, { logErrors: true });

    if (!parseResult.success) {
      console.warn(`[EQModulationEngine] LLM parse failed, using fallback: ${parseResult.error}`);
      return buildFallbackTonePlan(studentType, profile, narrative);
    }

    console.log(`[EQModulationEngine] Tone plan generated successfully`);
    console.log(`  - Warmth level: ${parseResult.data!.warmthLevel}`);
    console.log(`  - Directive level: ${parseResult.data!.directiveLevel}`);
    console.log(`  - Language patterns: ${parseResult.data!.languagePatterns.length}`);

    return parseResult.data!;
  } catch (error) {
    console.error(`[EQModulationEngine] Error building tone plan:`, error);
    console.warn(`[EQModulationEngine] Falling back to deterministic tone plan`);
    return buildFallbackTonePlan(studentType, profile, narrative);
  }
}

/**
 * Fallback Tone Plan Builder
 *
 * Deterministic fallback when LLM is unavailable or fails.
 * Uses archetype-based defaults + profile analysis.
 */
function buildFallbackTonePlan(
  studentType: StudentTypeClassification,
  profile: ExtractedProfile_v2,
  narrative: NarrativeBlocks_v2
): EQTonePlan {
  const archetype = studentType.primaryType;

  // Get default warmth/directive levels
  const defaults = warmthDirectiveMatrix[archetype as keyof typeof warmthDirectiveMatrix] || {
    warmth: 3,
    directive: 3
  };

  // Build archetype-specific guidelines
  const guidelines = getArchetypeGuidelines(archetype);
  const patterns = getArchetypeLanguagePatterns(archetype);
  const forbidden = getArchetypeForbiddenPatterns(archetype);
  const relatability = buildRelatabilityHooks(profile, narrative);
  const accountability = getArchetypeAccountabilityStyle(archetype);
  const microWins = buildMicroWinsStructure(studentType, profile);

  return {
    toneGuidelines: guidelines,
    languagePatterns: patterns,
    forbiddenPatterns: forbidden,
    warmthLevel: defaults.warmth,
    directiveLevel: defaults.directive,
    relatabilityHooks: relatability,
    accountabilityStyle: accountability,
    microWinsStructure: microWins,
    debugNotes: [
      `Fallback tone plan for: ${archetype}`,
      `Confidence: ${studentType.confidence}`,
      `Evidence: ${studentType.evidence.join(", ")}`,
      `Using deterministic archetype-based defaults`
    ]
  };
}

/**
 * Get archetype-specific tone guidelines
 */
function getArchetypeGuidelines(archetype: string): string[] {
  const guidelines: Record<string, string[]> = {
    "The Anxious Achiever": [
      "Use a soothing, normalizing tone",
      "Frame stretch goals as incremental, low-risk steps",
      "Validate uncertainty before offering solutions",
      "Provide frequent affirmation and progress recognition"
    ],
    "The Chaotic Ambitious": [
      "Use concise, anchoring language",
      "Provide tight structure and clear priorities",
      "Limit open-ended exploration without guardrails",
      "Focus on one flagship project at a time"
    ],
    "The Quiet High-Potential Thinker": [
      "Use coaxing, reflective questioning",
      "Create space for introspection and thinking",
      "Validate intellectual depth explicitly",
      "Draw out insights through curiosity-driven prompts"
    ],
    "The Overcommitted Perfectionist": [
      "Use grounding, reframing language",
      "Emphasize depth over breadth consistently",
      "Give permission to say no and prune commitments",
      "Reframe rest and focus as strategic advantages"
    ],
    "The Low-Agency Bright Drifter": [
      "Use energetic, activation tone",
      "Celebrate small wins and micro-progress",
      "Build autonomy gradually through experiments",
      "Avoid shame-based language about passivity"
    ],
    "The Narrative-Lost but Curious Freshman": [
      "Use exploratory, possibility-focused language",
      "Show patience with uncertainty and exploration",
      "Frame journey as discovery, not decision",
      "Provide low-pressure experimentation prompts"
    ],
    "The Transactional Just-Tell-Me-What-To-Do Student": [
      "Use tactical, checklist-driven language",
      "Minimize fluff and maximize actionability",
      "Start transactional, layer in EQ gradually",
      "Connect concrete steps to outcome goals"
    ]
  };

  return guidelines[archetype] || [
    "Use balanced warmth and structure",
    "Provide clear, actionable guidance",
    "Adapt tone based on student response"
  ];
}

/**
 * Get archetype-specific language patterns
 */
function getArchetypeLanguagePatterns(archetype: string): string[] {
  const patterns: Record<string, string[]> = {
    "The Anxious Achiever": [
      "It's completely normal to feel uncertain here — most students do.",
      "Let's just raise one course level, not everything at once.",
      "You're already academically strong; this is about confidence-building.",
      "We'll take this one step at a time."
    ],
    "The Chaotic Ambitious": [
      "Here are your three priorities for this week — just three.",
      "Let's pause and write this down before moving forward.",
      "Which one of these five interests is your North Star right now?",
      "Your energy is an asset — let's channel it into one flagship project."
    ],
    "The Quiet High-Potential Thinker": [
      "Tell me more about what you're thinking here.",
      "What would happen if you tried framing it this way?",
      "Your intellectual depth is a huge asset — let's unlock it.",
      "Take your time with this — deep thinking is valuable."
    ],
    "The Overcommitted Perfectionist": [
      "What if we cut two activities and went deeper on one?",
      "Depth > breadth for admissions officers.",
      "You don't need permission to say no.",
      "Strategic focus is more impressive than exhaustive breadth."
    ],
    "The Low-Agency Bright Drifter": [
      "Let's start small: one experiment this month.",
      "What's one thing you're curious about trying?",
      "You just did that — that's agency in action.",
      "Small steps forward still count as forward."
    ],
    "The Narrative-Lost but Curious Freshman": [
      "You're early in the journey — let's explore a few directions.",
      "What sounds interesting to you right now?",
      "We'll figure this out together, step by step.",
      "Exploration is part of the process at your stage."
    ],
    "The Transactional Just-Tell-Me-What-To-Do Student": [
      "Here's the plan: Step 1, Step 2, Step 3.",
      "Your action item for this week is X.",
      "Let's tie this to your goal of getting into [target school].",
      "Here's what you need to do, and here's why it matters."
    ]
  };

  return patterns[archetype] || [
    "Let's work together on this.",
    "Here's what I'm thinking.",
    "What feels right to you?"
  ];
}

/**
 * Get archetype-specific forbidden patterns
 */
function getArchetypeForbiddenPatterns(archetype: string): string[] {
  const forbidden: Record<string, string[]> = {
    "The Anxious Achiever": [
      "You should aim higher",
      "Don't be so anxious",
      "Just go for it",
      "You need to push yourself harder"
    ],
    "The Chaotic Ambitious": [
      "Follow all your passions",
      "Explore everything that interests you",
      "You can do it all",
      "Just see where things lead"
    ],
    "The Quiet High-Potential Thinker": [
      "Just pick something and go with it",
      "Stop overthinking this",
      "You need to decide now",
      "Don't be so hesitant"
    ],
    "The Overcommitted Perfectionist": [
      "You can do it all if you manage your time better",
      "More activities will strengthen your profile",
      "Keep all your commitments",
      "Sleep is overrated"
    ],
    "The Low-Agency Bright Drifter": [
      "You need to be more proactive",
      "Why haven't you done anything yet?",
      "You're wasting your potential",
      "Your parents are right to push you"
    ],
    "The Narrative-Lost but Curious Freshman": [
      "You need to know your path by now",
      "Stop exploring and commit",
      "Other students already know what they want",
      "You're behind"
    ],
    "The Transactional Just-Tell-Me-What-To-Do Student": [
      "How does that make you feel?",
      "Let's explore your inner motivations first",
      "We need to dig deeper before taking action",
      "Tell me about your childhood"
    ]
  };

  return forbidden[archetype] || [
    "You should know better",
    "This is easy",
    "Everyone else can do it"
  ];
}

/**
 * Build relatability hooks from profile and narrative
 */
function buildRelatabilityHooks(
  profile: ExtractedProfile_v2,
  narrative: NarrativeBlocks_v2
): string[] {
  const hooks: string[] = [];

  // First-gen/immigrant hooks
  if (profile.personality.coreValues.some((v: string) => v.toLowerCase().includes("family") || v.toLowerCase().includes("grit"))) {
    hooks.push("Many first-gen students feel pressure to take the hardest courses — but smart pacing matters more.");
  }

  // GPA-based hooks
  const gpa = profile.academics.gpa.weighted || profile.academics.gpa.unweighted;
  if (gpa && gpa >= 3.8) {
    hooks.push("I've worked with students who had your exact GPA and felt this same pressure.");
  }

  // Passion-based hooks
  if (narrative.thematicHubs.length > 0) {
    hooks.push(`Your ${narrative.thematicHubs[0]} focus is a real strength — let's build on that.`);
  }

  // Identity-based hooks
  if (narrative.identityThread) {
    hooks.push(`Your ${narrative.identityThread} identity is unique and valuable in admissions.`);
  }

  // Default hook
  if (hooks.length === 0) {
    hooks.push("I've seen students in your exact situation succeed with the right strategy.");
    hooks.push("Your background and strengths position you well for this journey.");
  }

  return hooks.slice(0, 5);
}

/**
 * Get archetype-specific accountability style
 */
function getArchetypeAccountabilityStyle(archetype: string): string {
  const styles: Record<string, string> = {
    "The Anxious Achiever": "Gentle check-ins with frequent affirmation. Reframe setbacks as normal learning opportunities. Use 'What did you learn?' instead of 'What went wrong?'",
    "The Chaotic Ambitious": "Firm guardrails with weekly check-ins. Use 'Did you complete X, Y, Z?' Direct but supportive. Celebrate completion over perfection.",
    "The Quiet High-Potential Thinker": "Reflective check-ins that honor thinking time. Ask 'Where are you in the process?' not 'Why isn't this done?' Validate progress in understanding, not just action.",
    "The Overcommitted Perfectionist": "Focus-oriented check-ins. Ask 'What did you say no to this week?' Celebrate pruning and boundary-setting as wins.",
    "The Low-Agency Bright Drifter": "Micro-win focused check-ins. Celebrate any forward movement. Use 'You did X — that's real progress!' Build evidence of capability.",
    "The Narrative-Lost but Curious Freshman": "Exploration-focused check-ins. Ask 'What did you discover?' not 'What did you decide?' Normalize trying things and changing direction.",
    "The Transactional Just-Tell-Me-What-To-Do Student": "Checklist-based accountability. 'Did you complete the three action items?' Direct feedback. Connect completion to goals."
  };

  return styles[archetype] || "Balanced check-ins with supportive accountability. Celebrate progress and address obstacles constructively.";
}

/**
 * Build micro-wins structure from student type and profile
 */
function buildMicroWinsStructure(
  studentType: StudentTypeClassification,
  profile: ExtractedProfile_v2
): string[] {
  const microWins: string[] = [];

  // Week 1: Based on rigor gaps
  if (profile.diagnostics.rigorGaps.length === 0) {
    microWins.push("Week 1: Add one challenging course to your schedule");
  } else {
    microWins.push("Week 1: Identify one area for academic growth");
  }

  // Week 2: Based on EC depth
  if (profile.diagnostics.ecDepthGaps.length > 0) {
    microWins.push("Week 2: Choose one EC to deepen with a tangible output");
  } else {
    microWins.push("Week 2: Deliver one tangible output for your flagship EC");
  }

  // Week 3: Reflection and adjustment
  microWins.push("Week 3: Reflect on progress and adjust strategy as needed");

  // Week 4: Narrative work
  microWins.push("Week 4: Write one paragraph about your core identity theme");

  return microWins;
}

/**
 * Apply EQ tone plan to text generation
 *
 * Helper function that formats text according to tone plan.
 * Can be used by chat UI, strategy renderer, etc.
 */
export function applyTonePlanToText(
  rawText: string,
  tonePlan: EQTonePlan
): string {
  // This is a placeholder for future tone application logic
  // Could include:
  // - Pattern matching and replacement
  // - Warmth/directive calibration
  // - Forbidden pattern filtering
  // - Relatability hook injection

  console.log(`[EQModulationEngine] Applying tone plan to text`);
  console.log(`  - Warmth level: ${tonePlan.warmthLevel}`);
  console.log(`  - Directive level: ${tonePlan.directiveLevel}`);

  // For now, return raw text
  // Future: implement actual tone transformation
  return rawText;
}
