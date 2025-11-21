#!/usr/bin/env ts-node
/**
 * Analyze Existing Pinecone Vectors
 * Queries sample vectors from each namespace to understand what's already embedded
 */

import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = 'pcsk_4Sei6r_Qtden5JKCuRMrXGSGdk9Gim5tX9e8bp7cAeSWTebDYCL78d76PvvYoYbKZV9Tzg';
const INDEX_NAME = 'jenny-v3-3072-093025';

interface VectorMetadata {
  [key: string]: any;
}

interface VectorRecord {
  id: string;
  values: number[];
  metadata?: VectorMetadata;
}

async function analyzeVectors() {
  console.log('📊 ANALYZING EXISTING PINECONE VECTORS');
  console.log('='.repeat(80));
  console.log(`Index: ${INDEX_NAME}`);
  console.log('='.repeat(80));
  console.log('');

  try {
    const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
    const index = pc.index(INDEX_NAME);

    // Get index stats first
    console.log('📈 CURRENT INDEX STATE');
    console.log('-'.repeat(80));
    const stats = await index.describeIndexStats();
    const totalCount = (stats as any).totalRecordCount || 0;

    console.log(`Total Vectors: ${totalCount.toLocaleString()}`);
    console.log(`Dimension: ${stats.dimension}`);
    console.log('');

    if (!stats.namespaces || Object.keys(stats.namespaces).length === 0) {
      console.log('⚠️  No namespaces found - cannot analyze');
      return;
    }

    const namespaces = Object.entries(stats.namespaces);
    console.log(`Namespaces to analyze: ${namespaces.length}`);
    console.log('');

    // Analyze each namespace
    for (const [namespace, nsData] of namespaces) {
      const recordCount = (nsData as any).recordCount || 0;

      console.log('═'.repeat(80));
      console.log(`📦 NAMESPACE: ${namespace}`);
      console.log('═'.repeat(80));
      console.log(`Record Count: ${recordCount.toLocaleString()}`);
      console.log('');

      // Query sample vectors from this namespace
      console.log('🔍 Querying sample vectors...');
      console.log('-'.repeat(80));

      try {
        // Create a dummy query vector (zeros) just to get samples
        const dummyVector = new Array(3072).fill(0);

        const queryResponse = await index.namespace(namespace).query({
          vector: dummyVector,
          topK: Math.min(10, recordCount), // Get up to 10 samples
          includeMetadata: true,
          includeValues: false
        });

        if (queryResponse.matches && queryResponse.matches.length > 0) {
          console.log(`✅ Retrieved ${queryResponse.matches.length} sample vectors`);
          console.log('');

          // Analyze metadata structure
          const metadataKeys = new Set<string>();
          const metadataSamples: any[] = [];

          queryResponse.matches.forEach((match: any) => {
            if (match.metadata) {
              Object.keys(match.metadata).forEach(key => metadataKeys.add(key));
              metadataSamples.push({
                id: match.id,
                score: match.score,
                metadata: match.metadata
              });
            }
          });

          console.log('📋 METADATA SCHEMA');
          console.log('-'.repeat(80));
          console.log(`Unique metadata fields found: ${metadataKeys.size}`);
          console.log('');
          console.log('Fields:');
          Array.from(metadataKeys).sort().forEach(key => {
            console.log(`  - ${key}`);
          });
          console.log('');

          console.log('📝 SAMPLE RECORDS (First 5)');
          console.log('-'.repeat(80));

          metadataSamples.slice(0, 5).forEach((sample, idx) => {
            console.log(`\n[${idx + 1}] ID: ${sample.id}`);
            console.log(`    Score: ${sample.score?.toFixed(4) || 'N/A'}`);

            if (sample.metadata) {
              console.log('    Metadata:');
              Object.entries(sample.metadata).forEach(([key, value]) => {
                let displayValue = value;
                if (typeof value === 'string' && value.length > 100) {
                  displayValue = value.substring(0, 100) + '...';
                }
                console.log(`      ${key}: ${JSON.stringify(displayValue)}`);
              });
            } else {
              console.log('    Metadata: (none)');
            }
          });

          console.log('');
          console.log('-'.repeat(80));

          // Analyze ID patterns
          console.log('🔤 ID PATTERNS');
          console.log('-'.repeat(80));
          const idPrefixes = new Map<string, number>();

          queryResponse.matches.forEach((match: any) => {
            const prefix = match.id.split('-')[0] || match.id.split('_')[0] || 'unknown';
            idPrefixes.set(prefix, (idPrefixes.get(prefix) || 0) + 1);
          });

          console.log('ID prefix distribution:');
          Array.from(idPrefixes.entries())
            .sort((a, b) => b[1] - a[1])
            .forEach(([prefix, count]) => {
              console.log(`  ${prefix}: ${count} vectors`);
            });
          console.log('');

        } else {
          console.log('⚠️  No vectors returned from query');
          console.log('');
        }

      } catch (queryError: any) {
        console.log(`❌ Error querying namespace: ${queryError.message}`);
        console.log('');
      }

      console.log('');
    }

    // Generate summary report
    console.log('═'.repeat(80));
    console.log('📊 ANALYSIS SUMMARY');
    console.log('═'.repeat(80));
    console.log('');

    console.log('🎯 KEY FINDINGS:');
    console.log('-'.repeat(80));
    console.log(`Total namespaces: ${namespaces.length}`);
    console.log(`Total vectors: ${totalCount.toLocaleString()}`);
    console.log('');

    console.log('Namespace breakdown:');
    namespaces.forEach(([ns, data]) => {
      const count = (data as any).recordCount || 0;
      console.log(`  - ${ns}: ${count.toLocaleString()} vectors`);
    });
    console.log('');

    console.log('📅 NAMESPACE NAMING PATTERNS:');
    console.log('-'.repeat(80));
    namespaces.forEach(([ns]) => {
      console.log(`  ${ns}`);

      // Parse namespace name
      const parts = ns.split('_');
      if (parts.length >= 2) {
        console.log(`    - Type: ${parts[0]}`);
        console.log(`    - Date: ${parts.slice(1).join('_')}`);
      }
    });
    console.log('');

    console.log('🔍 NEXT STEPS:');
    console.log('-'.repeat(80));
    console.log('Based on this analysis, you should:');
    console.log('');
    console.log('1. Review the metadata structure to understand what\'s embedded');
    console.log('2. Compare namespace dates (Oct 2025) with v4_organized data');
    console.log('3. Decide embedding strategy:');
    console.log('   a) Keep existing vectors if they match v4_organized content');
    console.log('   b) Add new namespaces (KB_v6_2025, EQ_v2_2025) without deleting old');
    console.log('   c) Clear index and re-embed everything fresh');
    console.log('');

    console.log('═'.repeat(80));
    console.log('✅ Analysis complete');
    console.log('═'.repeat(80));

  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(80));
    console.log('❌ ERROR');
    console.log('═'.repeat(80));
    console.log(`Error: ${error?.message || error}`);
    console.log('');
    if (error?.stack) {
      console.log('Stack trace:');
      console.log(error.stack);
    }
    process.exit(1);
  }
}

analyzeVectors().catch(console.error);
