#!/bin/bash
# EXECUTION SCRIPT - Run All Embeddings to Pinecone
# This is the ONE script to rule them all

set -e

echo "🚀 IVYLEVEL v4.0 - EMBEDDING EXECUTION"
echo "========================================"
echo ""
echo "This will:"
echo "  1. Load credentials from .env.embedding"
echo "  2. Embed 455 KB chips → Pinecone namespace KB_v6_2025"
echo "  3. Embed 107 EQ chips → Pinecone namespace EQ_v2_2025"
echo ""
echo "Duration: ~10-30 minutes (depending on rate limits)"
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f ".env.embedding" ]; then
    echo "✅ Loading credentials from .env.embedding"
    export $(grep -v '^#' .env.embedding | xargs)
else
    echo "❌ Error: .env.embedding not found"
    echo "   Please ensure .env.embedding exists in project root"
    exit 1
fi

# Validate required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not set"
    exit 1
fi

if [ -z "$PINECONE_API_KEY" ]; then
    echo "❌ Error: PINECONE_API_KEY not set"
    exit 1
fi

if [ -z "$PINECONE_INDEX" ]; then
    echo "❌ Error: PINECONE_INDEX not set"
    exit 1
fi

echo "✅ All required environment variables validated"
echo ""
echo "Configuration:"
echo "  - OpenAI Model: text-embedding-3-large"
echo "  - Pinecone Index: $PINECONE_INDEX"
echo "  - Pinecone Environment: $PINECONE_ENVIRONMENT"
echo ""

# Confirm execution
read -p "Press ENTER to start embedding pipeline (or Ctrl+C to cancel)... "
echo ""

START_TIME=$(date +%s)

# Step 1: Embed KB Chips
echo "=========================================="
echo "STEP 1/2: Embedding KB Chips"
echo "=========================================="
echo ""

if npx ts-node scripts/embed_kb_chips.ts; then
    echo ""
    echo "✅ KB chips embedding complete"
else
    echo ""
    echo "❌ KB chips embedding failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "STEP 2/2: Embedding EQ Chips"
echo "=========================================="
echo ""

if npx ts-node scripts/embed_eq_chips.ts; then
    echo ""
    echo "✅ EQ chips embedding complete"
else
    echo ""
    echo "❌ EQ chips embedding failed"
    exit 1
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "=========================================="
echo "✅ ALL EMBEDDINGS COMPLETE"
echo "=========================================="
echo ""
echo "Duration: ${MINUTES}m ${SECONDS}s"
echo ""
echo "Next steps:"
echo "  1. Verify in Pinecone console: https://app.pinecone.io"
echo "  2. Check namespaces: KB_v6_2025, EQ_v2_2025"
echo "  3. Run test: npx ts-node scripts/test_assessment_cli.ts 001"
echo "  4. Review: DEPLOYMENT_RUNBOOK.md"
echo ""
echo "🎉 Ready to ship!"
echo ""
