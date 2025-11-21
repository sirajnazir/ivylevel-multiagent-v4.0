/**
 * useAssessmentModel.ts
 *
 * React hook for fetching and managing assessment render model.
 *
 * This hook is backend-agnostic and can fetch from any REST endpoint
 * that returns RenderModel_v1.
 *
 * Usage:
 * ```tsx
 * const { model, isLoading, error, refetch } = useAssessmentModel({
 *   sessionId: 'abc123',
 *   apiEndpoint: 'https://api.example.com/assessments'
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  UseAssessmentModelOptions,
  UseAssessmentModelResult,
  RenderModel_v1,
} from '../types';

/**
 * Use Assessment Model Hook
 *
 * Fetches RenderModel_v1 from a REST endpoint or uses provided model.
 *
 * @param options - Hook configuration options
 * @returns Model state and refetch function
 */
export function useAssessmentModel(
  options: UseAssessmentModelOptions
): UseAssessmentModelResult {
  const {
    sessionId,
    apiEndpoint,
    model: providedModel,
    onError,
    refetchInterval,
  } = options;

  // State
  const [model, setModel] = useState<RenderModel_v1 | null>(providedModel || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs for interval management
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch Model
   *
   * Fetches the render model from the API endpoint.
   */
  const fetchModel = useCallback(async () => {
    // If model is provided directly, no need to fetch
    if (providedModel) {
      setModel(providedModel);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Validate inputs
    if (!sessionId || !apiEndpoint) {
      const err = new Error(
        'useAssessmentModel requires either a model prop or both sessionId and apiEndpoint'
      );
      setError(err);
      if (onError) onError(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construct URL
      const url = `${apiEndpoint}/${sessionId}`;

      // Fetch data
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch assessment model: ${response.status} ${response.statusText}`
        );
      }

      const data: RenderModel_v1 = await response.json();

      // Validate response has required fields
      if (!data.sessionId || !data.stage) {
        throw new Error('Invalid RenderModel_v1: missing required fields');
      }

      setModel(data);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      if (onError) onError(error);
    }
  }, [sessionId, apiEndpoint, providedModel, onError]);

  /**
   * Refetch
   *
   * Manually trigger a refetch of the model.
   */
  const refetch = useCallback(async () => {
    await fetchModel();
  }, [fetchModel]);

  // Initial fetch on mount or when dependencies change
  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  // Setup auto-refetch interval if specified
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchModel();
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, fetchModel]);

  return {
    model,
    isLoading,
    error,
    refetch,
  };
}
