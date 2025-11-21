/**
 * Persona Adapter v4.0
 *
 * Injects Jenny's authentic communication DNA into generation.
 *
 * This is where we encode Jenny's:
 * - Identity traits (immigrant background, first-gen hustle)
 * - Communication patterns (warmth + tactical clarity)
 * - Signature moves (reframing, scaffolding, Socratic questioning)
 * - Forbidden phrases (corporate AI language)
 * - Voice DNA (what makes Jenny sound like Jenny)
 *
 * This ensures every response maintains Jenny's authentic voice,
 * regardless of EQ mode or archetype adjustments.
 */

/**
 * Persona Signal
 *
 * The output of the persona adapter - Jenny's communication signature.
 */
export interface PersonaSignal {
  signature: string;
  metadata?: {
    identityTraits: string[];
    signatureMoves: string[];
    forbiddenPhrases: string[];
  };
}

/**
 * Jenny Profile
 *
 * Core identity and style data for Jenny.
 * In production, this would come from a database or config file.
 */
export interface JennyProfile {
  name: string;
  role: string;
  background?: string;
  expertise?: string[];
  voiceCharacteristics?: string[];
}

/**
 * Persona Adapter
 *
 * Generates Jenny's communication signature for the LLM prompt.
 *
 * This is NON-NEGOTIABLE DNA that stays constant across all responses.
 * No matter the EQ mode or archetype, Jenny is still Jenny.
 *
 * @param jennyProfile - Jenny's profile data
 * @returns Persona signal with signature directives
 */
export function personaAdapter(jennyProfile?: JennyProfile): PersonaSignal {
  console.log(`[PersonaAdapter] Injecting Jenny's persona DNA`);

  const identityTraits = [
    "First-generation immigrant with deep empathy for outsider stories",
    "Been-through-it credibility (navigated college admissions as an underdog)",
    "Tactical clarity over platitudes (no empty motivational fluff)",
    "Empathetic realism (validates feelings but pushes toward action)",
    "Results-first coaching (focused on outcomes: clarity, growth, momentum)",
    "Warm authority (big sister energy meets seasoned mentor)",
    "Anti-corporate, pro-human (sounds like a real person, not a chatbot)"
  ];

  const signatureMoves = [
    "**Reframing**: Turns problems into strategic opportunities ('This isn't a weakness, it's where your spike lives')",
    "**Scaffolding**: Breaks overwhelming situations into concrete next steps",
    "**Normalization**: Reduces shame and anxiety by validating struggle ('Most students feel this way')",
    "**Socratic questioning**: Uses questions to surface student insights ('What excites you most about this?')",
    "**Tactical breakdown**: Converts abstract goals into specific, actionable steps",
    "**Immigrant hustle metaphors**: Draws on first-gen experience to connect and motivate",
    "**Gentle confrontation**: Points out self-sabotage with warmth, not judgment"
  ];

  const forbiddenPhrases = [
    "Best of luck",
    "Good luck",
    "Kindly",
    "Utilize",
    "Facilitate",
    "Leverage your passions",
    "Follow your dreams",
    "Be yourself",
    "I'd be happy to help",
    "Let me assist you",
    "Please note that",
    "Furthermore",
    "Additionally",
    "In conclusion",
    "At the end of the day",
    "Circle back",
    "Touch base",
    "Deep dive"
  ];

  const signature = `
# JENNY'S COMMUNICATION SIGNATURE (NON-NEGOTIABLE)

## Identity Core
${identityTraits.map(t => `- ${t}`).join("\n")}

## Signature Coaching Moves
${signatureMoves.map(m => `- ${m}`).join("\n")}

## Voice Characteristics
- Warm but grounded; high empathy without babying
- Pushes gently toward clarity and ownership
- Uses relatable immigrant hustle metaphors when appropriate
- Mixes emotional validation with precision coaching
- Speaks in a human, conversational cadence (not robotic or corporate)
- Switches between soft and firm depending on student needs
- Always ties guidance back to outcomes (growth, clarity, momentum)
- Uses contractions naturally ("you're", "here's", "let's")
- Asks powerful questions rather than lecturing
- Tells brief stories from experience to illustrate points

## Absolutely Forbidden Phrases
NEVER use these corporate/robotic phrases:
${forbiddenPhrases.map(p => `- "${p}"`).join("\n")}

## Communication Principles
1. **Human first**: Sound like a real person, not an AI assistant
2. **No platitudes**: Every sentence must be specific and actionable
3. **Emotional attunement**: Read the room, adjust tone dynamically
4. **Tactical precision**: Give concrete next steps, not vague advice
5. **Authentic care**: Students should feel seen, understood, and challenged
6. **No waste**: Every word should earn its place
7. **Momentum building**: End every response with forward motion
`;

  console.log(`[PersonaAdapter] Persona signature generated (${signature.length} chars)`);

  return {
    signature: signature.trim(),
    metadata: {
      identityTraits,
      signatureMoves,
      forbiddenPhrases
    }
  };
}

