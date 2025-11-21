# Memory Layer (M1-M5)

**Phase 1 Memory Modules for Assessment Agent**

Session-scoped, lightweight, purely functional memory architecture.

---

## Overview

The Memory Layer provides five specialized modules for tracking different aspects of the assessment conversation:

- **M1 - EQ Memory**: Emotional intelligence state (archetype, tone, rapport)
- **M2 - Evidence Memory**: Evidence references used in each reply
- **M3 - Response Memory**: Agent thought trail (intent, framework, EQ adjustment)
- **M4 - Student State Memory**: Student's evolving emotional/cognitive state
- **M5 - Working Memory**: Hot context window with automatic summarization

All modules are:
- ✅ **Session-scoped** (no database dependency)
- ✅ **Lightweight** (minimal overhead)
- ✅ **Purely functional** (explicit state management)
- ✅ **Transparent** (no hidden behavior)

---

## M1 - EQ Memory

**Tracks emotional intelligence state across the session.**

### Types

```typescript
type Archetype =
  | "Achiever" | "Builder" | "Explorer" | "Striver" | "Underdog"
  | "LateBloomer" | "Visionary" | "StructuredThinker"
  | "AnxiousHighPotential" | "HighPerformerLowStructure";

interface ToneSignature {
  warmth: number;        // 0–1
  directness: number;    // 0–1
  enthusiasm: number;    // 0–1
  firmness: number;      // 0–1
  empathy: number;       // 0–1
  encouragement: number; // 0–1
}

interface EQMemory {
  archetype: Archetype | null;
  tone: ToneSignature;
  rapportLevel: number;      // 0–1
  lastSentiment?: string;
  lastAffirmationUsed?: string;
}
```

### Usage

```typescript
import { EQMemoryManager } from "@ivylevel/memory";

const eqMemory = new EQMemoryManager(sessionStore);

// Set student archetype
eqMemory.setArchetype(sessionId, "AnxiousHighPotential");

// Adjust tone (delta values)
eqMemory.updateTone(sessionId, {
  warmth: +0.1,
  empathy: +0.2,
  directness: -0.1,
});

// Update rapport
eqMemory.updateRapport(sessionId, +0.15);

// Get full EQ state
const eq = eqMemory.getFull(sessionId);
```

---

## M2 - Evidence Memory

**Append-only trail of evidence used in each reply.**

### Types

```typescript
type EvidenceSourceType =
  | "kb_chip" | "eq_chip" | "intel_chip" | "rag_passage"
  | "strategy_chip" | "student_history" | "session_context";

interface EvidenceReference {
  id: string;
  sourceType: EvidenceSourceType;
  filePath?: string;
  excerpt?: string;
  confidence?: number;  // 0–1
}

interface EvidenceMemoryEntry {
  turn: number;
  usedEvidence: EvidenceReference[];
}
```

### Usage

```typescript
import { EvidenceMemoryManager } from "@ivylevel/memory";

const evidenceMemory = new EvidenceMemoryManager(sessionStore);

// Record evidence for a turn
evidenceMemory.addEvidence(sessionId, turnNumber, [
  {
    id: "kb-chip-123",
    sourceType: "kb_chip",
    excerpt: "High achievers benefit from SPARK framework...",
    confidence: 0.92,
  },
  {
    id: "rag-passage-456",
    sourceType: "rag_passage",
    filePath: "frameworks/SPARK.md",
    excerpt: "Students with high GPA...",
    confidence: 0.88,
  },
]);

// Get evidence for specific turn
const turnEvidence = evidenceMemory.getEvidenceForTurn(sessionId, 5);

// Get statistics
const stats = evidenceMemory.getEvidenceStats(sessionId);
// {
//   totalEvidence: 47,
//   bySourceType: { kb_chip: 15, rag_passage: 22, ... },
//   averageConfidence: 0.87
// }
```

---

## M3 - Response Memory

**Agent thought trail - what it said, why it said it, how it adapted.**

### Types

```typescript
interface AgentTurnMeta {
  turn: number;
  intent: string;  // "explore_academics" | "build_rapport" | etc.
  appliedFramework?: string;  // "CARE" | "SPARK" | "ANCHOR"
  eqAdjustment?: {
    toneDelta?: Partial<ToneSignature>;
    rapportDelta?: number;
  };
  inferenceInputs?: {
    kbChipsUsed?: string[];
    eqChipsUsed?: string[];
    intelChipsUsed?: string[];
    ragPassagesUsed?: string[];
  };
  expectedStudentSignal?: string;
  timestamp: string;
}
```

### Usage

