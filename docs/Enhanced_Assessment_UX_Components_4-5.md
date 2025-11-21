## Enhanced Assessment UX — Components 4-5

**Archetype-to-UI Adaptation + Stage Controller for structured, emotionally intelligent assessments.**

---

## Overview

This package implements two critical components that transform the assessment from "generic chat" into "professional coaching session":

1. **Component 4**: Archetype-to-UI Adaptation Layer
2. **Component 5**: Adaptive Progression Engine (Stage Controller)

Together, these components ensure:
- The UI adapts to each student's archetype (overwhelmed students get calm UI, hackers get high-density)
- The assessment follows Jenny's actual 5-phase process
- The LLM can't skip ahead or get distracted
- Every session hits all intelligence checkpoints

---

## Component 4: Archetype-to-UI Adaptation Layer

### Purpose

Turns the static chat UI into a dynamic, emotionally intelligent experience that reacts to the student's archetype with adaptive:
- Color themes
- Microcopy tone
- Evidence chip density
- Progress stepper visibility
- Animation pacing

### Files Created

```
packages/eq/uiAdaptation/
├── types.ts                         # Type definitions
├── uiRules.ts                       # Archetype → UI mapping rules
├── uiAdapter.ts                     # Main UI adapter class
├── components/
│   ├── ArchetypeBanner.tsx         # Archetype indicator
│   ├── Microcopy.tsx                # Adaptive microcopy messages
│   ├── Chips.tsx                    # Density-controlled evidence chips
│   └── Stepper.tsx                  # Adaptive progress stepper
└── index.ts                         # Public exports
```

### The 15 Archetype → UI Mappings

Each archetype gets specific UI adaptations:

| Archetype               | Color      | Microcopy Tone | Chip Density | Show Evidence | Pacing |
|------------------------|------------|----------------|--------------|---------------|--------|
| OverwhelmedStarter     | #5A76FF    | calming        | low          | false         | slow   |
| QuietHighPotential     | default    | gentle         | low          | true          | slow   |
| BurntOutAchiever       | default    | reassuring     | low          | false         | slow   |
| Explorer               | default    | curious        | medium       | true          | normal |
| LateBloomer            | default    | gentle         | medium       | true          | slow   |
| Hacker                 | default    | direct         | high         | true          | fast   |
| ReluctantDoer          | default    | directive      | low          | true          | normal |
| HighFlyingGeneralist   | default    | direct         | high         | true          | fast   |
| HyperPerfectionist     | default    | soft-direct    | low          | false         | slow   |
| AnxiousPlanner         | default    | reassuring     | low          | true          | slow   |
| CreativeBuilder        | default    | curious        | medium       | true          | normal |
| DistractedMultitasker  | default    | directive      | low          | false         | fast   |
| UnderconfidentStriver  | default    | reassuring     | low          | true          | slow   |
| IndependentThinker     | default    | direct         | high         | true          | normal |
| StructuredExecutor     | default    | directive      | high         | true          | fast   |

### Microcopy Tones

Different microcopy messages for different archetypes:

- **calming**: "You're doing great — let's take this step by step."
- **gentle**: "No rush, let's explore this together."
- **reassuring**: "You're on the right track. Let's build on this."
- **curious**: "Interesting! Let's unpack that more."
- **direct**: "Got it. Let's cut to the core insight."
- **directive**: "Here's exactly what we'll do next."
- **soft-direct**: "I'll guide you clearly, but we'll keep things light."

### Usage

**Backend Integration**

```typescript
import { UIAdapter } from "@ivylevel/eq/uiAdaptation";
import { EQEngine } from "@ivylevel/eq";

const uiAdapter = new UIAdapter();
const eqEngine = new EQEngine();

// After each agent response
const eqState = await eqEngine.updateStudentArchetype(userMessage);

const uiState = uiAdapter.update({
  archetype: eqState.archetype,
  eqStyle: eqState.style?.name || "neutral",
  stage: currentStage,
});

return {
  message: finalReply,
  ui: uiState,
  eq: eqState,
};
```

**Frontend Integration**

```tsx
import { ArchetypeBanner, Microcopy, Chips, Stepper } from "@ivylevel/eq/uiAdaptation";

function AssessmentChat({ uiState, message }) {
  return (
    <div>
      {/* Show archetype banner */}
      <ArchetypeBanner uiState={uiState} />

      {/* Show adaptive microcopy */}
      <Microcopy uiState={uiState} />

      {/* Show stage progress */}
      <Stepper
        uiState={uiState}
        currentStage={stage}
        stages={["warmup", "academics", "activities", "narrative", "synthesis"]}
      />

      {/* Show evidence chips (respects density) */}
      <Chips uiState={uiState} evidence={message.evidence} />

      {/* Message content */}
      <div>{message.text}</div>
    </div>
  );
}
```

