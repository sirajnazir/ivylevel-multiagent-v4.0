#!/usr/bin/env bash
###############################################################################
# Batch Assessment Runner - Shell Wrapper
#
# Loads environment variables and runs assessment for all 11 students.
#
# Usage:
#   ./scripts/run_all_students_mvp.sh
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
echo -e "${BLUE}Batch Assessment Runner - Phase 1 MVP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Loading environment from .env"
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
else
    echo -e "${RED}⚠${NC}  Warning: .env file not found"
fi

# Validate required env vars
if [ -z "${OPENAI_API_KEY:-}" ]; then
    echo -e "${RED}❌ Error: OPENAI_API_KEY not set${NC}"
    echo "   Please set OPENAI_API_KEY in .env file or export it"
    exit 1
fi

if [ -z "${PINECONE_API_KEY:-}" ]; then
    echo -e "${RED}❌ Error: PINECONE_API_KEY not set${NC}"
    echo "   Please set PINECONE_API_KEY in .env file or export it"
    exit 1
fi

if [ -z "${PINECONE_INDEX_NAME:-}" ]; then
    echo -e "${RED}❌ Error: PINECONE_INDEX_NAME not set${NC}"
    echo "   Please set PINECONE_INDEX_NAME in .env file or export it"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment validated"
echo -e "${GREEN}✓${NC} OpenAI API Key: ${OPENAI_API_KEY:0:20}..."
echo -e "${GREEN}✓${NC} Pinecone Index: $PINECONE_INDEX_NAME"
echo ""

# Run the TypeScript script
npx ts-node scripts/run_all_students_mvp.ts
