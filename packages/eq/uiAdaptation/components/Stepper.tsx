/**
 * Stepper.tsx
 *
 * Component 4 - Adaptive Progress Stepper
 *
 * Displays assessment progress with adaptive pacing indicators.
 * Animation speed adjusts based on archetype pacing preference.
 */

import React from "react";
import type { UIState } from "../types";

export interface StepperProps {
  uiState: UIState;
  currentStage: string;
  stages: string[];
  className?: string;
}

export function Stepper({
  uiState,
  currentStage,
  stages,
  className = "",
}: StepperProps): React.ReactElement | null {
  // Don't show if archetype prefers hidden stepper
  if (!uiState.showProgressStepper) return null;

  const currentIndex = stages.indexOf(currentStage);

  // Get animation duration based on pacing
  const animationDuration =
    uiState.pacing === "slow" ? "600ms" : uiState.pacing === "fast" ? "150ms" : "300ms";

  return (
    <div
      className={`stepper ${className}`}
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
      }}
    >
      {stages.map((stage, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div
            key={stage}
            className={`stepper-item ${isActive ? "active" : ""} ${
              isCompleted ? "completed" : ""
            }`}
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 500,
              textAlign: "center",
              textTransform: "capitalize",
              backgroundColor: isCompleted || isActive ? uiState.colorTheme : "#e5e7eb",
              color: isCompleted || isActive ? "#fff" : "#6b7280",
              transition: `all ${animationDuration} ease-in-out`,
              opacity: isActive ? 1 : isCompleted ? 0.8 : 0.6,
            }}
          >
            {stage.replace("_", " ")}
          </div>
        );
      })}
    </div>
  );
}
