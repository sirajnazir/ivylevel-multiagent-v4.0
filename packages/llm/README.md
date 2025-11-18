# LLM Package

Centralized Claude API client for all IvyLevel agents.

## Purpose

Provides a unified interface for:
- Claude API calls with retry logic
- Prompt loading and context building
- Token usage tracking
- Error handling and logging
- Health checks

## Model

**Production Model:** `claude-3-5-sonnet-20241022`

## Usage

```typescript
import { runLLMExtraction } from '@ivylevel/llm';

const result = await runLLMExtraction({
  rawMessages: conversationHistory,
  transcriptText: fullTranscript,
  maxRetries: 1,
  temperature: 0.3,
});
```

## Features

- **Retry Logic**: Automatic retry with exponential backoff (max 1 retry)
- **Token Tracking**: Logs input/output token usage
- **Schema Validation**: Input validation before API calls
- **Error Handling**: Robust error messages and logging
- **Stub Mode**: Mock responses for testing without API calls

## Configuration

Set environment variables (future):
- `ANTHROPIC_API_KEY`: Your Claude API key
- `LLM_TIMEOUT`: Request timeout in ms (default: 30000)
- `LLM_MAX_RETRIES`: Maximum retry attempts (default: 1)

## Architecture

- **anthropicClient.ts**: Core Claude API wrapper
- **index.ts**: Public API exports
- Future: Additional LLM providers (OpenAI, Cohere, etc.)
