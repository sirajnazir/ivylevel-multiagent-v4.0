#!/usr/bin/env ts-node
/**
 * Pinecone Index Info Script
 * Gets describe and stats for jenny-v3-3072-093025
 */

import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || 'pcsk_4Sei6r_Qtden5JKCuRMrXGSGdk9Gim5tX9e8bp7cAeSWTebDYCL78d76PvvYoYbKZV9Tzg';
const INDEX_NAME = 'jenny-v3-3072-093025';

async function getIndexInfo() {
  console.log('🔍 Pinecone Index Information');
  console.log('='.repeat(80));
  console.log(`Index: ${INDEX_NAME}`);
  console.log('='.repeat(80));
  console.log('');

  try {
    // Initialize Pinecone client
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

    // Get index description
    console.log('📊 INDEX DESCRIPTION');
    console.log('-'.repeat(80));

    const indexDescription = await pc.describeIndex(INDEX_NAME);

    console.log(`Name: ${indexDescription.name}`);
    console.log(`Dimension: ${indexDescription.dimension}`);
    console.log(`Metric: ${indexDescription.metric}`);
    console.log(`Host: ${indexDescription.host}`);

    if (indexDescription.status) {
      console.log(`Status: ${JSON.stringify(indexDescription.status)}`);
    }

    if (indexDescription.spec) {
      console.log('\nSpec:');
      if ('serverless' in indexDescription.spec && indexDescription.spec.serverless) {
        console.log(`  Type: Serverless`);
        console.log(`  Cloud: ${indexDescription.spec.serverless.cloud}`);
        console.log(`  Region: ${indexDescription.spec.serverless.region}`);
      } else if ('pod' in indexDescription.spec && indexDescription.spec.pod) {
        console.log(`  Type: Pod`);
        console.log(`  Pod Type: ${indexDescription.spec.pod.podType}`);
        console.log(`  Pods: ${indexDescription.spec.pod.pods}`);
        console.log(`  Replicas: ${indexDescription.spec.pod.replicas}`);
        console.log(`  Environment: ${indexDescription.spec.pod.environment}`);
      }
    }

    console.log('');

    // Get index stats
    console.log('📈 INDEX STATS');
    console.log('-'.repeat(80));

    const index = pc.index(INDEX_NAME);
    const stats = await index.describeIndexStats();

    // Note: API uses 'totalRecordCount' not 'totalVectorCount'
    const totalCount = (stats as any).totalRecordCount || (stats as any).totalVectorCount || 0;
    console.log(`Total Vector Count: ${totalCount.toLocaleString()}`);
    console.log(`Dimension: ${stats.dimension || 'N/A'}`);

    if (stats.namespaces && Object.keys(stats.namespaces).length > 0) {
      console.log(`\nNamespaces: ${Object.keys(stats.namespaces).length}`);
      console.log('\nNamespace Breakdown:');
      console.log('-'.repeat(80));

      for (const [namespace, data] of Object.entries(stats.namespaces)) {
        const nsName = namespace || '(default/empty)';
        // API uses 'recordCount' not 'vectorCount'
        const vectorCount = (data as any).recordCount || (data as any).vectorCount || 0;
        console.log(`  ${nsName.padEnd(40)}: ${vectorCount.toLocaleString().padStart(10)} vectors`);
      }
    } else {
      console.log('\nNo namespace data available (or all vectors in default namespace)');
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ Index information retrieved successfully');
    console.log('='.repeat(80));

  } catch (error) {
    console.log('');
    console.log('='.repeat(80));
    console.log('❌ ERROR');
    console.log('='.repeat(80));
    console.log(`Error: ${error}`);
    console.log('');
    console.log('Troubleshooting:');
    console.log('  1. Check PINECONE_API_KEY is set correctly');
    console.log('  2. Verify index name is correct');
    console.log('  3. Ensure you have access to this index');
    console.log('');
    process.exit(1);
  }
}

// Run
getIndexInfo().catch(console.error);
