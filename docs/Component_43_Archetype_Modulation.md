# Component 43: Persona-Archetype Adaptive Modulation Layer

**Status:** ✅ COMPLETE
**Integration:** ✅ Integrated with Components 42 & AssessmentAgent
**Tests:** ✅ 18/18 passing

## Overview

Component 43 is the archetype-aware modulation layer that ensures Jenny adapts her tone, pacing, and style based on the student's archetype—while maintaining her authentic voice. It sits after persona stabilization (Component 42) but before final message rendering, changing the **HOW** of what Jenny says, not the **WHAT**.

**Key Insight:** Jenny doesn't talk the same way to a High-Achieving Robot as she does to a Lost Dreamer or an Anxious Overthinker. Your agent shouldn't either.

## The 9 IvyLevel Student Archetypes

1. **The High-Achieving Robot** - Tightly wound perfectionist
2. **The Lost Dreamer** - High-potential, no clarity
3. **The Discouraged Underdog** - Needs encouragement & wins
4. **The Burnt-Out Overloader** - Doing too much, needs boundaries
5. **The Detached Minimalist** - Low engagement, needs activation
6. **The Hyper-Ambitious Spiky Kid** - Sharp peaks & valleys, needs focus
7. **The Low-Confidence High-Talent Kid** - Imposter syndrome, needs validation
8. **The Chaotic Creative** - Creative but disorganized
9. **The Highly Anxious Overthinker** - Analysis paralysis, needs grounding

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                  Component 43 Flow                              │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ExtractedProfile_v2 → Detect Archetype                     │
│     • Analyze academics (GPA, rigor, performance patterns)      │
│     • Analyze activities (commitment level, leadership)         │
│     • Analyze personality (core values, identity threads)       │
│     • Compute emotional markers (anxiety, confidence, clarity)  │
│                                                                  │
│  2. Select Primary + Secondary Archetype                        │
│     • Primary: Dominant archetype (e.g., high_achieving_robot)  │
│     • Secondary: Modifier (e.g., burnt_out_overloader)          │
│     • Confidence: 0-1 score                                     │
│                                                                  │
│  3. Build Modulation Envelope                                   │
│     • Tone style (calm_anchoring, energizing_structured, etc.)  │
│     • Structure level (low, medium, high)                       │
│     • Warmth level (medium, high, very_high)                    │
│     • Pacing (gentle, moderate, brisk, slow)                    │
│     • Directives (reduce/increase/emphasize)                    │
│     • Constraints (drift tolerance, creativity, grounding)      │
│                                                                  │
│  4. Feed to Component 42 Persona Rewriter                       │
│     • Envelope modifies LLM system prompt                       │
│     • Archetype-specific signature phrases injected             │
│     • Tone/pacing constraints applied                           │
│                                                                  │
│  5. Output: Archetype-Modulated Jenny Voice                     │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

## Key Files

### Core Implementation

**packages/persona/archetype_modulation/types.ts** (102 lines)
- `StudentArchetype` - Union type of 9 archetypes
- `DetectedArchetype` - Primary/secondary + confidence
- `ModulationProfile` - Complete modulation settings per archetype
- `ModulationEnvelope` - Envelope passed to Component 42
- `ArchetypeSignals` - Input signals for detection

**packages/persona/archetype_modulation/detectArchetype.ts** (264 lines)
- `detectStudentArchetype()` - Main detection function
- `extractSignals()` - Extract signals from ExtractedProfile_v2
- Rule-based heuristics for archetype classification
- Returns primary, secondary, confidence, and detection signals

**packages/persona/archetype_modulation/modulationProfiles.ts** (389 lines)
- `MODULATION_PROFILES` - Complete profiles for all 9 archetypes
- `getModulationProfile()` - Get profile by archetype
- `getArchetypeExamples()` - Get signature phrases
- Defines tone, structure, warmth, pacing, directives for each archetype

**packages/persona/archetype_modulation/buildEnvelope.ts** (118 lines)
- `buildModulationEnvelope()` - Create envelope from profile
- `buildModulationPromptBlock()` - Generate LLM prompt block
- `getModulationSummary()` - Human-readable summary
- `validateEnvelope()` - Validate envelope structure

**packages/persona/archetype_modulation/index.ts** (40 lines)
- Main exports for Component 43
- Public API for archetype detection and modulation

