# Component 46 - Assessment Session State Machine (AssessmentSessionFSM_v1)

## Implementation Summary

**Status:** ✅ Complete
**Test Status:** ✅ 29/29 passing
**Integration:** ✅ Integrated with AssessmentAgent + Dialogue Engine

---

## Overview

Component 46 is the **Assessment Session Finite State Machine (FSM)** — the deterministic backbone that controls every turn of the assessment session. This component guarantees predictable stage transitions, correct prompting, no skipping stages, no infinite loops, no missing diagnostic data, and correct shutdown into completion mode.

Without this FSM, the dialogue engine would be unpredictable. With it, every assessment session follows the same reliable structure.

---

## Architecture

### Directory Structure

```
packages/agents/assessment-agent/session/
├── assessmentFSM.ts       # Main FSM implementation (520 lines)
├── types.ts                # Type definitions + stage requirements
├── index.ts                # Exports
└── __tests__/
    └── assessmentFSM.test.ts  # Comprehensive test suite (29 tests)
```

---

## Core Components

### 1. **types.ts** (150 lines)

Type definitions and stage requirements mapping.

**Key Types:**

```typescript
export type AssessmentStage =
  | "rapport"
  | "current_state"
  | "diagnostic"
  | "preview"
  | "complete";

export interface AssessmentFSMState {
  stage: AssessmentStage;
  requiredSlots: string[];      // Data that must be collected at this stage
  collectedSlots: string[];     // Data already collected
  history: Array<{ role: string; content: string }>;
}
```

**Stage Requirements** (THE critical mapping):

```typescript
export const StageRequirements: Record<AssessmentStage, string[]> = {
  rapport: [
    "student_background",
    "emotional_state",
    "motivation_reason"
  ],
  current_state: [
    "academics_rigor",
    "ec_depth",
    "passion_signals",
    "service_signals",
    "identity_signals"
  ],
  diagnostic: [
    "aptitude_score",
    "passion_score",
    "service_score",
    "narrative_risks",
    "narrative_opportunities"
  ],
  preview: [
    "12m_direction_signal",
    "summer_direction_signal",
    "awards_direction_signal"
  ],
  complete: []
};
```

This is THE dataset the FSM uses to determine whether a stage is "done".

---

### 2. **assessmentFSM.ts** (520 lines)

The main FSM implementation with 20+ methods.

**Key Methods:**

**Slot Management:**
- `markSlotCollected(slot: string): SlotCollectionResult`
  - Marks a required data slot as collected
  - Idempotent (safe to call multiple times)

- `markSlotsCollected(slots: string[]): SlotCollectionResult[]`
  - Batch mark multiple slots

- `getRequiredSlots(): string[]`
  - Returns slots required for current stage

- `getCollectedSlots(): string[]`
  - Returns slots already collected

- `getMissingSlots(): string[]`
  - Returns slots still needed

**Stage Management:**
- `tryAdvanceStage(): StageTransitionResult`
  - Attempts to advance to next stage if current stage complete
  - Returns transition result with success status

- `getStage(): AssessmentStage`
  - Returns current stage

- `isCurrentStageComplete(): boolean`
  - Checks if all required slots collected

- `isComplete(): boolean`
  - Returns true if in terminal 'complete' stage

- `getStageProgress(): number`
  - Returns completion percentage (0.0 - 1.0)

**History Management:**
- `appendMessage(role: string, content: string): void`
  - Adds message turn to history

- `getHistory(): Array<{role, content}>`
  - Returns conversation history

- `getTurnCount(): number`
  - Returns total number of turns

**Metadata:**
- `getMetadata(): FSMMetadata`
  - Returns timestamps, stage history, turn count

- `getCurrentStageDuration(): number`
  - Returns milliseconds spent in current stage

- `getSummary(): string`
  - Returns human-readable summary

**Utilities:**
- `reset(): void`
  - Resets FSM to initial state

- `validate(): {valid, issues[]}`
  - Validates FSM consistency

---

## Stage Flow

