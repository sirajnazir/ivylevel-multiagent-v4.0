/**
 * MessageDecorator.tsx
 *
 * Component 1 - Message Decorator
 *
 * Decorates messages with evidence chips, citations, and EQ hints.
 * This is where the "Jenny touch" gets visually represented.
 */

import React from "react";
import type { AssessmentMessage } from "./types";

export interface MessageDecoratorProps {
  message: AssessmentMessage;
}

export function MessageDecorator({ message }: MessageDecoratorProps): React.ReactElement {
  return (
    <div className="assessment-message">
      {/* Main message text */}
      <div className="assessment-message-text">{message.text}</div>

      {/* Evidence chips - visual indicators of what the agent noticed */}
      {message.evidence && message.evidence.length > 0 && (
        <div className="assessment-evidence-container">
          {message.evidence.map((ev, idx) => (
            <span className="assessment-evidence-chip" key={idx}>
              {ev}
            </span>
          ))}
        </div>
      )}

      {/* Citations - RAG sources used */}
      {message.citations && message.citations.length > 0 && (
        <div className="assessment-citation-container">
          {message.citations.map((c, idx) => (
            <div className="assessment-citation" key={idx}>
              📎 {c}
            </div>
          ))}
        </div>
      )}

      {/* EQ hints - subtle emotional guidance */}
      {message.eqHints && (
        <div className="assessment-eq-hint">
          <em>{message.eqHints}</em>
        </div>
      )}

      {/* Archetype indicator (optional, for debugging) */}
      {message.archetype && process.env.NODE_ENV === "development" && (
        <div className="assessment-archetype-debug">
          <small>Archetype: {message.archetype}</small>
        </div>
      )}
    </div>
  );
}
