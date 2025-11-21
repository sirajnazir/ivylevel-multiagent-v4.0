/**
 * stages/chunk.ts
 *
 * Stage D: Chunk Persona Blocks for Embeddings
 * Splits canonical blocks into embedding-sized chunks (150-250 tokens).
 */

import { estimateTokens, log } from '../util';
import type {
  StageResult,
  CanonicalPersonaBlock,
  EmbeddingChunk,
  PersonaChannel,
} from '../types';

/**
 * Chunk persona blocks for embeddings
 */
export async function chunkPersonaBlocks(
  blocks: CanonicalPersonaBlock[],
  targetTokens: number = 200
): Promise<StageResult<EmbeddingChunk[]>> {
  try {
    log('Stage D: Chunking blocks for embeddings', 'info');

    const chunks: EmbeddingChunk[] = [];

    for (const block of blocks) {
      const blockChunks = chunkSingleBlock(block, targetTokens);
      chunks.push(...blockChunks);
    }

    log(`Stage D: Created ${chunks.length} embedding chunks`, 'info');

    return {
      success: true,
      data: chunks,
      stage: 'chunk',
    };
  } catch (error) {
    log(`Stage D failed: ${error}`, 'error');
    return {
      success: false,
      error: String(error),
      stage: 'chunk',
    };
  }
}

/**
 * Chunk a single block into embedding-sized pieces
 */
function chunkSingleBlock(
  block: CanonicalPersonaBlock,
  targetTokens: number
): EmbeddingChunk[] {
  const chunks: EmbeddingChunk[] = [];

  // Convert block to text representation
  const blockText = blockToText(block);
  const totalTokens = estimateTokens(blockText);

  // If small enough, use as single chunk
  if (totalTokens <= targetTokens * 1.2) {
    chunks.push({
      id: `${block.id}.chunk.0`,
      channel: block.channel,
      text: blockText,
      block_id: block.id,
      token_count: totalTokens,
      weight: getChannelWeight(block.channel),
    });
    return chunks;
  }

  // Otherwise, split into sections
  const sections = splitBlockIntoSections(block);

  let chunkIndex = 0;
  for (const section of sections) {
    const sectionTokens = estimateTokens(section);

    if (sectionTokens <= targetTokens * 1.2) {
      // Section fits in one chunk
      chunks.push({
        id: `${block.id}.chunk.${chunkIndex++}`,
        channel: block.channel,
        text: section,
        block_id: block.id,
        token_count: sectionTokens,
        weight: getChannelWeight(block.channel),
      });
    } else {
      // Section needs further splitting
      const subChunks = splitLargeSection(section, targetTokens);
      for (const subChunk of subChunks) {
        chunks.push({
          id: `${block.id}.chunk.${chunkIndex++}`,
          channel: block.channel,
          text: subChunk,
          block_id: block.id,
          token_count: estimateTokens(subChunk),
          weight: getChannelWeight(block.channel),
        });
      }
    }
  }

  return chunks;
}

/**
 * Convert block to text representation
 */
function blockToText(block: CanonicalPersonaBlock): string {
  const parts: string[] = [];

  // Header
  parts.push(`# ${block.atomic_unit.replace(/_/g, ' ')}`);
  parts.push(`Channel: ${block.channel}`);

  // Context
  if (block.usage_context) {
    parts.push(`\nContext: ${block.usage_context}`);
  }

  // Rules
  if (block.rules.length > 0) {
    parts.push('\nRules:');
    block.rules.forEach(rule => parts.push(`- ${rule}`));
  }

  // Signature phrases
  if (block.signature_phrases.length > 0) {
    parts.push('\nSignature Phrases:');
    block.signature_phrases.forEach(phrase => parts.push(`- ${phrase}`));
  }

  // Example dialogue
  if (block.example_dialogue && block.example_dialogue.length > 0) {
    parts.push('\nExamples:');
    block.example_dialogue.forEach(ex => parts.push(`- ${ex}`));
  }

  // Negation rules
  if (block.negation_rules.length > 0) {
    parts.push('\nNever:');
    block.negation_rules.forEach(rule => parts.push(`- ${rule}`));
  }

  return parts.join('\n');
}

/**
 * Split block into logical sections
 */
function splitBlockIntoSections(block: CanonicalPersonaBlock): string[] {
  const sections: string[] = [];

  // Header + context
  const header = `# ${block.atomic_unit.replace(/_/g, ' ')}\n` +
                 `Channel: ${block.channel}\n` +
                 (block.usage_context ? `Context: ${block.usage_context}` : '');
  sections.push(header);

  // Rules section
  if (block.rules.length > 0) {
    const rulesText = 'Rules:\n' + block.rules.map(r => `- ${r}`).join('\n');
    sections.push(rulesText);
  }

  // Phrases section
  if (block.signature_phrases.length > 0) {
    const phrasesText = 'Signature Phrases:\n' +
                        block.signature_phrases.map(p => `- ${p}`).join('\n');
    sections.push(phrasesText);
  }

  // Examples section
  if (block.example_dialogue && block.example_dialogue.length > 0) {
    const examplesText = 'Examples:\n' +
                         block.example_dialogue.map(e => `- ${e}`).join('\n');
    sections.push(examplesText);
  }

  // Negation section
  if (block.negation_rules.length > 0) {
    const negationText = 'Never:\n' +
                         block.negation_rules.map(n => `- ${n}`).join('\n');
    sections.push(negationText);
  }

  return sections;
}

/**
 * Split large section by sentences
 */
function splitLargeSection(text: string, targetTokens: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());

  let currentChunk = '';

  for (const sentence of sentences) {
    const testChunk = currentChunk + sentence.trim() + '.';

    if (estimateTokens(testChunk) > targetTokens && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.trim());
      currentChunk = sentence.trim() + '.';
    } else {
      currentChunk = testChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Get channel weight for embeddings
 */
function getChannelWeight(channel: PersonaChannel): number {
  const weights: Record<PersonaChannel, number> = {
    language: 0.35,
    eq: 0.30,
    coaching: 0.20,
    archetypes: 0.10,
    safety: 0.05,
  };

  return weights[channel] || 0.1;
}

/**
 * Get chunk statistics
 */
export function getChunkStats(chunks: EmbeddingChunk[]): {
  total: number;
  byChannel: Record<PersonaChannel, number>;
  avgTokens: number;
  minTokens: number;
  maxTokens: number;
} {
  const byChannel: any = {
    language: 0,
    eq: 0,
    coaching: 0,
    archetypes: 0,
    safety: 0,
  };

  let totalTokens = 0;
  let minTokens = Infinity;
  let maxTokens = 0;

  for (const chunk of chunks) {
    byChannel[chunk.channel]++;
    const tokens = chunk.token_count || 0;
    totalTokens += tokens;
    minTokens = Math.min(minTokens, tokens);
    maxTokens = Math.max(maxTokens, tokens);
  }

  return {
    total: chunks.length,
    byChannel,
    avgTokens: chunks.length > 0 ? totalTokens / chunks.length : 0,
    minTokens: minTokens === Infinity ? 0 : minTokens,
    maxTokens,
  };
}
