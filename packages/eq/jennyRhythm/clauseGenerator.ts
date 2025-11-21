/**
 * jennyRhythm/clauseGenerator.ts
 *
 * Generates individual clauses for Jenny's rhythm patterns.
 * Creates validation, direction, and encouragement clauses based on
 * emotional state, pacing, and archetype.
 */

import { ClauseOptions, EmotionalState, RhythmPacing, ArchetypeLabel } from "./types";

/**
 * Jenny Clause Generator
 *
 * Generates context-aware clauses that form the building blocks
 * of Jenny's sentence rhythm. Each clause type serves a specific
 * purpose in the emotional arc.
 */
export class JennyClauseGenerator {
  private recentlyUsed: Set<string> = new Set();
  private maxRecentClauses = 30;

  /**
   * Generate validation clause (emotional resonance)
   * First sentence in Jenny's rhythm: acknowledge the student's state
   */
  generateValidationClause(opts: ClauseOptions): string {
    const { emotionalState, archetype } = opts;

    let pool: string[] = [];

    // Emotional state determines validation intensity
    if (emotionalState === "overwhelmed") {
      pool = [
        "This is a lot to hold.",
        "It makes sense your head feels crowded here.",
        "You're carrying something heavy in this moment.",
        "That's a real weight you're navigating.",
        "Anyone would feel stretched thin with this much on their plate.",
        "This is genuinely overwhelming — I see that.",
        "Your system is telling you this is too much, and that's valid.",
        "It's completely understandable that this feels like a lot right now.",
      ];
    } else if (emotionalState === "stressed") {
      pool = [
        "That tension is real.",
        "Anyone in your spot would feel this pull.",
        "Your reaction is grounded in reality.",
        "I can feel the pressure you're describing.",
        "This is the kind of stress that deserves attention.",
        "That's a legitimate source of friction.",
        "The anxiety you're feeling makes complete sense given the context.",
        "I hear the weight in what you're saying.",
      ];
    } else {
      // stable
      pool = [
        "This tracks with where you've been.",
        "I see the logic in how you're feeling.",
        "This fits the pattern of what you've shared.",
        "That resonates with what I know about your situation.",
        "Your read on this is solid.",
        "I'm tracking with you on this.",
        "This is consistent with the trajectory you've been on.",
        "That makes sense from where you're standing.",
      ];
    }

    // Archetype-specific additions
    if (archetype === "AnxiousPerfectionist" && emotionalState !== "stable") {
      pool.push(
        "You're holding yourself to a standard that's creating real strain.",
        "The perfectionism here is adding an extra layer of pressure."
      );
    } else if (archetype === "UnfocusedExplorer" && emotionalState === "overwhelmed") {
      pool.push(
        "There's a lot of competing directions here — that's disorienting.",
        "When everything feels important, nothing feels clear."
      );
    } else if (archetype === "QuietDeepThinker" && emotionalState === "stressed") {
      pool.push(
        "You're processing a lot internally, and that takes energy.",
        "The mental load you're carrying isn't always visible, but it's real."
      );
    }

    return this.pick(pool);
  }

  /**
   * Generate direction clause (action/clarity)
   * Second sentence in Jenny's rhythm: provide direction or clarity
   */
  generateDirectionClause(opts: ClauseOptions): string {
    const { pacing, archetype, emotionalState } = opts;

    let pool: string[] = [];

    // Pacing determines directive energy
    if (pacing === "slow") {
      pool = [
        "Let's zoom out for a second and notice the bigger pattern.",
        "Here's one small step that keeps things manageable.",
        "Let's anchor to the simplest next move.",
        "What I want to do is slow this down and look at one piece at a time.",
        "Let's ground in what you can actually control right now.",
        "Here's where I'd start — just one manageable action.",
        "Let's give this the space it needs and not rush the process.",
        "The move here is to simplify, not solve everything at once.",
      ];
    } else if (pacing === "fast") {
      pool = [
        "Here's the clean move that gives momentum.",
        "Let's capitalize on this energy.",
        "This is where you make a quick, high-leverage adjustment.",
        "The tactical play here is to act while you have clarity.",
        "Here's the decision that unlocks the next phase.",
        "Let's ride this momentum and make a clear choice.",
        "This is your window — let's use it strategically.",
        "The move is to commit and execute, not overthink.",
      ];
    } else {
      // medium pacing
      pool = [
        "Here's the direction that actually serves you.",
        "Let's shape this into something workable.",
        "Here's the move I'd focus on next.",
        "What matters most is getting traction on one clear thing.",
        "Let's build a bridge between where you are and where you want to be.",
        "The path forward is clearer than it feels right now.",
        "Here's what I'd prioritize if I were in your position.",
        "Let's turn this into concrete action.",
      ];
    }

    // Archetype-specific direction styles
    if (archetype === "HighAchiever" && pacing === "fast") {
      pool.push(
        "This is where your bias for action becomes your advantage.",
        "You have the momentum — let's channel it into the highest-ROI move."
      );
    } else if (archetype === "ReluctantPragmatist" && emotionalState === "stressed") {
      pool.push(
        "I know you're skeptical, but here's the pragmatic next step.",
        "Let's focus on what's actually realistic and doable, not ideal."
      );
    } else if (archetype === "UnfocusedExplorer" && pacing === "slow") {
      pool.push(
        "Let's narrow the options down to one clear direction.",
        "What you need right now is focus, not more possibilities."
      );
    }

    return this.pick(pool);
  }

