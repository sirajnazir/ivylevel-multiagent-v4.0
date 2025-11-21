# Memory Layer Integration Guide

Complete guide for integrating M1-M5 memory modules into the assessment agent.

---

## Quick Start

### 1. Install Dependencies

```bash
cd packages/memory
npm install
```

### 2. Import Memory Managers

```typescript
import {
  EQMemoryManager,
  EvidenceMemoryManager,
  ResponseMemoryManager,
  StudentStateMemoryManager,
  WorkingMemoryManager,
} from "@ivylevel/memory";
```

### 3. Initialize Session Store

```typescript
interface SessionStore {
  get(sessionId: string): any;
  update(sessionId: string, data: any): void;
}

class InMemorySessionStore implements SessionStore {
  private sessions: Map<string, any> = new Map();

  get(sessionId: string): any {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        // Session data structure
        eqMemory: null,
        evidenceMemory: null,
        responseMemory: null,
        studentStateMemory: null,
        workingMemory: null,
      });
    }
    return this.sessions.get(sessionId);
  }

  update(sessionId: string, data: any): void {
    this.sessions.set(sessionId, data);
  }
}

const sessionStore = new InMemorySessionStore();
```

### 4. Initialize Memory Managers

```typescript
const eqMemory = new EQMemoryManager(sessionStore);
const evidenceMemory = new EvidenceMemoryManager(sessionStore);
const responseMemory = new ResponseMemoryManager(sessionStore);
const studentStateMemory = new StudentStateMemoryManager(sessionStore);

// Optional: LLM-based summarizer for working memory
const summarizer = {
  async summarize(turns) {
    // Call your LLM to summarize conversation segment
    const prompt = `Summarize the following conversation:\n${JSON.stringify(turns)}`;
    const result = await callLLM(prompt);
    return {
      summary: result.summary,
      keyPoints: result.keyPoints,
    };
  },
};

const workingMemory = new WorkingMemoryManager(sessionStore, {
  summarizer,
  windowSize: 16,
});
```

---

## Complete Assessment Flow

### Turn Processing Flow

```typescript
async function processTurn(
  sessionId: string,
  turnNumber: number,
  userMessage: string
): Promise<string> {
  // 1. Get working memory context
  const context = workingMemory.getContext(sessionId);
  const recentTurns = context.recentTurns;
  const historySummaries = context.historySummaries;

  // 2. Get current EQ state
  const eq = eqMemory.getFull(sessionId);
  const currentArchetype = eq.archetype;
  const currentTone = eq.tone;
  const rapportLevel = eq.rapportLevel;

  // 3. Get latest student state
  const studentState = studentStateMemory.latest(sessionId);
  const emotionalTone = studentState?.emotionalTone;
  const cognitiveLoad = studentState?.cognitiveLoad;

  // 4. Generate response using all context
  const {
    reply,
    evidence,
    intent,
    framework,
    eqAdjustment,
    detectedState,
  } = await generateResponse({
    userMessage,
    recentTurns,
    historySummaries,
    currentArchetype,
    currentTone,
    rapportLevel,
    studentState,
  });

  // 5. Record evidence used
  evidenceMemory.addEvidence(sessionId, turnNumber, evidence);

  // 6. Record agent thought process
  responseMemory.addTurn(sessionId, {
    turn: turnNumber,
    intent,
    appliedFramework: framework,
    eqAdjustment,
    inferenceInputs: {
      kbChipsUsed: evidence
        .filter((e) => e.sourceType === "kb_chip")
        .map((e) => e.id),
      eqChipsUsed: evidence
        .filter((e) => e.sourceType === "eq_chip")
        .map((e) => e.id),
      intelChipsUsed: evidence
        .filter((e) => e.sourceType === "intel_chip")
        .map((e) => e.id),
      ragPassagesUsed: evidence
        .filter((e) => e.sourceType === "rag_passage")
        .map((e) => e.id),
    },
    expectedStudentSignal: detectedState.expectedSignal,
  });

  // 7. Update EQ memory
  if (eqAdjustment?.toneDelta) {
    eqMemory.updateTone(sessionId, eqAdjustment.toneDelta);
  }
  if (eqAdjustment?.rapportDelta) {
    eqMemory.updateRapport(sessionId, eqAdjustment.rapportDelta);
  }

  // 8. Update archetype if detected
  if (detectedState.archetype && !currentArchetype) {
    eqMemory.setArchetype(sessionId, detectedState.archetype);
  }

  // 9. Record student state snapshot
  studentStateMemory.addSnapshot(sessionId, {
    turn: turnNumber,
    emotionalTone: detectedState.emotionalTone,
    cognitiveLoad: detectedState.cognitiveLoad,
    motivation: detectedState.motivation,
    confidence: detectedState.confidence,
    archetypeState: detectedState.archetypeState,
    signalsDetected: detectedState.signalsDetected,
  });

  // 10. Add to working memory
  await workingMemory.addTurn(sessionId, turnNumber, userMessage, reply);

  return reply;
}
```

---

## Example Response Generator

