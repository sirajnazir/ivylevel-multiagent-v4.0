/**
 * persona.test.ts
 *
 * Comprehensive test suite for Component 40 - Jenny Persona Embedding Model
 * Tests chunk processing, embeddings, drift detection, and agent integration.
 */

import {
  PersonaChunkProcessor,
  EmbeddingService,
  DriftDetector,
  PersonaEmbeddingEngine,
  createDefaultConfig,
  DEFAULT_CHANNEL_WEIGHTS,
} from '../index';

import type {
  PersonaChunk,
  EmbeddingVector,
  CompositePersonaVector,
  PersonaRetrievalContext,
} from '../types';

// Mock persona data for testing
const MOCK_CORE_LANGUAGE = `
# Jenny Core Language Patterns

## Identity Reframe Blueprint
- "Here's what I'm noticing."
- "Your reaction makes sense."
- "This doesn't say anything about your potential."
- **Tone**: warm, steady
- **Use-case**: student overwhelmed

## Grounding Openers
- "Okay, let me slow this for a second."
- "Something important is happening here."
- **Tone**: calm, present
- **Use-case**: student anxious
`;

const MOCK_EQ_PATTERNS = `
# Jenny EQ Patterns

## Empathy Signatures
- Reflects emotional state before solving problem
- Names emotions student hasn't named yet
- Validates before redirecting

## Emotional Normalizers
- "This is manageable."
- "You're not behind."
- "That's a valid reaction."
`;

const MOCK_HEURISTICS = {
  coaching_heuristics: [
    {
      name: "Start with validation before strategy",
      pattern: "emotional_acknowledgment → tactical_guidance",
      weight: 0.9
    },
    {
      name: "One clean move principle",
      pattern: "reduce_options → provide_single_next_step",
      weight: 0.85
    }
  ],
  anti_patterns: [
    {
      pattern: "toxic_positivity",
      examples: ["Everything happens for a reason"],
      severity: "high"
    }
  ]
};

const MOCK_COACHING_PATTERNS = {
  coaching_move_signatures: {
    affirm: {
      language_markers: ["That's legitimate", "You're tracking the right thing"],
      when_used: "student needs validation",
      typical_followup: "tactical_guidance"
    },
    reframe: {
      language_markers: ["This isn't X; it's Y", "Let me offer a different lens"],
      when_used: "student stuck in negative interpretation",
      typical_followup: "evidence_provision"
    }
  }
};

const MOCK_ARCHETYPE_MAPPINGS = {
  archetype_interaction_signatures: {
    AnxiousPerfectionist: {
      primary_needs: ["containment", "permission", "nervous_system_validation"],
      communication_adjustments: {
        pace: "slow",
        complexity: "low"
      },
      signature_language: ["reduce cognitive load", "contain the edges"],
      avoid: ["multiple options", "perfectionist language"],
      typical_coaching_sequence: ["validate_anxiety", "ground_and_contain"]
    }
  }
};

const MOCK_NEGATIVE_EXAMPLES = `
# Jenny Negative Examples

## Toxic Positivity (NEVER)
❌ "Everything happens for a reason!"
❌ "Just think positive!"

## Identity Attacks (NEVER)
❌ "You're lazy."
❌ "You lack discipline."

## What Jenny Says Instead
✅ "Your reaction makes sense."
✅ "This is hard, and you're not broken."
`;

const MOCK_GOLDEN_THREAD = `
# Jenny's Golden Thread

## The Unifying Philosophy
Jenny is a strategic identity coach who helps students become the version of themselves that can handle what's ahead.

## Five Pillars

### 1. Identity Over Achievement
The goal isn't just to "get into college"—it's to build the internal operating system that makes success sustainable.
`;

