/**
 * types.ts
 *
 * Type definitions for Component 42 - Persona Weight Tuner + Drift Correction
 */

/**
 * Drift severity levels
 */
export type DriftLevel = 'green' | 'yellow' | 'orange' | 'red';

/**
 * Drift thresholds configuration
 */
export interface DriftThresholds {
  green: number;   // >= this similarity = perfect
  yellow: number;  // >= this similarity = slight drift
  orange: number;  // >= this similarity = medium drift
  red: number;     // < orange threshold = severe drift
}

/**
 * Persona profile dimensions
 */
export interface PersonaProfile {
  warmth: number;
  structure: number;
  identity_reframing: number;
  tough_love: number;
  immigrant_connection: number;
  precision_academics: number;
  reality_based_optimism: number;
  nervous_system_literacy: number;
  [key: string]: number;
}

/**
 * Channel weights for composite vector
 */
export interface ChannelWeights {
  language: number;
  eq: number;
  coaching: number;
  pattern: number;
  archetype: number;
  safety: number;
}

/**
 * Adaptive tuning configuration
 */
export interface AdaptiveTuning {
  enabled: boolean;
  learning_rate: number;
  min_samples_for_update: number;
  confidence_threshold: number;
}

/**
 * Evolution timeline event
 */
export interface EvolutionEvent {
  date: string;
  event: string;
  metrics?: {
    avg_similarity?: number;
    drift_events?: number;
    corrections_applied?: number;
    [key: string]: any;
  };
  notes?: string;
}

/**
 * Persona weights configuration
 */
export interface PersonaWeights {
  version: string;
  persona_name: string;
  last_updated: string;
  drift_thresholds: DriftThresholds;
  drift_severity_labels?: Record<DriftLevel, string>;
  persona_profile: PersonaProfile;
  channel_weights: ChannelWeights;
  adaptive_tuning: AdaptiveTuning;
  evolution_timeline: EvolutionEvent[];
}

/**
 * Drift detection result
 */
export interface DriftDetectionResult {
  similarity: number;
  drift_level: DriftLevel;
  requires_correction: boolean;
  confidence: number;
  channel_similarities?: Record<string, number>;
}

/**
 * Drift event for logging
 */
export interface DriftEvent {
  timestamp: string;
  original: string;
  rewritten?: string;
  similarity: number;
  drift_level: DriftLevel;
  correction_applied: boolean;
  channel_analysis?: Record<string, number>;
  metadata?: Record<string, any>;
}

/**
 * Rewrite options
 */
export interface RewriteOptions {
  force?: boolean;              // Force rewrite even if drift is low
  preserve_length?: boolean;    // Try to maintain similar length
  target_similarity?: number;   // Target similarity score
  max_iterations?: number;      // Max rewrite attempts
}

/**
 * Tuner configuration
 */
export interface TunerConfig {
  weights_path: string;
  canonical_embedding_path: string;
  drift_log_path: string;
  auto_correct_threshold: DriftLevel;
  verbose: boolean;
}