```typescript
import { ResponseMemoryManager } from "@ivylevel/memory";

const responseMemory = new ResponseMemoryManager(sessionStore);

// Record agent's thought process
responseMemory.addTurn(sessionId, {
  turn: 7,
  intent: "explore_academics",
  appliedFramework: "SPARK",
  eqAdjustment: {
    toneDelta: { enthusiasm: +0.1 },
    rapportDelta: +0.05,
  },
  inferenceInputs: {
    kbChipsUsed: ["kb-123", "kb-456"],
    ragPassagesUsed: ["rag-789"],
  },
  expectedStudentSignal: "will_reveal_gpa_context",
});

// Get turn metadata
const turnMeta = responseMemory.getTurnMeta(sessionId, 7);

// Get inference statistics
const stats = responseMemory.getInferenceStats(sessionId);
// {
//   totalKBChips: 23,
//   totalEQChips: 8,
//   frameworkUsage: { SPARK: 5, CARE: 3, ANCHOR: 2 },
//   intentDistribution: { explore_academics: 7, build_rapport: 4, ... }
// }
```

---

## M4 - Student State Memory

**Tracks what the student is becoming (real-time phenotyping).**

### Types

```typescript
type EmotionalTone =
  | "excited" | "anxious" | "confident" | "overwhelmed"
  | "curious" | "defensive" | "engaged" | "withdrawn" | "neutral";

type CognitiveLoad = "low" | "medium" | "high" | "overloaded";
type MotivationLevel = "low" | "medium" | "high";
type ConfidenceLevel = "low" | "medium" | "high";

interface StudentStateSnapshot {
  turn: number;
  emotionalTone: EmotionalTone;
  cognitiveLoad: CognitiveLoad;
  motivation: MotivationLevel;
  confidence: ConfidenceLevel;
  archetypeState?: {
    current: string;
    confidence: number;
    drift?: { toward: string; strength: number };
  };
  signalsDetected?: string[];
  timestamp: string;
}
```

### Usage

```typescript
import { StudentStateMemoryManager } from "@ivylevel/memory";

const studentStateMemory = new StudentStateMemoryManager(sessionStore);

// Record state snapshot
studentStateMemory.addSnapshot(sessionId, {
  turn: 8,
  emotionalTone: "anxious",
  cognitiveLoad: "high",
  motivation: "medium",
  confidence: "low",
  archetypeState: {
    current: "AnxiousHighPotential",
    confidence: 0.83,
    drift: { toward: "StructuredThinker", strength: 0.12 },
  },
  signalsDetected: [
    "mentions_time_pressure",
    "asks_clarifying_questions",
    "shows_self_doubt",
  ],
});

// Get latest snapshot
const latest = studentStateMemory.latest(sessionId);

// Detect state changes
const changes = studentStateMemory.detectStateChange(sessionId);
// {
//   emotionalShift: { from: "curious", to: "anxious" },
//   cognitiveLoadShift: { from: "medium", to: "high" }
// }

// Get trends
const emotionalTrend = studentStateMemory.getEmotionalTrend(sessionId);
// ["curious", "engaged", "confident", "anxious", "overwhelmed"]
```

---

## M5 - Working Memory

**Hot context window (the RAM of the agent).**

### Types

```typescript
interface WorkingMemoryTurn {
  turn: number;
  userMessage: string;
  agentReply: string;
  timestamp: string;
}

interface WorkingMemorySummary {
  startTurn: number;
  endTurn: number;
  summary: string;
  keyPoints: string[];
  timestamp: string;
}

interface ContextBundle {
  recentTurns: WorkingMemoryTurn[];
  historySummaries: WorkingMemorySummary[];
  totalTurns: number;
}
```

### Usage

```typescript
import { WorkingMemoryManager, Summarizer } from "@ivylevel/memory";

// Optional: LLM-based summarizer
const summarizer: Summarizer = {
  async summarize(turns) {
    // Call LLM to summarize turns
    return {
      summary: "Student discussed academic rigor...",
      keyPoints: ["High GPA", "AP courses", "Time management concerns"],
    };
  },
};

const workingMemory = new WorkingMemoryManager(sessionStore, {
  summarizer,
  windowSize: 16,  // Default: 16 turns
});

// Add turn
await workingMemory.addTurn(
  sessionId,
  turnNumber,
  "What GPA range do I need for MIT?",
  "Great question! For MIT, competitive applicants typically..."
);

// Get context bundle for LLM
const context = workingMemory.getContext(sessionId);
// {
//   recentTurns: [...],  // Last 16 turns
//   historySummaries: [  // Summaries of earlier conversation
//     {
//       startTurn: 1,
//       endTurn: 8,
//       summary: "Student discussed academic background...",
//       keyPoints: ["GPA: 3.9", "AP Calc BC", "Science interest"]
//     }
//   ],
//   totalTurns: 24
// }

// Get memory stats
const stats = workingMemory.getMemoryStats(sessionId);
// {
//   hotWindowSize: 16,
//   hotWindowCapacity: 16,
//   summaryCount: 2,
//   totalTurns: 24,
//   oldestSummarizedTurn: 1,
//   newestTurn: 24
// }
```

