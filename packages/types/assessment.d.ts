/**
 * Type definitions for Assessment Agent
 * TYPE-ONLY declarations - no runtime logic
 * References schemas defined in /packages/schema
 */

import type { AssessmentInput_v1 } from '../schema/assessmentInput_v1';
import type { AssessmentOutput_v1 } from '../schema/assessmentOutput_v1';
import type { AssessmentInternalState_v1 } from '../schema/assessmentInternalState_v1';

/**
 * Profile extraction result structure
 */
export type ProfileData = {
  academics: object;
  activities: object;
  awards: object;
  personality: object;
};

/**
 * Oracle results aggregation type
 */
export type OracleResults = {
  ivyScore?: number;
  weakSpots?: string[];
  narrativeThreads?: string[];
  [key: string]: unknown;
};

/**
 * Narrative blocks structure
 */
export type NarrativeBlocks = {
  themes: string[];
  identityThread: string;
  positioning: string;
};

/**
 * Strategy blocks structure
 */
export type StrategyBlocks = {
  '12MonthPlan': string[];
  summerPlanning: string[];
  awardsTargets: string[];
};

/**
 * Assessment Agent handler function type
 */
export type AssessmentHandler = (
  input: AssessmentInput_v1
) => Promise<AssessmentOutput_v1>;

/**
 * Agent registry entry type
 */
export type AgentRegistryEntry = {
  name: string;
  version: string;
  agentClass: unknown;
  handler: AssessmentHandler;
  description: string;
};
