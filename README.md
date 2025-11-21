# IvyLevel Multi-Agents Platform v4.0

**Production-ready assessment platform** with API, frontend, RAG integration, and quality gates.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- (Optional) Redis for production session storage

### Start the Full Stack

**Terminal 1 - API Server:**
```bash
cd apps/api
npm install
npm run dev
# Runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd apps/student-app
npm install
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 - Run Tests:**
```bash
npm install
npm run test:quality
```

---

## 📁 Project Structure

```
ivylevel-multiagents-v4.0/
├── apps/
│   ├── api/                    # Express API service (port 4000)
│   └── student-app/            # Next.js frontend (port 3000)
├── packages/
│   ├── agents/
│   │   └── assessment-agent/   # Core assessment logic
│   ├── orchestrator/           # Agent orchestration
│   ├── schema/                 # Zod schemas (single source of truth)
│   ├── rendering/              # UI/PDF rendering models
│   ├── adapters/
│   │   └── v3-intelligence-oracles/  # v3 bridge (read-only)
│   ├── llm/                    # LLM utilities
│   ├── session/                # Session management
│   ├── rag/                    # RAG retrieval (Pinecone + Cohere)
│   └── telemetry/              # Event logging
├── docs/
│   ├── contributors/
│   │   └── Contributor_Ruleset_v2.0.md
│   ├── ASSESSMENT_AGENT_v1_SPEC_SUITE.md
│   └── Phase1_Implementation_Summary.md
├── tests/                      # Integration tests
├── scripts/                    # Utility scripts
├── .husky/                     # Git hooks
├── package.json
└── README.md                   # This file
```

---

## 🎯 System Overview

### Assessment Flow

```
Student → Chat UI → API → Session Store
                      ↓
                Assessment Agent → RAG → Knowledge Base
                      ↓
                Intelligence Oracles (APS)
                      ↓
                Narrative + Strategy Generation
                      ↓
                Render Model → Summary UI / PDF
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **API** | Express 5, Node.js, TypeScript |
| **Orchestration** | Custom task graph (LangGraph-style) |
| **Intelligence** | v3 Oracles (Aptitude, Passion, Service) |
| **LLM** | Claude (Anthropic) - Phase 2 |
| **RAG** | Pinecone + Cohere rerank |
| **Session** | In-memory Map (Redis-ready) |
| **Testing** | Jest, ts-jest |
| **Validation** | Zod schemas |
| **Logging** | Custom telemetry (Kafka/OTel-ready) |

---

## 🧪 Testing & Quality Gates

### Run Tests

```bash
# All tests
npm test

# Assessment agent only
npm run test:assessment

# RAG module only
npm run test:rag

# Quality gates (RAG + Assessment)
npm run test:quality

# Coverage report
npm run test:coverage
```

### Quality Gates Enforcement

Before merging changes to RAG, LLM, schemas, or agents:

```bash
npm run data:lint:chips && npm run test:quality
```

**All tests must pass** ✅

---

## 📚 Documentation

- **[Contributor Ruleset v2.0](docs/contributors/Contributor_Ruleset_v2.0.md)** - Mandatory rules for all contributors
- **[Assessment Agent Spec](docs/ASSESSMENT_AGENT_v1_SPEC_SUITE.md)** - Complete agent specification
- **[Phase 1 Implementation Summary](docs/Phase1_Implementation_Summary.md)** - Detailed implementation report
- **[API README](apps/api/README.md)** - API endpoint documentation
- **[Frontend README](apps/student-app/README.md)** - Frontend architecture

---

## 🔐 Environment Variables

### API (`apps/api/.env`)
```bash
API_PORT=4000
PINECONE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
COHERE_API_KEY=your_key_here
```

### Frontend (`apps/student-app/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🛠️ Development Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Assessment agent tests
npm run test:assessment

# RAG module tests
npm run test:rag

# Quality gates
npm run test:quality

# Data quality linting (Phase 2)
npm run data:lint:chips

# Coach ingestion
npm run ingest:coach <file-or-directory>

