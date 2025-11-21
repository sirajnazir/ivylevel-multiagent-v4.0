/**
 * AssessmentStageIndicator.tsx
 *
 * Component 5 - Stage Indicator
 *
 * Visual progress tracker showing current assessment stage.
 * Makes the experience feel professional and structured.
 */

"use client";

import React from "react";

export interface AssessmentStageIndicatorProps {
  stage: string;
  className?: string;
}

export function AssessmentStageIndicator({
  stage,
  className = "",
}: AssessmentStageIndicatorProps): React.ReactElement {
  const stages = ["warmup", "academics", "activities", "narrative", "synthesis"];

  const stageLabels: Record<string, string> = {
    warmup: "Warm-Up",
    academics: "Academics",
    activities: "Activities",
    narrative: "Narrative",
    synthesis: "Synthesis",
  };

  const currentIndex = stages.indexOf(stage);

  return (
    <div className={`assessment-stage-indicator ${className}`}>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {stages.map((s, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div
              key={s}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "8px 12px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                textAlign: "center",
                backgroundColor: isActive || isCompleted ? "#3b82f6" : "#e5e7eb",
                color: isActive || isCompleted ? "#ffffff" : "#6b7280",
                transition: "all 0.3s ease-in-out",
                opacity: isActive ? 1 : isCompleted ? 0.8 : 0.5,
                cursor: "default",
              }}
            >
              {stageLabels[s] || s}
            </div>
          );
        })}
      </div>

      {/* Stage description */}
      <div
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        {getStageDescription(stage)}
      </div>
    </div>
  );
}

/**
 * Get Stage Description
 *
 * Returns user-friendly description for each stage.
 */
function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    warmup: "Building rapport and understanding your context",
    academics: "Exploring your academic profile and trajectory",
    activities: "Understanding your extracurriculars and leadership",
    narrative: "Identifying your unique story and positioning",
    synthesis: "Creating your strategic roadmap",
    complete: "Assessment complete!",
  };

  return descriptions[stage] || "";
}
