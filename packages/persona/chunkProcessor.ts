/**
 * persona/chunkProcessor.ts
 *
 * Processes persona data files into embeddable chunks.
 * Breaks down markdown and JSON into atomic persona concepts.
 */

import type {
  PersonaChunk,
  EmbeddingChannel,
  PersonaDataSources,
} from './types';

/**
 * Persona Chunk Processor
 * Converts raw persona data into structured chunks ready for embedding
 */
export class PersonaChunkProcessor {
  private chunkCounter: number = 0;

  /**
   * Process all persona data sources into chunks
   */
  processAll(sources: PersonaDataSources, rawData: {
    coreLanguage: string;
    eqPatterns: string;
    heuristics: any;
    coachingPatterns: any;
    archetypeMappings: any;
    negativeExamples: string;
    goldenThread: string;
  }): PersonaChunk[] {
    const chunks: PersonaChunk[] = [];

    // Process language channel
    chunks.push(...this.processLanguageData(rawData.coreLanguage));

    // Process EQ channel
    chunks.push(...this.processEQData(rawData.eqPatterns));

    // Process strategy channel
    chunks.push(...this.processStrategyData(rawData.heuristics, rawData.coachingPatterns));

    // Process pattern channel
    chunks.push(...this.processPatternData(rawData.goldenThread));

    // Process archetype channel
    chunks.push(...this.processArchetypeData(rawData.archetypeMappings));

    // Process safety channel
    chunks.push(...this.processSafetyData(rawData.negativeExamples));

    return chunks;
  }

  /**
   * Process core language data into chunks
   */
  private processLanguageData(markdown: string): PersonaChunk[] {
    const chunks: PersonaChunk[] = [];

    // Split by ## headings
    const sections = this.splitByHeadings(markdown);

    for (const section of sections) {
      const lines = section.content.split('\n').filter(l => l.trim());

      // Each bullet list item becomes a chunk
      const phraseLines = lines.filter(l => l.startsWith('- ') && !l.startsWith('- **'));
      const metaLines = lines.filter(l => l.startsWith('- **'));

      if (phraseLines.length > 0) {
        const text = `${section.heading}\n${phraseLines.join('\n')}\n${metaLines.join('\n')}`;

        chunks.push({
          id: this.generateChunkId('language'),
          text: text.trim(),
          channel: 'language',
          weight: 0.9,
          category: section.heading,
          tags: ['idiom', 'language_pattern'],
          metadata: {
            phraseCount: phraseLines.length,
          },
        });
      }
    }

    return chunks;
  }

  /**
   * Process EQ patterns data into chunks
   */
  private processEQData(markdown: string): PersonaChunk[] {
    const chunks: PersonaChunk[] = [];

    const sections = this.splitByHeadings(markdown);

    for (const section of sections) {
      const lines = section.content.split('\n').filter(l => l.trim());

      // Group bullet points
      const bulletPoints = lines.filter(l => l.startsWith('- '));

      if (bulletPoints.length > 0) {
        const text = `${section.heading}\n${bulletPoints.join('\n')}`;

        chunks.push({
          id: this.generateChunkId('eq'),
          text: text.trim(),
          channel: 'eq',
          weight: 0.85,
          category: section.heading,
          tags: ['eq_pattern', 'emotional_intelligence'],
          metadata: {
            patternCount: bulletPoints.length,
          },
        });
      }
    }

    return chunks;
  }

  /**
   * Process strategy data (heuristics + coaching patterns) into chunks
   */
  private processStrategyData(heuristics: any, coachingPatterns: any): PersonaChunk[] {
    const chunks: PersonaChunk[] = [];

    // Process coaching heuristics
    if (heuristics.coaching_heuristics) {
      for (const heuristic of heuristics.coaching_heuristics) {
        chunks.push({
          id: this.generateChunkId('strategy'),
          text: `Heuristic: ${heuristic.name}\nPattern: ${heuristic.pattern}\nWeight: ${heuristic.weight}`,
          channel: 'strategy',
          weight: heuristic.weight,
          category: 'coaching_heuristic',
          tags: ['heuristic', 'strategy'],
          metadata: {
            heuristicName: heuristic.name,
            pattern: heuristic.pattern,
          },
        });
      }
    }

    // Process coaching move signatures
    if (coachingPatterns.coaching_move_signatures) {
      for (const [moveName, moveData] of Object.entries(coachingPatterns.coaching_move_signatures)) {
        const md = moveData as any;
        const text = `Coaching Move: ${moveName}\n` +
                     `Language Markers: ${md.language_markers.join(', ')}\n` +
                     `When Used: ${md.when_used}\n` +
                     `Typical Follow-up: ${md.typical_followup}`;

        chunks.push({
          id: this.generateChunkId('strategy'),
          text,
          channel: 'strategy',
          weight: 0.8,
          category: 'coaching_move',
          tags: ['coaching_move', 'strategy'],
          metadata: {
            moveName,
            whenUsed: md.when_used,
          },
        });
      }
    }

    return chunks;
  }

  /**
   * Process pattern recognition data (golden thread) into chunks
   */
  private processPatternData(markdown: string): PersonaChunk[] {
    const chunks: PersonaChunk[] = [];

    const sections = this.splitByHeadings(markdown);

    for (const section of sections) {
      // Each major section becomes a chunk
      if (section.content.length > 100) {
        chunks.push({
          id: this.generateChunkId('pattern'),
          text: `${section.heading}\n${section.content}`,
          channel: 'pattern',
          weight: 0.85,
          category: section.heading,
          tags: ['pattern', 'golden_thread'],
          metadata: {
            sectionLength: section.content.length,
          },
        });
      }
    }

    return chunks;
  }

