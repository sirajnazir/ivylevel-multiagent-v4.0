/**
 * Test Pinecone Connection
 * Verifies that the Pinecone index exists and is accessible
 */

import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || '';
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'jenny-v3-3072-093025';

async function testPineconeConnection() {
  console.log('[PineconeTest] Starting connection test...');
  console.log(`[PineconeTest] Index name: ${PINECONE_INDEX_NAME}`);
  console.log(`[PineconeTest] API key length: ${PINECONE_API_KEY.length} characters`);

  try {
    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });

    console.log('[PineconeTest] ✓ Pinecone client initialized');

    // List all indexes
    console.log('[PineconeTest] Listing all indexes...');
    const indexes = await pinecone.listIndexes();
    console.log(`[PineconeTest] Found ${indexes.indexes?.length || 0} indexes:`);
    indexes.indexes?.forEach((idx) => {
      console.log(`  - ${idx.name} (dimension: ${idx.dimension}, metric: ${idx.metric})`);
    });

    // Check if our index exists
    const targetIndex = indexes.indexes?.find((idx) => idx.name === PINECONE_INDEX_NAME);

    if (!targetIndex) {
      console.error(`[PineconeTest] ✗ Index "${PINECONE_INDEX_NAME}" not found!`);
      console.log('[PineconeTest] Available indexes:');
      indexes.indexes?.forEach((idx) => console.log(`  - ${idx.name}`));
      process.exit(1);
    }

    console.log(`[PineconeTest] ✓ Index "${PINECONE_INDEX_NAME}" found`);
    console.log(`[PineconeTest]   Dimension: ${targetIndex.dimension}`);
    console.log(`[PineconeTest]   Metric: ${targetIndex.metric}`);
    console.log(`[PineconeTest]   Host: ${targetIndex.host}`);

    // Try to connect to the index
    const index = pinecone.index(PINECONE_INDEX_NAME);
    console.log('[PineconeTest] ✓ Index connection established');

    // Try to query the index
    console.log('[PineconeTest] Testing query with dummy vector...');
    const dummyVector = Array(3072).fill(0.1);

    const queryResult = await index.query({
      vector: dummyVector,
      topK: 3,
      includeMetadata: true,
    });

    console.log(`[PineconeTest] ✓ Query successful, got ${queryResult.matches?.length || 0} results`);

    if (queryResult.matches && queryResult.matches.length > 0) {
      console.log('[PineconeTest] Sample result:');
      const sample = queryResult.matches[0];
      console.log(`  - ID: ${sample.id}`);
      console.log(`  - Score: ${sample.score}`);
      console.log(`  - Metadata: ${JSON.stringify(sample.metadata, null, 2).substring(0, 200)}...`);
    }

    console.log('[PineconeTest] ✓ All tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('[PineconeTest] ✗ Error:', error);
    if (error instanceof Error) {
      console.error('[PineconeTest] Error message:', error.message);
      console.error('[PineconeTest] Error stack:', error.stack);
    }
    process.exit(1);
  }
}

testPineconeConnection();