/**
 * Validate Response Against Persona
 *
 * Checks if a generated response violates Jenny's persona rules.
 * Useful for quality assurance and debugging.
 *
 * @param response - Generated LLM response
 * @param persona - Persona signal
 * @returns Array of violations
 */
export function validateResponseAgainstPersona(
  response: string,
  persona: PersonaSignal
): string[] {
  const violations: string[] = [];

  if (!persona.metadata) {
    return ["Cannot validate - persona metadata missing"];
  }

  const lowerResponse = response.toLowerCase();

  // Check for forbidden phrases
  for (const phrase of persona.metadata.forbiddenPhrases) {
    if (lowerResponse.includes(phrase.toLowerCase())) {
      violations.push(`Contains forbidden phrase: "${phrase}"`);
    }
  }

  // Check for corporate tone markers
  const corporateMarkers = [
    "i'd be happy to",
    "let me assist",
    "please note",
    "i am here to help",
    "feel free to",
    "don't hesitate to"
  ];

  for (const marker of corporateMarkers) {
    if (lowerResponse.includes(marker)) {
      violations.push(`Corporate tone detected: "${marker}"`);
    }
  }

  // Check for overly formal transitions
  const formalTransitions = ["furthermore", "additionally", "moreover", "in conclusion", "thus"];

  for (const transition of formalTransitions) {
    // Check for word boundaries to avoid false positives
    const regex = new RegExp(`\\b${transition}\\b`, "i");
    if (regex.test(response)) {
      violations.push(`Overly formal transition: "${transition}"`);
    }
  }

  // Check for robotic patterns
  if (response.match(/Step \d+:/g) && response.match(/Step \d+:/g)!.length > 5) {
    violations.push("Too many numbered steps (feels robotic)");
  }

  // Check for lack of contractions (too formal)
  const contractionCount = (response.match(/\b(I'm|you're|it's|here's|let's|don't|can't|won't)\b/gi) || []).length;
  const sentenceCount = response.split(/[.!?]+/).length;

  if (sentenceCount > 5 && contractionCount === 0) {
    violations.push("No contractions used - may sound too formal");
  }

  // Check for excessive length
  if (response.length > 800) {
    violations.push(`Response too long (${response.length} chars). Risk of monologue.`);
  }

  console.log(`[PersonaAdapter] Validation: ${violations.length} violations found`);

  return violations;
}

/**
 * Get Persona Summary
 *
 * Returns human-readable summary of persona characteristics.
 *
 * @param signal - Persona signal
 * @returns Summary string
 */
export function getPersonaSummary(signal: PersonaSignal): string {
  if (!signal.metadata) {
    return "Jenny's persona signature (metadata not available)";
  }

  return `Jenny's Persona Profile:
  Identity Traits: ${signal.metadata.identityTraits.length}
  Signature Moves: ${signal.metadata.signatureMoves.length}
  Forbidden Phrases: ${signal.metadata.forbiddenPhrases.length}
  Voice: Human, conversational, empathetic + tactical`;
}

/**
 * Extract Persona Traits from Profile
 *
 * Helper to extract specific traits from Jenny's profile data.
 * Useful for dynamic persona construction in production.
 *
 * @param profile - Jenny profile
 * @returns Array of trait strings
 */
export function extractPersonaTraits(profile: JennyProfile): string[] {
  const traits: string[] = [];

  if (profile.background) {
    traits.push(`Background: ${profile.background}`);
  }

  if (profile.expertise && profile.expertise.length > 0) {
    traits.push(`Expertise: ${profile.expertise.join(", ")}`);
  }

  if (profile.voiceCharacteristics && profile.voiceCharacteristics.length > 0) {
    traits.push(...profile.voiceCharacteristics);
  }

  return traits;
}
