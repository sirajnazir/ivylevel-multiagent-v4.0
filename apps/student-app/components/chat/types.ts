/**
 * types.ts
 *
 * Component 1 - Chat UI Wrapper Types
 *
 * Type definitions for the assessment chat system.
 */

export interface AssessmentMessage {
  id: string;
  role: "assistant" | "user" | "system";
  text: string;

  // EQ / Archetype metadata
  eqTone?: { label: string; warmth: number; strictness: number };
  archetype?: string;
  eqHints?: string;

  // RAG & evidence
  evidence?: string[];
  citations?: string[];

  // Internal
  createdAt: string;
}

export interface AssessmentChatState {
  messages: AssessmentMessage[];
  status: "idle" | "thinking" | "error";
  progress: number;
  stage: string;
  archetype: string;
  eqTone: {
    label: string;
    warmth: number;
    strictness: number;
  };
}

export interface SendMessagePayload {
  text: string;
  sessionId: string;
}

export interface AssessmentChatResponse {
  message: AssessmentMessage;
  progress: {
    progress: number;
    stage: string;
    description: string;
    milestone?: string;
  };
  archetype: string;
  eqTone: {
    label: string;
    warmth: number;
    strictness: number;
  };
}
