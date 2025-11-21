/**
 * jennyVocab/idiomClusters.ts
 *
 * Jenny Idiom Clusters - small, reusable phrase units that define her voice.
 * These are Jenny-only patterns that create her distinctive coaching signature.
 */

import { IdiomCluster } from "./types";

/**
 * CLUSTER 1: "Grounding" Starters
 * Used to create presence and slow the moment
 */
export const GROUNDING_IDIOMS: IdiomCluster = {
  name: "Grounding Starters",
  type: "grounding",
  phrases: [
    "Okay, here's what I'm noticing.",
    "Let me slow this for a second.",
    "Something important is happening here.",
    "Here's what actually matters.",
    "Hold on — let's anchor this.",
    "Pause for a moment.",
    "Here's what I'm seeing.",
    "Let's ground this in reality.",
    "Before we move forward, let's clarify.",
    "I want to zoom in on something here.",
  ],
};

/**
 * CLUSTER 2: "Reframe" Idioms
 * Used to shift perspective without dismissing feelings
 */
export const REFRAME_IDIOMS: IdiomCluster = {
  name: "Reframe Patterns",
  type: "reframe",
  phrases: [
    "This isn't a failure; it's a signal.",
    "This doesn't mean what you think it means.",
    "This is feedback, not identity.",
    "You're closer than it feels.",
    "This is information, not indictment.",
    "Let me offer you a different lens.",
    "What if we looked at this from another angle?",
    "This isn't the end — it's data.",
    "Your brain is protecting you, not sabotaging you.",
    "This is a signal, not a sentence.",
  ],
};

/**
 * CLUSTER 3: "Guidance" Idioms
 * Used to provide direction without being directive
 */
export const GUIDANCE_IDIOMS: IdiomCluster = {
  name: "Guidance Phrases",
  type: "guidance",
  phrases: [
    "Here's the clean move.",
    "Here's the next right step.",
    "Let's aim for a small, winnable action.",
    "This is where you shift gears.",
    "What serves you better here is...",
    "The move that makes sense is...",
    "Here's where I'd focus your energy.",
    "Let's build toward this.",
    "This is the leverage point.",
    "One clear action that matters:",
  ],
};

/**
 * CLUSTER 4: "Validation" Idioms
 * Used to normalize student emotions and reactions
 */
export const VALIDATION_IDIOMS: IdiomCluster = {
  name: "Validation Patterns",
  type: "validation",
  phrases: [
    "Of course this feels heavy.",
    "Your reaction is human.",
    "Anyone would tense up here.",
    "You're reading the situation correctly.",
    "This is a valid response.",
    "That makes total sense given your context.",
    "Your system is trying to protect you.",
    "I see why this would feel overwhelming.",
    "That's a legitimate weight to carry.",
    "Your nervous system is doing its job.",
  ],
};

/**
 * CLUSTER 5: "Future Self" Idioms
 * Used to connect present actions to future identity
 */
export const FUTURE_SELF_IDIOMS: IdiomCluster = {
  name: "Future Self Language",
  type: "future-self",
  phrases: [
    "This is the version of you we're building toward.",
    "Your future self will thank you for this move.",
    "We're shaping long-term identity, not short-term relief.",
    "This is identity work, not just task work.",
    "The person you're becoming will need this foundation.",
    "You're laying groundwork for who you're becoming.",
    "This move serves your future self.",
    "We're playing the long game here.",
    "This is about trajectory, not just today.",
    "Your future you is counting on this choice.",
  ],
};

/**
 * All idiom clusters combined
 */
export const ALL_IDIOM_CLUSTERS: IdiomCluster[] = [
  GROUNDING_IDIOMS,
  REFRAME_IDIOMS,
  GUIDANCE_IDIOMS,
  VALIDATION_IDIOMS,
  FUTURE_SELF_IDIOMS,
];

/**
 * Jenny Idiom Selector
 *
 * Selects idioms based on type and context.
 */
export class JennyIdiomSelector {
  private recentlyUsed: Set<string> = new Set();
  private maxRecentIdioms = 20;

  /**
   * Get idiom by type
   */
  getIdiom(type: IdiomCluster["type"]): string {
    const cluster = ALL_IDIOM_CLUSTERS.find(c => c.type === type);

    if (!cluster) {
      // Fallback to grounding
      return this.pickIdiom(GROUNDING_IDIOMS.phrases);
    }

    return this.pickIdiom(cluster.phrases);
  }

  /**
   * Get grounding starter
   */
  getGroundingStarter(): string {
    return this.pickIdiom(GROUNDING_IDIOMS.phrases);
  }

  /**
   * Get reframe idiom
   */
  getReframeIdiom(): string {
    return this.pickIdiom(REFRAME_IDIOMS.phrases);
  }

  /**
   * Get guidance idiom
   */
  getGuidanceIdiom(): string {
    return this.pickIdiom(GUIDANCE_IDIOMS.phrases);
  }

  /**
   * Get validation idiom
   */
  getValidationIdiom(): string {
    return this.pickIdiom(VALIDATION_IDIOMS.phrases);
  }

  /**
   * Get future self idiom
   */
  getFutureSelfIdiom(): string {
    return this.pickIdiom(FUTURE_SELF_IDIOMS.phrases);
  }

  /**
   * Pick idiom from pool, avoiding recent repeats
   */
  private pickIdiom(pool: string[]): string {
    // Filter out recently used
    let available = pool.filter(i => !this.recentlyUsed.has(i));

    // If all have been used recently, use full pool
    if (available.length === 0) {
      available = pool;
    }

    // Random selection
    const selected = available[Math.floor(Math.random() * available.length)];

    // Track usage
    this.recentlyUsed.add(selected);
    if (this.recentlyUsed.size > this.maxRecentIdioms) {
      // Remove oldest (first added)
      const first = this.recentlyUsed.values().next().value;
      if (first !== undefined) {
        this.recentlyUsed.delete(first);
      }
    }

    return selected;
  }

  /**
   * Get all idiom clusters
   */
  getAllClusters(): IdiomCluster[] {
    return ALL_IDIOM_CLUSTERS;
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
      clustersCount: ALL_IDIOM_CLUSTERS.length,
    };
  }
}