### Integration

**packages/agents/assessment-agent/src/AssessmentAgent.ts**
- Added 5 new methods:
  - `detectArchetype()` - Detect student archetype
  - `buildArchetypeModulation()` - Build modulation envelope
  - `getDetectedArchetype()` - Get current archetype
  - `getArchetypeModulationSummary()` - Get summary
  - `applyPersonaTunerWithArchetype()` - Enhanced persona tuner

**scripts/persona_weights/util/personaRewrite.ts**
- Updated `rewriteToPersonaStyle()` - Accepts modulation envelope
- Updated `buildRewritePrompt()` - Injects archetype modulation block
- Updated `mockRewrite()` - Uses archetype-specific phrases

## Modulation Profile Examples

### High-Achieving Robot

```typescript
{
  tone: 'calm_anchoring',
  structure: 'high',
  warmth: 'medium_high',
  pacing: 'slow',
  directives: {
    reduce: [
      'pressure language',
      'urgency markers',
      'competitive comparisons'
    ],
    increase: [
      'emotional grounding',
      'permission to rest',
      'nervous system literacy'
    ],
    emphasize: [
      'single-path clarity',
      'you are not your GPA',
      'sustainable pacing'
    ]
  },
  strategyLanguage: 'controlled, paced, prioritized steps',
  examplePhrases: [
    "Let's slow this down.",
    "You're carrying way too many spinning plates.",
    "Your worth isn't measured by your transcript."
  ]
}
```

### Lost Dreamer

```typescript
{
  tone: 'compassionate_exploratory',
  structure: 'medium',
  warmth: 'high',
  pacing: 'gentle',
  directives: {
    reduce: [
      'rigid timelines',
      'binary choices',
      'pressure to decide now'
    ],
    increase: [
      'possibility language',
      'lightweight experiments',
      'exploration framing'
    ],
    emphasize: [
      'curiosity over certainty',
      'clarity comes from action',
      'your confusion is signal, not failure'
    ]
  },
  strategyLanguage: 'exploration, lightweight experiments',
  examplePhrases: [
    "Let's try something small and see what lights you up.",
    "You don't need to know your major right now.",
    "Confusion is just your brain asking for more data."
  ]
}
```

### Anxious Overthinker

```typescript
{
  tone: 'soothing_reassuring',
  structure: 'medium',
  warmth: 'high',
  pacing: 'gentle',
  directives: {
    reduce: [
      'uncertainty amplifiers',
      'open-ended questions without guidance',
      'rushing decisions'
    ],
    increase: [
      'safety language',
      'normalization statements',
      'grounding techniques'
    ],
    emphasize: [
      'your anxiety is lying to you',
      'one step at a time',
      'your nervous system is doing its thing'
    ]
  },
  strategyLanguage: 'grounding, one step at a time',
  examplePhrases: [
    "Let's slow this down. You're spinning too many scenarios.",
    "Your nervous system is doing its thing. Let's ground this.",
    "You don't need to solve everything today."
  ]
}
```

## Archetype Detection

### Input Signals

```typescript
{
  // From academics
  gpa: number | null;
  rigorLevel: 'high' | 'medium' | 'low';
  performancePattern: 'consistent' | 'spiky' | 'declining' | 'improving';

  // From activities
  activityTypes: string[];
  commitmentLevel: 'overloaded' | 'balanced' | 'minimal';
  leadershipRoles: number;

  // From personality
  coreValues: string[];
  identityThreads: string[];
  passions: string[];

  // Computed emotional markers (0-10 scale)
  anxietyMarkers: number;
  confidenceMarkers: number;
  clarityMarkers: number;
  burnoutMarkers: number;

  // Derived
  conversationTone: 'overwhelmed' | 'lost' | 'driven' | 'detached' | 'anxious';
}
```

### Detection Rules (Rule-Based)

**High-Achieving Robot**
- GPA >= 3.8 + High rigor + Anxiety/burnout markers > 5

**Anxious Overthinker**
- Anxiety markers >= 7

**Burnt-Out Overloader**
- Overloaded activities + Burnout markers >= 6

**Lost Dreamer**
- Clarity markers <= 3 + Uncertain conversation tone

**Chaotic Creative**
- Creative activities + Organization stressors

**Detached Minimalist**
- Minimal activities + Detached conversation tone

