/**
 * __tests__/assessmentFSM.test.ts
 *
 * Tests for Component 46 - Assessment Session State Machine
 */

import { AssessmentSessionFSM } from '../assessmentFSM';
import { StageRequirements } from '../types';

describe('Component 46 - Assessment Session FSM', () => {
  describe('Initialization', () => {
    it('should initialize in rapport stage', () => {
      const fsm = new AssessmentSessionFSM();
      expect(fsm.getStage()).toBe('rapport');
    });

    it('should initialize with rapport stage requirements', () => {
      const fsm = new AssessmentSessionFSM();
      const requiredSlots = fsm.getRequiredSlots();

      expect(requiredSlots).toEqual(StageRequirements['rapport']);
      expect(requiredSlots).toContain('student_background');
      expect(requiredSlots).toContain('emotional_state');
      expect(requiredSlots).toContain('motivation_reason');
    });

    it('should initialize with empty collected slots', () => {
      const fsm = new AssessmentSessionFSM();
      expect(fsm.getCollectedSlots()).toEqual([]);
    });

    it('should initialize with empty history', () => {
      const fsm = new AssessmentSessionFSM();
      expect(fsm.getHistory()).toEqual([]);
    });

    it('should not be complete initially', () => {
      const fsm = new AssessmentSessionFSM();
      expect(fsm.isComplete()).toBe(false);
      expect(fsm.isCurrentStageComplete()).toBe(false);
    });
  });

  describe('Slot Collection', () => {
    it('should mark slot as collected', () => {
      const fsm = new AssessmentSessionFSM();
      const result = fsm.markSlotCollected('student_background');

      expect(result.success).toBe(true);
      expect(result.slot).toBe('student_background');
      expect(result.alreadyCollected).toBe(false);
      expect(fsm.getCollectedSlots()).toContain('student_background');
    });

    it('should mark multiple slots as collected', () => {
      const fsm = new AssessmentSessionFSM();
      const results = fsm.markSlotsCollected(['student_background', 'emotional_state']);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(fsm.getCollectedSlots()).toContain('student_background');
      expect(fsm.getCollectedSlots()).toContain('emotional_state');
    });

    it('should be idempotent - marking same slot twice', () => {
      const fsm = new AssessmentSessionFSM();

      const result1 = fsm.markSlotCollected('student_background');
      expect(result1.alreadyCollected).toBe(false);

      const result2 = fsm.markSlotCollected('student_background');
      expect(result2.alreadyCollected).toBe(true);

      // Should only appear once
      expect(fsm.getCollectedSlots()).toEqual(['student_background']);
    });

    it('should track stage progress', () => {
      const fsm = new AssessmentSessionFSM();

      expect(fsm.getStageProgress()).toBe(0);

      fsm.markSlotCollected('student_background');
      expect(fsm.getStageProgress()).toBeCloseTo(1/3, 2);

      fsm.markSlotCollected('emotional_state');
      expect(fsm.getStageProgress()).toBeCloseTo(2/3, 2);

      fsm.markSlotCollected('motivation_reason');
      expect(fsm.getStageProgress()).toBe(1);
    });

    it('should return missing slots', () => {
      const fsm = new AssessmentSessionFSM();

      expect(fsm.getMissingSlots()).toHaveLength(3);

      fsm.markSlotCollected('student_background');
      const missing = fsm.getMissingSlots();

      expect(missing).toHaveLength(2);
      expect(missing).toContain('emotional_state');
      expect(missing).toContain('motivation_reason');
      expect(missing).not.toContain('student_background');
    });
  });

  describe('Stage Transitions', () => {
    it('should not transition when stage incomplete', () => {
      const fsm = new AssessmentSessionFSM();

      fsm.markSlotCollected('student_background');
      const result = fsm.tryAdvanceStage();

      expect(result.transitioned).toBe(false);
      expect(result.fromStage).toBe('rapport');
      expect(result.toStage).toBe('rapport');
      expect(result.missingSlots).toHaveLength(2);
      expect(fsm.getStage()).toBe('rapport');
    });

    it('should transition when all slots collected', () => {
      const fsm = new AssessmentSessionFSM();

      fsm.markSlotCollected('student_background');
      fsm.markSlotCollected('emotional_state');
      fsm.markSlotCollected('motivation_reason');

      const result = fsm.tryAdvanceStage();

      expect(result.transitioned).toBe(true);
      expect(result.fromStage).toBe('rapport');
      expect(result.toStage).toBe('current_state');
      expect(result.missingSlots).toHaveLength(0);
      expect(fsm.getStage()).toBe('current_state');
    });

    it('should reset collected slots after transition', () => {
      const fsm = new AssessmentSessionFSM();

      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));
      expect(fsm.getCollectedSlots()).toHaveLength(3);

      fsm.tryAdvanceStage();

      // Collected slots should be reset for new stage
      expect(fsm.getCollectedSlots()).toEqual([]);
    });

    it('should update required slots after transition', () => {
      const fsm = new AssessmentSessionFSM();

      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      const newRequiredSlots = fsm.getRequiredSlots();
      expect(newRequiredSlots).toEqual(StageRequirements['current_state']);
      expect(newRequiredSlots).toContain('academics_rigor');
      expect(newRequiredSlots).toContain('ec_depth');
    });

    it('should follow canonical stage flow', () => {
      const fsm = new AssessmentSessionFSM();

      // rapport → current_state
      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();
      expect(fsm.getStage()).toBe('current_state');

      // current_state → diagnostic
      StageRequirements['current_state'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();
      expect(fsm.getStage()).toBe('diagnostic');

      // diagnostic → preview
      StageRequirements['diagnostic'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();
      expect(fsm.getStage()).toBe('preview');

      // preview → complete
      StageRequirements['preview'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();
      expect(fsm.getStage()).toBe('complete');
    });

    it('should reach terminal complete stage', () => {
      const fsm = new AssessmentSessionFSM();

      // Complete all stages
      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      StageRequirements['current_state'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      StageRequirements['diagnostic'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      StageRequirements['preview'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      expect(fsm.getStage()).toBe('complete');
      expect(fsm.isComplete()).toBe(true);
    });

    it('should not advance from complete stage', () => {
      const fsm = new AssessmentSessionFSM();

      // Fast-forward to complete
      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();
      StageRequirements['current_state'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();
      StageRequirements['diagnostic'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();
      StageRequirements['preview'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      expect(fsm.getStage()).toBe('complete');

      const result = fsm.tryAdvanceStage();
      expect(result.transitioned).toBe(false);
      expect(result.reason).toContain('terminal');
      expect(fsm.getStage()).toBe('complete');
    });
  });

  describe('History Management', () => {
    it('should append messages to history', () => {
      const fsm = new AssessmentSessionFSM();

      fsm.appendMessage('student', 'Hello');
      fsm.appendMessage('coach', 'Hi there!');

      const history = fsm.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({ role: 'student', content: 'Hello' });
      expect(history[1]).toEqual({ role: 'coach', content: 'Hi there!' });
    });

    it('should track turn count', () => {
      const fsm = new AssessmentSessionFSM();

      expect(fsm.getTurnCount()).toBe(0);

      fsm.appendMessage('student', 'Hello');
      expect(fsm.getTurnCount()).toBe(1);

      fsm.appendMessage('coach', 'Hi!');
      expect(fsm.getTurnCount()).toBe(2);
    });
  });

  describe('Metadata', () => {
    it('should track stage history', () => {
      const fsm = new AssessmentSessionFSM();

      const metadata = fsm.getMetadata();
      expect(metadata.stageHistory).toHaveLength(1);
      expect(metadata.stageHistory[0].stage).toBe('rapport');
      expect(metadata.stageHistory[0].enteredAt).toBeDefined();
    });

    it('should update stage history on transition', () => {
      const fsm = new AssessmentSessionFSM();

      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      const metadata = fsm.getMetadata();
      expect(metadata.stageHistory).toHaveLength(2);
      expect(metadata.stageHistory[0].stage).toBe('rapport');
      expect(metadata.stageHistory[0].exitedAt).toBeDefined();
      expect(metadata.stageHistory[1].stage).toBe('current_state');
      expect(metadata.stageHistory[1].enteredAt).toBeDefined();
    });

    it('should track timestamps', async () => {
      const fsm = new AssessmentSessionFSM();

      const metadata = fsm.getMetadata();
      expect(metadata.createdAt).toBeDefined();
      expect(metadata.lastUpdated).toBeDefined();

      const beforeUpdate = metadata.lastUpdated;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      fsm.markSlotCollected('student_background');

      const updatedMetadata = fsm.getMetadata();
      expect(updatedMetadata.lastUpdated).not.toBe(beforeUpdate);
    });

    it('should track stage duration', () => {
      const fsm = new AssessmentSessionFSM();

      const duration = fsm.getCurrentStageDuration();
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('State Management', () => {
    it('should return full state', () => {
      const fsm = new AssessmentSessionFSM();

      fsm.markSlotCollected('student_background');
      fsm.appendMessage('student', 'Hello');

      const state = fsm.getState();

      expect(state.stage).toBe('rapport');
      expect(state.requiredSlots).toEqual(StageRequirements['rapport']);
      expect(state.collectedSlots).toContain('student_background');
      expect(state.history).toHaveLength(1);
    });

    it('should return summary string', () => {
      const fsm = new AssessmentSessionFSM();

      fsm.markSlotCollected('student_background');

      const summary = fsm.getSummary();

      expect(summary).toContain('rapport');
      expect(summary).toContain('33%'); // 1/3 complete
      expect(summary).toContain('2 slots'); // 2 missing
    });

    it('should reset to initial state', () => {
      const fsm = new AssessmentSessionFSM();

      // Make some progress
      fsm.markSlotCollected('student_background');
      fsm.appendMessage('student', 'Hello');
      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));
      fsm.tryAdvanceStage();

      expect(fsm.getStage()).toBe('current_state');

      // Reset
      fsm.reset();

      expect(fsm.getStage()).toBe('rapport');
      expect(fsm.getCollectedSlots()).toEqual([]);
      expect(fsm.getHistory()).toEqual([]);
      expect(fsm.getTurnCount()).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should validate correct FSM state', () => {
      const fsm = new AssessmentSessionFSM();

      const validation = fsm.validate();
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect when stage is complete', () => {
      const fsm = new AssessmentSessionFSM();

      expect(fsm.isCurrentStageComplete()).toBe(false);

      StageRequirements['rapport'].forEach(slot => fsm.markSlotCollected(slot));

      expect(fsm.isCurrentStageComplete()).toBe(true);
    });
  });

  describe('Complete Flow', () => {
    it('should complete full assessment flow', () => {
      const fsm = new AssessmentSessionFSM();

      // Stage 1: Rapport
      expect(fsm.getStage()).toBe('rapport');
      fsm.appendMessage('student', "I'm nervous about college");
      fsm.appendMessage('coach', "I hear you. Let's talk.");
      fsm.markSlotsCollected(StageRequirements['rapport']);
      fsm.tryAdvanceStage();

      // Stage 2: Current State
      expect(fsm.getStage()).toBe('current_state');
      fsm.appendMessage('student', "I have a 4.2 GPA and do debate");
      fsm.appendMessage('coach', "Tell me more about your activities");
      fsm.markSlotsCollected(StageRequirements['current_state']);
      fsm.tryAdvanceStage();

      // Stage 3: Diagnostic
      expect(fsm.getStage()).toBe('diagnostic');
      fsm.markSlotsCollected(StageRequirements['diagnostic']);
      fsm.tryAdvanceStage();

      // Stage 4: Preview
      expect(fsm.getStage()).toBe('preview');
      fsm.markSlotsCollected(StageRequirements['preview']);
      fsm.tryAdvanceStage();

      // Stage 5: Complete
      expect(fsm.getStage()).toBe('complete');
      expect(fsm.isComplete()).toBe(true);

      // Verify metadata
      const metadata = fsm.getMetadata();
      expect(metadata.stageHistory).toHaveLength(5);
      expect(metadata.totalTurns).toBe(4);
    });
  });
});
