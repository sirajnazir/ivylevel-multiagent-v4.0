## Enhanced Assessment UX — Components 1-3

**Complete implementation of the assessment chat system with real-time EQ adaptation, progress tracking, and Jenny-like personality.**

---

## Overview

This package implements three critical components for the IvyLevel assessment chat experience:

1. **Component 1**: Chat UI Wrapper + Message Decorator
2. **Component 2**: Progress Engine + State Sync Layer
3. **Component 3**: Real-Time EQ & Archetype Adaptation Engine

Together, these components create a chat interface that:
- Feels human and adaptive (like talking to the real Jenny)
- Tracks progress through deterministic assessment stages
- Adapts tone and pacing based on student archetype
- Prevents flow drift and maintains session coherence
- Provides rich metadata (evidence, citations, EQ hints)

---

## Component 1: Chat UI Wrapper + Message Decorator

### Purpose

Wraps the chat UI and injects session metadata, evidence chips, archetype signals, citations, and Jenny-persona behavioral hooks.

### Files Created

```
apps/student-app/
├── components/chat/
│   ├── AssessmentChatWrapper.tsx    # Main wrapper component
│   ├── MessageDecorator.tsx          # Message decoration with evidence/citations
│   └── types.ts                      # Type definitions
├── hooks/
│   └── useAssessmentAgent.ts         # Core agent hook
├── lib/
│   └── jennyTone.ts                  # EQ tone utilities
└── styles/
    └── chat.css                      # Chat UI styles
```

### Usage

```tsx
import AssessmentChatWrapper from "@/components/chat/AssessmentChatWrapper";

function AssessmentPage({ sessionId }: { sessionId: string }) {
  return (
    <AssessmentChatWrapper
      sessionId={sessionId}
      showDebugPanel={process.env.NODE_ENV === "development"}
    />
  );
}
```

### Features

**AssessmentChatWrapper**
- Full chat interface with messages, input, send button
- Real-time progress bar showing current stage
- Error handling and retry capability
- Loading states with typing indicator
- Debug panel for development (archetype, EQ tone, progress)

**MessageDecorator**
- Evidence chips (visual indicators of what agent noticed)
- Citations (RAG sources used)
- EQ hints (subtle emotional guidance)
- Archetype indicators (in development mode)

**useAssessmentAgent Hook**
- Manages message history
- Sends messages to backend
- Receives responses with EQ/archetype metadata
- Handles errors gracefully
- Optimistic UI updates

### Message Flow

```
User types message
  ↓
useAssessmentAgent.sendMessage()
  ↓
POST /api/assessment/{sessionId}/message
  ↓
Backend: EQ Engine + Progress Engine + Agent
  ↓
Response with: { message, progress, archetype, eqTone }
  ↓
Update UI: messages, progress bar, EQ state
  ↓
MessageDecorator renders with evidence/citations
```

---

## Component 2: Progress Engine + State Sync Layer

### Purpose

Tracks progress through the 4-phase assessment flow with deterministic stage progression. Prevents flow drift and maintains session coherence.

### Files Created

```
apps/student-app/
├── components/chat/
│   └── AssessmentProgressBar.tsx     # Progress visualization
├── hooks/
│   └── useAssessmentProgress.ts      # Progress tracking hook
└── types/
    └── assessmentProgressTypes.ts    # Progress type definitions

packages/api/src/
├── progress/
│   └── assessmentProgressEngine.ts   # Backend progress engine
└── types/
    └── assessmentProgressTypes.ts    # Backend progress types
```

### Assessment Stages

| Stage      | Progress | Description                                      | Duration   |
|------------|----------|--------------------------------------------------|------------|
| intake     | 10%      | Understanding background, context, and goals     | 5-10 min   |
| diagnostic | 30%      | Evaluating academics, activities, and gaps       | 15-20 min  |
| narrative  | 60%      | Identifying themes, identity threads, positioning| 10-15 min  |
| strategy   | 85%      | Planning roadmap and target list                 | 10-15 min  |
| wrap_up    | 100%     | Preparing complete assessment summary            | 5 min      |

### Usage

**Frontend**

```tsx
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";

function MyComponent({ sessionId }: { sessionId: string }) {
  const { progress, stage, stageDescription, milestones } =
    useAssessmentProgress(sessionId);

  return (
    <div>
      <h3>{stage.toUpperCase()}</h3>
      <p>{stageDescription}</p>
      <ProgressBar value={progress} />
    </div>
  );
}
```

**Backend**