### UI State Interface

```typescript
interface UIState {
  archetype: string | null;
  eqStyle: string | null;
  colorTheme: string;              // Hex color for primary theme
  microcopyTone: string;           // Tone for supportive messages
  chipDensity: "low" | "medium" | "high";  // Max chips: 2, 4, or 8
  showEvidence: boolean;           // Show/hide evidence chips
  showProgressStepper: boolean;    // Show/hide progress indicator
  pacing: "slow" | "normal" | "fast";  // Animation speed
}
```

### What This Unlocks

- **Cognitive Ergonomics**: Overwhelmed students get simpler UI, analytical students get maximum data
- **Emotional Intelligence**: UI tone matches student's emotional state
- **Personalization**: Every student feels the experience was designed for them
- **Reduced Overwhelm**: Anxious students don't see overwhelming amounts of chips/data
- **Increased Engagement**: High-agency students get faster pacing and more information

---

## Component 5: Adaptive Progression Engine (Stage Controller)

### Purpose

Transforms the assessment from "ChatGPT chat" into a guided 5-phase clinical flow identical to Jenny's process. Prevents LLM from rushing ahead, ensures all intelligence checkpoints are hit.

### Files Created

```
packages/assessment/stageController/
├── types.ts                  # Type definitions
├── stageRules.ts             # Stage transition rules
├── stageController.ts        # Main controller class
└── index.ts                  # Public exports

apps/student-app/components/chat/
└── AssessmentStageIndicator.tsx  # Frontend stage visualizer
```

### The 5 Assessment Stages

| Stage      | Min Turns | Description                                          | Objectives |
|------------|-----------|------------------------------------------------------|------------|
| warmup     | 2         | Building rapport and understanding initial context   | 4          |
| academics  | 4         | Exploring academic profile, rigor, and trajectory    | 5          |
| activities | 4         | Understanding ECs, leadership, and personal narrative| 5          |
| narrative  | 3         | Identifying themes, positioning, and unique story    | 5          |
| synthesis  | 2         | Creating preliminary roadmap and strategic direction | 4          |

### Stage Definitions

**Warmup (2+ turns)**
- Establish comfortable rapport
- Understand student's immediate concerns
- Gauge communication style and energy level
- Set expectations for the session

**Academics (4+ turns)**
- Understand GPA, test scores, class rank
- Evaluate course rigor and academic trajectory
- Identify academic strengths and challenges
- Assess intellectual interests and passions
- Gather evidence for academic positioning

**Activities (4+ turns)**
- Map all extracurricular activities
- Identify leadership roles and impact
- Discover passion projects and initiatives
- Understand time allocation and priorities
- Extract narrative threads and identity signals

**Narrative (3+ turns)**
- Synthesize academic + EC data into coherent narrative
- Identify unique positioning and standout qualities
- Detect archetype and communication preferences
- Map identity threads and personal values
- Assess college readiness and fit preferences

**Synthesis (2+ turns)**
- Provide preliminary standout assessment
- Suggest strategic directions and opportunities
- Identify immediate action items
- Set expectations for full assessment output

### Usage

**Backend Integration**

```typescript
import { StageController } from "@ivylevel/assessment/stageController";

const stageController = new StageController("warmup");

// Before each agent response
export async function POST(req: Request) {
  const { text } = await req.json();

  // Record turn
  stageController.recordTurn();

  // Check if should advance
  const transition = stageController.shouldAdvance();

  if (transition.shouldAdvance) {
    console.log(`[Stage] ${transition.reason}`);
    stageController.advanceStage(transition.nextStage);
  }

  const currentStage = stageController.getStage();
  const progress = stageController.getProgressPercentage();

  // Generate response with stage context
  const reply = await assessmentAgent.respond({
    input: text,
    stage: currentStage,
    objectives: stageController.getObjectivesStatus(),
  });

  return Response.json({
    reply,
    stage: currentStage,
    progress,
    stageDefinition: stageController.getStageDefinition(),
  });
}
```

**Frontend Integration**

```tsx
import { AssessmentStageIndicator } from "@/components/chat/AssessmentStageIndicator";

function AssessmentChat({ stage }) {
  return (
    <div>
      <AssessmentStageIndicator stage={stage} />
      {/* Rest of chat UI */}
    </div>
  );
}
```

### Stage Controller API

