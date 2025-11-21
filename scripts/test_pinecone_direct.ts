#!/usr/bin/env ts-node
/**
 * Direct Pinecone Index Test
 */

import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = 'pcsk_4Sei6r_Qtden5JKCuRMrXGSGdk9Gim5tX9e8bp7cAeSWTebDYCL78d76PvvYoYbKZV9Tzg';
const INDEX_NAME = 'jenny-v3-3072-20250930';

async function testDirect() {
  console.log('🧪 Direct Pinecone Index Test');
  console.log('='.repeat(80));

  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pc.index(INDEX_NAME);

    console.log('📊 Getting index stats...');
    const stats = await index.describeIndexStats();

    console.log('✅ Stats retrieved successfully!');
    console.log('');
    console.log(`Total Vectors: ${(stats as any).totalRecordCount || 0}`);
    console.log(`Dimension: ${stats.dimension}`);
    console.log('');

    if (stats.namespaces) {
      const namespaceKeys = Object.keys(stats.namespaces);
      console.log(`Namespaces Found: ${namespaceKeys.length}`);
      console.log('-'.repeat(80));

      for (const [ns, data] of Object.entries(stats.namespaces)) {
        const count = (data as any).recordCount || 0;
        console.log(`  ${ns || '(default)'}: ${count} vectors`);
      }
    } else {
      console.log('⚠️  No namespaces found');
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ Test complete');

  } catch (error: any) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  }
}

testDirect().catch(console.error);
