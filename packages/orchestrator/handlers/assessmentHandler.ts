import { AssessmentInput_v1, assessmentInputSchema_v1 } from '../../schema/assessmentInput_v1';
import { AssessmentOutput_v1 } from '../../schema/assessmentOutput_v1';
import { AssessmentInternalState_v1 } from '../../schema/assessmentInternalState_v1';
import { AssessmentAgent } from '../../agents/assessment-agent/src/AssessmentAgent';

/**
 * Orchestrator bridge handler for Assessment Agent
 * Validates input, constructs state, orchestrates agent execution
 * Returns typed assessment output
 */
export async function handleAssessment(input: unknown): Promise<AssessmentOutput_v1> {
  // Step 1: Validate input using zod schema
  const validatedInput = assessmentInputSchema_v1.parse(input);

  // Step 2: Construct Assessment Agent
  const agent = new AssessmentAgent(validatedInput);

  // Step 3: Initialize internal state
  agent.initialize();

  // Step 4: Execute transformation chain (sequential calls)
  // TODO: Wire to task graph execution
  const extracted = await agent.extractProfile();
  const oracles = await agent.runIntelligenceOracles();
  const narrative = agent.generateNarrativeBlocks(extracted, oracles);
  const strategy = agent.generateStrategyBlocks(extracted, oracles, narrative);
  const output = agent.buildOutput();

  return output;
}
