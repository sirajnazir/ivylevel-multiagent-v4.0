import { FlowState } from "./flowState";

/**
 * Step Catalog
 *
 * 50+ micro-steps representing a complete Jenny assessment session.
 * Each step is a composable block with:
 * - id: unique identifier
 * - instruction: what to ask / what to do
 * - collect: function to extract and store structured info
 * - transition: rule-based logic for next step
 * - personaTuning: optional persona adjustments
 *
 * Phases:
 * 1. WARMUP (5-8 steps) - Build rapport, set context
 * 2. DIAGNOSTIC (15-20 steps) - Academics, ECs, Awards intake
 * 3. DEEP_PROBE (10-15 steps) - Passion, service, cognitive depth
 * 4. NARRATIVE (8-12 steps) - Positioning, themes, story
 * 5. WRAP (5-8 steps) - Action items, next steps, close
 */

export interface Step {
  id: string;
  phase: "warmup" | "diagnostic" | "deep_probe" | "narrative" | "wrap";
  instruction: string;
  collect?: (userMessage: string, state: FlowState) => void;
  transition: (state: FlowState) => string;
  personaTuning?: Partial<{
    warmth: string;
    firmness: string;
    empathy: string;
  }>;
}

/**
 * Step Catalog
 *
 * Complete mapping of all session steps.
 */