```typescript
import { AssessmentProgressEngine } from "@/progress/assessmentProgressEngine";

// Get progress for current stage
const progressPayload = AssessmentProgressEngine.getProgress("diagnostic");

// Calculate granular progress within a stage
const granularProgress = AssessmentProgressEngine.calculateGranularProgress(
  "diagnostic",
  2, // substeps completed
  5  // total substeps
);

// Validate stage transitions
const isValid = AssessmentProgressEngine.validateStageTransition(
  "intake",
  "diagnostic"
);

return {
  message: agentResponse,
  progress: progressPayload,
  // ...
};
```

### Features

- **Deterministic Progress**: Each stage maps to exact progress percentage
- **Granular Progress**: Calculate progress within stages based on substeps
- **Stage Validation**: Prevent skipping stages or invalid transitions
- **Milestone Tracking**: Record key moments in the assessment journey
- **Expected Durations**: Guide students on time commitment

---

## Component 3: Real-Time EQ & Archetype Adaptation Engine

### Purpose

The adaptive personality engine that makes Jenny feel alive. Detects student archetype, selects appropriate EQ style, and modulates every response in real-time.

### Files Created

```
packages/eq/
├── archetypeDetector.ts    # LLM-driven archetype classification
├── eqEngine.ts             # Main EQ engine
├── eqMiddleware.ts         # Response modulation
├── eqProfiles.ts           # All Jenny EQ styles
├── types.ts                # Type definitions
└── index.ts                # Public exports
```

### Architecture

```
Student Message
  ↓
Archetype Detector (LLM Structured Output)
  ↓
15 Archetypes → EQ Style Mapping
  ↓
EQ Style Selection (10 profiles)
  ↓
Response Modulator (warmth, directness, structure, pacing)
  ↓
Final Agent Response
```

### The 15 Archetypes

1. **OverwhelmedStarter** → Warm Empathic
2. **QuietHighPotential** → Warm Empathic
3. **BurntOutAchiever** → Pacing Slow
4. **Explorer** → Relatable Curious
5. **LateBloomer** → Encouraging Builder
6. **Hacker** → Precision Direct
7. **ReluctantDoer** → Structured Motivator
8. **HighFlyingGeneralist** → Analyst Mode
9. **HyperPerfectionist** → Pacing Slow
10. **AnxiousPlanner** → Warm Empathic
11. **CreativeBuilder** → Cheerfully Relatable
12. **DistractedMultitasker** → Structured Direct
13. **UnderconfidentStriver** → Confidence Builder
14. **IndependentThinker** → Analyst Mode
15. **StructuredExecutor** → Precision Direct

### The 10 EQ Styles

Each style has:
- **Tone Markers**: Communication qualities
- **Style Rules**: Specific guidelines
- **Pacing**: slow | normal | fast
- **Warmth**: 0.0 - 1.0 (emotional support level)
- **Directness**: 0.0 - 1.0 (conciseness level)
- **Structure Level**: 0.0 - 1.0 (organization level)

**Example: Warm Empathic**
```typescript
{
  name: "WarmEmpathic",
  toneMarkers: ["gentle reassurance", "emotional validation", "relatable examples"],
  styleRules: [
    "Reflect student feelings before moving forward",
    "Use supportive phrasing: 'I hear you', 'That makes sense'",
    "Avoid overloading with too many steps at once",
  ],
  pacing: "slow",
  warmth: 0.95,
  directness: 0.40,
  structureLevel: 0.55,
}
```

**Example: Precision Direct**
```typescript
{
  name: "PrecisionDirect",
  toneMarkers: ["concise", "actionable", "clarity-focused"],
  styleRules: [
    "Remove fluff and get straight to the point",
    "Lead with logic and data",
    "Highlight immediate next steps",
  ],
  pacing: "fast",
  warmth: 0.55,
  directness: 0.95,
  structureLevel: 0.85,
}
```

### Usage

**Backend Integration**

```typescript
import { EQEngine, applyEQMiddleware } from "@ivylevel/eq";

const eqEngine = new EQEngine();

// Update archetype based on latest student message
const eqState = await eqEngine.updateStudentArchetype(userMessage);

// Generate raw agent response
const rawReply = await assessmentAgent.respond(userMessage);

// Apply EQ modulation
const finalReply = applyEQMiddleware(rawReply, eqState);

return {
  reply: finalReply,
  archetype: eqState.archetype,
  eqTone: {
    label: eqState.style?.name || "neutral",
    warmth: eqState.style?.warmth || 0.7,
    strictness: 1 - (eqState.style?.warmth || 0.7),
  },
};
```

