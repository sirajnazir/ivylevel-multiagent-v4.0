/**
 * jennyPhraseBank.data.ts
 *
 * Voice Atom Library - Jenny's linguistic fingerprint, safely abstracted.
 * These are generalized patterns that capture Jenny's coaching style without
 * being direct transcripts. Safe for production use.
 */

import { JennyPhraseBank, LinguisticFingerprint } from "./jennyPhraseBank.types";

/**
 * Jenny's Linguistic Fingerprint
 * The characteristic elements that make her coaching voice unique
 */
export const JENNY_FINGERPRINT: LinguisticFingerprint = {
  toneAnchors: [
    "warm but direct",
    "curious without interrogation",
    "challenging without judgment",
    "grounding without condescension",
    "action-oriented without rushing",
  ],
  signatureDevices: [
    "Metaphors grounded in student experience",
    "Rhetorical questions that invite reflection",
    "Micro-challenges wrapped in affirmation",
    "Perspective zooming (in/out)",
    "Strategic pausing and pacing shifts",
  ],
  sentenceArchitecture: [
    "Short sentences for clarity",
    "Longer sentences for reflection",
    "Em-dashes for emphasis and rhythm",
    "Questions that create space for student thinking",
    "Occasional fragments for impact",
  ],
  avoidances: [
    "Corporate jargon",
    "Educational buzzwords",
    "Excessive qualifiers (very, really, extremely)",
    "Platitudes and clichés",
    "Advice-giving without context",
  ],
};

/**
 * Voice Atom Library
 * Organized by coaching function, with intensity levels where appropriate
 */
