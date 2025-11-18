import { AssessmentInput_v1 } from '../../schema/assessmentInput_v1';
import { AssessmentOutput_v1 } from '../../schema/assessmentOutput_v1';

/**
 * Mock API route for Assessment Agent
 * Mimics full input/output structure for testing
 * No actual LLM or database calls
 */
export function mockAssessmentRoute(input: AssessmentInput_v1): AssessmentOutput_v1 {
  // Mock response with proper structure
  const mockOutput: AssessmentOutput_v1 = {
    profile: {
      academics: {
        // Mock academic data
      },
      activities: {
        // Mock activities data
      },
      awards: {
        // Mock awards data
      },
      personality: {
        // Mock personality data
      },
    },
    diagnostics: {
      strengths: [
        'Mock strength 1',
        'Mock strength 2',
      ],
      weaknesses: [
        'Mock weakness 1',
        'Mock weakness 2',
      ],
      academicGaps: [
        'Mock academic gap',
      ],
      ECDepthGaps: [
        'Mock EC depth gap',
      ],
    },
    narrative: {
      themes: [
        'Mock theme 1',
        'Mock theme 2',
      ],
      identityThread: 'Mock identity thread narrative',
      positioning: 'Mock positioning statement',
    },
    strategy: {
      '12MonthPlan': [
        'Mock 12-month action item 1',
        'Mock 12-month action item 2',
      ],
      summerPlanning: [
        'Mock summer planning item 1',
        'Mock summer planning item 2',
      ],
      awardsTargets: [
        'Mock awards target 1',
        'Mock awards target 2',
      ],
    },
    metadata: {
      modelVersion: 'assessment-agent-v1.0-mock',
      generatedAt: new Date().toISOString(),
    },
  };

  return mockOutput;
}
