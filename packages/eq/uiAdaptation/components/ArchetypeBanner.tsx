/**
 * ArchetypeBanner.tsx
 *
 * Component 4 - Archetype Banner
 *
 * Displays the current archetype with adaptive color theme.
 * Shows students that the system "gets" them.
 */

import React from "react";
import type { UIState } from "../types";

export interface ArchetypeBannerProps {
  uiState: UIState;
  className?: string;
}

export function ArchetypeBanner({
  uiState,
  className = "",
}: ArchetypeBannerProps): React.ReactElement | null {
  if (!uiState.archetype) return null;

  // Format archetype name: "OverwhelmedStarter" → "Overwhelmed Starter"
  const formattedArchetype = uiState.archetype.replace(/([A-Z])/g, " $1").trim();

  return (
    <div
      className={`archetype-banner ${className}`}
      style={{
        background: uiState.colorTheme,
        padding: "8px 12px",
        borderRadius: "8px",
        color: "#fff",
        marginBottom: "10px",
        fontSize: "0.875rem",
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span>📊</span>
      <span>Assessment Mode: {formattedArchetype}</span>
    </div>
  );
}