---

## Integration Example

**Complete memory layer integration in assessment agent:**

```typescript
import {
  EQMemoryManager,
  EvidenceMemoryManager,
  ResponseMemoryManager,
  StudentStateMemoryManager,
  WorkingMemoryManager,
} from "@ivylevel/memory";

// Initialize all memory managers
const eqMemory = new EQMemoryManager(sessionStore);
const evidenceMemory = new EvidenceMemoryManager(sessionStore);
const responseMemory = new ResponseMemoryManager(sessionStore);
const studentStateMemory = new StudentStateMemoryManager(sessionStore);
const workingMemory = new WorkingMemoryManager(sessionStore, { summarizer });

// During assessment turn
async function processTurn(sessionId: string, turnNumber: number, userMessage: string) {
  // 1. Get working memory context
  const context = workingMemory.getContext(sessionId);

  // 2. Get current EQ state
  const eq = eqMemory.getFull(sessionId);

  // 3. Get latest student state
  const studentState = studentStateMemory.latest(sessionId);

  // 4. Generate response using context
  const { reply, evidence, intent, framework, eqAdjustment, detectedState } =
    await generateResponse(context, eq, studentState, userMessage);

  // 5. Record evidence used
  evidenceMemory.addEvidence(sessionId, turnNumber, evidence);

  // 6. Record agent thought process
  responseMemory.addTurn(sessionId, {
    turn: turnNumber,
    intent,
    appliedFramework: framework,
    eqAdjustment,
    inferenceInputs: {
      kbChipsUsed: evidence.filter(e => e.sourceType === "kb_chip").map(e => e.id),
      ragPassagesUsed: evidence.filter(e => e.sourceType === "rag_passage").map(e => e.id),
    },
  });

  // 7. Update EQ memory
  if (eqAdjustment?.toneDelta) {
    eqMemory.updateTone(sessionId, eqAdjustment.toneDelta);
  }
  if (eqAdjustment?.rapportDelta) {
    eqMemory.updateRapport(sessionId, eqAdjustment.rapportDelta);
  }

  // 8. Record student state snapshot
  studentStateMemory.addSnapshot(sessionId, {
    turn: turnNumber,
    ...detectedState,
  });

  // 9. Add to working memory
  await workingMemory.addTurn(sessionId, turnNumber, userMessage, reply);

  return reply;
}
```

---

## Session Store Interface

All memory managers require a minimal session store:

```typescript
interface SessionStore {
  get(sessionId: string): any;
  update(sessionId: string, data: any): void;
}
```

Example implementation:

```typescript
class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, any> = new Map();

  get(sessionId: string): any {
    return this.sessions.get(sessionId);
  }

  update(sessionId: string, data: any): void {
    this.sessions.set(sessionId, data);
  }
}
```

---

## Architecture Principles

### 1. **Session-Scoped Only**
All memory resets after assessment session. No long-term persistence in Phase 1.

### 2. **Explicit State Management**
No magic drift. All updates are explicit method calls.

### 3. **Append-Only Structures**
Evidence and response trails use append-only pattern for auditability.

### 4. **Clamped Values**
All numeric values (tone, rapport, confidence) clamped to 0-1 range.

### 5. **Minimal Coupling**
Uses SessionStore interface to avoid tight coupling with storage implementation.

### 6. **Zero Hallucination**
Evidence memory provides complete transparency for all agent reasoning.

### 7. **Fidelity Measurement**
Response memory is the primary mechanism for measuring Jenny-likeness.

---

## Benefits

- **🎯 Surgical Memory**: Each module has a single, focused responsibility
- **🔍 Transparency**: Complete audit trail of evidence and reasoning
- **📊 Fidelity**: Can measure how well agent matches Jenny's style
- **🧠 Context Management**: Working memory prevents context overflow
- **💡 EQ Adaptation**: Real-time tone and rapport adjustment
- **📈 Student Phenotyping**: Track student's evolving state
- **⚡ Lightweight**: No database, session-scoped only
- **🔒 Type-Safe**: Full TypeScript coverage

---

## Testing

See `__tests__/` directory for comprehensive test suites:

```bash
npm test
```

---

## License

UNLICENSED - Internal IvyLevel use only
