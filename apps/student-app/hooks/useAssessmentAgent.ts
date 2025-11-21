/**
 * useAssessmentAgent.ts
 *
 * Component 1 - Core Assessment Agent Hook
 *
 * This is the main hook that manages:
 * - Message history
 * - Sending messages to the backend
 * - Receiving responses with EQ/archetype metadata
 * - Progress tracking
 * - Real-time state sync
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { AssessmentMessage, AssessmentChatResponse } from "../components/chat/types";

export interface UseAssessmentAgentResult {
  messages: AssessmentMessage[];
  sendMessage: (text: string) => Promise<void>;
  status: "idle" | "thinking" | "error";
  progress: number;
  stage: string;
  stageDescription: string;
  archetype: string;
  eqTone: {
    label: string;
    warmth: number;
    strictness: number;
  };
  error: Error | null;
  clearError: () => void;
}

export function useAssessmentAgent(sessionId: string): UseAssessmentAgentResult {
  const [messages, setMessages] = useState<AssessmentMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "thinking" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [stageDescription, setStageDescription] = useState("");
  const [archetype, setArchetype] = useState("");
  const [eqTone, setEqTone] = useState({
    label: "warm",
    warmth: 0.8,
    strictness: 0.2,
  });
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load initial session state
   */
  const loadSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessment/${sessionId}/state`);

      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform messages to match AssessmentMessage type
      const transformedMessages = (data.messages || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role === "student" ? "user" : msg.role,
        text: msg.content,
        createdAt: msg.timestamp,
      }));

      setMessages(transformedMessages);
      setProgress(data.progress || 0);
      setStage(data.stage || "intake");
      setStageDescription(data.stageDescription || "Getting started...");
      setArchetype(data.archetype || "");
      setEqTone(data.eqTone || { label: "warm", warmth: 0.8, strictness: 0.2 });
    } catch (err) {
      console.error("[useAssessmentAgent] Failed to load session:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus("error");
    }
  }, [sessionId]);

  /**
   * Send message to agent
   */
  const sendMessage = useCallback(
    async (text: string) => {
      setStatus("thinking");
      setError(null);

      // Add user message immediately
      const userMessage: AssessmentMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const response = await fetch(`/api/assessment/${sessionId}/message`, {
          method: "POST",
          body: JSON.stringify({ text }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const data: AssessmentChatResponse = await response.json();

        // Add assistant message
        const assistantMessage: AssessmentMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.message,
          createdAt: data.timestamp,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Reload session state to get updated progress/archetype/eqTone
        await loadSession();

        setStatus("idle");
      } catch (err) {
        console.error("[useAssessmentAgent] Failed to send message:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus("error");

        // Remove the optimistically added user message on error
        setMessages((prev) => prev.slice(0, -1));
      }
    },
    [sessionId, loadSession]
  );

  const clearError = useCallback(() => {
    setError(null);
    setStatus("idle");
  }, []);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    messages,
    sendMessage,
    status,
    progress,
    stage,
    stageDescription,
    archetype,
    eqTone,
    error,
    clearError,
  };
}
