Siraj… alright, this is the big one.
The **Multi-Agent Runtime Spec** is the literal *heart* of v4.0 — the part that makes your Assessment Twin, Planning Agent, Execution Agent, EQ Agent, and future Digital Twins actually behave like a coordinated brain instead of a collection of confused LLMs yelling into the void.

This spec is written neutral and machine-safe.
Save it as:

```
/docs/specs/MultiAgentRuntime_v1.0.md
```

Here we go.

---

# ⭐ **IVYLEVEL v4.0 — MULTI-AGENT RUNTIME SPEC (v1.0)**

**Module:** `/packages/orchestrator`
**Audience:** Senior Engineers, AI Coding Agents, Platform Architects
**Status:** Baseline Spec (required before any implementation)

---

# 1. PURPOSE

The Multi-Agent Runtime is responsible for:

1. **Coordinating all agents**
   (Assessment Agent, Planning Agent, Execution Agent, EQ Agent, Oracles Adapter Agents)

2. **Executing task graphs**
   Declarative flow graphs representing each agent’s reasoning pipeline.

3. **Managing state** across phases of work.

4. **Handling inter-agent communication**
   (messages, requests, shared memory, arbitration).

5. **Model routing & tool-calling orchestration**
   (OpenAI Tools, structured outputs, function calls).

6. **Evaluating outputs**
   via validation, guardrails, scoring, error handling.

7. **Maintaining deterministic behavior**
   through schemas, constraints, and logs.

This spec defines how the runtime works, how agents plug into it, and what guarantees are provided.

---

# 2. DIRECTORY STRUCTURE

```
/packages/orchestrator
  ├── router/
  │    ├── agentRouter.ts
  │    ├── messageRouter.ts
  │    └── toolRouter.ts
  │
  ├── state/
  │    ├── stateManager.ts
  │    ├── memoryAdapter.ts
  │    └── runtimeContext.ts
  │
  ├── task-graph/
  │    ├── graphEngine.ts
  │    ├── graphTypes.ts
  │    ├── graphValidator.ts
  │    └── graphLibrary/
  │         ├── assessment.graph.ts
  │         ├── planning.graph.ts
  │         ├── execution.graph.ts
  │         └── eq.graph.ts
  │
  ├── registry/
  │    ├── agentRegistry.ts
  │    └── capabilitiesRegistry.ts
  │
  ├── evaluators/
  │    ├── guardrails.ts
  │    ├── outputValidators.ts
  │    ├── scoring.ts
  │    └── consistencyChecks.ts
  │
  ├── adapters/
  │    ├── v3-oracle-adapter.ts
  │    ├── openai-adapter.ts
  │    ├── cohere-adapter.ts
  │    ├── pinecone-adapter.ts
  │    └── cache-adapter.ts
  │
  └── tests/
```

---

# 3. CORE DESIGN PRINCIPLES

1. **Agents cannot call each other directly**
   All communication flows through the runtime.

2. **Agents are stateless functions**
   State exists only in:

   * runtime context
   * memory layer
   * database
   * Redis (ephemeral)

3. **Task Graphs drive behavior**
   Each agent defines a declarative flow.

4. **Deterministic I/O**
   Inputs + outputs must match schemas.

5. **Tool calling is controlled**
   Tools must be explicitly declared.

6. **Inter-agent communication is message-based**
   No direct function imports.

7. **Every step is logged + traceable**
   OTel → Grafana.

8. **Runtime can interrupt or re-route**
   Based on guardrail scores.

---

# 4. RUNTIME COMPONENTS

---

## 4.1 Agent Registry

**File:** `/packages/orchestrator/registry/agentRegistry.ts`

Registers all v4.0 agents with:

* agent_id
* version
* capabilities
* input schema
* output schema
* task graph
* tool list
* model settings (OpenAI config)

### Example entry:

```ts
{
  id: "assessment-agent",
  version: "1.0.0",
  graph: assessmentGraph,
  inputSchema: AssessmentInput_v1,
  outputSchema: AssessmentOutput_v1,
  tools: ["extract", "summarize", "diagnose", "narrativeBuild"],
  model: "gpt-4o-mini",
}
```

---

## 4.2 Task Graph Engine

**File:** `/packages/orchestrator/task-graph/graphEngine.ts`

The **task graph** is the declarative heart of each agent.

### Node Format:

```ts
{
  id: "extract_profile",
  action: "llm_call" | "tool_call" | "oracle_call" | "aggregate" | "branch",
  input: SchemaRef,
  output: SchemaRef,
  transitions: [{ condition, next }],
}
```

### Graph Execution:

The runtime performs:

1. Validate graph
2. Initialize runtime context
3. Execute node
4. Run validation
5. Determine next node
6. Continue until terminal node
7. Return output schema object

Task graphs **guarantee**:

* predictable flow
* no circular dependencies
* no rogue steps

---