The FSM enforces this canonical flow:

```
1. rapport
   ↓ (collect: student_background, emotional_state, motivation_reason)
2. current_state
   ↓ (collect: academics_rigor, ec_depth, passion_signals, service_signals, identity_signals)
3. diagnostic
   ↓ (collect: aptitude_score, passion_score, service_score, narrative_risks, narrative_opportunities)
4. preview
   ↓ (collect: 12m_direction_signal, summer_direction_signal, awards_direction_signal)
5. complete (terminal)
```

**Rules:**
- Cannot skip stages
- Cannot advance until all required slots collected
- Cannot reverse (except via reset)
- Cannot advance from terminal stage

---

## Integration

### With Dialogue Engine (Component 45)

The FSM and dialogue engine have parallel stage/phase names with a mapping layer:

**FSM Stage → Dialogue Phase:**
- `rapport` → `rapport_and_safety`
- `current_state` → `current_state_mapping`
- `diagnostic` → `diagnostic_insights`
- `preview` → `strategic_preview`
- `complete` → `strategic_preview`

**Helper Functions:**
```typescript
export function fsmStageToDialoguePhase(stage: string): AssessmentPhase
export function dialoguePhaseToFSMStage(phase: AssessmentPhase): string
```

### With AssessmentAgent

**New Field:**
```typescript
private sessionFSM: AssessmentSessionFSM;
```

**New Methods (10):**

1. **`getSessionFSM(): AssessmentSessionFSM`**
   - Returns FSM instance

2. **`getFSMStage(): AssessmentStage`**
   - Returns current FSM stage

3. **`markDataSlotCollected(slot: string)`**
   - Marks slot collected + attempts transition
   - Auto-syncs dialogue phase with FSM stage

4. **`markDataSlotsCollected(slots: string[])`**
   - Batch mark slots + transition

5. **`getFSMProgress(): number`**
   - Returns stage completion percentage

6. **`getMissingFSMSlots(): string[]`**
   - Returns missing slots for current stage

7. **`isAssessmentComplete(): boolean`**
   - Returns true if FSM in 'complete' stage

8. **`getFSMSummary(): string`**
   - Returns human-readable summary

9. **`resetSessionFSM(): void`**
   - Resets FSM + dialogue state

10. **`validateFSMSync(): {synced, fsmStage, dialoguePhase}`**
    - Checks FSM/dialogue sync

**Auto-Sync Behavior:**

When a slot is marked and triggers stage transition, the dialogue phase automatically syncs:

```typescript
markDataSlotCollected(slot: string) {
  const result = this.sessionFSM.markSlotCollected(slot);
  const transitionResult = this.sessionFSM.tryAdvanceStage();

  if (transitionResult.transitioned) {
    // Auto-sync dialogue phase
    this.currentPhase = fsmStageToDialoguePhase(transitionResult.toStage);
    console.log(`FSM transition: ${transitionResult.fromStage} → ${transitionResult.toStage}`);
    console.log(`Synced dialogue phase: ${this.currentPhase}`);
  }

  return { slotResult: result, transitionResult };
}
```

---

## Test Suite

**Location:** `packages/agents/assessment-agent/session/__tests__/assessmentFSM.test.ts`

**Test Coverage:** 29 tests, all passing

### Test Categories

1. **Initialization** (5 tests)
   - Initializes in rapport stage
   - Has correct stage requirements
   - Empty collected slots
   - Empty history
   - Not complete initially

2. **Slot Collection** (5 tests)
   - Mark single slot
   - Mark multiple slots
   - Idempotent marking
   - Track stage progress
   - Return missing slots

3. **Stage Transitions** (7 tests)
   - No transition when incomplete
   - Transition when complete
   - Reset collected slots after transition
   - Update required slots after transition
   - Follow canonical flow
   - Reach terminal complete stage
   - No advance from complete

4. **History Management** (2 tests)
   - Append messages
   - Track turn count

5. **Metadata** (4 tests)
   - Track stage history
   - Update stage history on transition
   - Track timestamps
   - Track stage duration

