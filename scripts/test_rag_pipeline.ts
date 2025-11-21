#!/usr/bin/env ts-node
/**
 * End-to-End RAG Pipeline Test
 * Tests retrieval from actual Pinecone namespaces
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { retrieveAssessmentContext } from '../packages/rag/assessmentRag';
import { extendMetadata } from '../packages/rag/metadataExtender';

async function test() {
  console.log('🧪 Testing RAG Pipeline');
  console.log('='.repeat(80));

  const query = 'deadline crisis and essay breakthrough';

  console.log(`Query: "${query}"`);
  console.log('');

  try {
    console.log('📊 Retrieving from Pinecone...');
    const chips = await retrieveAssessmentContext(
      query,
      { studentId: 'test', topicTags: ['deadline_crunch', 'essay'] },
      { topKInitial: 12, topKReranked: 5 }
    );

    console.log(`✅ Retrieved ${chips.length} chips`);
    console.log('');

    console.log('=== CHIPS ===');
    chips.forEach((c, idx) => {
      const extended = extendMetadata(c);
      console.log(`\n[${idx + 1}] ${c.id}`);
      console.log(`    Score: ${c.score.toFixed(4)}`);
      console.log(`    Type: ${c.metadata.type || 'N/A'}`);
      console.log(`    Phase: ${c.metadata.phase || 'N/A'}`);
      console.log(`    Seniority: ${extended.enriched.seniority}`);
      console.log(`    Confidence: ${extended.enriched.confidenceCategory}`);
      console.log(`    Source: ${c.source}`);
      console.log(`    Text: ${c.text.substring(0, 100)}...`);
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ RAG Pipeline Test Complete');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
