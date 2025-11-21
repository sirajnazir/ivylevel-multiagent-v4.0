/**
 * Chips.tsx
 *
 * Component 4 - Adaptive Evidence Chips
 *
 * Displays evidence chips with density control based on archetype.
 * Some students need less cognitive load (low density).
 * Others want maximum transparency (high density).
 */

import React from "react";
import type { UIState } from "../types";

export interface ChipsProps {
  uiState: UIState;
  evidence: string[];
  className?: string;
}

export function Chips({
  uiState,
  evidence,
  className = "",
}: ChipsProps): React.ReactElement | null {
  // Don't show if archetype prefers hidden evidence
  if (!uiState.showEvidence) return null;

  // Don't show if no evidence
  if (!evidence || evidence.length === 0) return null;

  // Limit based on density
  const density = uiState.chipDensity;
  const maxChips = density === "low" ? 2 : density === "medium" ? 4 : 8;
  const visibleChips = evidence.slice(0, maxChips);

  return (
    <div
      className={`chips-container ${className}`}
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginBottom: "12px",
      }}
    >
      {visibleChips.map((chip, index) => (
        <span
          key={index}
          className="chip"
          style={{
            padding: "4px 10px",
            backgroundColor: "#e5e7eb",
            color: "#374151",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          {chip}
        </span>
      ))}

      {/* Show indicator if there are more chips */}
      {evidence.length > maxChips && (
        <span
          className="chip-more"
          style={{
            padding: "4px 10px",
            backgroundColor: "#f3f4f6",
            color: "#9ca3af",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          +{evidence.length - maxChips} more
        </span>
      )}
    </div>
  );
}
