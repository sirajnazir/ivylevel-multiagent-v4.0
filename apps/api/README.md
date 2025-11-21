# IvyLevel Assessment API

Express-based REST API for the IvyLevel Assessment Platform v4.0.

## Quick Start

```bash
npm install
npm run dev
```

Server runs on **http://localhost:4000**

## API Endpoints

### POST /assessment/start

Start a new assessment session.

**Request:**
```json
{
  "studentId": "string",
  "studentName": "string (optional)",
  "intakeId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid"
  }
}
```

---

### POST /assessment/message

Send a student message and receive agent reply.

**Request:**
```json
{
  "sessionId": "uuid",
  "message": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "agentMessage": "string"
  }
}
```

---

### POST /assessment/complete

Complete the assessment and generate outputs.

**Request:**
```json
{
  "sessionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "assessmentOutput": { /* AssessmentOutput_v2 */ },
    "renderModel": { /* RenderModel_v1 */ }
  }
}
```

---

### GET /assessment/:sessionId

Retrieve session data.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "studentId": "string",
    "messages": [...],
    "status": "active | completed",
    "assessmentOutput": { /* if completed */ },
    "renderModel": { /* if completed */ }
  }
}
```

---

## Environment Variables

Create a `.env` file in the API root:

```bash
API_PORT=4000
PINECONE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
COHERE_API_KEY=your_key_here
```

## Architecture

- **Server:** `src/server.ts`
- **Routes:** `src/routes/assessment.ts`
- **Types:** `src/types.ts`

### Dependencies

- **Orchestrator:** `packages/orchestrator/handlers/assessmentHandler.ts`
- **Session Store:** `packages/session/assessmentSessionStore.ts`
- **Rendering:** `packages/rendering/assessment/`
- **Telemetry:** `packages/telemetry/events.ts`

## Development

```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Telemetry

The API logs events for:
- Session starts
- Messages sent
- Session completions

Events are logged to console in Phase 1. Phase 2 will integrate with external telemetry services.

## Next Steps

1. Wire real LLM chat agent (currently uses stub echo responses)
2. Integrate RAG context into chat agent prompts
3. Add authentication/authorization
4. Add rate limiting
5. Add API documentation (OpenAPI/Swagger)
