#!/bin/bash
# Master Embedding Pipeline Runner
# Embeds all KB and EQ chips to Pinecone

set -e

echo "🚀 IvyLevel v4.0 - Master Embedding Pipeline"
echo "=========================================="
echo ""

# Check environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    exit 1
fi

if [ -z "$PINECONE_API_KEY" ]; then
    echo "❌ Error: PINECONE_API_KEY not set"
    exit 1
fi

echo "✅ Environment variables validated"
echo ""

# Run KB chips embedding
echo "📚 Step 1/2: Embedding KB Chips..."
echo "------------------------------------"
npx ts-node scripts/embed_kb_chips.ts
echo ""

# Run EQ chips embedding
echo "🎭 Step 2/2: Embedding EQ Chips..."
echo "------------------------------------"
npx ts-node scripts/embed_eq_chips.ts
echo ""

echo "=========================================="
echo "✅ ALL EMBEDDINGS COMPLETE"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Verify embeddings in Pinecone console"
echo "  2. Run test assessment: npm run test:assessment"
echo "  3. Check execution runbook: docs/DEPLOYMENT_RUNBOOK.md"
echo ""
