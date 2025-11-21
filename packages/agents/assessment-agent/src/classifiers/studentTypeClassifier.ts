import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { safeJsonParse } from "../../../../llm/safeJsonParse";
import {
  studentTypeClassificationSchema,
  studentTypeInputSchema,
  type StudentTypeClassification,
  type StudentTypeInput,
  type StudentArchetype
} from "../../../../schema/studentType_v1";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Student Type Classifier
 *
 * Hybrid classifier combining:
 * 1. Heuristic rules (fast, deterministic)
 * 2. LLM classification (nuanced, handles edge cases)
 *
 * Used by AssessmentAgent to determine coaching strategy adaptation.
 */

/**
 * Heuristic Rules for Quick Classification
 *
 * These rules handle clear-cut cases and reduce LLM calls.
 * Returns null if heuristics are inconclusive.
 */
function applyHeuristics(input: StudentTypeInput): StudentArchetype | null {
  const { profile, oracleResults } = input;

  // Rule 1: Freshman/Sophomore with limited EC history → Archetype 6
  if (
    profile.gradeLevel &&
    profile.gradeLevel <= 10 &&
    (!profile.ecDepth || profile.ecDepth === "limited") &&
    (!oracleResults.passionScore || oracleResults.passionScore < 50)
  ) {
    return "The Narrative-Lost but Curious Freshman";
  }

  // Rule 2: High GPA + High Rigor + 10+ ECs → Archetype 4
  if (
    profile.gpa &&
    profile.gpa >= 3.8 &&
    profile.rigorLevel === "high" &&
    profile.executionGaps &&
    profile.executionGaps.some((gap) => gap.includes("overcommitted") || gap.includes("burnout"))
  ) {
    return "The Overcommitted Perfectionist";
  }

  // Rule 3: Solid GPA + Low Rigor Delta + Passive Signals → Archetype 5
  if (
    profile.gpa &&
    profile.gpa >= 3.3 &&
    profile.gpa <= 3.8 &&
    profile.rigorDelta !== undefined &&
    profile.rigorDelta <= 0 &&
    profile.motivationSignals &&
    profile.motivationSignals.some((m) => m.includes("parent-driven") || m.includes("passive"))
  ) {
    return "The Low-Agency Bright Drifter";
  }

  // Rule 4: High Aptitude + Low Self-Promotion → Archetype 3
  if (
    oracleResults.aptitudeScore &&
    oracleResults.aptitudeScore >= 85 &&
    profile.personalityMarkers &&
    profile.personalityMarkers.some((p) => p.includes("introspective") || p.includes("understated"))
  ) {
    return "The Quiet High-Potential Thinker";
  }

  // Rule 5: High Passion + Execution Gaps → Archetype 2
  if (
    oracleResults.passionScore &&
    oracleResults.passionScore >= 80 &&
    profile.executionGaps &&
    profile.executionGaps.length > 0 &&
    (!profile.ecDepth || profile.ecDepth === "shallow")
  ) {
    return "The Chaotic Ambitious";
  }

  // If no heuristic matches, return null (defer to LLM)
  return null;
}

/**
 * Build evidence array from input data
 */
function buildEvidence(input: StudentTypeInput, type: StudentArchetype): string[] {
  const evidence: string[] = [];
  const { profile, oracleResults, narrative } = input;

  // Add relevant evidence based on type
  if (profile.gpa) {
    evidence.push(`GPA: ${profile.gpa}`);
  }

  if (oracleResults.aptitudeScore) {
    evidence.push(`Aptitude score: ${oracleResults.aptitudeScore}`);
  }

  if (oracleResults.passionScore) {
    evidence.push(`Passion score: ${oracleResults.passionScore}`);
  }

  if (profile.rigorDelta !== undefined) {
    evidence.push(`Rigor delta: ${profile.rigorDelta}`);
  }

  if (profile.executionGaps && profile.executionGaps.length > 0) {
    evidence.push(`Execution gaps: ${profile.executionGaps.join(", ")}`);
  }

  // Ensure at least 3 evidence points
  while (evidence.length < 3) {
    evidence.push(`Classification based on ${type} pattern match`);
  }

  return evidence.slice(0, 5);
}

/**
 * Get default coaching adaptations for each archetype
 */
function getDefaultAdaptations(type: StudentArchetype): string[] {
  const adaptations: Record<StudentArchetype, string[]> = {
    "The Anxious Achiever": [
      "Use gentle stretch language: 'Let's raise just one course level here'",
      "Frequent affirmation of progress",
      "Normalize uncertainty and imperfection"
    ],
    "The Chaotic Ambitious": [
      "Provide tight structure with weekly check-ins",
      "Break big goals into micro-steps",
      "Use accountability frameworks consistently"
    ],
    "The Quiet High-Potential Thinker": [
      "Use Socratic questioning to unlock narrative",
      "Validate intellectual depth explicitly",
      "Provide reflection prompts for self-discovery"
    ],
    "The Overcommitted Perfectionist": [
      "Give permission to prune commitments",
      "Reframe from breadth to depth",
      "Emphasize energy management and sustainability"
    ],
    "The Low-Agency Bright Drifter": [
      "Use discovery prompts to build intrinsic motivation",
      "Celebrate small wins to build momentum",
      "Gradually increase autonomy and ownership"
    ],
    "The Narrative-Lost but Curious Freshman": [
      "Provide exploration roadmap with low pressure",
      "Encourage experimentation across domains",
      "Set monthly milestones for discovery"
    ],
    "The Transactional Just-Tell-Me-What-To-Do Student": [
      "Start with concrete, transactional steps",
      "Layer in EQ and reflection gradually",
      "Connect actions to values over time"
    ]
  };

  return adaptations[type];
}