```typescript
class StageController {
  // Core methods
  recordTurn(): void                           // Increment turn count
  getStage(): AssessmentStage                  // Get current stage
  shouldAdvance(): StageTransitionResult       // Check if ready to advance
  advanceStage(next: AssessmentStage): void    // Move to next stage
  tryAdvance(): boolean                        // Auto-advance if ready

  // Progress tracking
  getProgressPercentage(): number              // 0-100 overall progress
  getStageDefinition(): StageDefinition        // Get current stage info

  // Objectives
  markObjectiveAchieved(objective: string): void
  getObjectivesStatus(): Array<{ objective: string; achieved: boolean }>

  // Metadata
  getStageMetadata(stage: AssessmentStage): StageMetadata
  getAllMetadata(): Record<AssessmentStage, StageMetadata>

  // Utilities
  isComplete(): boolean                        // Check if finished
  reset(): void                                // Reset to warmup
}
```

### Stage Transition Logic

```typescript
// Minimum turns enforced
const MIN_TURNS = {
  warmup: 2,
  academics: 4,
  activities: 4,
  narrative: 3,
  synthesis: 2,
  complete: 0,
};

// Evaluation logic
function evaluateStageTransition(state: StageState): StageTransitionResult {
  const { stage, turnCount } = state;

  // Check minimum turns
  if (turnCount < MIN_TURNS[stage]) {
    return {
      nextStage: stage,
      reason: `Not enough turns in ${stage} (${turnCount}/${MIN_TURNS[stage]})`,
      shouldAdvance: false,
    };
  }

  // Advance to next stage
  switch (stage) {
    case "warmup": return { nextStage: "academics", shouldAdvance: true };
    case "academics": return { nextStage: "activities", shouldAdvance: true };
    // ...
  }
}
```

### What This Unlocks

1. **Prevents LLM Rushing** - Can't jump to narrative in turn 2
2. **Guarantees Coverage** - All intelligence checkpoints hit
3. **Enables Replay/Debug** - Know which stage produced which output
4. **Archetype-Aware Pacing** - Different archetypes can have different minimum turns
5. **Professional Experience** - Feels like real consultant with structured process

---

## Full Integration Example

### Backend API Route

```typescript
// apps/api/routes/assessment/[sessionId]/message.ts

import { StageController } from "@ivylevel/assessment/stageController";
import { UIAdapter } from "@ivylevel/eq/uiAdaptation";
import { EQEngine, applyEQMiddleware } from "@ivylevel/eq";

const stageController = new StageController();
const uiAdapter = new UIAdapter();
const eqEngine = new EQEngine();

export async function POST(req: Request) {
  const { text } = await req.json();

  // 1. Record turn and check stage progression
  stageController.recordTurn();
  stageController.tryAdvance();

  const stage = stageController.getStage();
  const progress = stageController.getProgressPercentage();

  // 2. Update EQ state
  const eqState = await eqEngine.updateStudentArchetype(text);

  // 3. Update UI state
  const uiState = uiAdapter.update({
    archetype: eqState.archetype,
    eqStyle: eqState.style?.name || "neutral",
    stage,
  });

  // 4. Generate agent response
  const rawReply = await assessmentAgent.respond({
    input: text,
    stage,
    archetype: eqState.archetype,
    objectives: stageController.getObjectivesStatus(),
  });

  // 5. Apply EQ modulation
  const finalReply = applyEQMiddleware(rawReply, eqState);

  // 6. Build response
  const message = {
    id: crypto.randomUUID(),
    role: "assistant",
    text: finalReply,
    evidence: rawReply.evidence || [],
    citations: rawReply.citations || [],
    createdAt: new Date().toISOString(),
  };

  return Response.json({
    message,
    stage,
    progress,
    stageDefinition: stageController.getStageDefinition(),
    ui: uiState,
    eq: {
      archetype: eqState.archetype,
      style: eqState.style?.name,
      warmth: eqState.style?.warmth,
    },
  });
}
```

### Frontend Page

```tsx
"use client";

import { useState } from "react";
import { AssessmentStageIndicator } from "@/components/chat/AssessmentStageIndicator";
import { ArchetypeBanner, Microcopy, Chips } from "@ivylevel/eq/uiAdaptation";
import { useAssessmentAgent } from "@/hooks/useAssessmentAgent";

export default function AssessmentPage({ params }: { params: { sessionId: string } }) {
  const {
    messages,
    sendMessage,
    stage,
    progress,
    uiState,
    eqState,
  } = useAssessmentAgent(params.sessionId);

  return (
    <div className="assessment-page">
      {/* Archetype banner */}
      <ArchetypeBanner uiState={uiState} />

      {/* Stage indicator */}
      <AssessmentStageIndicator stage={stage} />

      {/* Adaptive microcopy */}
      <Microcopy uiState={uiState} />

      {/* Messages */}
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id}>
            {/* Evidence chips (respects density) */}
            {message.evidence && (
              <Chips uiState={uiState} evidence={message.evidence} />
            )}

            {/* Message text */}
            <div>{message.text}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <input onKeyPress={(e) => {
        if (e.key === "Enter") sendMessage(e.target.value);
      }} />
    </div>
  );
}
```