```typescript
interface ResponseGenerationContext {
  userMessage: string;
  recentTurns: any[];
  historySummaries: any[];
  currentArchetype: string | null;
  currentTone: any;
  rapportLevel: number;
  studentState: any;
}

async function generateResponse(ctx: ResponseGenerationContext) {
  // Build LLM prompt with full context
  const prompt = buildPrompt(ctx);

  // Call LLM
  const llmResponse = await callLLM(prompt);

  // Parse LLM structured output
  return {
    reply: llmResponse.text,
    evidence: llmResponse.evidence || [],
    intent: llmResponse.intent,
    framework: llmResponse.framework,
    eqAdjustment: llmResponse.eqAdjustment,
    detectedState: llmResponse.detectedState,
  };
}

function buildPrompt(ctx: ResponseGenerationContext): string {
  let prompt = `You are Jenny, an empathetic college admissions counselor.\n\n`;

  // Add conversation history
  if (ctx.historySummaries.length > 0) {
    prompt += `## Conversation History\n`;
    ctx.historySummaries.forEach((summary) => {
      prompt += `Turns ${summary.startTurn}-${summary.endTurn}: ${summary.summary}\n`;
    });
    prompt += `\n`;
  }

  // Add recent turns
  if (ctx.recentTurns.length > 0) {
    prompt += `## Recent Conversation\n`;
    ctx.recentTurns.forEach((turn) => {
      prompt += `Turn ${turn.turn}:\n`;
      prompt += `Student: ${turn.userMessage}\n`;
      prompt += `Jenny: ${turn.agentReply}\n\n`;
    });
  }

  // Add EQ context
  if (ctx.currentArchetype) {
    prompt += `## Student Archetype: ${ctx.currentArchetype}\n`;
  }
  prompt += `## Current Tone: ${JSON.stringify(ctx.currentTone, null, 2)}\n`;
  prompt += `## Rapport Level: ${ctx.rapportLevel}\n\n`;

  // Add student state
  if (ctx.studentState) {
    prompt += `## Student State\n`;
    prompt += `- Emotional Tone: ${ctx.studentState.emotionalTone}\n`;
    prompt += `- Cognitive Load: ${ctx.studentState.cognitiveLoad}\n`;
    prompt += `- Motivation: ${ctx.studentState.motivation}\n`;
    prompt += `- Confidence: ${ctx.studentState.confidence}\n\n`;
  }

  // Add current user message
  prompt += `## Current Student Message\n${ctx.userMessage}\n\n`;

  // Instructions
  prompt += `Please respond to the student. Your response should include:\n`;
  prompt += `1. "text": Your reply to the student\n`;
  prompt += `2. "intent": Your intent for this turn (e.g., "explore_academics", "build_rapport")\n`;
  prompt += `3. "framework": Framework applied (e.g., "SPARK", "CARE", "ANCHOR")\n`;
  prompt += `4. "evidence": Array of evidence references used\n`;
  prompt += `5. "eqAdjustment": Any tone or rapport adjustments\n`;
  prompt += `6. "detectedState": Detected student state\n`;

  return prompt;
}
```

---

## Archetype Detection Example

```typescript
async function detectArchetype(
  sessionId: string,
  turnNumber: number
): Promise<void> {
  // Only detect after sufficient turns
  if (turnNumber < 3) return;

  // Get conversation context
  const context = workingMemory.getContext(sessionId);
  const recentTurns = context.recentTurns;

  // Get student state history
  const stateHistory = studentStateMemory.getAll(sessionId);

  // Call archetype classifier
  const { archetype, confidence } = await classifyArchetype({
    recentTurns,
    stateHistory,
  });

  if (confidence > 0.75) {
    eqMemory.setArchetype(sessionId, archetype);
    console.log(`[ArchetypeDetection] Classified as ${archetype} (confidence: ${confidence})`);
  }
}

