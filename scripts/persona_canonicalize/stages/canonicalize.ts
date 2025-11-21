/**
 * stages/canonicalize.ts
 *
 * Stage C: Canonicalize Concepts into Structured Persona Blocks
 * Converts extracted concepts into standardized canonical format.
 */

import { generateId, log } from '../util';
import type {
  StageResult,
  ExtractedConcepts,
  CanonicalPersonaBlock,
  PersonaConcept,
  PersonaChannel,
} from '../types';

/**
 * Canonicalize concepts into structured blocks
 */
export async function canonicalizeConcepts(
  concepts: ExtractedConcepts
): Promise<StageResult<CanonicalPersonaBlock[]>> {
  try {
    log('Stage C: Canonicalizing concepts into blocks', 'info');

    const blocks: CanonicalPersonaBlock[] = [];

    // Process each channel
    for (const [channel, channelConcepts] of Object.entries(concepts)) {
      for (const concept of channelConcepts) {
        const block = conceptToBlock(concept, channel as PersonaChannel);
        blocks.push(block);
      }
    }

    log(`Stage C: Created ${blocks.length} canonical blocks`, 'info');

    return {
      success: true,
      data: blocks,
      stage: 'canonicalize',
    };
  } catch (error) {
    log(`Stage C failed: ${error}`, 'error');
    return {
      success: false,
      error: String(error),
      stage: 'canonicalize',
    };
  }
}

/**
 * Convert concept to canonical block
 */
function conceptToBlock(
  concept: PersonaConcept,
  channel: PersonaChannel
): CanonicalPersonaBlock {
  return {
    id: generateId(`jenny.${channel}`),
    channel,
    atomic_unit: concept.type || 'unknown',
    rules: concept.rules || [],
    signature_phrases: concept.examples || [],
    usage_context: concept.context || '',
    example_dialogue: extractDialogue(concept),
    negation_rules: concept.never_do || [],
    metadata: {
      extracted_at: new Date().toISOString(),
      source_channel: channel,
    },
  };
}

/**
 * Extract dialogue examples from concept
 */
function extractDialogue(concept: PersonaConcept): string[] {
  const dialogue: string[] = [];

  // Look for example dialogues in concept
  if (concept.examples) {
    // Filter for conversational examples (those with quotes or question marks)
    dialogue.push(...concept.examples.filter(ex =>
      ex.includes('"') || ex.includes('?') || ex.includes('Student:') || ex.includes('Jenny:')
    ));
  }

  return dialogue.slice(0, 5); // Limit to 5 examples
}

/**
 * Validate canonical block structure
 */
export function validateBlock(block: CanonicalPersonaBlock): boolean {
  // Required fields
  if (!block.id || !block.channel || !block.atomic_unit) {
    return false;
  }

  // Arrays should be defined (can be empty)
  if (!Array.isArray(block.rules) ||
      !Array.isArray(block.signature_phrases) ||
      !Array.isArray(block.negation_rules)) {
    return false;
  }

  // Valid channel
  const validChannels: PersonaChannel[] = ['language', 'eq', 'coaching', 'archetypes', 'safety'];
  if (!validChannels.includes(block.channel)) {
    return false;
  }

  return true;
}

/**
 * Merge duplicate blocks (same atomic_unit)
 */
export function mergeDuplicateBlocks(blocks: CanonicalPersonaBlock[]): CanonicalPersonaBlock[] {
  const blockMap = new Map<string, CanonicalPersonaBlock>();

  for (const block of blocks) {
    const key = `${block.channel}.${block.atomic_unit}`;

    if (blockMap.has(key)) {
      // Merge with existing
      const existing = blockMap.get(key)!;
      existing.rules = [...new Set([...existing.rules, ...block.rules])];
      existing.signature_phrases = [...new Set([...existing.signature_phrases, ...block.signature_phrases])];
      existing.negation_rules = [...new Set([...existing.negation_rules, ...block.negation_rules])];

      if (block.example_dialogue) {
        existing.example_dialogue = [
          ...(existing.example_dialogue || []),
          ...block.example_dialogue,
        ];
      }
    } else {
      blockMap.set(key, { ...block });
    }
  }

  return Array.from(blockMap.values());
}

/**
 * Sort blocks by channel and atomic_unit
 */
export function sortBlocks(blocks: CanonicalPersonaBlock[]): CanonicalPersonaBlock[] {
  return blocks.sort((a, b) => {
    // First by channel
    if (a.channel !== b.channel) {
      return a.channel.localeCompare(b.channel);
    }

    // Then by atomic_unit
    return a.atomic_unit.localeCompare(b.atomic_unit);
  });
}

/**
 * Get block statistics
 */
export function getBlockStats(blocks: CanonicalPersonaBlock[]): {
  total: number;
  byChannel: Record<PersonaChannel, number>;
  avgRulesPerBlock: number;
  avgPhrasesPerBlock: number;
} {
  const byChannel: any = {
    language: 0,
    eq: 0,
    coaching: 0,
    archetypes: 0,
    safety: 0,
  };

  let totalRules = 0;
  let totalPhrases = 0;

  for (const block of blocks) {
    byChannel[block.channel]++;
    totalRules += block.rules.length;
    totalPhrases += block.signature_phrases.length;
  }

  return {
    total: blocks.length,
    byChannel,
    avgRulesPerBlock: blocks.length > 0 ? totalRules / blocks.length : 0,
    avgPhrasesPerBlock: blocks.length > 0 ? totalPhrases / blocks.length : 0,
  };
}
