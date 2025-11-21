/**
 * jennyVocab/wordChoiceEngine.ts
 *
 * Jenny Word Choice Engine - selects vocabulary based on mode, archetype, and emotional state.
 * Implements Jenny's 5 vocabulary domains:
 * - Identity Language
 * - Growth & Momentum
 * - EQ Safety / Normalizers
 * - Precision & Clarity
 * - Student-Type Tailoring
 */

import { VocabContext, VocabMode, ArchetypeLabel, VocabularyDomain, VocabSelection } from "./types";

/**
 * Jenny Word Choice Engine
 *
 * Selects vocabulary from domain-specific phrase clusters.
 * Each domain maps to emotional regulation + guidance patterns.
 */
export class JennyWordChoiceEngine {
  private recentlyUsed: Set<string> = new Set();
  private maxRecentPhrases = 25;

  /**
   * DOMAIN A: Identity Language (core Jenny signature)
   * "who you're becoming", "the through-line here", "your internal compass"
   */
  private identityVocab: string[] = [
    "who you're becoming",
    "the through-line here",
    "your internal compass",
    "the pattern underneath",
    "your natural strengths showing up",
    "the version of you we're aiming toward",
    "the identity arc you're shaping",
    "This is part of your growth arc.",
    "Here's the pattern underneath.",
    "You're shaping a stronger version of yourself.",
    "This is identity work, not task work.",
    "Your future self is emerging here.",
    "This is about who you're becoming, not just what you're doing.",
    "The through-line in all of this is your values.",
    "Your internal compass is telling you something real.",
  ];

  /**
   * DOMAIN B: Growth & Momentum
   * "micro-wins", "momentum stacks", "one clean move"
   */
  private momentumVocab: string[] = [
    "micro-wins",
    "momentum stacks",
    "one clean move",
    "small, compounding steps",
    "build a rhythm, not a sprint",
    "we're shaping consistency",
    "this is traction territory",
    "Small compounding steps matter.",
    "This is traction territory.",
    "Let's build micro-wins here.",
    "Momentum stacks when you stay consistent.",
    "We're building rhythm, not chasing perfection.",
    "One clean move creates the next one.",
    "This is where you regain momentum.",
    "Progress compounds faster than you think.",
  ];

  /**
   * DOMAIN C: EQ Safety / Normalizers
   * "this is a valid reaction", "your nervous system is doing its thing"
   */
  private safetyVocab: string[] = [
    "this is a valid reaction",
    "your nervous system is doing its thing",
    "you're not behind",
    "you're not failing; you're recalibrating",
    "your brain isn't wrong; it's just signaling overload",
    "let's de-shame this",
    "let's slow the moment",
    "This is a valid reaction.",
    "Anyone in your spot would feel this.",
    "Your system is trying to protect you.",
    "You're not behind — you're pacing yourself.",
    "Your brain is signaling overload, not failure.",
    "Let's de-shame this reaction.",
    "Your nervous system is doing its job.",
    "This doesn't mean you're not capable — it means you're human.",
  ];

  /**
   * DOMAIN D: Precision & Clarity
   * "the clean takeaway", "the sharpest lens on this"
   */
  private clarityVocab: string[] = [
    "the clean takeaway",
    "the sharpest lens on this",
    "the actionable edge",
    "the high-signal part",
    "let's reduce noise",
    "Here's the clean move.",
    "Let's focus on one sharp next step.",
    "What's the high-signal action here?",
    "Let's strip away the noise.",
    "The actionable edge is right here.",
    "Here's the sharpest lens on this.",
    "Let's get to the clean takeaway.",
    "This is the part that actually moves things forward.",
  ];

  /**
   * DOMAIN E: Validation Vocabulary
   * Used when mode is "validate"
   */
  private validateVocab: string[] = [
    "This is a valid reaction.",
    "Anyone in your spot would feel this.",
    "Your system is trying to protect you.",
    "Of course this feels heavy.",
    "Your reaction is human.",
    "Anyone would tense up here.",
    "You're reading the situation correctly.",
    "This makes complete sense given your context.",
    "That's a legitimate response to what you're facing.",
  ];

  /**
   * DOMAIN F: Guide Vocabulary
   * Used when mode is "guide"
   */
  private guideVocab: string[] = [
    "Here's the clean move.",
    "Let's focus on one sharp next step.",
    "This is where you regain momentum.",
    "Here's the next right step.",
    "Let's aim for a small, winnable action.",
    "This is where you shift gears.",
    "What serves you better here is...",
    "Let's shape this into something doable.",
  ];

  /**
   * DOMAIN G: Reframe Vocabulary
   * Used when mode is "reframe"
   */
  private reframeVocab: string[] = [
    "This isn't failure; it's a signal.",
    "You're closer than it feels.",
    "This doesn't mean what you think it means.",
    "This is feedback, not identity.",
    "This isn't a failure; it's a signal.",
    "This doesn't mean what you think it means.",
    "You're closer than it feels.",
    "This is information, not indictment.",
    "Let me offer you a different lens on this.",
  ];

