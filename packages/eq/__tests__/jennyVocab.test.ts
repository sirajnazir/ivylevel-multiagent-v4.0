/**
 * jennyVocab.test.ts
 *
 * Comprehensive test suite for Component 39 - Jenny Vocabulary & Idiom Model
 * Tests vocabulary domains, idiom clusters, substitution, filtering, and integration.
 */

import {
  JennyWordChoiceEngine,
  JennyIdiomSelector,
  JennySubstitutionEngine,
  JennySemanticFilter,
  JennyVocabEngine,
  quickTransform,
  quickValidate,
  quickSubstitute,
  quickFilter,
  validateJennyVoice,
  ALL_IDIOM_CLUSTERS,
  GROUNDING_IDIOMS,
  REFRAME_IDIOMS,
  GUIDANCE_IDIOMS,
  VALIDATION_IDIOMS,
  FUTURE_SELF_IDIOMS,
  SUBSTITUTION_RULES,
  FILTER_RULES,
} from '../jennyVocab';

import type {
  VocabContext,
  VocabMode,
  ArchetypeLabel,
  EmotionalState,
  VocabTransformOptions,
} from '../jennyVocab';

describe('Component 39: Jenny Vocabulary & Idiom Model', () => {

  // ============================================================================
  // JennyWordChoiceEngine Tests
  // ============================================================================

  describe('JennyWordChoiceEngine', () => {
    let engine: JennyWordChoiceEngine;

    beforeEach(() => {
      engine = new JennyWordChoiceEngine();
    });

    test('should generate vocabulary phrase for validate mode', () => {
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stressed',
        mode: 'validate',
      };

      const result = engine.generate(context);

      expect(result).toBeDefined();
      expect(result.phrase).toBeTruthy();
      expect(result.domain.toLowerCase()).toContain('validation');
      expect(typeof result.phrase).toBe('string');
    });

    test('should generate vocabulary phrase for guide mode', () => {
      const context: VocabContext = {
        archetype: 'HighAchiever',
        emotionalState: 'stable',
        mode: 'guide',
      };

      const result = engine.generate(context);

      expect(result).toBeDefined();
      expect(result.phrase).toBeTruthy();
      expect(result.domain.toLowerCase()).toContain('guidance');
    });

    test('should generate vocabulary phrase for identity mode', () => {
      const context: VocabContext = {
        archetype: 'UnfocusedExplorer',
        emotionalState: 'stable',
        mode: 'identity',
      };

      const result = engine.generate(context);

      expect(result).toBeDefined();
      expect(result.phrase).toBeTruthy();
      expect(result.domain.toLowerCase()).toContain('identity');
    });

    test('should generate vocabulary phrase for momentum mode', () => {
      const context: VocabContext = {
        archetype: 'ReluctantPragmatist',
        emotionalState: 'stable',
        mode: 'momentum',
      };

      const result = engine.generate(context);

      expect(result).toBeDefined();
      expect(result.phrase).toBeTruthy();
      expect(result.domain.toLowerCase()).toContain('momentum');
    });

    test('should generate vocabulary phrase for clarity mode', () => {
      const context: VocabContext = {
        archetype: 'QuietDeepThinker',
        emotionalState: 'overwhelmed',
        mode: 'clarity',
      };

      const result = engine.generate(context);

      expect(result).toBeDefined();
      expect(result.phrase).toBeTruthy();
      expect(result.domain.toLowerCase()).toContain('clarity');
    });

    test('should include archetype-specific vocabulary', () => {
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stressed',
        mode: 'guide',
      };

      const phrases = new Set<string>();

      // Generate multiple times to check for archetype phrases
      for (let i = 0; i < 50; i++) {
        const result = engine.generate(context);
        phrases.add(result.phrase);
      }

      // Should include at least some archetype-specific phrases
      const archetypePhrase = Array.from(phrases).some(p =>
        p.includes('cognitive load') ||
        p.includes('contain the edges') ||
        p.includes('anchor to one idea')
      );

      expect(archetypePhrase).toBe(true);
    });

    test('should avoid recently used phrases', () => {
      const context: VocabContext = {
        archetype: 'HighAchiever',
        emotionalState: 'stable',
        mode: 'momentum',
      };

      const phrases: string[] = [];

      // Generate 10 phrases
      for (let i = 0; i < 10; i++) {
        const result = engine.generate(context);
        phrases.push(result.phrase);
      }

      // Check that we don't have immediate repeats
      for (let i = 1; i < phrases.length; i++) {
        expect(phrases[i]).not.toBe(phrases[i - 1]);
      }
    });

    test('should reset state', () => {
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stable',
        mode: 'identity',
      };

      // Generate some phrases
      for (let i = 0; i < 5; i++) {
        engine.generate(context);
      }

      const stateBefore = engine.getState();
      expect(stateBefore.recentlyUsedCount).toBeGreaterThan(0);

      engine.reset();

      const stateAfter = engine.getState();
      expect(stateAfter.recentlyUsedCount).toBe(0);
    });

    test('should provide state information', () => {
      const state = engine.getState();

      expect(state).toBeDefined();
      expect(typeof state.recentlyUsedCount).toBe('number');
      expect(typeof state.domainsCount).toBe('number');
      expect(state.domainsCount).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // JennyIdiomSelector Tests
  // ============================================================================

  describe('JennyIdiomSelector', () => {
    let selector: JennyIdiomSelector;

    beforeEach(() => {
      selector = new JennyIdiomSelector();
    });

    test('should get grounding idiom', () => {
      const idiom = selector.getGroundingStarter();

      expect(idiom).toBeTruthy();
      expect(typeof idiom).toBe('string');
      expect(GROUNDING_IDIOMS.phrases).toContain(idiom);
    });

    test('should get reframe idiom', () => {
      const idiom = selector.getReframeIdiom();

      expect(idiom).toBeTruthy();
      expect(typeof idiom).toBe('string');
      expect(REFRAME_IDIOMS.phrases).toContain(idiom);
    });

    test('should get guidance idiom', () => {
      const idiom = selector.getGuidanceIdiom();

      expect(idiom).toBeTruthy();
      expect(typeof idiom).toBe('string');
      expect(GUIDANCE_IDIOMS.phrases).toContain(idiom);
    });

    test('should get validation idiom', () => {
      const idiom = selector.getValidationIdiom();

      expect(idiom).toBeTruthy();
      expect(typeof idiom).toBe('string');
      expect(VALIDATION_IDIOMS.phrases).toContain(idiom);
    });

    test('should get future self idiom', () => {
      const idiom = selector.getFutureSelfIdiom();

      expect(idiom).toBeTruthy();
      expect(typeof idiom).toBe('string');
      expect(FUTURE_SELF_IDIOMS.phrases).toContain(idiom);
    });

    test('should get idiom by type', () => {
      const grounding = selector.getIdiom('grounding');
      const reframe = selector.getIdiom('reframe');
      const guidance = selector.getIdiom('guidance');
      const validation = selector.getIdiom('validation');
      const futureSelf = selector.getIdiom('future-self');

      expect(GROUNDING_IDIOMS.phrases).toContain(grounding);
      expect(REFRAME_IDIOMS.phrases).toContain(reframe);
      expect(GUIDANCE_IDIOMS.phrases).toContain(guidance);
      expect(VALIDATION_IDIOMS.phrases).toContain(validation);
      expect(FUTURE_SELF_IDIOMS.phrases).toContain(futureSelf);
    });

    test('should avoid recently used idioms', () => {
      const idioms: string[] = [];

      // Get 5 grounding idioms
      for (let i = 0; i < 5; i++) {
        idioms.push(selector.getGroundingStarter());
      }

      // Check for no immediate repeats
      for (let i = 1; i < idioms.length; i++) {
        expect(idioms[i]).not.toBe(idioms[i - 1]);
      }
    });

    test('should reset state', () => {
      // Generate some idioms
      for (let i = 0; i < 5; i++) {
        selector.getGroundingStarter();
      }

      const stateBefore = selector.getState();
      expect(stateBefore.recentlyUsedCount).toBeGreaterThan(0);

      selector.reset();

      const stateAfter = selector.getState();
      expect(stateAfter.recentlyUsedCount).toBe(0);
    });

    test('should export all idiom clusters', () => {
      expect(ALL_IDIOM_CLUSTERS).toBeDefined();
      expect(Array.isArray(ALL_IDIOM_CLUSTERS)).toBe(true);
      expect(ALL_IDIOM_CLUSTERS.length).toBe(5);

      const types = ALL_IDIOM_CLUSTERS.map(c => c.type);
      expect(types).toContain('grounding');
      expect(types).toContain('reframe');
      expect(types).toContain('guidance');
      expect(types).toContain('validation');
      expect(types).toContain('future-self');
    });
  });

  // ============================================================================
  // JennySubstitutionEngine Tests
  // ============================================================================

  describe('JennySubstitutionEngine', () => {
    let engine: JennySubstitutionEngine;

    beforeEach(() => {
      engine = new JennySubstitutionEngine();
    });

    test('should rewrite directive "you should" to invitation', () => {
      const input = 'You should focus on your goals.';
      const output = engine.rewrite(input);

      expect(output).not.toContain('you should');
      expect(output).toContain('what serves you better here is');
    });

    test('should rewrite "you must" to "what matters most is"', () => {
      const input = 'You must complete this task.';
      const output = engine.rewrite(input);

      expect(output).not.toContain('you must');
      expect(output).toContain('what matters most is');
    });

    test('should rewrite weak language "try to"', () => {
      const input = 'Try to finish your homework.';
      const output = engine.rewrite(input);

      expect(output).not.toContain('try to');
      expect(output).toContain("let's shape this into");
    });

    test('should rewrite generic reassurance "don\'t worry"', () => {
      const input = "Don't worry, it'll be fine.";
      const output = engine.rewrite(input);

      expect(output).not.toContain("don't worry");
      expect(output).toContain("you're not behind");
    });

    test('should rewrite corporate jargon "optimize"', () => {
      const input = 'You need to optimize your workflow.';
      const output = engine.rewrite(input);

      expect(output).not.toContain('optimize');
      expect(output).toContain('improve');
    });

    test('should strip "as an AI" entirely', () => {
      const input = 'As an AI, I can help you with that.';
      const output = engine.rewrite(input);

      expect(output).not.toContain('as an AI');
      expect(output).not.toContain('As an AI');
    });

    test('should rewrite "in summary" to "here\'s the core:"', () => {
      const input = 'In summary, you need to practice more.';
      const output = engine.rewrite(input);

      expect(output).not.toContain('in summary');
      expect(output).toContain("here's the core:");
    });

    test('should detect patterns needing substitution', () => {
      const text1 = 'You should try harder.';
      const text2 = 'Here is what will help.';

      expect(engine.needsSubstitution(text1)).toBe(true);
      expect(engine.needsSubstitution(text2)).toBe(false);
    });

    test('should find all patterns in text', () => {
      const text = 'You should try to optimize your work and don\'t worry about it.';
      const patterns = engine.findPatterns(text);

      expect(patterns).toContain('you should');
      expect(patterns).toContain('try to');
      expect(patterns).toContain('optimize');
      expect(patterns).toContain("don't worry");
    });

    test('should apply specific substitution rule', () => {
      const text = 'You should focus.';
      const output = engine.applyRule(text, 'you should', 'what helps is');

      expect(output).toContain('what helps is');
      expect(output).not.toContain('you should');
    });

    test('should get substitution statistics', () => {
      const original = 'You should try to optimize your work and don\'t worry.';
      const rewritten = engine.rewrite(original);
      const stats = engine.getSubstitutionStats(original, rewritten);

      expect(stats.substitutionCount).toBeGreaterThan(0);
      expect(stats.patternsReplaced.length).toBeGreaterThan(0);
    });

    test('should export substitution rules', () => {
      expect(SUBSTITUTION_RULES).toBeDefined();
      expect(Array.isArray(SUBSTITUTION_RULES)).toBe(true);
      expect(SUBSTITUTION_RULES.length).toBeGreaterThan(20);
    });

    test('should clean up whitespace after substitution', () => {
      const text = 'You   should    focus.';
      const output = engine.rewrite(text);

      expect(output).not.toMatch(/\s{2,}/);
    });
  });

  // ============================================================================
  // JennySemanticFilter Tests
  // ============================================================================

  describe('JennySemanticFilter', () => {
    let filter: JennySemanticFilter;

    beforeEach(() => {
      filter = new JennySemanticFilter();
    });

    test('should filter corporate jargon "synergy"', () => {
      const input = 'We need to leverage synergy to optimize results.';
      const output = filter.filter(input);

      expect(output).not.toContain('synergy');
      expect(output).not.toContain('leverage');
      expect(output).not.toContain('optimize');
    });

    test('should filter therapy cliché "inner child"', () => {
      const input = 'Connect with your inner child.';
      const output = filter.filter(input);

      expect(output).not.toContain('inner child');
      expect(output).toContain('the part of you that');
    });

    test('should filter robotic directive "you must"', () => {
      const input = 'You must complete this task.';
      const output = filter.filter(input);

      expect(output).not.toContain('you must');
      expect(output).toContain('what matters is');
    });

    test('should filter generic GPT "as an AI"', () => {
      const input = 'As an AI language model, I can help.';
      const output = filter.filter(input);

      expect(output).not.toContain('as an AI');
      expect(output).not.toContain('language model');
    });

    test('should filter educational buzzword "growth mindset"', () => {
      const input = 'Develop a growth mindset for learning.';
      const output = filter.filter(input);

      expect(output).not.toContain('growth mindset');
      expect(output).toContain('mindset for growth');
    });

    test('should detect filtered patterns', () => {
      const text1 = 'Leverage synergy to optimize.';
      const text2 = 'Work together to improve.';

      expect(filter.containsFilteredPatterns(text1)).toBe(true);
      expect(filter.containsFilteredPatterns(text2)).toBe(false);
    });

    test('should find all filtered patterns', () => {
      const text = 'Leverage synergy and manifest your inner child.';
      const found = filter.findFilteredPatterns(text);

      expect(found.length).toBeGreaterThan(0);
      expect(found.some(f => f.reason === 'Corporate jargon')).toBe(true);
      expect(found.some(f => f.reason === 'Therapy cliché')).toBe(true);
    });

    test('should validate Jenny-safe text', () => {
      const validText = 'Here is what will help you move forward.';
      const invalidText = 'Leverage synergy for optimization.';

      const result1 = filter.validate(validText);
      const result2 = filter.validate(invalidText);

      expect(result1.isValid).toBe(true);
      expect(result1.violations.length).toBe(0);

      expect(result2.isValid).toBe(false);
      expect(result2.violations.length).toBeGreaterThan(0);
    });

    test('should get filter statistics', () => {
      const text = 'Leverage synergy to optimize your inner child.';
      const stats = filter.getFilterStats(text);

      expect(stats.patternCount).toBeGreaterThan(0);
      expect(stats.patternsFound.length).toBeGreaterThan(0);
      expect(stats.filteredText).not.toContain('synergy');
    });

    test('should export filter rules', () => {
      expect(FILTER_RULES).toBeDefined();
      expect(Array.isArray(FILTER_RULES)).toBe(true);
      expect(FILTER_RULES.length).toBeGreaterThan(10);
    });

    test('should clean up whitespace after filtering', () => {
      const text = 'This is   a   very very   important   message.';
      const output = filter.filter(text);

      expect(output).not.toMatch(/\s{2,}/);
    });
  });

  // ============================================================================
  // JennyVocabEngine Integration Tests
  // ============================================================================

  describe('JennyVocabEngine', () => {
    let engine: JennyVocabEngine;

    beforeEach(() => {
      engine = new JennyVocabEngine();
    });

    test('should transform text with all options enabled', () => {
      const input = 'You should try to optimize your workflow. Don\'t worry about it.';
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stressed',
        mode: 'validate',
      };

      const output = engine.transform(input, {
        applySubstitutions: true,
        applyFilters: true,
        addIdioms: true,
        context,
      });

      expect(output).toBeTruthy();
      expect(output).not.toContain('you should');
      expect(output).not.toContain('optimize');
      expect(output).not.toContain("don't worry");
    });

    test('should transform with filters only', () => {
      const input = 'Leverage synergy for optimization.';

      const output = engine.transform(input, {
        applySubstitutions: false,
        applyFilters: true,
        addIdioms: false,
      });

      expect(output).not.toContain('synergy');
      expect(output).not.toContain('leverage');
    });

    test('should transform with substitutions only', () => {
      const input = 'You should try harder.';

      const output = engine.transform(input, {
        applySubstitutions: true,
        applyFilters: false,
        addIdioms: false,
      });

      expect(output).not.toContain('you should');
      expect(output).toContain('what serves you better here is');
    });

    test('should add idioms for validate mode', () => {
      const input = 'You are doing well.';
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stressed',
        mode: 'validate',
      };

      const output = engine.transform(input, {
        addIdioms: true,
        context,
      });

      // Should have an idiom prepended
      expect(output.length).toBeGreaterThan(input.length);
    });

    test('should add idioms for guide mode', () => {
      const input = 'Focus on your goals.';
      const context: VocabContext = {
        archetype: 'HighAchiever',
        emotionalState: 'stable',
        mode: 'guide',
      };

      const output = engine.transform(input, {
        addIdioms: true,
        context,
      });

      expect(output.length).toBeGreaterThan(input.length);
    });

    test('should add idioms for reframe mode', () => {
      const input = 'This is difficult.';
      const context: VocabContext = {
        archetype: 'QuietDeepThinker',
        emotionalState: 'stressed',
        mode: 'reframe',
      };

      const output = engine.transform(input, {
        addIdioms: true,
        context,
      });

      expect(output.length).toBeGreaterThan(input.length);
    });

    test('should add idioms for identity mode', () => {
      const input = 'Keep building.';
      const context: VocabContext = {
        archetype: 'ReluctantPragmatist',
        emotionalState: 'stable',
        mode: 'identity',
      };

      const output = engine.transform(input, {
        addIdioms: true,
        context,
      });

      expect(output.length).toBeGreaterThan(input.length);
    });

    test('should get vocabulary phrase', () => {
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stressed',
        mode: 'validate',
      };

      const phrase = engine.getVocabPhrase(context);

      expect(phrase).toBeTruthy();
      expect(typeof phrase).toBe('string');
    });

    test('should get idiom by type', () => {
      const grounding = engine.getIdiom('grounding');
      const reframe = engine.getIdiom('reframe');
      const guidance = engine.getIdiom('guidance');

      expect(grounding).toBeTruthy();
      expect(reframe).toBeTruthy();
      expect(guidance).toBeTruthy();
    });

    test('should detect if text needs transformation', () => {
      const text1 = 'You should try to optimize.';
      const text2 = 'Here is what will help.';

      expect(engine.needsTransformation(text1)).toBe(true);
      expect(engine.needsTransformation(text2)).toBe(false);
    });

    test('should validate Jenny voice', () => {
      const validText = 'Here is what matters most.';
      const invalidText = 'You should leverage synergy.';

      const result1 = engine.validateVoice(validText);
      const result2 = engine.validateVoice(invalidText);

      expect(result1.isValid).toBe(true);
      expect(result1.issues.length).toBe(0);

      expect(result2.isValid).toBe(false);
      expect(result2.issues.length).toBeGreaterThan(0);
    });

    test('should preview transformation', () => {
      const input = 'You should optimize your workflow.';
      const preview = engine.previewTransformation(input, {
        applySubstitutions: true,
        applyFilters: true,
      });

      expect(preview.original).toBe(input);
      expect(preview.transformed).not.toBe(input);
      expect(preview.changes.length).toBeGreaterThan(0);
    });

    test('should reset all components', () => {
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stable',
        mode: 'identity',
      };

      // Generate some state
      for (let i = 0; i < 5; i++) {
        engine.getVocabPhrase(context);
        engine.getIdiom('grounding');
      }

      engine.reset();

      const state = engine.getState();
      expect(state.wordChoice.recentlyUsedCount).toBe(0);
      expect(state.idioms.recentlyUsedCount).toBe(0);
    });

    test('should get state of all components', () => {
      const state = engine.getState();

      expect(state).toBeDefined();
      expect(state.wordChoice).toBeDefined();
      expect(state.idioms).toBeDefined();
    });

    test('should provide access to individual engines', () => {
      expect(engine.getWordChoiceEngine()).toBeInstanceOf(JennyWordChoiceEngine);
      expect(engine.getIdiomSelector()).toBeInstanceOf(JennyIdiomSelector);
      expect(engine.getSubstitutionEngine()).toBeInstanceOf(JennySubstitutionEngine);
      expect(engine.getSemanticFilter()).toBeInstanceOf(JennySemanticFilter);
    });
  });

  // ============================================================================
  // Helper Functions Tests
  // ============================================================================

  describe('Helper Functions', () => {
    test('quickTransform should transform text', () => {
      const input = 'You should try to optimize.';
      const output = quickTransform(input);

      expect(output).not.toContain('you should');
      expect(output).not.toContain('optimize');
    });

    test('quickTransform with context should add idioms', () => {
      const input = 'Focus on your goals.';
      const context: VocabContext = {
        archetype: 'HighAchiever',
        emotionalState: 'stable',
        mode: 'guide',
      };

      const output = quickTransform(input, context);

      expect(output).toBeTruthy();
    });

    test('quickValidate should validate Jenny voice', () => {
      const validText = 'Here is what matters.';
      const invalidText = 'Leverage synergy.';

      expect(quickValidate(validText)).toBe(true);
      expect(quickValidate(invalidText)).toBe(false);
    });

    test('quickSubstitute should rewrite phrases', () => {
      const input = 'You should try harder.';
      const output = quickSubstitute(input);

      expect(output).not.toContain('you should');
    });

    test('quickFilter should filter patterns', () => {
      const input = 'Leverage synergy for optimization.';
      const output = quickFilter(input);

      expect(output).not.toContain('synergy');
    });

    test('validateJennyVoice should validate text', () => {
      const validText = 'Here is what will help.';
      const invalidText = 'Leverage your inner child.';

      expect(validateJennyVoice(validText)).toBe(true);
      expect(validateJennyVoice(invalidText)).toBe(false);
    });
  });

  // ============================================================================
  // Integration Scenarios
  // ============================================================================

  describe('Integration Scenarios', () => {
    let engine: JennyVocabEngine;

    beforeEach(() => {
      engine = new JennyVocabEngine();
    });

    test('Scenario: Anxious Perfectionist needs validation', () => {
      const input = 'You should try to optimize your approach better.';
      const context: VocabContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stressed',
        mode: 'validate',
      };

      const output = engine.transform(input, {
        applySubstitutions: true,
        applyFilters: true,
        addIdioms: true,
        context,
      });

      // Should be transformed to Jenny voice
      expect(output).not.toContain('you should');
      expect(output).not.toContain('optimize');
      expect(output).not.toContain('try to');
      expect(output.length).toBeGreaterThan(0);
    });

    test('Scenario: High Achiever needs guidance', () => {
      const input = 'You must leverage your skills and execute the plan.';
      const context: VocabContext = {
        archetype: 'HighAchiever',
        emotionalState: 'stable',
        mode: 'guide',
      };

      const output = engine.transform(input, {
        applySubstitutions: true,
        applyFilters: true,
        addIdioms: true,
        context,
      });

      expect(output).not.toContain('you must');
      expect(output).not.toContain('leverage');
      expect(output).not.toContain('execute');
    });

    test('Scenario: Distracted Multitasker needs clarity', () => {
      const input = 'Try to focus on multiple tasks and optimize your time.';
      const context: VocabContext = {
        archetype: 'UnfocusedExplorer',
        emotionalState: 'overwhelmed',
        mode: 'clarity',
      };

      const output = engine.transform(input, {
        applySubstitutions: true,
        applyFilters: true,
        addIdioms: true,
        context,
      });

      expect(output).not.toContain('try to');
      expect(output).not.toContain('optimize');
    });

    test('Scenario: Generic AI response needs Jenny transformation', () => {
      const input = 'As an AI, I think you should try to optimize your workflow. In summary, leverage synergy and don\'t worry.';

      const output = engine.transform(input, {
        applySubstitutions: true,
        applyFilters: true,
      });

      // Should strip all generic AI patterns
      expect(output).not.toContain('as an AI');
      expect(output).not.toContain('I think');
      expect(output).not.toContain('you should');
      expect(output).not.toContain('try to');
      expect(output).not.toContain('optimize');
      expect(output).not.toContain('in summary');
      expect(output).not.toContain('leverage');
      expect(output).not.toContain('synergy');
      expect(output).not.toContain("don't worry");
    });

    test('Scenario: Complete pipeline transformation', () => {
      const input = 'You must leverage synergy and manifest your inner child. Try to optimize and don\'t worry about growth mindset.';
      const context: VocabContext = {
        archetype: 'QuietDeepThinker',
        emotionalState: 'stressed',
        mode: 'reframe',
      };

      const output = engine.transform(input, {
        applySubstitutions: true,
        applyFilters: true,
        addIdioms: true,
        context,
      });

      // Should transform everything
      expect(output).not.toContain('you must');
      expect(output).not.toContain('leverage');
      expect(output).not.toContain('synergy');
      expect(output).not.toContain('manifest');
      expect(output).not.toContain('inner child');
      expect(output).not.toContain('try to');
      expect(output).not.toContain('optimize');
      expect(output).not.toContain("don't worry");
      expect(output).not.toContain('growth mindset');

      // Should have content
      expect(output.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    let engine: JennyVocabEngine;

    beforeEach(() => {
      engine = new JennyVocabEngine();
    });

    test('should handle empty text', () => {
      const output = engine.transform('');
      expect(output).toBe('');
    });

    test('should handle text with no patterns', () => {
      const input = 'This is a simple sentence.';
      const output = engine.transform(input);
      expect(output).toBe(input);
    });

    test('should handle text with only whitespace', () => {
      const output = engine.transform('   ');
      expect(output).toBe('');
    });

    test('should handle text with multiple spaces', () => {
      const input = 'You    should    try    harder.';
      const output = engine.transform(input, { applySubstitutions: true });
      expect(output).not.toMatch(/\s{2,}/);
    });

    test('should handle case-insensitive patterns', () => {
      const input = 'YOU SHOULD TRY TO OPTIMIZE.';
      const output = engine.transform(input, { applySubstitutions: true });
      expect(output.toLowerCase()).not.toContain('you should');
    });
  });
});