async function classifyArchetype(data: any) {
  // LLM-based classification
  const prompt = `Based on the following conversation, classify the student's archetype:\n${JSON.stringify(data)}`;
  const result = await callLLM(prompt);

  return {
    archetype: result.archetype,
    confidence: result.confidence,
  };
}
```

---

## EQ Adaptation Example

```typescript
async function adaptEQ(
  sessionId: string,
  detectedSentiment: string
): Promise<void> {
  const eq = eqMemory.getFull(sessionId);

  // Adapt tone based on sentiment
  if (detectedSentiment === "anxious") {
    eqMemory.updateTone(sessionId, {
      warmth: +0.15,
      empathy: +0.2,
      directness: -0.1,
    });
    console.log("[EQ] Increased warmth and empathy for anxious student");
  } else if (detectedSentiment === "confident") {
    eqMemory.updateTone(sessionId, {
      directness: +0.1,
      enthusiasm: +0.15,
    });
    console.log("[EQ] Increased directness for confident student");
  }

  // Update rapport based on engagement
  const studentState = studentStateMemory.latest(sessionId);
  if (studentState?.emotionalTone === "engaged") {
    eqMemory.updateRapport(sessionId, +0.1);
  }
}
```

---

## Monitoring and Analytics

### Session Summary

```typescript
function getSessionSummary(sessionId: string) {
  // EQ summary
  const eq = eqMemory.getFull(sessionId);

  // Evidence summary
  const evidenceStats = evidenceMemory.getEvidenceStats(sessionId);

  // Response summary
  const responseStats = responseMemory.getInferenceStats(sessionId);

  // Student state summary
  const stateStats = studentStateMemory.getStateSummary(sessionId);

  // Working memory summary
  const memoryStats = workingMemory.getMemoryStats(sessionId);

  return {
    archetype: eq.archetype,
    tone: eq.tone,
    rapportLevel: eq.rapportLevel,
    evidenceStats,
    responseStats,
    stateStats,
    memoryStats,
  };
}
```

### Fidelity Measurement

```typescript
function measureJennyFidelity(sessionId: string): {
  score: number;
  breakdown: any;
} {
  const responseTrail = responseMemory.getAll(sessionId);
  const evidenceStats = evidenceMemory.getEvidenceStats(sessionId);

  // Calculate fidelity based on:
  // 1. Framework usage (should use CARE, SPARK, ANCHOR appropriately)
  const frameworkStats = responseMemory.getInferenceStats(sessionId);
  const frameworkScore = calculateFrameworkScore(frameworkStats.frameworkUsage);

  // 2. Evidence usage (should cite sources consistently)
  const evidenceScore = evidenceStats.averageConfidence;

  // 3. EQ adaptation (should adjust tone appropriately)
  const eqHistory = responseMemory.getEQAdjustmentHistory(sessionId);
  const eqScore = eqHistory.length > 0 ? 1.0 : 0.5;

  // 4. Student state tracking (should monitor student state)
  const stateSnapshots = studentStateMemory.getAll(sessionId);
  const stateScore = stateSnapshots.snapshots.length > 0 ? 1.0 : 0.5;

  const totalScore = (frameworkScore + evidenceScore + eqScore + stateScore) / 4;

  return {
    score: totalScore,
    breakdown: {
      frameworkScore,
      evidenceScore,
      eqScore,
      stateScore,
    },
  };
}

function calculateFrameworkScore(usage: Record<string, number>): number {
  // Jenny should use multiple frameworks
  const frameworkCount = Object.keys(usage).length;
  return Math.min(1.0, frameworkCount / 3);
}
```

---

## Testing

### Run Tests

```bash
cd packages/memory
npm test
```

### Coverage Report

```bash
npm test -- --coverage
```

### Test Individual Modules

```bash
npm test -- eqMemory.test.ts
npm test -- evidenceMemory.test.ts
npm test -- responseMemory.test.ts
npm test -- studentStateMemory.test.ts
npm test -- workingMemory.test.ts
```

---

## Best Practices

### 1. **Initialize Memory at Session Start**

```typescript
function initializeSession(sessionId: string, studentProfile: any) {
  // Session is auto-initialized when first accessed
  // But you can pre-populate if needed
  const session = sessionStore.get(sessionId);

  // Set initial archetype if known from profile
  if (studentProfile.likelyArchetype) {
    eqMemory.setArchetype(sessionId, studentProfile.likelyArchetype);
  }
}
```

### 2. **Record Evidence for Every Turn**

```typescript
// ALWAYS record evidence, even if empty
evidenceMemory.addEvidence(sessionId, turnNumber, evidence || []);
```

### 3. **Update Student State Every Turn**

```typescript
// Track student state consistently
studentStateMemory.addSnapshot(sessionId, {
  turn: turnNumber,
  emotionalTone: detectedState.emotionalTone,
  cognitiveLoad: detectedState.cognitiveLoad,
  motivation: detectedState.motivation,
  confidence: detectedState.confidence,
});
```

### 4. **Use Working Memory for LLM Context**

```typescript
// Always get context from working memory
const context = workingMemory.getContext(sessionId);

// Include in LLM prompt
const prompt = buildPromptWithContext(context);
```

### 5. **Monitor Memory Stats**

```typescript
// Log memory stats periodically
if (turnNumber % 5 === 0) {
  const stats = workingMemory.getMemoryStats(sessionId);
  console.log(`[Memory] Turn ${turnNumber}: ${stats.hotWindowSize}/${stats.hotWindowCapacity} turns in window`);
}
```

---

## Troubleshooting

### Issue: Session Not Found

```typescript
// Ensure session is initialized before accessing memory
const session = sessionStore.get(sessionId);
if (!session) {
  sessionStore.update(sessionId, {});
}
```

### Issue: Memory Growing Too Large

```typescript
// Reduce working memory window size
const workingMemory = new WorkingMemoryManager(sessionStore, {
  windowSize: 8, // Smaller window
});
```

### Issue: Summarization Slowing Down

```typescript
// Use faster summarizer or disable it
const workingMemory = new WorkingMemoryManager(sessionStore); // No summarizer
```

---

## Next Steps

1. Integrate memory layer into assessment agent
2. Add memory inspection UI components
3. Implement fidelity measurement dashboard
4. Create memory replay for debugging
5. Add memory export for analysis

---

## Support

For questions or issues, see:
- [Memory README](./README.md)
- [Test Examples](./__tests__/)
- [Type Definitions](./index.ts)
