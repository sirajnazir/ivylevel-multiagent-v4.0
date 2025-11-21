/**
 * Microcopy.tsx
 *
 * Component 4 - Adaptive Microcopy
 *
 * Displays tone-adaptive microcopy that changes based on archetype.
 * This is the "emotional intelligence" of the UI.
 */

import React from "react";
import type { UIState } from "../types";

export interface MicrocopyProps {
  uiState: UIState;
  className?: string;
}

export function Microcopy({
  uiState,
  className = "",
}: MicrocopyProps): React.ReactElement | null {
  const tone = uiState.microcopyTone;

  const microcopyMap: Record<string, string> = {
    calming: "You're doing great — let's take this step by step.",
    gentle: "No rush, let's explore this together.",
    reassuring: "You're on the right track. Let's build on this.",
    curious: "Interesting! Let's unpack that more.",
    direct: "Got it. Let's cut to the core insight.",
    directive: "Here's exactly what we'll do next.",
    "soft-direct": "I'll guide you clearly, but we'll keep things light.",
    neutral: "",
  };

  const message = microcopyMap[tone] || "";

  if (!message) return null;

  return (
    <div
      className={`microcopy ${className}`}
      style={{
        fontSize: "0.875rem",
        color: "#6b7280",
        marginBottom: "8px",
        fontStyle: "italic",
      }}
    >
      {message}
    </div>
  );
}
