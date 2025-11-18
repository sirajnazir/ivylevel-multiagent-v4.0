import { AssessmentAgent } from '../../agents/assessment-agent/src';
import { handleAssessment } from '../handlers/assessmentHandler';

/**
 * Agent Registry
 * Central registry for all agents in the multi-agent system
 * Maps agent names to their constructors and handlers
 */
export const agentRegistry = {
  AssessmentAgent: {
    name: 'AssessmentAgent',
    version: '1.0.0',
    agentClass: AssessmentAgent,
    handler: handleAssessment,
    description: 'Assessment Agent (Jenny Twin) - Conducts student assessments and generates comprehensive profiles',
  },
};