describe('Component 40: Jenny Persona Embedding Model', () => {

  // ============================================================================
  // PersonaChunkProcessor Tests
  // ============================================================================

  describe('PersonaChunkProcessor', () => {
    let processor: PersonaChunkProcessor;

    beforeEach(() => {
      processor = new PersonaChunkProcessor();
    });

    test('should process language data into chunks', () => {
      const chunks = processor['processLanguageData'](MOCK_CORE_LANGUAGE);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].channel).toBe('language');
      expect(chunks[0].text).toContain('Identity Reframe Blueprint');
      expect(chunks[0].weight).toBeGreaterThan(0);
    });

    test('should process EQ data into chunks', () => {
      const chunks = processor['processEQData'](MOCK_EQ_PATTERNS);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].channel).toBe('eq');
      expect(chunks[0].text).toContain('Empathy Signatures');
    });

    test('should process strategy data into chunks', () => {
      const chunks = processor['processStrategyData'](MOCK_HEURISTICS, MOCK_COACHING_PATTERNS);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.some(c => c.channel === 'strategy')).toBe(true);
      expect(chunks.some(c => c.category === 'coaching_heuristic')).toBe(true);
      expect(chunks.some(c => c.category === 'coaching_move')).toBe(true);
    });

    test('should process archetype data into chunks', () => {
      const chunks = processor['processArchetypeData'](MOCK_ARCHETYPE_MAPPINGS);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].channel).toBe('archetype');
      expect(chunks[0].category).toBe('AnxiousPerfectionist');
      expect(chunks[0].text).toContain('reduce cognitive load');
    });

    test('should process safety data into chunks', () => {
      const chunks = processor['processSafetyData'](MOCK_NEGATIVE_EXAMPLES);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].channel).toBe('safety');
      expect(chunks[0].weight).toBe(1.0); // Safety is critical
      expect(chunks[0].text).toContain('NEVER SAY');
    });

    test('should process all data sources', () => {
      const chunks = processor.processAll({
        coreLanguage: '',
        eqPatterns: '',
        heuristics: '',
        coachingPatterns: '',
        archetypeMappings: '',
        negativeExamples: '',
        goldenThread: '',
      }, {
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      expect(chunks.length).toBeGreaterThan(0);

      // Should have chunks from all channels
      const channels = new Set(chunks.map(c => c.channel));
      expect(channels.has('language')).toBe(true);
      expect(channels.has('eq')).toBe(true);
      expect(channels.has('strategy')).toBe(true);
      expect(channels.has('archetype')).toBe(true);
      expect(channels.has('safety')).toBe(true);
    });

    test('should estimate token counts', () => {
      const text = "This is a test sentence with about ten words in it.";
      const tokens = processor.estimateTokenCount(text);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(text.length); // Tokens should be less than characters
    });

    test('should split large chunks', () => {
      const largeText = 'This is a sentence. '.repeat(100); // Create large text
      const largeChunk: PersonaChunk = {
        id: 'test',
        text: largeText,
        channel: 'language',
        weight: 1.0,
      };

      const splitChunks = processor.splitLargeChunk(largeChunk, 250);

      expect(splitChunks.length).toBeGreaterThan(1);
      splitChunks.forEach(chunk => {
        expect(processor.estimateTokenCount(chunk.text)).toBeLessThanOrEqual(250);
      });
    });

    test('should provide chunk statistics', () => {
      const chunks: PersonaChunk[] = [
        { id: '1', text: 'Test 1', channel: 'language', weight: 0.9 },
        { id: '2', text: 'Test 2', channel: 'eq', weight: 0.8 },
        { id: '3', text: 'Test 3', channel: 'language', weight: 0.7 },
      ];

      const stats = processor.getChunkStats(chunks);

      expect(stats.total).toBe(3);
      expect(stats.byChannel.language).toBe(2);
      expect(stats.byChannel.eq).toBe(1);
      expect(stats.avgWeight).toBeCloseTo(0.8, 1);
      expect(stats.totalTokens).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EmbeddingService Tests
  // ============================================================================

  describe('EmbeddingService', () => {
    let service: EmbeddingService;

    beforeEach(() => {
      service = new EmbeddingService('text-embedding-3-large', 1536);
    });

    test('should generate embeddings for chunks', async () => {
      const chunk: PersonaChunk = {
        id: 'test_1',
        text: "Here's what I'm noticing.",
        channel: 'language',
        weight: 0.9,
      };

      const embedding = await service.embedChunk(chunk);

      expect(embedding).toBeDefined();
      expect(embedding.vector.length).toBe(1536);
      expect(embedding.text).toBe(chunk.text);
      expect(embedding.channel).toBe('language');
    });

    test('should generate consistent embeddings for same text', async () => {
      const chunk: PersonaChunk = {
        id: 'test',
        text: 'Consistent text',
        channel: 'language',
        weight: 1.0,
      };

      const embedding1 = await service.embedChunk(chunk);
      const embedding2 = await service.embedChunk(chunk);

      // Same text should produce same embedding
      expect(embedding1.vector).toEqual(embedding2.vector);
    });

    test('should generate different embeddings for different text', async () => {
      const chunk1: PersonaChunk = {
        id: 'test_1',
        text: 'First text',
        channel: 'language',
        weight: 1.0,
      };

      const chunk2: PersonaChunk = {
        id: 'test_2',
        text: 'Second text',
        channel: 'language',
        weight: 1.0,
      };

      const embedding1 = await service.embedChunk(chunk1);
      const embedding2 = await service.embedChunk(chunk2);

      // Different text should produce different embeddings
      expect(embedding1.vector).not.toEqual(embedding2.vector);
    });

    test('should compute cosine similarity', () => {
      const v1 = [1, 0, 0];
      const v2 = [1, 0, 0];
      const v3 = [0, 1, 0];

      const sim1 = service.cosineSimilarity(v1, v2);
      const sim2 = service.cosineSimilarity(v1, v3);

      expect(sim1).toBeCloseTo(1.0, 5); // Identical vectors
      expect(sim2).toBeCloseTo(0.0, 5); // Orthogonal vectors
    });

    test('should find top K similar embeddings', async () => {
      const chunks: PersonaChunk[] = [
        { id: '1', text: 'validation', channel: 'language', weight: 1.0 },
        { id: '2', text: 'strategy', channel: 'strategy', weight: 1.0 },
        { id: '3', text: 'empathy', channel: 'eq', weight: 1.0 },
        { id: '4', text: 'validation support', channel: 'language', weight: 1.0 },
      ];

      const embeddings = await service.embedChunks(chunks);

      // Query for validation-related chunks
      const queryChunk: PersonaChunk = {
        id: 'query',
        text: 'validation',
        channel: 'language',
        weight: 1.0,
      };

      const queryEmbedding = await service.embedChunk(queryChunk);
      const topK = service.findTopK(queryEmbedding.vector, embeddings, 2);

      expect(topK.length).toBe(2);
      expect(topK[0].similarity).toBeGreaterThanOrEqual(topK[1].similarity);
    });

    test('should generate composite vector from channels', async () => {
      const channelEmbeddings = new Map<string, EmbeddingVector[]>();

      // Create mock embeddings for each channel
      for (const channel of ['language', 'eq', 'strategy', 'pattern', 'archetype', 'safety']) {
        const chunk: PersonaChunk = {
          id: `${channel}_1`,
          text: `${channel} content`,
          channel: channel as any,
          weight: 1.0,
        };
        const embedding = await service.embedChunk(chunk);
        channelEmbeddings.set(channel, [embedding]);
      }

      const composite = service.generateCompositeVector(channelEmbeddings, DEFAULT_CHANNEL_WEIGHTS);

      expect(composite.vector.length).toBe(1536);
      expect(composite.weights).toEqual(DEFAULT_CHANNEL_WEIGHTS);
      expect(composite.channelVectors.language).toBeDefined();
      expect(composite.channelVectors.eq).toBeDefined();
    });
  });

  // ============================================================================
  // DriftDetector Tests
  // ============================================================================

  describe('DriftDetector', () => {
    let detector: DriftDetector;
    let embeddingService: EmbeddingService;
    let jennyComposite: CompositePersonaVector;

    beforeEach(async () => {
      embeddingService = new EmbeddingService('text-embedding-3-large', 1536);

      // Create mock Jenny composite
      const channelEmbeddings = new Map<string, EmbeddingVector[]>();

      for (const channel of ['language', 'eq', 'strategy', 'pattern', 'archetype', 'safety']) {
        const chunk: PersonaChunk = {
          id: `jenny_${channel}`,
          text: `Jenny ${channel} signature`,
          channel: channel as any,
          weight: 1.0,
        };
        const embedding = await embeddingService.embedChunk(chunk);
        channelEmbeddings.set(channel, [embedding]);
      }

      jennyComposite = embeddingService.generateCompositeVector(channelEmbeddings, DEFAULT_CHANNEL_WEIGHTS);
      detector = new DriftDetector(jennyComposite, embeddingService, 0.78);
    });

    test('should detect drift in non-Jenny output', async () => {
      const badOutput = "You must leverage synergy to optimize your workflow. Everything happens for a reason!";

      const result = await detector.detectDrift(badOutput);

      expect(result.similarity).toBeLessThan(0.9);
      expect(result.threshold).toBe(0.78);
    });

    test('should provide suggestions for fixing drift', async () => {
      const badOutput = "Just think positive and it'll work out!";

      const result = await detector.detectDrift(badOutput);

      expect(result.suggestions).toBeDefined();
      if (result.hasDrift) {
        expect(result.suggestions.length).toBeGreaterThan(0);
      }
    });

    test('should compute per-channel drift', async () => {
      const output = "Here's what I'm noticing about your approach.";

      const result = await detector.detectDrift(output);

      expect(result.channelDrift).toBeDefined();
      expect(result.channelDrift!.language).toBeDefined();
      expect(result.channelDrift!.eq).toBeDefined();
      expect(result.channelDrift!.strategy).toBeDefined();
    });

    test('should allow threshold updates', () => {
      detector.setThreshold(0.85);
      expect(detector.getThreshold()).toBe(0.85);
    });

    test('should detect drift in batch', async () => {
      const outputs = [
        "Here's what will help.",
        "You must optimize your workflow.",
        "Your reaction makes sense.",
      ];

      const results = await detector.detectDriftBatch(outputs);

      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.similarity).toBeDefined();
        expect(typeof result.hasDrift).toBe('boolean');
      });
    });

    test('should provide drift statistics', async () => {
      const outputs = [
        "This is manageable.",
        "Synergize your efforts.",
        "Here's the clean takeaway.",
      ];

      const results = await detector.detectDriftBatch(outputs);
      const stats = detector.getDriftStats(results);

      expect(stats.totalOutputs).toBe(3);
      expect(stats.driftCount).toBeGreaterThanOrEqual(0);
      expect(stats.driftRate).toBeGreaterThanOrEqual(0);
      expect(stats.avgSimilarity).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // PersonaEmbeddingEngine Integration Tests
  // ============================================================================

  describe('PersonaEmbeddingEngine', () => {
    let engine: PersonaEmbeddingEngine;

    beforeEach(() => {
      const config = createDefaultConfig('jenny', './data/personas/jenny');
      engine = new PersonaEmbeddingEngine(config);
    });

    test('should initialize from raw data', async () => {
      await engine.initialize({
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      const composite = engine.getCompositeVector();
      expect(composite).toBeDefined();
      expect(composite.vector.length).toBe(1536);
    });

    test('should retrieve persona chunks for context', async () => {
      await engine.initialize({
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      const context: PersonaRetrievalContext = {
        archetype: 'AnxiousPerfectionist',
        emotionalState: 'stressed',
        coachingMove: 'affirm',
        topK: 3,
      };

      const retrieved = await engine.retrieveForContext(context);

      expect(retrieved.length).toBeLessThanOrEqual(3);
      retrieved.forEach(item => {
        expect(item.chunk).toBeDefined();
        expect(item.embedding).toBeDefined();
        expect(item.similarity).toBeGreaterThanOrEqual(0);
        expect(item.similarity).toBeLessThanOrEqual(1);
      });
    });

    test('should build conditioning context', async () => {
      await engine.initialize({
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      const context: PersonaRetrievalContext = {
        archetype: 'AnxiousPerfectionist',
        userMessage: 'I feel overwhelmed.',
      };

      const conditioning = await engine.buildConditioningContext(context);

      expect(conditioning.personaChunks).toBeDefined();
      expect(conditioning.compositeVector).toBeDefined();
    });

    test('should check drift', async () => {
      await engine.initialize({
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      const output = "Here's what I'm noticing.";
      const driftResult = await engine.checkDrift(output);

      expect(driftResult.similarity).toBeDefined();
      expect(typeof driftResult.hasDrift).toBe('boolean');
    });

    test('should export and import index', async () => {
      await engine.initialize({
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      const index = engine.exportIndex();

      expect(index.version).toBe('1.0');
      expect(index.personaName).toBe('jenny');
      expect(index.entries.length).toBeGreaterThan(0);

      // Test import
      const config2 = createDefaultConfig('jenny2', './data/personas/jenny');
      const engine2 = new PersonaEmbeddingEngine(config2);
      engine2.importIndex(index);

      const composite2 = engine2.getCompositeVector();
      expect(composite2).toBeDefined();
    });

    test('should get chunks by channel', async () => {
      await engine.initialize({
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      const languageChunks = engine.getChunksByChannel('language');
      const eqChunks = engine.getChunksByChannel('eq');

      expect(languageChunks.length).toBeGreaterThan(0);
      expect(eqChunks.length).toBeGreaterThan(0);

      languageChunks.forEach(chunk => {
        expect(chunk.channel).toBe('language');
      });
    });

    test('should provide statistics', async () => {
      await engine.initialize({
        coreLanguage: MOCK_CORE_LANGUAGE,
        eqPatterns: MOCK_EQ_PATTERNS,
        heuristics: MOCK_HEURISTICS,
        coachingPatterns: MOCK_COACHING_PATTERNS,
        archetypeMappings: MOCK_ARCHETYPE_MAPPINGS,
        negativeExamples: MOCK_NEGATIVE_EXAMPLES,
        goldenThread: MOCK_GOLDEN_THREAD,
      });

      const stats = engine.getStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byChannel).toBeDefined();
      expect(stats.avgWeight).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    test('should handle empty persona data', () => {
      const processor = new PersonaChunkProcessor();
      const chunks = processor.processAll({
        coreLanguage: '',
        eqPatterns: '',
        heuristics: '',
        coachingPatterns: '',
        archetypeMappings: '',
        negativeExamples: '',
        goldenThread: '',
      }, {
        coreLanguage: '',
        eqPatterns: '',
        heuristics: { coaching_heuristics: [] },
        coachingPatterns: {},
        archetypeMappings: {},
        negativeExamples: '',
        goldenThread: '',
      });

      expect(chunks.length).toBe(0);
    });

    test('should handle very short text chunks', () => {
      const processor = new PersonaChunkProcessor();
      const tokens = processor.estimateTokenCount('Hi');
      expect(tokens).toBeGreaterThan(0);
    });

    test('should normalize embedding vectors', async () => {
      const service = new EmbeddingService('text-embedding-3-large', 1536);
      const chunk: PersonaChunk = {
        id: 'test',
        text: 'Test normalization',
        channel: 'language',
        weight: 1.0,
      };

      const embedding = await service.embedChunk(chunk);

      // Compute vector norm
      let norm = 0;
      for (const val of embedding.vector) {
        norm += val * val;
      }
      norm = Math.sqrt(norm);

      // Should be unit vector (norm ≈ 1)
      expect(norm).toBeCloseTo(1.0, 5);
    });
  });
});
