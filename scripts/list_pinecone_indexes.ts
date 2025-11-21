#!/usr/bin/env ts-node
/**
 * List All Pinecone Indexes
 */

import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || 'pcsk_4Sei6r_Qtden5JKCuRMrXGSGdk9Gim5tX9e8bp7cAeSWTebDYCL78d76PvvYoYbKZV9Tzg';

async function listIndexes() {
  console.log('📋 Listing All Pinecone Indexes');
  console.log('='.repeat(80));
  console.log('');

  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

    const indexes = await pc.listIndexes();

    if (indexes.indexes && indexes.indexes.length > 0) {
      console.log(`Found ${indexes.indexes.length} index(es):`);
      console.log('-'.repeat(80));

      for (const index of indexes.indexes) {
        console.log(`\n📊 ${index.name}`);
        console.log(`   Dimension: ${index.dimension}`);
        console.log(`   Metric: ${index.metric}`);
        console.log(`   Host: ${index.host}`);

        if (index.spec) {
          if ('serverless' in index.spec && index.spec.serverless) {
            console.log(`   Type: Serverless`);
            console.log(`   Cloud: ${index.spec.serverless.cloud}`);
            console.log(`   Region: ${index.spec.serverless.region}`);
          } else if ('pod' in index.spec && index.spec.pod) {
            console.log(`   Type: Pod`);
            console.log(`   Environment: ${index.spec.pod.environment}`);
          }
        }
      }

      console.log('');
      console.log('='.repeat(80));
      console.log('✅ List complete');
      console.log('='.repeat(80));
    } else {
      console.log('⚠️  No indexes found');
      console.log('');
      console.log('This could mean:');
      console.log('  1. API key has no indexes created');
      console.log('  2. Wrong API key / environment');
      console.log('  3. Indexes were deleted');
    }

  } catch (error) {
    console.log('');
    console.log('='.repeat(80));
    console.log('❌ ERROR');
    console.log('='.repeat(80));
    console.log(`Error: ${error}`);
    console.log('');
    console.log('Check:');
    console.log('  1. PINECONE_API_KEY is valid');
    console.log('  2. Network connection');
    console.log('  3. Account permissions');
    process.exit(1);
  }
}

listIndexes().catch(console.error);