**Low-Confidence High-Talent**
- Confidence markers <= 4 + GPA >= 3.5

**Hyper-Ambitious Spiky**
- High leadership + Overloaded + Driven tone

**Discouraged Underdog**
- GPA < 3.2 + Discouragement markers

## Usage Examples

### Basic Archetype Detection

```typescript
import { detectStudentArchetype, getArchetypeName } from '@/persona/archetype_modulation';

const profile: ExtractedProfile_v2 = { /* ... */ };

const detected = detectStudentArchetype(profile);

console.log(detected);
// {
//   primary: 'high_achieving_robot',
//   secondary: 'burnt_out_overloader',
//   confidence: 0.82,
//   signals: [
//     'High GPA + High rigor + Anxiety/burnout markers',
//     'Also showing overload patterns'
//   ]
// }

console.log(getArchetypeName(detected.primary));
// "The High-Achieving Robot"
```

### Building Modulation Envelope

```typescript
import { buildModulationEnvelope, getModulationSummary } from '@/persona/archetype_modulation';

const envelope = buildModulationEnvelope(profile);

console.log(getModulationSummary(envelope));
// "Archetype: high_achieving_robot (82% confidence) | Tone: calm_anchoring | Structure: high | Warmth: medium_high"

console.log(envelope.toneProfile.examplePhrases);
// [
//   "Let's slow this down.",
//   "You're carrying way too many spinning plates.",
//   "Your worth isn't measured by your transcript."
// ]
```

### Integration with Component 42

```typescript
import { runPersonaTuner } from '@/scripts/persona_weights';
import { buildModulationEnvelope } from '@/persona/archetype_modulation';

const profile: ExtractedProfile_v2 = { /* ... */ };
const envelope = buildModulationEnvelope(profile);

const genericOutput = "You should try harder and focus on your goals.";

// Apply persona tuner with archetype modulation
const modulated = await runPersonaTuner(
  genericOutput,
  undefined,
  { verbose: false },
  envelope // Component 43 envelope
);

// For high-achieving robot:
// "Let's slow this down. What will help here is focusing on one clean move instead of overwhelming yourself with everything at once."

// For lost dreamer:
// "Let's try something small and see what lights you up. What will help here is following your curiosity instead of forcing yourself toward a rigid goal."
```

### Integration in AssessmentAgent

```typescript
// In AssessmentAgent
async processStudentProfile(profile: ExtractedProfile_v2) {
  // Detect archetype
  const archetype = this.detectArchetype(profile);
  console.log(`Detected: ${archetype.primary} (${archetype.confidence})`);

  // Build modulation envelope
  const envelope = this.buildArchetypeModulation(profile);

  // Get summary
  console.log(this.getArchetypeModulationSummary());
  // "Archetype: high_achieving_robot (82% confidence) | Tone: calm_anchoring | Structure: high | Warmth: medium_high"

  // Apply to response generation
  const rawResponse = await this.generateResponse(userMessage);
  const modulatedResponse = await this.applyPersonaTunerWithArchetype(rawResponse);

  return modulatedResponse;
}
```

## Modulation Envelope Structure

```typescript
{
  persona: 'jenny',
  archetype: 'high_achieving_robot',
  secondary: 'burnt_out_overloader' | null,
  confidence: 0.82,
  toneProfile: {
    archetype: 'high_achieving_robot',
    tone: 'calm_anchoring',
    structure: 'high',
    warmth: 'medium_high',
    pacing: 'slow',
    directives: {
      reduce: [...],
      increase: [...],
      emphasize: [...]
    },
    strategyLanguage: '...',
    examplePhrases: [...]
  },
  constraints: {
    driftTolerance: 'strict' | 'moderate' | 'relaxed',
    creativityLevel: 'low' | 'medium' | 'high',
    groundingRequired: boolean
  },
  metadata: {
    detectionSignals: [...],
    timestamp: '2025-01-18T...'
  }
}
```

## LLM Prompt Integration

When the envelope is passed to Component 42's `rewriteToPersonaStyle()`, this block is injected into the system prompt:

