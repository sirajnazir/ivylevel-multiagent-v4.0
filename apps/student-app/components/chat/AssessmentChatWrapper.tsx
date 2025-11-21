/**
 * AssessmentChatWrapper.tsx
 *
 * Component 1 - Main Chat Wrapper
 *
 * This is the root component that:
 * - Wraps the chat UI (using OpenAI's ChatUI SDK or custom implementation)
 * - Injects progress state
 * - Decorates messages with evidence, citations, EQ hints
 * - Displays archetype and EQ tone metadata
 * - Provides lifecycle hooks for simulation mode
 */

"use client";

import React, { useState } from "react";
import { useAssessmentAgent } from "../../hooks/useAssessmentAgent";
import { MessageDecorator } from "./MessageDecorator";
import "../../styles/chat.css";

export interface AssessmentChatWrapperProps {
  sessionId: string;
  showDebugPanel?: boolean;
}

export default function AssessmentChatWrapper({
  sessionId,
  showDebugPanel = false,
}: AssessmentChatWrapperProps): React.ReactElement {
  const {
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
  } = useAssessmentAgent(sessionId);

  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    await sendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="assessment-chat-container">
      {/* Header with progress */}
      <div className="assessment-chat-header">
        <div className="assessment-header-content">
          <h2>Assessment Session</h2>
          <div className="assessment-stage-info">
            <span className="assessment-stage-label">{stage.toUpperCase()}</span>
            <span className="assessment-stage-description">{stageDescription}</span>
          </div>
        </div>

        <div className="assessment-progress-bar">
          <div
            className="assessment-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="assessment-error-banner">
          <span>⚠️ {error.message}</span>
          <button onClick={clearError} className="assessment-error-dismiss">
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="assessment-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`assessment-message-wrapper assessment-message-${message.role}`}
          >
            <MessageDecorator message={message} />
          </div>
        ))}

        {/* Loading indicator */}
        {status === "thinking" && (
          <div className="assessment-message-wrapper assessment-message-assistant">
            <div className="assessment-message-loading">
              <div className="assessment-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="assessment-typing-text">Jenny is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="assessment-chat-input-container">
        <textarea
          className="assessment-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={status === "thinking"}
          rows={3}
        />
        <button
          className="assessment-chat-send-button"
          onClick={handleSend}
          disabled={status === "thinking" || !input.trim()}
        >
          {status === "thinking" ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Debug panel (optional) */}
      {showDebugPanel && (
        <div className="assessment-debug-panel">
          <h4>Debug Info</h4>
          <div className="assessment-debug-row">
            <span className="assessment-debug-label">Archetype:</span>
            <span className="assessment-debug-value">{archetype || "Not detected"}</span>
          </div>
          <div className="assessment-debug-row">
            <span className="assessment-debug-label">EQ Tone:</span>
            <span className="assessment-debug-value">{eqTone.label}</span>
          </div>
          <div className="assessment-debug-row">
            <span className="assessment-debug-label">Warmth:</span>
            <span className="assessment-debug-value">{(eqTone.warmth * 100).toFixed(0)}%</span>
          </div>
          <div className="assessment-debug-row">
            <span className="assessment-debug-label">Strictness:</span>
            <span className="assessment-debug-value">{(eqTone.strictness * 100).toFixed(0)}%</span>
          </div>
          <div className="assessment-debug-row">
            <span className="assessment-debug-label">Progress:</span>
            <span className="assessment-debug-value">{progress}%</span>
          </div>
          <div className="assessment-debug-row">
            <span className="assessment-debug-label">Stage:</span>
            <span className="assessment-debug-value">{stage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