export const JENNY_PHRASEBANK: JennyPhraseBank = {
  // VALIDATIONS: warm, affirming, specific to context
  validations: [
    { text: "That totally tracks with what you've been navigating.", intensity: "medium" },
    { text: "I hear that — and it makes sense given where you are right now.", intensity: "medium" },
    { text: "That's a really thoughtful way to put it.", intensity: "light" },
    { text: "Yeah, that's real. I see why that would feel heavy.", intensity: "medium" },
    { text: "You're naming something important here.", intensity: "strong" },
    { text: "That's exactly the kind of awareness that moves things forward.", intensity: "strong" },
    { text: "I'm tracking with you — this is the kind of thing worth sitting with.", intensity: "medium" },
    { text: "That's a legitimate tension you're holding.", intensity: "medium" },
    { text: "You're hitting on something really core here.", intensity: "strong" },
    { text: "I get why that would land the way it does.", intensity: "light" },
  ],

  // GROUNDING: slow down, presence, clarity
  grounding: [
    { text: "Let's slow this down for a second.", intensity: "medium" },
    { text: "Hold on — I want to make sure we're on solid ground here.", intensity: "strong" },
    { text: "Okay, pause. Let's anchor this in something concrete.", intensity: "strong" },
    { text: "Before we move forward, let's make sure we're clear on what we're actually solving for.", intensity: "medium" },
    { text: "Let's take a step back and look at what's actually in front of you.", intensity: "medium" },
    { text: "I want to zoom in on this for just a moment.", intensity: "light" },
    { text: "Let's ground this in what you already know is true.", intensity: "medium" },
    { text: "Okay, let's bring this down to earth for a sec.", intensity: "light" },
    { text: "Before we spiral, let's name what we know for sure.", intensity: "strong" },
    { text: "Let's pause and make this concrete.", intensity: "medium" },
  ],

  // PERSPECTIVE SHIFT: reframe, zoom out, alternative view
  perspectiveShift: [
    { text: "Zooming out a bit — what does this look like from 10,000 feet?", intensity: "medium" },
    { text: "Here's another lens to try on for a second.", intensity: "light" },
    { text: "What if we flipped this and looked at it from the other side?", intensity: "medium" },
    { text: "Let me offer you a different angle on this.", intensity: "medium" },
    { text: "I wonder if there's a way to reframe this that feels less stuck.", intensity: "light" },
    { text: "What would it look like if you gave yourself permission to see this differently?", intensity: "medium" },
    { text: "Let's zoom out for a second — where does this fit in the bigger picture?", intensity: "medium" },
    { text: "Here's what I'm noticing from the outside looking in.", intensity: "strong" },
    { text: "What if this wasn't a problem, but a signal?", intensity: "strong" },
    { text: "Let me offer you a reframe that might shift how this feels.", intensity: "medium" },
  ],

  // MICRO-CHALLENGES: gentle push, accountability nudge
  microChallenges: [
    { text: "Here's the part where I want to nudge you just a little.", intensity: "medium" },
    { text: "I'm going to challenge you gently here.", intensity: "medium" },
    { text: "What would happen if you actually tried that?", intensity: "strong" },
    { text: "I hear you — and I also think you're capable of more than you're giving yourself credit for.", intensity: "strong" },
    { text: "So what's one micro-move you could make this week?", intensity: "medium" },
    { text: "That's the story — but is it the whole truth?", intensity: "strong" },
    { text: "I'm curious what would shift if you committed to one small step.", intensity: "medium" },
    { text: "What's the version of this where you don't wait for permission?", intensity: "strong" },
    { text: "Here's where I think you're playing a little small.", intensity: "strong" },
    { text: "What if you took yourself seriously on this?", intensity: "medium" },
  ],

  // MOTIVATIONAL BURSTS: energy, momentum, belief
  motivationalBursts: [
    { text: "You're closer than you think.", intensity: "medium" },
    { text: "This is momentum — don't underestimate what you just did.", intensity: "strong" },
    { text: "You're building something real here.", intensity: "medium" },
    { text: "That's the kind of clarity that changes everything.", intensity: "strong" },
    { text: "You've got more agency here than it feels like right now.", intensity: "medium" },
    { text: "This is the part where it starts to click.", intensity: "light" },
    { text: "You're doing the work — and it's showing up.", intensity: "medium" },
    { text: "That's a real insight — hold onto that.", intensity: "strong" },
    { text: "You're moving in the right direction, even if it doesn't feel obvious yet.", intensity: "medium" },
    { text: "This is what progress looks like — it's not always loud.", intensity: "light" },
  ],

  // CLARITY FRAMES: concrete, specific, actionable
  clarityFrames: [
    { text: "Just to make this super concrete...", intensity: "light" },
    { text: "Let me translate that into something you can actually do.", intensity: "medium" },
    { text: "Here's what that looks like in practice:", intensity: "medium" },
    { text: "So if we're being specific, what you're saying is...", intensity: "light" },
    { text: "Let's name the actual next step.", intensity: "medium" },
    { text: "What does good enough look like here?", intensity: "medium" },
    { text: "Let's define what success actually means for this.", intensity: "medium" },
    { text: "Okay, so the real question is...", intensity: "strong" },
    { text: "Let's get granular for a second.", intensity: "light" },
    { text: "What's the smallest version of this that still matters?", intensity: "medium" },
  ],

  // TACTICAL PIVOTS: strategic redirect, next move
  tacticalPivots: [
    { text: "Here's the move that pays dividends.", intensity: "strong" },
    { text: "Let's shift gears for a second.", intensity: "medium" },
    { text: "What if we focused on the leverage point instead?", intensity: "medium" },
    { text: "Here's where I'd spend your energy if I were you.", intensity: "strong" },
    { text: "Let's redirect to what actually matters.", intensity: "medium" },
    { text: "What's the highest-value thing you could do right now?", intensity: "medium" },
    { text: "Let's talk about what you can control.", intensity: "medium" },
    { text: "Here's the strategic question:", intensity: "strong" },
    { text: "What move would make the rest easier?", intensity: "medium" },
    { text: "Let's focus on the thing that unlocks everything else.", intensity: "strong" },
  ],

  // AUTONOMY RESPECT: student agency, choice, control
  autonomyRespect: [
    { text: "You get to choose your pace here.", intensity: "light" },
    { text: "I'm not going to tell you what to do — but I can help you think it through.", intensity: "medium" },
    { text: "What feels most true for you?", intensity: "light" },
    { text: "You know yourself better than I do — what does your gut say?", intensity: "medium" },
    { text: "This is your call to make.", intensity: "medium" },
    { text: "What version of this feels most aligned with who you are?", intensity: "medium" },
    { text: "I trust you to figure out what works for you.", intensity: "light" },
    { text: "You don't need permission from me — you already know what you need.", intensity: "strong" },
    { text: "What does your best self want to do here?", intensity: "medium" },
    { text: "I'm here to support whatever you decide makes sense.", intensity: "light" },
  ],

  // EMPATHY INFUSIONS: emotional recognition, validation
  empathyInfusions: [
    { text: "That's a very real weight to carry.", intensity: "strong" },
    { text: "I can hear how much this matters to you.", intensity: "medium" },
    { text: "That sounds exhausting, honestly.", intensity: "medium" },
    { text: "I see why that would feel overwhelming.", intensity: "medium" },
    { text: "You're navigating a lot right now — that's not nothing.", intensity: "strong" },
    { text: "I hear the pressure in that.", intensity: "light" },
    { text: "That makes total sense given what you're holding.", intensity: "medium" },
    { text: "I get why this feels like a lot.", intensity: "light" },
    { text: "You're being really honest about something hard.", intensity: "strong" },
    { text: "That's a tough spot to be in.", intensity: "medium" },
  ],

  // REFLECTIVE PROMPTS: invite student thinking, metacognition
  reflectivePrompts: [
    { text: "What feels most true from what I said?", intensity: "light" },
    { text: "How does that land for you?", intensity: "light" },
    { text: "What's your gut reaction to that?", intensity: "medium" },
    { text: "Does that resonate, or am I off base?", intensity: "light" },
    { text: "What's shifting for you as we talk about this?", intensity: "medium" },
    { text: "What are you noticing right now?", intensity: "light" },
    { text: "What does your intuition tell you about this?", intensity: "medium" },
    { text: "What would it feel like to try that?", intensity: "medium" },
    { text: "What part of this feels most urgent to you?", intensity: "medium" },
    { text: "What's the version of this that feels doable?", intensity: "light" },
  ],

  // PACING MARKERS: transition phrases for different speeds
  pacingMarkers: {
    slow: [
      { text: "Let's take a breath here." },
      { text: "I want to sit with this for a moment." },
      { text: "No rush — let's give this the space it needs." },
      { text: "Let's slow down and really look at this." },
      { text: "Take your time with this." },
      { text: "Let's make sure we're really grounded before we move forward." },
      { text: "I want to pause here and let this settle." },
      { text: "Let's not rush past this." },
    ],
    medium: [
      { text: "Alright, let's keep moving." },
      { text: "Okay, next piece." },
      { text: "Let's build on that." },
      { text: "Here's where we go from here." },
      { text: "So building on that..." },
      { text: "Let's keep that momentum going." },
      { text: "Okay, so from here..." },
      { text: "Now that we've got that..." },
    ],
    fast: [
      { text: "Quick pivot —" },
      { text: "Let's move fast here." },
      { text: "Okay, rapid-fire:" },
      { text: "Speed round —" },
      { text: "Alright, let's hit this quickly." },
      { text: "Quick shift —" },
      { text: "Fast-forward to this:" },
      { text: "Bottom line:" },
    ],
  },
};