---

## Testing

### Component 4: UI Adaptation

```typescript
import { UIAdapter } from "@ivylevel/eq/uiAdaptation";

const adapter = new UIAdapter();

// Test overwhelmed student
const state1 = adapter.update({
  archetype: "OverwhelmedStarter",
  eqStyle: "WarmEmpathic",
  stage: "warmup",
});

expect(state1.chipDensity).toBe("low");
expect(state1.showEvidence).toBe(false);
expect(state1.pacing).toBe("slow");
expect(state1.microcopyTone).toBe("calming");

// Test hacker student
const state2 = adapter.update({
  archetype: "Hacker",
  eqStyle: "PrecisionDirect",
  stage: "academics",
});

expect(state2.chipDensity).toBe("high");
expect(state2.showEvidence).toBe(true);
expect(state2.pacing).toBe("fast");
expect(state2.microcopyTone).toBe("direct");
```

### Component 5: Stage Controller

```typescript
import { StageController } from "@ivylevel/assessment/stageController";

const controller = new StageController();

// Test minimum turns enforcement
controller.recordTurn();
const result1 = controller.shouldAdvance();
expect(result1.shouldAdvance).toBe(false);
expect(result1.reason).toContain("Not enough turns");

controller.recordTurn();
const result2 = controller.shouldAdvance();
expect(result2.shouldAdvance).toBe(true);
expect(result2.nextStage).toBe("academics");

// Test auto-advance
controller.tryAdvance();
expect(controller.getStage()).toBe("academics");

// Test progress
expect(controller.getProgressPercentage()).toBeGreaterThan(0);
expect(controller.getProgressPercentage()).toBeLessThan(50);
```

---

## Benefits

### Component 4 Benefits

1. **Cognitively Ergonomic**: UI complexity matches student's processing capacity
2. **Emotionally Intelligent**: Tone adapts to student's state
3. **Personalized**: Every student feels the experience was designed for them
4. **Professional**: Adaptive UI makes the system feel sophisticated

### Component 5 Benefits

1. **Structured**: Enforces Jenny's actual assessment process
2. **Complete**: Guarantees all intelligence checkpoints are hit
3. **Debuggable**: Always know which stage produced which output
4. **Professional**: Feels like real consultant, not random chatbot

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AssessmentChat                                       │  │
│  │                                                        │  │
│  │  ├─ ArchetypeBanner (Component 4)                    │  │
│  │  │   └─ Adaptive color theme                         │  │
│  │  │                                                    │  │
│  │  ├─ AssessmentStageIndicator (Component 5)           │  │
│  │  │   └─ Current stage + progress                     │  │
│  │  │                                                    │  │
│  │  ├─ Microcopy (Component 4)                          │  │
│  │  │   └─ Tone-adaptive supportive message             │  │
│  │  │                                                    │  │
│  │  ├─ Messages                                          │  │
│  │  │   └─ Chips (Component 4)                          │  │
│  │  │       └─ Density-controlled evidence chips        │  │
│  │  │                                                    │  │
│  │  └─ Stepper (Component 4)                            │  │
│  │      └─ Pacing-aware progress visualization          │  │
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
│  │  1. Stage Controller (Component 5)                    │  │
│  │     ├─ recordTurn()                                  │  │
│  │     ├─ tryAdvance()                                  │  │
│  │     └─ getStage() → current stage                    │  │
│  │                                                        │  │
│  │  2. EQ Engine (Component 3)                           │  │
│  │     └─ updateStudentArchetype() → archetype          │  │
│  │                                                        │  │
│  │  3. UI Adapter (Component 4)                          │  │
│  │     └─ update(archetype, stage) → uiState            │  │
│  │                                                        │  │
│  │  4. Assessment Agent                                  │  │
│  │     └─ respond(text, stage, archetype)               │  │
│  │                                                        │  │
│  │  5. Response Assembly                                 │  │
│  │     └─ { message, stage, progress, ui, eq }          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

- **Component 6**: Evidence Layer UI (Citations + Expandable Chips)
- **Component 7**: Skill-Spotlight Reducer (Real-Time Strength Identification)

---

## License

MIT
