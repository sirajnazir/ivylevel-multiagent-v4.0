#!/usr/bin/env ts-node
/**
 * Check the ACTUAL Pinecone Index: jenny-v3-3072-093025
 */

import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = 'pcsk_4Sei6r_Qtden5JKCuRMrXGSGdk9Gim5tX9e8bp7cAeSWTebDYCL78d76PvvYoYbKZV9Tzg';
const INDEX_NAME = 'jenny-v3-3072-093025';

async function checkIndex() {
  console.log('📊 CHECKING INDEX: jenny-v3-3072-093025');
  console.log('='.repeat(80));
  console.log('');

  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

    // Describe index
    console.log('📋 INDEX DESCRIPTION');
    console.log('-'.repeat(80));
    const desc = await pc.describeIndex(INDEX_NAME);
    console.log(`Name: ${desc.name}`);
    console.log(`Dimension: ${desc.dimension}`);
    console.log(`Metric: ${desc.metric}`);
    console.log(`Host: ${desc.host}`);

    if (desc.spec && 'serverless' in desc.spec && desc.spec.serverless) {
      console.log(`Type: Serverless`);
      console.log(`Cloud: ${desc.spec.serverless.cloud}`);
      console.log(`Region: ${desc.spec.serverless.region}`);
    }

    console.log('');

    // Get stats
    console.log('📈 INDEX STATS');
    console.log('-'.repeat(80));

    const index = pc.index(INDEX_NAME);
    const stats = await index.describeIndexStats();

    const totalCount = (stats as any).totalRecordCount || 0;
    console.log(`Total Vectors: ${totalCount.toLocaleString()}`);
    console.log(`Dimension: ${stats.dimension}`);

    if (stats.namespaces && Object.keys(stats.namespaces).length > 0) {
      console.log(`\nNamespaces Found: ${Object.keys(stats.namespaces).length}`);
      console.log('-'.repeat(80));

      for (const [ns, data] of Object.entries(stats.namespaces)) {
        const name = ns || '(default/empty)';
        const count = (data as any).recordCount || 0;
        console.log(`  ${name.padEnd(50)}: ${count.toLocaleString().padStart(10)} vectors`);
      }
    } else {
      console.log(`\n⚠️  No namespaces found - all vectors in default namespace`);
      console.log(`   This means existing vectors don't have namespace metadata`);
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ Index check complete');
    console.log('='.repeat(80));
    console.log('');

    // Decision point
    console.log('🎯 NEXT STEPS:');
    console.log('-'.repeat(80));

    if (totalCount > 0) {
      console.log(`You have ${totalCount} existing vectors in this index.`);
      console.log('');
      console.log('Options:');
      console.log('  1. Add KB/EQ chips to NEW namespaces (KB_v6_2025, EQ_v2_2025)');
      console.log('  2. Keep existing vectors separate');
      console.log('  3. Run embeddings now: ./scripts/EXECUTE_EMBEDDINGS.sh');
    } else {
      console.log('Index is EMPTY - ready for new embeddings!');
      console.log('Run: ./scripts/EXECUTE_EMBEDDINGS.sh');
    }
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('='.repeat(80));
    console.log('❌ ERROR');
    console.log('='.repeat(80));
    console.log(`Error: ${error?.message || error}`);
    console.log('');
    process.exit(1);
  }
}

checkIndex().catch(console.error);