  /**
   * Generate encouragement clause (optional third sentence)
   * Provides closing validation and confidence
   */
  generateEncouragementClause(opts: ClauseOptions): string {
    const { emotionalState, archetype } = opts;

    let pool: string[] = [
      "You're more capable here than you think.",
      "You can absolutely handle this.",
      "This is a solvable problem with the right pacing.",
      "I see your capacity to navigate this.",
      "You've got what it takes to move through this.",
      "This is within your range — trust that.",
      "You're building the skill as you go.",
      "The fact that you're engaging with this is already progress.",
    ];

    // Emotional state adjustments
    if (emotionalState === "overwhelmed") {
      pool.push(
        "You don't have to solve it all at once.",
        "One step at a time is enough.",
        "Give yourself permission to pace this."
      );
    } else if (emotionalState === "stable") {
      pool.push(
        "You're in a good position to make meaningful progress here.",
        "This is exactly the kind of clarity that leads to action.",
        "You're ready for this next step."
      );
    }

    // Archetype-specific encouragement
    if (archetype === "AnxiousPerfectionist") {
      pool.push(
        "Progress, not perfection, is the goal here.",
        "You don't need to have it all figured out to move forward."
      );
    } else if (archetype === "HighAchiever") {
      pool.push(
        "This is where your drive becomes your edge.",
        "You're built for this kind of challenge."
      );
    } else if (archetype === "QuietDeepThinker") {
      pool.push(
        "Your thoughtfulness here is an asset, not a liability.",
        "Trust the internal process you're working through."
      );
    }

    return this.pick(pool);
  }

  /**
   * Generate breath marker (transition/pacing phrase)
   * Used to create natural pauses and rhythm shifts
   */
  generateBreathMarker(pacing: RhythmPacing): string {
    const pool: { [key in RhythmPacing]: string[] } = {
      slow: [
        "Okay.",
        "So.",
        "Here's the thing.",
        "Let's pause here.",
        "Take a breath.",
        "Before we move on,",
      ],
      medium: [
        "Alright.",
        "So here's what I'm seeing.",
        "Here's the pattern.",
        "Now,",
        "From here,",
      ],
      fast: [
        "Quick note —",
        "Bottom line:",
        "Here's the move:",
        "Fast-forward:",
        "Real talk:",
      ],
    };

    return this.pick(pool[pacing]);
  }

  /**
   * Generate softener phrase
   * Turns directives into invitations
   */
  generateSoftener(): string {
    return this.pick([
      "Let's",
      "What I'd suggest is",
      "Here's what might serve you:",
      "What will help here is",
      "The move that makes sense is",
      "What I'm thinking is",
      "One option is",
      "What could work here:",
    ]);
  }

  /**
   * Pick a clause from pool, avoiding recent repeats
   */
  private pick(pool: string[]): string {
    // Filter out recently used
    let available = pool.filter(c => !this.recentlyUsed.has(c));

    // If all have been used recently, use full pool
    if (available.length === 0) {
      available = pool;
    }

    // Random selection
    const selected = available[Math.floor(Math.random() * available.length)];

    // Track usage
    this.recentlyUsed.add(selected);
    if (this.recentlyUsed.size > this.maxRecentClauses) {
      // Remove oldest (first added)
      const first = this.recentlyUsed.values().next().value;
      if (first !== undefined) {
        this.recentlyUsed.delete(first);
      }
    }

    return selected;
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
    };
  }
}
