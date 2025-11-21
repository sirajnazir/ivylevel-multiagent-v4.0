import { AssessmentInput_v1 } from '../../schema/assessmentInput_v1';
import { AssessmentInternalState_v1 } from '../../schema/assessmentInternalState_v1';

/**
 * Assessment Agent Task Graph
 * Defines the sequential execution flow for the assessment pipeline
 * Updated with Component 10: EQ Modulation Engine
 *
 * Pipeline flow:
 * 1. extractProfile - Extract student profile from raw data
 * 2. runIntelligenceOracles - Run APS intelligence scoring
 * 3. determineStudentType - Classify student into 1 of 7 archetypes
 * 4. generateNarrativeBlocks - Generate narrative positioning
 * 5. applyEQModulation - Generate adaptive conversational tone plan (NEW)
 * 6. generateStrategyBlocks - Generate 12-month strategy plan
 * 7. buildOutput - Aggregate final assessment output
 */
export const assessmentGraph = [
  'extractProfile',
  'runIntelligenceOracles',
  'determineStudentType',
  'generateNarrativeBlocks',
  'applyEQModulation',
  'generateStrategyBlocks',
  'buildOutput',
];