  /**
   * Process archetype interaction data into chunks
   */
  private processArchetypeData(archetypeData: any): PersonaChunk[] {
    const chunks: PersonaChunk[] = [];

    if (archetypeData.archetype_interaction_signatures) {
      for (const [archetype, data] of Object.entries(archetypeData.archetype_interaction_signatures)) {
        const ad = data as any;

        // Create comprehensive archetype chunk
        const text = `Archetype: ${archetype}\n` +
                     `Primary Needs: ${ad.primary_needs.join(', ')}\n` +
                     `Signature Language: ${ad.signature_language.join(', ')}\n` +
                     `Avoid: ${ad.avoid.join(', ')}\n` +
                     `Coaching Sequence: ${ad.typical_coaching_sequence.join(' → ')}`;

        chunks.push({
          id: this.generateChunkId('archetype'),
          text,
          channel: 'archetype',
          weight: 0.75,
          category: archetype,
          tags: ['archetype', 'student_type'],
          metadata: {
            archetype,
            primaryNeeds: ad.primary_needs,
          },
        });
      }
    }

    return chunks;
  }

  /**
   * Process safety/boundary data (negative examples) into chunks
   */
  private processSafetyData(markdown: string): PersonaChunk[] {
    const chunks: PersonaChunk[] = [];

    const sections = this.splitByHeadings(markdown);

    for (const section of sections) {
      const lines = section.content.split('\n').filter(l => l.trim());

      // Group negative examples (❌) and positive alternatives (✅)
      const negativeExamples = lines.filter(l => l.includes('❌'));
      const positiveExamples = lines.filter(l => l.includes('✅'));

      if (negativeExamples.length > 0) {
        const text = `${section.heading}\nNEVER SAY:\n${negativeExamples.join('\n')}` +
                     (positiveExamples.length > 0 ? `\n\nSAY INSTEAD:\n${positiveExamples.join('\n')}` : '');

        chunks.push({
          id: this.generateChunkId('safety'),
          text: text.trim(),
          channel: 'safety',
          weight: 1.0,  // Safety is critical
          category: section.heading,
          tags: ['safety', 'anti_pattern', 'boundary'],
          metadata: {
            negativeCount: negativeExamples.length,
            positiveCount: positiveExamples.length,
          },
        });
      }
    }

    return chunks;
  }

  /**
   * Split markdown by ## headings
   */
  private splitByHeadings(markdown: string): Array<{ heading: string; content: string }> {
    const sections: Array<{ heading: string; content: string }> = [];
    const lines = markdown.split('\n');

    let currentHeading = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentHeading) {
          sections.push({
            heading: currentHeading,
            content: currentContent.join('\n').trim(),
          });
        }

        // Start new section
        currentHeading = line.replace('## ', '').trim();
        currentContent = [];
      } else if (line.startsWith('# ')) {
        // Skip top-level headings
        continue;
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentHeading) {
      sections.push({
        heading: currentHeading,
        content: currentContent.join('\n').trim(),
      });
    }

    return sections;
  }

  /**
   * Generate unique chunk ID
   */
  private generateChunkId(channel: EmbeddingChannel): string {
    return `${channel}_chunk_${this.chunkCounter++}_${Date.now()}`;
  }

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokenCount(text: string): number {
    // Rough estimate: 4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Split chunk if too large
   */
  splitLargeChunk(chunk: PersonaChunk, maxTokens: number = 250): PersonaChunk[] {
    const estimatedTokens = this.estimateTokenCount(chunk.text);

    if (estimatedTokens <= maxTokens) {
      return [chunk];
    }

    // Split by sentences
    const sentences = chunk.text.split(/[.!?]+/).filter(s => s.trim());
    const chunks: PersonaChunk[] = [];
    let currentText = '';
    let sentenceBuffer: string[] = [];

    for (const sentence of sentences) {
      sentenceBuffer.push(sentence.trim());
      const testText = sentenceBuffer.join('. ') + '.';

      if (this.estimateTokenCount(testText) > maxTokens) {
        // Save current buffer
        if (currentText) {
          chunks.push({
            ...chunk,
            id: this.generateChunkId(chunk.channel),
            text: currentText,
          });
        }

        currentText = sentence.trim() + '.';
        sentenceBuffer = [sentence.trim()];
      } else {
        currentText = testText;
      }
    }

    // Save remaining
    if (currentText) {
      chunks.push({
        ...chunk,
        id: this.generateChunkId(chunk.channel),
        text: currentText,
      });
    }

    return chunks;
  }

  /**
   * Get statistics about processed chunks
   */
  getChunkStats(chunks: PersonaChunk[]): {
    total: number;
    byChannel: Record<EmbeddingChannel, number>;
    avgWeight: number;
    totalTokens: number;
  } {
    const byChannel: Record<string, number> = {};
    let totalWeight = 0;
    let totalTokens = 0;

    for (const chunk of chunks) {
      byChannel[chunk.channel] = (byChannel[chunk.channel] || 0) + 1;
      totalWeight += chunk.weight;
      totalTokens += this.estimateTokenCount(chunk.text);
    }

    return {
      total: chunks.length,
      byChannel: byChannel as Record<EmbeddingChannel, number>,
      avgWeight: chunks.length > 0 ? totalWeight / chunks.length : 0,
      totalTokens,
    };
  }
}