```
<<ARCHETYPE_MODULATION_PROFILE>>

student_archetype: high_achieving_robot
confidence: 0.82

tone_directives:
  tone_style: calm_anchoring
  structure: high
  warmth: medium_high
  pacing: slow

reduce_these:
  - pressure language
  - urgency markers
  - competitive comparisons

increase_these:
  - emotional grounding
  - permission to rest
  - nervous system literacy

emphasize_these:
  - single-path clarity
  - you are not your GPA
  - sustainable pacing

strategy_language: controlled, paced, prioritized steps

example_signature_phrases:
  - "Let's slow this down."
  - "You're carrying way too many spinning plates."
  - "Your worth isn't measured by your transcript."

constraints:
  drift_tolerance: strict
  creativity_level: low
  grounding_required: true

<<END_MODULATION_PROFILE>>
```

## Testing

**packages/persona/archetype_modulation/__tests__/archetype.test.ts** (213 lines)

✅ 18/18 tests passing:

**Archetype Detection (5 tests)**
- ✅ Detect high-achieving robot archetype
- ✅ Detect lost dreamer archetype
- ✅ Detect anxious overthinker archetype
- ✅ Include secondary archetype when applicable
- ✅ Return human-readable archetype names

**Modulation Profiles (4 tests)**
- ✅ Return profile for high-achieving robot
- ✅ Return profile for chaotic creative
- ✅ Have example phrases for all 9 archetypes
- ✅ Return signature phrases for archetype

**Modulation Envelope (7 tests)**
- ✅ Build envelope from profile
- ✅ Set strict drift tolerance for anxious students
- ✅ Set relaxed tolerance for creative students
- ✅ Enforce stricter modulation when drift detected
- ✅ Generate well-formatted prompt block
- ✅ Validate correct envelope
- ✅ Reject envelope with invalid confidence

**Integration Scenarios (2 tests)**
- ✅ Provide different modulation for different archetypes
- ✅ Provide archetype-specific example phrases

## Adaptive Constraints

Component 43 dynamically adjusts constraints based on archetype:

### Strict Drift Tolerance
- **Archetypes:** High-Achieving Robot, Anxious Overthinker, Burnt-Out Overloader, Detached Minimalist, Discouraged Underdog
- **Reason:** These students need consistent, stable messaging
- **Effect:** Stronger drift correction, lower creativity, more grounding

### Relaxed Drift Tolerance
- **Archetypes:** Chaotic Creative, Lost Dreamer
- **Reason:** These students benefit from exploratory, flexible messaging
- **Effect:** Looser drift correction, higher creativity, less rigid structure

### Override on Red Drift
- **Trigger:** Component 42 detects red drift (similarity < 0.45)
- **Effect:** ALL archetypes get strict modulation temporarily
- **Reason:** Prevent generic AI voice from breaking through

## Production Integration Path

### Current Status (Rule-Based)
- ✅ Rule-based archetype detection using profile signals
- ✅ All 9 archetype modulation profiles defined
- ✅ Full integration with Component 42
- ✅ AssessmentAgent integration complete

### Future Enhancement (LLM-Based - Component 44)
- **Current:** Rule-based heuristics (fast, deterministic)
- **Future:** LLM-based classification (more accurate, context-aware)
- **Benefit:** Better handling of edge cases and nuanced profiles
- **Path:** Replace `detectStudentArchetype()` with LLM call

## Key Benefits

1. **Personalized Coaching:** Same advice, different delivery per student type
2. **Increased Effectiveness:** Messaging lands better when matched to student archetype
3. **Defensible Moat:** Competitors can't replicate this level of personalization
4. **Scalable:** Rule-based detection is fast and deterministic
5. **Composable:** Works seamlessly with Components 40, 41, and 42

## Summary

Component 43 transforms IvyLevel from "smart coaching" to "transformational coaching" by adapting Jenny's voice to each student's archetype. It's the difference between:

**Generic Jenny:**
"You should focus on your college applications and work hard."

**Jenny to High-Achieving Robot:**
"Let's slow this down. You're carrying way too many spinning plates, and it's impossible to think clearly when everything feels urgent. Your worth isn't measured by your transcript."

**Jenny to Lost Dreamer:**
"Let's try something small and see what lights you up. You don't need to know your major right now—confusion is just your brain asking for more data."

**Jenny to Anxious Overthinker:**
"Let's slow this down. You're spinning too many scenarios. Your nervous system is doing its thing. What's the one thing you can control right now?"

**This is where your platform stops being "smart" and starts being transformational.**
