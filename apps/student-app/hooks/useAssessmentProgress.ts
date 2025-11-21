/**
 * useAssessmentProgress.ts
 *
 * Component 2 - Progress Tracking Hook
 *
 * Client-side hook that consumes backend progress events and exposes:
 * - progress (0 → 100)
 * - stage (intake | diagnostic | narrative | strategy | wrap_up)
 * - stageDescription
 * - milestones
 * - updateProgress(payload) — called internally
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { AssessmentStage, ProgressPayload, ProgressMilestone } from "../types/assessmentProgressTypes";

export interface UseAssessmentProgressResult {
  progress: number;
  stage: AssessmentStage;
  stageDescription: string;
  milestones: ProgressMilestone[];
  updateProgress: (payload: ProgressPayload) => void;
  refetch: () => Promise<void>;
}

export function useAssessmentProgress(sessionId: string): UseAssessmentProgressResult {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AssessmentStage>("intake");
  const [stageDescription, setStageDescription] = useState("Getting started...");
  const [milestones, setMilestones] = useState<ProgressMilestone[]>([]);

  /**
   * Update Progress
   *
   * Updates local progress state with new data from backend.
   */
  const updateProgress = useCallback((payload: ProgressPayload) => {
    setProgress(payload.progress);
    setStage(payload.stage);
    setStageDescription(payload.description);

    if (payload.milestone) {
      const newMilestone: ProgressMilestone = {
        id: crypto.randomUUID(),
        stage: payload.stage,
        description: payload.milestone,
        timestamp: new Date().toISOString(),
      };

      setMilestones((prev) => [...prev, newMilestone]);
    }
  }, []);

  /**
   * Fetch Initial Progress
   *
   * Loads initial progress state from backend.
   */
  const fetchInitial = useCallback(async () => {
    try {
      const response = await fetch(`/api/assessment/${sessionId}/progress`);

      if (!response.ok) {
        console.error(`Failed to fetch progress: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      updateProgress(data);

      if (data.milestones) {
        setMilestones(data.milestones);
      }
    } catch (err) {
      console.error("[useAssessmentProgress] Failed to fetch initial progress:", err);
    }
  }, [sessionId, updateProgress]);

  /**
   * Refetch Progress
   *
   * Manually refetch progress from backend.
   */
  const refetch = useCallback(async () => {
    await fetchInitial();
  }, [fetchInitial]);

  // Load initial progress on mount
  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  return {
    progress,
    stage,
    stageDescription,
    milestones,
    updateProgress,
    refetch,
  };
}
