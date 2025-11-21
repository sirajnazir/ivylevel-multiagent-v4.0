#!/usr/bin/env ts-node
import { Pinecone } from '@pinecone-database/pinecone';

const INDEX_NAME = 'jenny-v3-3072-093025';
const PINECONE_API_KEY = 'pcsk_4Sei6r_Qtden5JKCuRMrXGSGdk9Gim5tX9e8bp7cAeSWTebDYCL78d76PvvYoYbKZV9Tzg';

async function testQuery() {
  console.log('Testing direct query to namespace...');

  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pc.index(INDEX_NAME);

    // Create a dummy embedding (3072 dimensions of zeros)
    const dummyVector = new Array(3072).fill(0);

    console.log('Querying KBv6_2025-10-06_v1.0 namespace...');
    const result = await index.namespace('KBv6_2025-10-06_v1.0').query({
      vector: dummyVector,
      topK: 5,
      includeMetadata: true
    });

    console.log(`✅ Got ${result.matches?.length || 0} results`);
    if (result.matches && result.matches.length > 0) {
      console.log('First match:', result.matches[0].id);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testQuery();