  /**
   * Archetype-Specific Vocabulary Mappings
   */
  private archetypeVocab: { [key in ArchetypeLabel]?: string[] } = {
    AnxiousPerfectionist: [
      "reduce cognitive load",
      "contain the edges",
      "anchor to one idea",
      "You don't need perfection — you need progress.",
      "Let's reduce the cognitive load here.",
      "We're aiming for good enough, not flawless.",
    ],
    UnfocusedExplorer: [
      "stable rhythm",
      "small anchors",
      "rebuild the core routine",
      "Let's create stable anchors.",
      "We're building a rhythm, not a rigid system.",
      "Small, consistent moves beat big, sporadic ones.",
    ],
    HighAchiever: [
      "channel the intensity",
      "precision over volume",
      "don't flood the system",
      "Let's channel that intensity strategically.",
      "Precision over volume here.",
      "Don't flood the system — focus the energy.",
    ],
    ReluctantPragmatist: [
      "realistic next step",
      "pragmatic move",
      "what's actually doable",
      "Let's focus on what's actually realistic.",
      "The pragmatic move here is...",
      "We're optimizing for doable, not ideal.",
    ],
    OverscheduledOverachiever: [
      "protect your capacity",
      "strategic boundaries",
      "don't overcommit",
      "Let's protect your capacity here.",
      "You need strategic boundaries, not more on your plate.",
      "Saying no is a strategic move.",
    ],
    QuietDeepThinker: [
      "honor the processing time",
      "internal work counts",
      "reflection is progress",
      "Your internal processing is valuable work.",
      "Reflection time is progress, not procrastination.",
      "Let's honor the pace your brain needs.",
    ],
  };

  /**
   * Select vocabulary based on context
   */
  generate(ctx: VocabContext): VocabSelection {
    let pool: string[] = [];
    let domain = "";

    // Select vocabulary pool based on mode
    switch (ctx.mode) {
      case "validate":
        pool = this.validateVocab;
        domain = "Validation";
        break;

      case "guide":
        pool = this.guideVocab;
        domain = "Guidance";
        break;

      case "reframe":
        pool = this.reframeVocab;
        domain = "Reframe";
        break;

      case "identity":
        pool = this.identityVocab;
        domain = "Identity";
        break;

      case "momentum":
        pool = this.momentumVocab;
        domain = "Momentum";
        break;

      case "clarity":
        pool = this.clarityVocab;
        domain = "Clarity";
        break;

      case "safety":
        pool = this.safetyVocab;
        domain = "Safety";
        break;

      default:
        pool = this.guideVocab;
        domain = "Guidance";
    }

    // Add archetype-specific vocabulary if available
    const archetypeSpecific = this.archetypeVocab[ctx.archetype];
    if (archetypeSpecific && archetypeSpecific.length > 0) {
      pool = [...pool, ...archetypeSpecific];
      domain = `${domain} (${ctx.archetype})`;
    }

    // Pick phrase from pool
    const phrase = this.pickPhrase(pool);

    return {
      phrase,
      domain,
      mode: ctx.mode,
      archetype: ctx.archetype,
    };
  }

  /**
   * Pick a specific phrase from a mode's vocabulary
   */
  pick(mode: VocabMode): string {
    let pool: string[] = [];

    switch (mode) {
      case "validate":
        pool = this.validateVocab;
        break;
      case "guide":
        pool = this.guideVocab;
        break;
      case "reframe":
        pool = this.reframeVocab;
        break;
      case "identity":
        pool = this.identityVocab;
        break;
      case "momentum":
        pool = this.momentumVocab;
        break;
      case "clarity":
        pool = this.clarityVocab;
        break;
      case "safety":
        pool = this.safetyVocab;
        break;
      default:
        pool = this.guideVocab;
    }

    return this.pickPhrase(pool);
  }

  /**
   * Get archetype-specific phrase
   */
  getArchetypePhrase(archetype: ArchetypeLabel): string | undefined {
    const pool = this.archetypeVocab[archetype];
    if (!pool || pool.length === 0) {
      return undefined;
    }
    return this.pickPhrase(pool);
  }

  /**
   * Pick phrase from pool, avoiding recent repeats
   */
  private pickPhrase(pool: string[]): string {
    // Filter out recently used
    let available = pool.filter(p => !this.recentlyUsed.has(p));

    // If all have been used recently, use full pool
    if (available.length === 0) {
      available = pool;
    }

    // Random selection
    const selected = available[Math.floor(Math.random() * available.length)];

    // Track usage
    this.recentlyUsed.add(selected);
    if (this.recentlyUsed.size > this.maxRecentPhrases) {
      // Remove oldest (first added)
      const first = this.recentlyUsed.values().next().value;
      if (first !== undefined) {
        this.recentlyUsed.delete(first);
      }
    }

    return selected;
  }

  /**
   * Get all vocabulary domains
   */
  getAllDomains(): VocabularyDomain[] {
    return [
      {
        name: "Identity",
        description: "Core Jenny signature - identity-first language",
        phrases: this.identityVocab,
      },
      {
        name: "Momentum",
        description: "Growth & movement language",
        phrases: this.momentumVocab,
      },
      {
        name: "Safety",
        description: "EQ normalizers & emotional regulation",
        phrases: this.safetyVocab,
      },
      {
        name: "Clarity",
        description: "Precision & actionable language",
        phrases: this.clarityVocab,
      },
      {
        name: "Validate",
        description: "Validation & acknowledgment",
        phrases: this.validateVocab,
      },
      {
        name: "Guide",
        description: "Direction & next steps",
        phrases: this.guideVocab,
      },
      {
        name: "Reframe",
        description: "Perspective shifts",
        phrases: this.reframeVocab,
      },
    ];
  }

  /**
   * Reset recently used tracking
   */
  reset(): void {
    this.recentlyUsed.clear();
  }

  /**
   * Get current state for debugging
   */
  getState() {
    return {
      recentlyUsedCount: this.recentlyUsed.size,
      domainsCount: this.getAllDomains().length,
    };
  }
}
