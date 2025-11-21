/**
 * index.ts
 *
 * Main exports for Component 44 - LLM-Powered Archetype Classifier
 */

export {
  classifyArchetypeLLM,
  validateClassification
} from './classifyArchetype.llm';

export type {
  ArchetypeClassification,
  ClassificationInput,
  ClassificationMetadata
} from './types';
