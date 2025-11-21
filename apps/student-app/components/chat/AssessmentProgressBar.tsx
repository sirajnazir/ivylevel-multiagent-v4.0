/**
 * AssessmentProgressBar.tsx
 *
 * Component 2 - Progress Bar Component
 *
 * Visual progress indicator for the assessment session.
 * Shows current stage, description, and progress percentage.
 */

"use client";

import React from "react";
import { useAssessmentProgress } from "../../hooks/useAssessmentProgress";

export interface AssessmentProgressBarProps {
  sessionId: string;
  showMilestones?: boolean;
}

export function AssessmentProgressBar({
  sessionId,
  showMilestones = false,
}: AssessmentProgressBarProps): React.ReactElement {
  const { progress, stage, stageDescription, milestones } = useAssessmentProgress(sessionId);

  return (
    <div className="assessment-progress-wrapper">
      {/* Progress Header */}
      <div className="assessment-progress-header">
        <span className="stage-label">{stage.toUpperCase().replace('_', ' ')}</span>
        <span className="stage-description">{stageDescription}</span>
        <span className="stage-percentage">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="assessment-progress-bar">
        <div
          className="assessment-progress-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Assessment progress: ${progress}%`}
        />
      </div>

      {/* Stage Indicators */}
      <div className="assessment-stage-indicators">
        {["intake", "diagnostic", "narrative", "strategy", "wrap_up"].map((s) => (
          <div
            key={s}
            className={`assessment-stage-indicator ${
              s === stage
                ? "active"
                : milestones.some((m) => m.stage === s)
                ? "completed"
                : "pending"
            }`}
          >
            <div className="assessment-stage-dot" />
            <div className="assessment-stage-name">{s.replace('_', ' ')}</div>
          </div>
        ))}
      </div>

      {/* Milestones (optional) */}
      {showMilestones && milestones.length > 0 && (
        <div className="assessment-milestones">
          <h4>Milestones</h4>
          <ul>
            {milestones.map((milestone) => (
              <li key={milestone.id}>
                <span className="milestone-stage">{milestone.stage}</span>
                <span className="milestone-description">{milestone.description}</span>
                <span className="milestone-time">
                  {new Date(milestone.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
