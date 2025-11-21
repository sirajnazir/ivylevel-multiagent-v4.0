#!/usr/bin/env bash
###############################################################################
# EQ Chips Embedding Runner - Shell Wrapper
#
# Loads environment variables and embeds EQ chips into Pinecone.
#
# Usage:
#   ./scripts/run_embed_eq_chips.sh
###############################################################################

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project root
cd "$(dirname "$0")/.."

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}EQ Chips Embedding - Phase 1.5${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Load environment variables
if [ -f .env.embedding ]; then
    echo -e "${GREEN}✓${NC} Loading environment from .env.embedding"
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env.embedding | grep -v '^$' | xargs)
elif [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Loading environment from .env"
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
else
    echo -e "${RED}❌ Error: No .env or .env.embedding file found${NC}"
    exit 1
fi

# Validate required env vars
if [ -z "${OPENAI_API_KEY:-}" ]; then
    echo -e "${RED}❌ Error: OPENAI_API_KEY not set${NC}"
    exit 1
fi

if [ -z "${PINECONE_API_KEY:-}" ]; then
    echo -e "${RED}❌ Error: PINECONE_API_KEY not set${NC}"
    exit 1
fi

if [ -z "${PINECONE_INDEX_NAME:-}" ]; then
    echo -e "${RED}❌ Error: PINECONE_INDEX_NAME not set${NC}"
    exit 1
fi

# Optional: set EQ namespace (default will be used if not set)
export PINECONE_EQ_NAMESPACE="${PINECONE_EQ_NAMESPACE:-EQ_v1_2025}"

echo -e "${GREEN}✓${NC} Environment validated"
echo -e "${GREEN}✓${NC} OpenAI API Key: ${OPENAI_API_KEY:0:20}..."
echo -e "${GREEN}✓${NC} Pinecone Index: $PINECONE_INDEX_NAME"
echo -e "${GREEN}✓${NC} EQ Namespace: $PINECONE_EQ_NAMESPACE"
echo ""

# Run the TypeScript script
npx ts-node scripts/embed_eq_chips.ts