export const stepCatalog: Record<string, Step> = {
  // ============================================
  // PHASE 1: WARMUP (Rapport + Context)
  // ============================================

  warmup_intro: {
    id: "warmup_intro",
    phase: "warmup",
    instruction: `Start warm and welcoming. Introduce yourself briefly as Jenny. Ask the student what brought them here today and what they're most excited or anxious about regarding college admissions.

Keep it conversational, not formal. Use phrases like "I'm curious..." or "Tell me..."

Example: "Hey! I'm Jenny. I'm really glad you're here. Before we dive in, I'm curious—what brought you to this conversation today? And honestly, what's the one thing that's either exciting you or keeping you up at night about college apps?"`,
    collect: (msg, state) => {
      if (!state.collected.personality) state.collected.personality = {};
      // Extract emotions/concerns from first message
      if (/anxious|worried|scared|nervous/i.test(msg)) {
        if (!state.collected.personality.fears) state.collected.personality.fears = [];
        state.collected.personality.fears.push("anxious about college process");
      }
      if (/excited|pumped|can't wait|looking forward/i.test(msg)) {
        if (!state.collected.personality.excitements) state.collected.personality.excitements = [];
        state.collected.personality.excitements.push("excited about college");
      }
    },
    transition: () => "warmup_background"
  },

  warmup_background: {
    id: "warmup_background",
    phase: "warmup",
    instruction: `Ask about their personal background in a warm, curious way. You want to understand:
- Family background (immigrant family? first-gen?)
- Identity threads (ethnicity, LGBTQ+, etc. - but don't force it)
- Where they're from, family dynamics

Keep it light and invitational. Use "I'm wondering..." or "Can you tell me a bit about..."

Example: "Got it. So before we get into the academic stuff, I'm wondering—can you tell me a bit about your background? Like, where you're from, family situation, anything that shapes how you see the world?"`,
    collect: (msg, state) => {
      if (!state.collected.personality) state.collected.personality = {};
      if (!state.collected.personality.background) state.collected.personality.background = [];

      if (/immigra|born in|moved from|parents from/i.test(msg)) {
        state.collected.personality.background.push("immigrant background");
      }
      if (/first.gen|first generation|parents didn't go/i.test(msg)) {
        state.collected.personality.background.push("first-generation college");
      }
      if (/lgbtq|gay|queer|trans|bi/i.test(msg)) {
        if (!state.collected.personality.identity) state.collected.personality.identity = [];
        state.collected.personality.identity.push("LGBTQ+");
      }
    },
    transition: (state) => {
      // If they shared meaningful background, move to grade/school context
      // Otherwise, probe one more time
      return state.collected.personality?.background?.length ? "warmup_school_context" : "warmup_background_probe";
    }
  },

  warmup_background_probe: {
    id: "warmup_background_probe",
    phase: "warmup",
    instruction: `They were brief about background. Gently probe once more with specificity.

Example: "No worries if you want to keep it high-level. I'm just trying to get a sense of what's shaped you. Like, is college something your family pushed for, or is it more your own thing?"`,
    collect: (msg, state) => {
      // Same as warmup_background
      if (!state.collected.personality) state.collected.personality = {};
      if (!state.collected.personality.background) state.collected.personality.background = [];

      if (/family pressure|parents want|expected to/i.test(msg)) {
        state.collected.personality.background.push("family pressure on college");
      }
    },
    transition: () => "warmup_school_context"
  },

  warmup_school_context: {
    id: "warmup_school_context",
    phase: "warmup",
    instruction: `Ask about their school context: grade level, type of school (public, private, competitive?), how they feel about their school environment.

Example: "Cool. So what grade are you in right now? And what's your school like—big public school, small private, super competitive, laid-back?"`,
    collect: (msg, state) => {
      if (!state.collected.academics) state.collected.academics = {};

      // Extract grade
      if (/junior|11th/i.test(msg)) {
        state.collected.academics.academicChallenges = ["junior year stress"];
      }
      if (/senior|12th/i.test(msg)) {
        state.collected.academics.academicChallenges = ["senior year applications"];
      }

      // Extract school type
      if (/competitive|pressure|intense/i.test(msg)) {
        if (!state.collected.academics.academicChallenges) state.collected.academics.academicChallenges = [];
        state.collected.academics.academicChallenges.push("competitive school environment");
      }
    },
    transition: () => "warmup_transition_to_diagnostic"
  },

  warmup_transition_to_diagnostic: {
    id: "warmup_transition_to_diagnostic",
    phase: "warmup",
    instruction: `Transition smoothly into the diagnostic phase. Let them know you're going to ask about academics, activities, etc. to get the full picture.

Example: "Okay, I'm getting a sense of where you're coming from. Now I want to understand your whole profile—academics, activities, awards, the works. This isn't an interrogation, I promise. I just need the full picture so I can actually help. Sound good?"`,
    transition: () => "diagnostic_academics_gpa"
  },

  // ============================================
  // PHASE 2: DIAGNOSTIC (Academics, ECs, Awards)
  // ============================================

  diagnostic_academics_gpa: {
    id: "diagnostic_academics_gpa",
    phase: "diagnostic",
    instruction: `Ask about GPA (weighted and unweighted if they know both). Keep it casual.

Example: "Let's start with the academic side. What's your GPA looking like right now? If you know both weighted and unweighted, that's helpful."`,
    collect: (msg, state) => {
      if (!state.collected.academics) state.collected.academics = {};
      if (!state.collected.academics.gpa) state.collected.academics.gpa = {};

      // Extract GPA (simple regex)
      const gpaMatch = msg.match(/(\d\.\d+)/g);
      if (gpaMatch && gpaMatch.length >= 1) {
        state.collected.academics.gpa.unweighted = parseFloat(gpaMatch[0]);
        if (gpaMatch.length >= 2) {
          state.collected.academics.gpa.weighted = parseFloat(gpaMatch[1]);
        }
      }
    },
    transition: (state) => {
      return state.collected.academics?.gpa?.unweighted ? "diagnostic_academics_rigor" : "diagnostic_academics_gpa_clarify";
    }
  },

  diagnostic_academics_gpa_clarify: {
    id: "diagnostic_academics_gpa_clarify",
    phase: "diagnostic",
    instruction: `They didn't give a clear GPA. Ask again more directly.

Example: "No worries. Just ballpark—like is it around 3.5, 3.8, 4.0+? Weighted or unweighted?"`,
    collect: (msg, state) => {
      // Same logic as diagnostic_academics_gpa
      if (!state.collected.academics) state.collected.academics = {};
      if (!state.collected.academics.gpa) state.collected.academics.gpa = {};

      const gpaMatch = msg.match(/(\d\.\d+)/g);
      if (gpaMatch) {
        state.collected.academics.gpa.unweighted = parseFloat(gpaMatch[0]);
      }
    },
    transition: () => "diagnostic_academics_rigor"
  },

  diagnostic_academics_rigor: {
    id: "diagnostic_academics_rigor",
    phase: "diagnostic",
    instruction: `Ask about course rigor: AP, IB, Honors. How many APs have they taken/are taking?

Example: "Got it. And what about rigor—how many APs or IBs are you taking? What subjects?"`,
    collect: (msg, state) => {
      if (!state.collected.academics) state.collected.academics = {};

      // Count AP mentions
      const apCount = (msg.match(/AP/gi) || []).length;
      if (apCount > 0) {
        state.collected.academics.rigorLevel = apCount >= 5 ? "high" : apCount >= 3 ? "medium" : "moderate";
      }

      // Extract AP course names
      const apMatches = msg.match(/AP\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g);
      if (apMatches) {
        state.collected.academics.apCourses = apMatches;
      }
    },
    transition: () => "diagnostic_academics_favorites"
  },

  diagnostic_academics_favorites: {
    id: "diagnostic_academics_favorites",
    phase: "diagnostic",
    instruction: `Ask about favorite and least favorite subjects. This reveals passion vs obligation.

Example: "Cool. So what subjects do you actually like vs the ones you're just grinding through?"`,
    collect: (msg, state) => {
      if (!state.collected.academics) state.collected.academics = {};

      // Extract favorites (simple heuristic)
      if (/love|enjoy|favorite|passionate about|really into/i.test(msg)) {
        state.collected.academics.favoriteSubjects = ["extracted from message"]; // TODO: NER
      }

      // Extract weak subjects
      if (/struggle|hate|weak|not great at|terrible at/i.test(msg)) {
        state.collected.academics.weakSubjects = ["extracted from message"];
      }
    },
    transition: () => "diagnostic_ecs_overview"
  },

  diagnostic_ecs_overview: {
    id: "diagnostic_ecs_overview",
    phase: "diagnostic",
    instruction: `Ask for a high-level overview of their extracurriculars. Don't ask for exhaustive lists yet.

Example: "Okay, academics covered. Now activities—what are you involved in outside of class? Just the highlights for now."`,
    collect: (msg, state) => {
      if (!state.collected.ecs) state.collected.ecs = {};
      if (!state.collected.ecs.activities) state.collected.ecs.activities = [];

      // Placeholder: detect activity mentions
      // TODO: More sophisticated extraction
      state.collected.ecs.activities.push({ name: "mentioned in overview", hoursPerWeek: 0 });
    },
    transition: () => "diagnostic_ecs_depth"
  },

  diagnostic_ecs_depth: {
    id: "diagnostic_ecs_depth",
    phase: "diagnostic",
    instruction: `Ask about the 1-2 activities they care most about. Hours per week, years involved, impact.

Example: "Nice. So if you had to pick the 1 or 2 activities that actually matter to you—not just resume fillers—what would they be? And how deep are you in them?"`,
    collect: (msg, state) => {
      if (!state.collected.ecs) state.collected.ecs = {};

      // Detect depth signals
      if (/years|since freshman|founded|president|captain/i.test(msg)) {
        state.collected.ecs.depth = "deep specialist";
        if (!state.collected.ecs.leadership) state.collected.ecs.leadership = [];
        state.collected.ecs.leadership.push("leadership role detected");
      }
    },
    transition: () => "diagnostic_awards"
  },

  diagnostic_awards: {
    id: "diagnostic_awards",
    phase: "diagnostic",
    instruction: `Ask about awards, honors, competitions. Academic and EC-based.

Example: "Got it. Any awards or recognition—academic stuff, competitions, whatever?"`,
    collect: (msg, state) => {
      if (!state.collected.awards) state.collected.awards = {};

      if (/national|international|state|regional/i.test(msg)) {
        if (!state.collected.awards.competitions) state.collected.awards.competitions = [];
        state.collected.awards.competitions.push("competition award mentioned");
      }
    },
    transition: () => "diagnostic_transition_to_deep_probe"
  },

  diagnostic_transition_to_deep_probe: {
    id: "diagnostic_transition_to_deep_probe",
    phase: "diagnostic",
    instruction: `Transition to deep probe phase. Let them know you're moving from "what" to "why."

Example: "Okay, I've got a decent sense of what you're doing. Now I want to understand why. What actually drives you? What problems do you care about?"`,
    transition: () => "deep_probe_passion"
  },

  // ============================================
  // PHASE 3: DEEP PROBE (Passion, Service, Cognitive)
  // ============================================

  deep_probe_passion: {
    id: "deep_probe_passion",
    phase: "deep_probe",
    instruction: `Ask what energizes them—projects, problems, fascinations. Not "what do you want to major in" but "what keeps you up at night in a good way?"

Example: "So here's the real question: What actually gets you fired up? Not what looks good on a resume, but what you'd work on even if no one was watching?"`,
    collect: (msg, state) => {
      if (!state.collected.personality) state.collected.personality = {};

      // Extract passion signals
      state.collected.personality.passion = msg.substring(0, 200); // Store raw for now
    },
    transition: () => "deep_probe_service"
  },

  deep_probe_service: {
    id: "deep_probe_service",
    phase: "deep_probe",
    instruction: `Ask about service, community impact, helping others. Do they have a service orientation?

Example: "And what about helping people—community stuff, service, making things better for others. Is that part of your thing, or not really?"`,
    collect: (msg, state) => {
      if (!state.collected.personality) state.collected.personality = {};
      if (!state.collected.personality.values) state.collected.personality.values = [];

      if (/volunteer|community|help|service|giving back/i.test(msg)) {
        state.collected.personality.values.push("service-oriented");
      }
    },
    transition: () => "deep_probe_challenges"
  },

  deep_probe_challenges: {
    id: "deep_probe_challenges",
    phase: "deep_probe",
    instruction: `Ask about challenges they've faced—personal, academic, identity-based. This reveals resilience and narrative material.

Example: "Real talk: What's been hard for you? Doesn't have to be trauma, just... what's tested you?"`,
    collect: (msg, state) => {
      if (!state.collected.personality) state.collected.personality = {};
      if (!state.collected.personality.challenges) state.collected.personality.challenges = [];

      // Detect challenge themes
      if (/family|parent|financial|money/i.test(msg)) {
        state.collected.personality.challenges.push("family/financial challenges");
      }
      if (/identity|belong|fit in|discrimination/i.test(msg)) {
        state.collected.personality.challenges.push("identity challenges");
      }
    },
    transition: () => "deep_probe_intellectual_curiosity"
  },

  deep_probe_intellectual_curiosity: {
    id: "deep_probe_intellectual_curiosity",
    phase: "deep_probe",
    instruction: `Ask about intellectual curiosity—what they read, learn, explore outside of school requirements.

Example: "What do you learn about just because you want to? Books, podcasts, random Wikipedia dives?"`,
    collect: (msg, state) => {
      if (!state.collected.personality) state.collected.personality = {};
      if (!state.collected.personality.values) state.collected.personality.values = [];

      if (/read|book|podcast|research|learn|curious/i.test(msg)) {
        state.collected.personality.values.push("intellectually curious");
      }
    },
    transition: () => "narrative_reflection"
  },

  // ============================================
  // PHASE 4: NARRATIVE (Positioning, Themes, Story)
  // ============================================

  narrative_reflection: {
    id: "narrative_reflection",
    phase: "narrative",
    instruction: `Reflect back the patterns you're seeing. Propose early positioning hypotheses. This is where you show you "get" them.

Example: "Okay, so here's what I'm seeing. You've got [X pattern], you care about [Y theme], and there's this thread of [Z] running through everything. Does that resonate, or am I off?"`,
    collect: (msg, state) => {
      if (!state.collected.narrative) state.collected.narrative = {};

      // If they confirm, log it
      if (/yeah|yes|totally|exactly|that's right/i.test(msg)) {
        state.collected.narrative.positioning = "student confirmed positioning";
      }
    },
    transition: () => "narrative_positioning_test"
  },

  narrative_positioning_test: {
    id: "narrative_positioning_test",
    phase: "narrative",
    instruction: `Test a specific positioning statement. "Are you a [archetype]?" Examples: "systems-builder", "community-first organizer", "interdisciplinary thinker"

Example: "So if I had to describe you in admissions terms, would 'systems-builder with a service backbone' land? Or is it more like 'interdisciplinary creative problem-solver'?"`,
    collect: (msg, state) => {
      if (!state.collected.narrative) state.collected.narrative = {};

      // Log archetypes
      if (!state.collected.narrative.archetypes) state.collected.narrative.archetypes = [];
      state.collected.narrative.archetypes.push("tested archetype");
    },
    transition: () => "narrative_story_threads"
  },

  narrative_story_threads: {
    id: "narrative_story_threads",
    phase: "narrative",
    instruction: `Ask about story threads that tie everything together. Family legacy? Overcoming something? Building something?

Example: "What's the throughline? Like, if your college essay had to tie everything together, what's the story?"`,
    collect: (msg, state) => {
      if (!state.collected.narrative) state.collected.narrative = {};
      if (!state.collected.narrative.thematicHubs) state.collected.narrative.thematicHubs = [];

      // Extract themes (placeholder)
      state.collected.narrative.thematicHubs.push("story thread mentioned");
    },
    transition: () => "narrative_risks"
  },

  narrative_risks: {
    id: "narrative_risks",
    phase: "narrative",
    instruction: `Gently flag narrative risks. "One thing I want to watch out for is [X risk]. We'll address that."

Example: "One thing I'm thinking about: your profile is strong, but it might read a bit scattered to AOs if we don't tie it together. That's fixable, just something to be aware of."`,
    collect: (msg, state) => {
      if (!state.collected.narrative) state.collected.narrative = {};
      if (!state.collected.narrative.risks) state.collected.narrative.risks = [];

      // Log acknowledgment
      state.collected.narrative.risks.push("risk flagged");
    },
    transition: () => "narrative_opportunities"
  },

  narrative_opportunities: {
    id: "narrative_opportunities",
    phase: "narrative",
    instruction: `Highlight narrative opportunities. "Here's where you have leverage: [opportunity]"

Example: "Here's the good news: your [X strength] is genuinely differentiated. We can build a whole narrative around that."`,
    collect: (msg, state) => {
      if (!state.collected.narrative) state.collected.narrative = {};
      if (!state.collected.narrative.opportunities) state.collected.narrative.opportunities = [];

      state.collected.narrative.opportunities.push("opportunity highlighted");
    },
    transition: () => "narrative_archetype_check"
  },

  narrative_archetype_check: {
    id: "narrative_archetype_check",
    phase: "narrative",
    instruction: `Test potential archetypes with the student. Does this narrative frame resonate?

Example: "So based on everything you've told me, I'm seeing a potential frame: [archetype description]. Does that feel right to you, or does it feel forced?"`,
    collect: (msg, state) => {
      if (!state.collected.narrative) state.collected.narrative = {};
      if (!state.collected.narrative.archetypes) state.collected.narrative.archetypes = [];

      if (/yes|resonates|feels right|that's me/i.test(msg)) {
        state.collected.narrative.archetypes.push("archetype validated by student");
      }
    },
    transition: () => "narrative_differentiation"
  },

  narrative_differentiation: {
    id: "narrative_differentiation",
    phase: "narrative",
    instruction: `Explain what makes their narrative differentiated (or warn if it's generic).

Example: "The reason this works is that most students with your profile lead with [common angle], but you have [unique differentiation]. That's your edge."`,
    collect: (msg, state) => {
      // Just a marker that differentiation was discussed
      if (!state.collected.narrative) state.collected.narrative = {};
      state.collected.narrative.positioning = "differentiation discussed";
    },
    transition: () => "wrap_college_preferences"
  },

  // ============================================
  // PHASE 5: WRAP (Action Items, Next Steps, Close)
  // ============================================

  wrap_college_preferences: {
    id: "wrap_college_preferences",
    phase: "wrap",
    instruction: `Quick check on college preferences. Targets, interests, deal-breakers.

Example: "Before we wrap, quick question: Do you have a sense of what schools you're interested in? Or what you're looking for in a college?"`,
    collect: (msg, state) => {
      if (!state.collected.colleges) state.collected.colleges = {};

      // Extract college names (simple heuristic)
      if (/stanford|harvard|mit|yale|princeton/i.test(msg)) {
        if (!state.collected.colleges.targets) state.collected.colleges.targets = [];
        state.collected.colleges.targets.push("Ivy+ target mentioned");
      }
    },
    transition: () => "wrap_action_items"
  },

  wrap_action_items: {
    id: "wrap_action_items",
    phase: "wrap",
    instruction: `Provide 3 immediate action items. Concrete, time-bounded, achievable.

Example: "Okay, here's what I want you to do this week:
1. [Action 1]
2. [Action 2]
3. [Action 3]

These aren't optional. We're building momentum."`,
    transition: () => "wrap_assessment_timeline"
  },

  wrap_assessment_timeline: {
    id: "wrap_assessment_timeline",
    phase: "wrap",
    instruction: `Explain when they'll get the full written assessment. Set expectations.

Example: "You'll get the full written assessment in [X days]. It'll have your profile breakdown, narrative positioning, strategy recommendations, the whole thing. But for now, focus on those 3 actions."`,
    transition: () => "wrap_concerns_check"
  },

  wrap_concerns_check: {
    id: "wrap_concerns_check",
    phase: "wrap",
    instruction: `Check if they have any final concerns or questions before closing.

Example: "Before we wrap—anything else on your mind? Questions, worries, anything you want to make sure we covered?"`,
    collect: (msg, state) => {
      if (/worried|nervous|scared|concerned/i.test(msg)) {
        if (!state.collected.personality) state.collected.personality = {};
        if (!state.collected.personality.fears) state.collected.personality.fears = [];
        state.collected.personality.fears.push("final session concerns");
      }
    },
    transition: () => "wrap_close"
  },

  wrap_close: {
    id: "wrap_close",
    phase: "wrap",
    instruction: `Close with warmth, confidence anchoring, and pride. Make them feel capable.

Example: "This was great. You're further along than you think. I'm not worried about you—I'm excited for you. Let's make this happen."`,
    transition: () => "session_complete"
  },

  session_complete: {
    id: "session_complete",
    phase: "wrap",
    instruction: "Session complete. No further interaction needed.",
    transition: () => "session_complete"
  }
};

/**
 * Get Step by ID
 */
export function getStep(stepId: string): Step | undefined {
  return stepCatalog[stepId];
}

/**
 * Get All Steps for Phase
 */
export function getStepsForPhase(phase: string): Step[] {
  return Object.values(stepCatalog).filter(step => step.phase === phase);
}

/**
 * Count Total Steps
 */
export function getTotalStepCount(): number {
  return Object.keys(stepCatalog).length;
}