6. **State Management** (3 tests)
   - Return full state
   - Return summary string
   - Reset to initial state

7. **Validation** (2 tests)
   - Validate correct FSM state
   - Detect when stage complete

8. **Complete Flow** (1 test)
   - Complete full assessment flow (all 5 stages)

---

## Usage Examples

### Example 1: Basic FSM Usage

```typescript
const fsm = new AssessmentSessionFSM();

console.log(fsm.getStage());  // "rapport"
console.log(fsm.getMissingSlots());  // ["student_background", "emotional_state", "motivation_reason"]

// Mark slots collected
fsm.markSlotCollected("student_background");
fsm.markSlotCollected("emotional_state");
fsm.markSlotCollected("motivation_reason");

console.log(fsm.getStageProgress());  // 1.0 (100%)

// Try advance stage
const result = fsm.tryAdvanceStage();
console.log(result.transitioned);  // true
console.log(result.toStage);  // "current_state"
```

### Example 2: With AssessmentAgent

```typescript
const agent = new AssessmentAgent(input);

console.log(agent.getFSMStage());  // "rapport"
console.log(agent.getFSMProgress());  // 0.0

// Mark data collected
agent.markDataSlotCollected("student_background");
agent.markDataSlotCollected("emotional_state");
agent.markDataSlotCollected("motivation_reason");

// FSM automatically transitions and syncs dialogue phase
console.log(agent.getFSMStage());  // "current_state"
console.log(agent.getCurrentPhase());  // "current_state_mapping" (auto-synced!)
```

### Example 3: Check Completion

```typescript
const agent = new AssessmentAgent(input);

// Fast-forward through all stages
StageRequirements['rapport'].forEach(slot => agent.markDataSlotCollected(slot));
StageRequirements['current_state'].forEach(slot => agent.markDataSlotCollected(slot));
StageRequirements['diagnostic'].forEach(slot => agent.markDataSlotCollected(slot));
StageRequirements['preview'].forEach(slot => agent.markDataSlotCollected(slot));

console.log(agent.isAssessmentComplete());  // true
console.log(agent.getFSMStage());  // "complete"
```

### Example 4: Track Progress

```typescript
const agent = new AssessmentAgent(input);

// Start rapport stage
agent.markDataSlotCollected("student_background");
console.log(agent.getFSMSummary());
// "Stage: rapport | Progress: 33% | Missing: 2 slots | Duration: 5s | Turns: 2"

agent.markDataSlotCollected("emotional_state");
console.log(agent.getFSMSummary());
// "Stage: rapport | Progress: 67% | Missing: 1 slots | Duration: 8s | Turns: 4"

agent.markDataSlotCollected("motivation_reason");
console.log(agent.getFSMSummary());
// "Stage: current_state | Progress: 0% | Missing: 5 slots | Duration: 0s | Turns: 6"
```

---

## Key Features

### 1. **Deterministic Stage Flow**

The FSM guarantees:
- ✅ No skipping stages
- ✅ No infinite loops
- ✅ No backwards transitions (except reset)
- ✅ Predictable, reproducible behavior

### 2. **Data Completeness**

The FSM ensures:
- ✅ All required data collected before advancing
- ✅ Clear tracking of missing slots
- ✅ No premature stage transitions

### 3. **Graceful State Management**

- Idempotent slot marking (safe to mark same slot multiple times)
- Atomic stage transitions (all or nothing)
- Consistent state validation

### 4. **Rich Metadata**

- Stage history with timestamps (entered/exited)
- Turn count tracking
- Stage duration calculation
- Human-readable summaries

### 5. **Auto-Sync with Dialogue Engine**

- FSM stage transitions automatically sync dialogue phase
- No manual coordination required
- Validation methods to check sync status

---

## Benefits

### For the Platform

**✔ Reproducibility**
Every assessment session follows the same structure — perfect for testing & quality assurance.

**✔ Deterministic Stage Flow**
No LLM jumping around or skipping required diagnostic elements.