**What EQ Middleware Does**

1. **Warmth Modulation**
   - High warmth (≥0.8): Adds supportive openings like "I hear you."
   - Low warmth (≤0.6): Removes overly warm language

2. **Directness Modulation**
   - High directness (≥0.8): Removes filler words, uses imperatives
   - Low directness (≤0.5): Softens commands, adds exploratory language

3. **Structure Modulation**
   - High structure (≥0.7): Adds headers, numbered lists, clear organization
   - Low structure (≤0.5): Uses flowing, narrative style

4. **Pacing Modulation**
   - Slow: Limits response length, adds check-ins ("Does this resonate?")
   - Fast: Removes check-ins, allows longer responses

5. **Contextual Adjustments**
   - High overwhelm → simplify and slow down
   - High hesitation → add validation
   - High verbosity → match energy
   - Low verbosity → be more concise

### Advanced Features

**Manual Style Override**
```typescript
eqEngine.setStyleManually("PrecisionDirect");
```

**Get Style for Archetype**
```typescript
const style = eqEngine.getStyleForArchetype("Hacker");
// Returns: PrecisionDirect style
```

**Get Style Guidance (for debugging)**
```typescript
import { getStyleGuidance } from "@ivylevel/eq";

const guidance = getStyleGuidance(eqState);
console.log(guidance);
/*
Style: WarmEmpathic
Pacing: slow
Warmth: 95%
Directness: 40%
Structure: 55%

Tone Markers: gentle reassurance, emotional validation, relatable examples

Style Rules:
1. Reflect student feelings before moving forward
2. Use supportive phrasing: 'I hear you', 'That makes sense'
3. Avoid overloading with too many steps at once
...
*/
```

---

## Full Integration Example

### Backend API Route

```typescript
// apps/api/routes/assessment/[sessionId]/message.ts

import { AssessmentAgent } from "@ivylevel/agents/assessment-agent";
import { EQEngine, applyEQMiddleware } from "@ivylevel/eq";
import { AssessmentProgressEngine } from "@ivylevel/api/progress";

const eqEngine = new EQEngine();

export async function POST(req: Request, { params }: { params: { sessionId: string } }) {
  const { text } = await req.json();
  const { sessionId } = params;

  // 1. Update EQ state based on student message
  const eqState = await eqEngine.updateStudentArchetype(text);

  // 2. Get current progress
  const currentStage = await getSessionStage(sessionId); // Your session storage
  const progressPayload = AssessmentProgressEngine.getProgress(currentStage);

  // 3. Generate agent response
  const assessmentAgent = new AssessmentAgent(sessionId);
  const rawReply = await assessmentAgent.respond(text, {
    stage: currentStage,
    archetype: eqState.archetype,
  });

  // 4. Apply EQ modulation
  const finalReply = applyEQMiddleware(rawReply, eqState);

  // 5. Build response message
  const message = {
    id: crypto.randomUUID(),
    role: "assistant",
    text: finalReply,
    eqTone: {
      label: eqState.style?.name || "neutral",
      warmth: eqState.style?.warmth || 0.7,
      strictness: 1 - (eqState.style?.warmth || 0.7),
    },
    archetype: eqState.archetype,
    evidence: rawReply.evidence || [],
    citations: rawReply.citations || [],
    createdAt: new Date().toISOString(),
  };

  return Response.json({
    message,
    progress: progressPayload,
    archetype: eqState.archetype,
    eqTone: message.eqTone,
  });
}
```

### Frontend Page

```tsx
// app/assessment/[sessionId]/page.tsx

import AssessmentChatWrapper from "@/components/chat/AssessmentChatWrapper";

export default function AssessmentPage({
  params,
}: {
  params: { sessionId: string };
}) {
  return (
    <div className="assessment-page">
      <AssessmentChatWrapper
        sessionId={params.sessionId}
        showDebugPanel={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}
```

---

## Testing

### Component 1: Chat UI

```typescript
// Test message decoration
const message: AssessmentMessage = {
  id: "1",
  role: "assistant",
  text: "Let's explore your academic interests.",
  evidence: ["intellectual_curiosity", "stem_focus"],
  citations: ["Transcript Q3 2023"],
  eqHints: "Student is showing analytical thinking",
  createdAt: new Date().toISOString(),
};

render(<MessageDecorator message={message} />);
```

### Component 2: Progress Engine

