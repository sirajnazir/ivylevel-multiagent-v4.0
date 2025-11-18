import { z } from 'zod';
import { safeJsonParse, parseJsonUnsafe, debugCleaningSteps } from './safeJsonParse';

describe('safeJsonParse', () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  describe('valid JSON', () => {
    it('should parse clean JSON successfully', () => {
      const input = JSON.stringify({ name: 'Alice', age: 25 });
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Alice', age: 25 });
      expect(result.error).toBeUndefined();
    });

    it('should parse JSON with markdown code fences', () => {
      const input = '```json\n{"name": "Bob", "age": 30}\n```';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Bob', age: 30 });
    });

    it('should parse JSON with triple backticks only', () => {
      const input = '```\n{"name": "Charlie", "age": 35}\n```';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Charlie', age: 35 });
    });
  });

  describe('Claude hallucinations', () => {
    it('should strip "Here\'s the JSON:" preamble', () => {
      const input = 'Here\'s the JSON:\n{"name": "Dave", "age": 40}';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Dave', age: 40 });
    });

    it('should strip "I hope this helps!" postamble', () => {
      const input = '{"name": "Eve", "age": 45}\nI hope this helps!';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Eve', age: 45 });
    });

    it('should handle multiple hallucination patterns', () => {
      const input = 'Based on your transcript, here\'s the extracted JSON:\n```json\n{"name": "Frank", "age": 50}\n```\nLet me know if you need anything else!';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Frank', age: 50 });
    });
  });

  describe('trailing commas', () => {
    it('should fix trailing comma before closing brace', () => {
      const input = '{"name": "Grace", "age": 55,}';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Grace', age: 55 });
    });

    it('should fix trailing comma in array', () => {
      const arraySchema = z.object({
        items: z.array(z.string()),
      });
      const input = '{"items": ["a", "b", "c",]}';
      const result = safeJsonParse(input, arraySchema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ items: ['a', 'b', 'c'] });
    });
  });

  describe('schema validation', () => {
    it('should fail when JSON does not match schema', () => {
      const input = '{"name": "Henry", "age": "not a number"}';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Schema validation failed');
    });

    it('should fail when required fields are missing', () => {
      const input = '{"name": "Iris"}';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Schema validation failed');
    });
  });

  describe('malformed JSON', () => {
    it('should fail on completely invalid JSON', () => {
      const input = 'this is not json at all';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });

    it('should fail on broken JSON structure', () => {
      const input = '{"name": "Jack", "age": }';
      const result = safeJsonParse(input, testSchema);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
  });

  describe('parseJsonUnsafe', () => {
    it('should parse JSON without schema validation', () => {
      const input = '{"anything": "goes", "count": 123}';
      const result = parseJsonUnsafe(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ anything: 'goes', count: 123 });
    });

    it('should still clean markdown and hallucinations', () => {
      const input = '```json\n{"test": true}\n```';
      const result = parseJsonUnsafe(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ test: true });
    });
  });

  describe('debugCleaningSteps', () => {
    it('should show all cleaning stages', () => {
      const input = 'Here is the JSON:\n```json\n{"name": "Kate", "age": 60}\n```';
      const debug = debugCleaningSteps(input);

      expect(debug.parseSuccess).toBe(true);
      expect(debug.parseError).toBeUndefined();
      expect(debug.afterHallucinationStrip).not.toContain('Here is the JSON');
      expect(debug.afterLLMClean).not.toContain('```');
    });

    it('should report parse failure in debug mode', () => {
      const input = 'invalid json {{{';
      const debug = debugCleaningSteps(input);

      expect(debug.parseSuccess).toBe(false);
      expect(debug.parseError).toBeDefined();
    });
  });
});