/**
 * Get default framework priority for each archetype
 */
function getDefaultFrameworkPriority(type: StudentArchetype): string[] {
  const priorities: Record<StudentArchetype, string[]> = {
    "The Anxious Achiever": ["rigor_stretch", "confidence_building", "normalize_uncertainty"],
    "The Chaotic Ambitious": ["execution_framework", "prioritization_matrix", "accountability_system"],
    "The Quiet High-Potential Thinker": ["narrative_unlocking", "intellectual_validation", "self_discovery"],
    "The Overcommitted Perfectionist": ["pruning_framework", "depth_over_breadth", "energy_management"],
    "The Low-Agency Bright Drifter": ["discovery_prompts", "small_wins_strategy", "autonomy_building"],
    "The Narrative-Lost but Curious Freshman": ["exploration_roadmap", "experimentation_framework", "milestone_tracking"],
    "The Transactional Just-Tell-Me-What-To-Do Student": ["transactional_bridge", "value_connection", "gradual_eq_layering"]
  };

  return priorities[type];
}

/**
 * Get default EQ modulation for each archetype
 */
function getDefaultEQModulation(type: StudentArchetype) {
  const modulation: Record<StudentArchetype, any> = {
    "The Anxious Achiever": {
      warmth: "high",
      directness: "low",
      pace: "gradual",
      structure: "medium"
    },
    "The Chaotic Ambitious": {
      warmth: "high",
      directness: "high",
      pace: "gradual",
      structure: "tight"
    },
    "The Quiet High-Potential Thinker": {
      warmth: "medium",
      directness: "medium",
      pace: "gradual",
      structure: "loose"
    },
    "The Overcommitted Perfectionist": {
      warmth: "high",
      directness: "high",
      pace: "slow",
      structure: "medium"
    },
    "The Low-Agency Bright Drifter": {
      warmth: "high",
      directness: "low",
      pace: "slow",
      structure: "medium"
    },
    "The Narrative-Lost but Curious Freshman": {
      warmth: "high",
      directness: "low",
      pace: "gradual",
      structure: "medium"
    },
    "The Transactional Just-Tell-Me-What-To-Do Student": {
      warmth: "medium",
      directness: "high",
      pace: "fast",
      structure: "tight"
    }
  };

  return modulation[type];
}

/**
 * LLM-based classification for nuanced cases
 */
async function classifyWithLLM(input: StudentTypeInput): Promise<StudentTypeClassification> {
  const promptPath = path.join(__dirname, "../../../../../tools/ingest-coach/prompts/studentType.prompt.md");
  const systemPrompt = fs.readFileSync(promptPath, "utf8");

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(input, null, 2) }
    ],
    temperature: 0.2
  });

  const cleaned = response.choices[0].message.content || JSON.stringify({
    primaryType: "The Narrative-Lost but Curious Freshman",
    confidence: 0.5,
    evidence: ["Insufficient data for classification", "Defaulting to exploratory archetype", "Requires more interaction data"],
    coachingAdaptations: ["Start with broad discovery prompts", "Gather more behavioral signals", "Adjust classification as data emerges"],
    frameworkPriority: ["exploration_roadmap"],
    eqModulation: {
      warmth: "high",
      directness: "medium",
      pace: "gradual",
      structure: "medium"
    }
  });

  const parseResult = safeJsonParse(cleaned, studentTypeClassificationSchema, { logErrors: true });

  if (!parseResult.success) {
    throw new Error(`Student type classification failed: ${parseResult.error}`);
  }

  return parseResult.data!;
}

/**
 * Main classification function (hybrid approach)
 *
 * 1. Try heuristic rules first (fast path)
 * 2. If heuristics inconclusive, use LLM (nuanced path)
 * 3. Return complete classification with coaching adaptations
 */
export async function classifyStudentType(input: StudentTypeInput): Promise<StudentTypeClassification> {
  // Validate input
  const validatedInput = studentTypeInputSchema.parse(input);

  // Step 1: Try heuristics
  const heuristicType = applyHeuristics(validatedInput);

  if (heuristicType) {
    // Heuristic match found - build classification
    console.log(`[StudentTypeClassifier] Heuristic match: ${heuristicType}`);

    return {
      primaryType: heuristicType,
      confidence: 0.85, // High confidence for heuristic matches
      evidence: buildEvidence(validatedInput, heuristicType),
      coachingAdaptations: getDefaultAdaptations(heuristicType),
      frameworkPriority: getDefaultFrameworkPriority(heuristicType),
      eqModulation: getDefaultEQModulation(heuristicType)
    };
  }

  // Step 2: Heuristics inconclusive - use LLM
  console.log(`[StudentTypeClassifier] Heuristics inconclusive, using LLM classification`);
  return await classifyWithLLM(validatedInput);
}

/**
 * Batch classification for multiple students
 */
export async function classifyStudentTypeBatch(
  inputs: StudentTypeInput[]
): Promise<StudentTypeClassification[]> {
  return Promise.all(inputs.map((input) => classifyStudentType(input)));
}