```typescript
import { AssessmentProgressEngine } from "@ivylevel/api/progress";

// Test basic progress
const progress = AssessmentProgressEngine.getProgress("diagnostic");
expect(progress.progress).toBe(30);
expect(progress.description).toContain("Evaluating");

// Test stage transitions
const isValid = AssessmentProgressEngine.validateStageTransition("intake", "diagnostic");
expect(isValid).toBe(true);

const isInvalid = AssessmentProgressEngine.validateStageTransition("intake", "strategy");
expect(isInvalid).toBe(false);

// Test granular progress
const granular = AssessmentProgressEngine.calculateGranularProgress("diagnostic", 3, 5);
expect(granular).toBeGreaterThan(30);
expect(granular).toBeLessThan(60);
```

### Component 3: EQ Engine

```typescript
import { EQEngine, applyEQMiddleware } from "@ivylevel/eq";

// Test archetype detection
const eqEngine = new EQEngine();
const state = await eqEngine.updateStudentArchetype(
  "I'm really stressed about college apps. I don't know where to start."
);

expect(state.archetype).toBe("OverwhelmedStarter");
expect(state.style?.name).toBe("WarmEmpathic");

// Test EQ middleware
const rawReply = "You should start with your college list.";
const modulated = applyEQMiddleware(rawReply, state);

expect(modulated).toContain("I hear you");
expect(modulated.length).toBeGreaterThan(rawReply.length);
```

---

## Benefits

### What This Solves

1. **No More Flow Drift** (the v3 disaster)
   - Deterministic progress tracking
   - Stage validation prevents skipping
   - Clear milestones and completion criteria

2. **Human-Like Adaptation**
   - Real-time archetype detection
   - Adaptive tone and pacing
   - Jenny's signature phrases and style

3. **Rich Metadata**
   - Evidence chips show what agent noticed
   - Citations provide transparency
   - EQ hints guide emotional calibration

4. **Hot-Swappable UX**
   - Backend-agnostic components
   - Can plug into any frontend
   - Easy to replace chat UI later

5. **Developer Experience**
   - Clear separation of concerns
   - Type-safe throughout
   - Easy to test and debug
   - Debug panel for development

---

## Next Steps

### Component 4: Archetype-to-UI Adaptation Layer
Where the UI visibly changes depending on student archetype:
- Onboarding flow customization
- Badges and visual indicators
- Microcopy adaptation
- Pacing guidance

### Component 5: Evidence Chip System
Visual system for displaying agent observations:
- EQ chips
- APS signals
- Narrative threads
- Strategy indicators

### Component 6: Citation & RAG Display
Transparency layer for retrieved context:
- Source attribution
- Relevance scores
- Interactive citations
- RAG quality indicators

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AssessmentChatWrapper                                │  │
│  │                                                        │  │
│  │  ├─ useAssessmentAgent                               │  │
│  │  │   └─ POST /api/assessment/{id}/message           │  │
│  │  │                                                    │  │
│  │  ├─ useAssessmentProgress                            │  │
│  │  │   └─ GET /api/assessment/{id}/progress           │  │
│  │  │                                                    │  │
│  │  ├─ MessageDecorator                                 │  │
│  │  │   ├─ Evidence chips                               │  │
│  │  │   ├─ Citations                                    │  │
│  │  │   └─ EQ hints                                     │  │
│  │  │                                                    │  │
│  │  └─ AssessmentProgressBar                            │  │
│  │      ├─ Stage indicator                              │  │
│  │      ├─ Progress percentage                          │  │
│  │      └─ Milestones                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend (API)                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Assessment Message Handler                           │  │
│  │                                                        │  │
│  │  1. EQ Engine                                         │  │
│  │     ├─ Archetype Detector (LLM)                      │  │
│  │     ├─ Archetype → EQ Style Mapping                  │  │
│  │     └─ EQ State Management                           │  │
│  │                                                        │  │
│  │  2. Progress Engine                                   │  │
│  │     ├─ Stage Tracking                                │  │
│  │     ├─ Progress Calculation                          │  │
│  │     └─ Milestone Recording                           │  │
│  │                                                        │  │
│  │  3. Assessment Agent                                  │  │
│  │     ├─ Generate Response                             │  │
│  │     ├─ Extract Evidence                              │  │
│  │     └─ Gather Citations                              │  │
│  │                                                        │  │
│  │  4. EQ Middleware                                     │  │
│  │     ├─ Apply Warmth                                  │  │
│  │     ├─ Apply Directness                              │  │
│  │     ├─ Apply Structure                               │  │
│  │     └─ Apply Pacing                                  │  │
│  │                                                        │  │
│  │  5. Response Assembly                                 │  │
│  │     └─ { message, progress, archetype, eqTone }     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## License

MIT