**✔ Data Completeness**
Every slot collected → a perfect ExtractedProfile_v2.

**✔ Enables Coach Embeddings Later**
FSM ensures consistent style + consistent outputs = consistent embeddings.

**✔ Architecture-Critical**
Every other agent in the mesh will later reuse this FSM pattern.

### For Developers

**✔ Easy Debugging**
- Clear stage tracking
- Visible slot collection status
- Human-readable summaries

**✔ Easy Testing**
- Deterministic behavior
- Predictable state transitions
- Complete test coverage

**✔ Easy Extension**
- Add new stages by updating StageRequirements
- Add new slots by updating stage arrays
- Coach-specific variants possible

---

## How FSM Integrates with Dialogue Engine

During every assessment turn:

1. **Dialogue Engine generates response** based on:
   - FSM stage (rapport, current_state, diagnostic, preview)
   - Transcript history
   - Archetype classification
   - EQ modulation

2. **Agent marks collected slots** from student's response:
   ```typescript
   agent.markDataSlotCollected("student_background");
   agent.markDataSlotCollected("emotional_state");
   ```

3. **FSM attempts stage transition**:
   - Checks if all required slots collected
   - Advances to next stage if complete
   - Auto-syncs dialogue phase

4. **Next turn uses updated stage**:
   - Dialogue engine receives new FSM stage
   - Generates response appropriate for new stage
   - Collects new slots for new stage

This ensures:
- ✅ The LLM cannot "jump ahead"
- ✅ The agent cannot skip diagnostics
- ✅ Assessment always yields full data
- ✅ Pipeline symmetry: extraction → oracles → narrative → strategy
- ✅ FSM ensures upstream completeness

---

## Comparison: Component 45 vs Component 46

| Aspect | Component 45 (Dialogue Engine) | Component 46 (FSM) |
|--------|-------------------------------|-------------------|
| **Purpose** | Generate Jenny's next message | Control stage flow |
| **Stage Names** | `rapport_and_safety`, `current_state_mapping`, `diagnostic_insights`, `strategic_preview` | `rapport`, `current_state`, `diagnostic`, `preview`, `complete` |
| **Responsibility** | Message generation, tone modulation, data collection prompting | Stage transitions, data completeness checking, flow control |
| **Flexibility** | Can adapt message based on context | Strict, deterministic stage flow |
| **Output** | Message text + diagnostic notes | Stage transitions + slot tracking |
| **Testing** | Mock LLM responses | Deterministic state machine |

**They work together:**
- FSM controls WHEN to advance stages (deterministic)
- Dialogue Engine controls WHAT to say in each stage (adaptive)

---

## Production Considerations

### Slot Detection

In production, you'll need a slot detection system to automatically mark slots from student responses:

```typescript
// Pseudo-code
async function processStudentMessage(studentMessage: string) {
  // Extract slots from message (NER, pattern matching, LLM extraction)
  const detectedSlots = await detectSlots(studentMessage, agent.getFSMStage());

  // Mark detected slots
  detectedSlots.forEach(slot => agent.markDataSlotCollected(slot));

  // Check for stage transition
  if (agent.getFSMStage() changed) {
    console.log("Stage transitioned! New stage:", agent.getFSMStage());
  }

  // Generate next turn using dialogue engine
  const dialogueOutput = await agent.generateAssessmentDialogueTurn(studentMessage);

  return dialogueOutput.message;
}
```

### Error Handling

- If slot detection fails, mark manually or ask clarifying questions
- If student provides incomplete data, stay in current stage and re-prompt
- If student goes off-topic, gently redirect to missing slots

### Stage Duration Monitoring

- Track how long each stage takes
- Alert if stage duration exceeds threshold (e.g., 15 minutes)
- Adjust prompting strategy if student is stuck

---

## Future Enhancements

1. **Coach-Specific Variants**
   - Different coaches may have different stage requirements
   - FSM can support coach-specific StageRequirements

