import { AssessmentInput_v1 } from '../../schema/assessmentInput_v1';
import { AssessmentInternalState_v1 } from '../../schema/assessmentInternalState_v1';

export const assessmentGraph = {
  nodes: {
    INIT: {
      handler: (input: AssessmentInput_v1): AssessmentInternalState_v1 => {
        const state: AssessmentInternalState_v1 = {
          step: 'init',
        };
        return state;
      },
    },
    EXTRACT_PROFILE: {
      handler: (state: AssessmentInternalState_v1): AssessmentInternalState_v1 => {
        return {
          ...state,
          step: 'extract',
          extractedProfile: {},
        };
      },
    },
    CALL_ORACLES: {},
    BUILD_NARRATIVE: {},
    BUILD_PLAN: {},
    BUILD_OUTPUT: {},
  },
  edges: [
    { from: 'INIT', to: 'EXTRACT_PROFILE' },
    { from: 'EXTRACT_PROFILE', to: 'CALL_ORACLES' },
    { from: 'CALL_ORACLES', to: 'BUILD_NARRATIVE' },
    { from: 'BUILD_NARRATIVE', to: 'BUILD_PLAN' },
    { from: 'BUILD_PLAN', to: 'BUILD_OUTPUT' },
  ],
};