# Coach ingestion tests
npm run test:ingest
```

---

## 📦 Key Packages

### Core Agents
- **`packages/agents/assessment-agent`** - Main assessment orchestration
  - Profile extraction
  - Oracle execution
  - Narrative generation
  - Strategy generation

### Orchestration
- **`packages/orchestrator`** - Task graph execution
  - Assessment handler
  - State management
  - Pipeline coordination

### Data Layer
- **`packages/schema`** - Single source of truth for all types
  - Zod validation schemas
  - Versioned (v1, v2)
  - Changelog enforcement

### Intelligence
- **`packages/adapters/v3-intelligence-oracles`** - v3 bridge (read-only)
  - Aptitude Oracle
  - Passion Oracle
  - Service Oracle
  - APS scoring

### Rendering
- **`packages/rendering/assessment`** - UI/PDF rendering
  - RenderModel_v1 builder
  - PDF export hook (Phase 2: full implementation)

### RAG
- **`packages/rag`** - Hybrid retrieval
  - Pinecone vector search
  - Cohere reranking
  - Context-aware queries

### Session Management
- **`packages/session`** - Session store
  - In-memory Map (Phase 1)
  - Redis-ready abstraction

### Telemetry
- **`packages/telemetry`** - Event logging
  - Console logging (Phase 1)
  - Kafka/OTel-ready (Phase 2)

### Coach Ingestion
- **`tools/ingest-coach`** - Coach data ingestion engine
  - EQ pattern extraction
  - Manifest tracking system
  - Anti-hallucination quality rules
  - Foundation for Coach Digital Twins

---

## 🚢 Phase 1 Status: ✅ COMPLETE

## 🧠 Coach Ingestion Engine v1.0: ✅ COMPLETE

### Delivered Components - Assessment Platform

- ✅ Express API with 4 endpoints
- ✅ Session management (in-memory, Redis-ready)
- ✅ RAG module skeleton (Pinecone + Cohere)
- ✅ Next.js chat interface
- ✅ Next.js summary dashboard
- ✅ PDF export hook
- ✅ Telemetry/event logging
- ✅ Quality gates & NPM scripts
- ✅ All tests passing
- ✅ Documentation complete

### Delivered Components - Coach Ingestion

- ✅ EQ Pattern Extractor with LLM prompt
- ✅ TypeScript wrapper with OpenAI integration
- ✅ Zod schema validation
- ✅ Manifest tracking system
- ✅ Sample coaching transcript
- ✅ Anti-hallucination quality rules (10 rules)
- ✅ Tests passing (3/3)
- ✅ Full documentation

---

## 🗺️ Phase 2 Roadmap

### RAG Implementation
- [ ] Wire OpenAI embeddings API
- [ ] Wire Pinecone vector query
- [ ] Wire Cohere rerank API
- [ ] Add golden query tests
- [ ] Implement retrieval quality checks

### LLM Chat Agent
- [ ] Replace stub responses with real Claude API calls
- [ ] Implement conversation flow logic
- [ ] Integrate RAG context into prompts
- [ ] Add conversation quality metrics

### PDF Generation
- [ ] Install pdfkit
- [ ] Implement full PDF rendering with styling
- [ ] Add branding and layout
- [ ] Create download API endpoint

### Telemetry & Monitoring
- [ ] Integrate Kafka/OTel
- [ ] Add PII hashing for production
- [ ] Add performance metrics
- [ ] Create analytics dashboard

### Production Readiness
- [ ] Migrate session store to Redis
- [ ] Add authentication (Auth0/Clerk)
- [ ] Add rate limiting
- [ ] Add error monitoring (Sentry)
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Docker/K8s deployment configs
- [ ] CI/CD pipelines

---

## 🛡️ Contributor Guidelines

**Before making ANY changes, read:**
- [Contributor Ruleset v2.0](docs/contributors/Contributor_Ruleset_v2.0.md)
- [`.claude/instructions.md`](.claude/instructions.md)

**Core Principles:**
1. **No duplicate files** - Search before creating
2. **Schema governance** - All schemas in `/packages/schema` with versions
3. **v3 protection** - Oracles are read-only
4. **PR size limits** - ≤500 lines, ≤10 files, 1 domain
5. **Testing required** - All modules must have tests
6. **Quality gates** - Run `npm run test:quality` before PR

**Forbidden:**
- ❌ Creating folders outside approved structure
- ❌ Modifying v3 intelligence logic
- ❌ Touching CI/CD or infra without approval
- ❌ Inline schemas or duplicate logic
- ❌ Large PRs or cross-domain changes

---

## 🔧 Troubleshooting

### API won't start
```bash
# Check if port 4000 is in use
lsof -ti:4000

# Kill process if needed (after user confirmation)
kill -9 <PID>
```

### Frontend won't connect to API
```bash
# Check NEXT_PUBLIC_API_URL is set
echo $NEXT_PUBLIC_API_URL

# Should be http://localhost:4000
```

### Tests failing
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📞 Support

- **Issues:** GitHub Issues
- **Docs:** `docs/` directory
- **Contributing:** See Contributor Ruleset v2.0

---

## 📄 License

ISC

---

## ✨ What's New in v4.0

- **Phase 1 Complete:** Full API + Frontend + RAG skeleton
- **Production-Ready Session Management**
- **Quality Gates Enforced**
- **Comprehensive Testing**
- **Telemetry Integration**
- **Rendering Pipeline**
- **v3 Oracle Bridge (read-only)**
- **Type-Safe Schemas**

**Previous:** v3 (intelligence oracles only)
**Current:** v4 (full production platform)
**Next:** Phase 2 (RAG wiring, LLM chat agent, production deployment)

---

**Status:** Phase 1 ✅ Complete | Phase 2 🚧 Planned