## 4.3 Router Layer

### 1. **Agent Router**

Decides which agent handles requests:

```
/router/agentRouter.ts
```

Used when:

* UI triggers agent
* another agent sends a message
* scheduled action starts

### 2. **Message Router**

For inter-agent messaging:

```
/router/messageRouter.ts
```

Packets:

```
{
  sender: agent_id
  recipient: agent_id
  body: object
  timestamp: ISO
}
```

### 3. **Tool Router**

Handles tool invocation:

```
/router/toolRouter.ts
```

Allowed tools include:

* v3 oracles
* facts extraction tools
* knowledge retrieval
* narrative templates
* pinecone search
* cohere rerank

All tools are declared in advance.

---

## 4.4 State Manager

**File:** `/state/stateManager.ts`

Responsible for:

* runtime context
* working memory
* temporary variables
* phase tracking
* agent-scoped data

State is stored:

* in-memory (ephemeral)
* Redis (cross-step)
* Postgres (final outputs)

---

# 5. SHARED MEMORY MODEL

Memory types:

### 1. **Working Memory**

Ephemeral, per execution.
Example:

* extracted facts
* intermediate narratives

### 2. **Shared Memory**

Cross-agent.
Stored in Redis.

Example:

* assessment summary
* risk flags
* parent persona

### 3. **Semantic Memory**

Stored in Pinecone.
Example:

* coach exemplars
* past assessments

### 4. **Episodic Memory**

Stored in Postgres.
Long-term facts.

---

# 6. AGENT EXECUTION FLOW

```
API Request
   ↓
AgentRouter.selectAgent()
   ↓
Load Task Graph
   ↓
Initialize RuntimeContext
   ↓
Execute Node:
    - LLM call
    - Oracle call
    - Tool call
    - Aggregate
    - Branch
   ↓
Validate output schema
   ↓
Transition rules select next node
   ↓
Repeat
   ↓
Return Agent Output Schema
   ↓
StateManager.commit()
```

Agents **must not** mutate state directly.

---

# 7. INTER-AGENT COMMUNICATION

Agents communicate via:

```
/router/messageRouter
```

Message contract:

```
type AgentMessage = {
  sender: AgentID
  recipient: AgentID
  payload: any
  context: RuntimeContext
  correlationId: string
};
```

### Allowed:

* Assessment → Planning
* Planning → Execution
* Assessment → EQ Agent
* Execution → Planning

### Forbidden:

* Cross-calls bypassing runtime
* Arbitrary imports between agents

---

# 8. EXTERNAL INTEGRATIONS (3P)

Handled through adapters:

* OpenAI → `/adapters/openai-adapter.ts`
* Cohere → `/adapters/cohere-adapter.ts`
* Pinecone → `/adapters/pinecone-adapter.ts`
* AssemblyAI → `/adapters/transcript-adapter.ts`
* Zapier/Google Calendar → `/adapters/3p`

All calls must pass through toolRouter.

---

# 9. EVALUATORS (GUARDRAILS)

Before and after each node, evaluators run:

* schema validator
* consistency checker
* safety evaluator
* narrative quality scorer
* hallucination detector
* missing-field guardrail

If evaluator fails:

* runtime halts
* returns structured error

---

# 10. OUTPUT GUARANTEES

Every agent must output exactly:

1. **Schema-defined object**
2. **Version metadata**
3. **Confidence score**
4. **Execution trace ID**

No free-form LLM output permitted.

---

# 11. ERROR MODEL

Errors must be structured:

```
{
  error: {
    code,
    message,
    detail,
    node,
    agent,
    graph,
    traceId
  }
}
```

Runtime never returns raw LLM errors.

---

# 12. VERSIONING

### Runtime Versions:

* `v1.0.0` — baseline
* `v1.1.x` — improved scheduler
* `v2.0.0` — distributed agents
* `v3.0.0` — coach-specific personality routing

Each agent declares required runtime version.

---

# 13. IMPLEMENTATION PHASES

### **Phase 1: Skeleton**

* agent registry
* state manager
* toolRouter
* basic graph engine

### **Phase 2: Minimal Task Graph**

* assessment graph
* oracle adapters
* validation

### **Phase 3: Messaging + Shared Memory**

* inter-agent messages
* Redis integration

### **Phase 4: Full Runtime**

* evaluator layer
* trace + safety
* 3P adapters

### **Phase 5: Optimization**

* model routing
* parallel execution
* coach-specific personality loading

---

# ⭐ **Multi-Agent Runtime Spec v1.0 COMPLETE**

This is the runtime contract Claude and others MUST follow.

Next options if you want to continue tightening the architecture:

* **Assessment Agent State Machine Spec**
* **Planning Agent Spec**
* **Execution Agent Spec**
* **Knowledge Layer Spec**
* **Task Graph DSL Spec**
* **Tracing + Observability Spec**

Tell me which one you want next.