2. **Dynamic Slot Addition**
   - Add optional slots based on student responses
   - Example: If student mentions anxiety, add "mental_health_support_needed" slot

3. **Stage Reversal**
   - Allow going back to previous stage if new information emerges
   - Requires careful design to avoid infinite loops

4. **Parallel Slot Collection**
   - Collect slots for multiple stages simultaneously
   - Example: Collect "passion_signals" during "current_state" and "diagnostic"

5. **Conditional Stages**
   - Skip stages based on student profile
   - Example: Skip "diagnostic" if student already has oracle scores

---

## Files Created (4)

1. `packages/agents/assessment-agent/session/types.ts`
2. `packages/agents/assessment-agent/session/assessmentFSM.ts`
3. `packages/agents/assessment-agent/session/index.ts`
4. `packages/agents/assessment-agent/session/__tests__/assessmentFSM.test.ts`

---

## Files Modified (3)

1. `packages/agents/assessment-agent/dialogue/types.ts`
   - Added FSM/dialogue phase mapping functions

2. `packages/agents/assessment-agent/dialogue/index.ts`
   - Exported mapping functions

3. `packages/agents/assessment-agent/src/AssessmentAgent.ts`
   - Added `sessionFSM` field
   - Added 10 FSM methods
   - Initialized FSM in constructor

---

## Testing

### Run Tests

```bash
npx jest packages/agents/assessment-agent/session/__tests__/assessmentFSM.test.ts
```

### Test Results

```
PASS packages/agents/assessment-agent/session/__tests__/assessmentFSM.test.ts
  Component 46 - Assessment Session FSM
    Initialization
      ✓ should initialize in rapport stage (2 ms)
      ✓ should initialize with rapport stage requirements
      ✓ should initialize with empty collected slots (1 ms)
      ✓ should initialize with empty history
      ✓ should not be complete initially
    Slot Collection
      ✓ should mark slot as collected
      ✓ should mark multiple slots as collected
      ✓ should be idempotent - marking same slot twice
      ✓ should track stage progress
      ✓ should return missing slots
    Stage Transitions
      ✓ should not transition when stage incomplete
      ✓ should transition when all slots collected
      ✓ should reset collected slots after transition
      ✓ should update required slots after transition
      ✓ should follow canonical stage flow
      ✓ should reach terminal complete stage
      ✓ should not advance from complete stage
    History Management
      ✓ should append messages to history
      ✓ should track turn count
    Metadata
      ✓ should track stage history
      ✓ should update stage history on transition
      ✓ should track timestamps (11 ms)
      ✓ should track stage duration
    State Management
      ✓ should return full state
      ✓ should return summary string
      ✓ should reset to initial state
    Validation
      ✓ should validate correct FSM state
      ✓ should detect when stage is complete
    Complete Flow
      ✓ should complete full assessment flow

Test Suites: 1 passed, 1 total
Tests:       29 passed, 29 total
Time:        1.3 s
```

---

## Summary

Component 46 is now **fully implemented and tested**. It provides:

✅ Deterministic stage flow (5 stages: rapport → current_state → diagnostic → preview → complete)
✅ Data completeness checking (16 total slots across 4 stages)
✅ Graceful state management (idempotent, atomic, validated)
✅ Rich metadata tracking (history, timestamps, progress)
✅ Auto-sync with dialogue engine (FSM ↔ dialogue phase mapping)
✅ Integration with AssessmentAgent (10 new methods)
✅ Comprehensive test coverage (29/29 tests passing)
✅ Production-ready architecture

The FSM is the deterministic backbone of the assessment session, ensuring every conversation follows the same reliable structure and collects all required diagnostic data.

**Components 43-46 Status:**
- ✅ Component 43 - Persona-Archetype Adaptive Modulation (18/18 tests)
- ✅ Component 44 - LLM-Powered Archetype Classifier (14/14 tests)
- ✅ Component 45 - Assessment Session Dialogue Engine (13/13 tests)
- ✅ Component 46 - Assessment Session FSM (29/29 tests)

**Total: 74/74 tests passing across all four components!**
