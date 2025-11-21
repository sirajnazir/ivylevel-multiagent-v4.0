#!/bin/bash
###############################################################################
# RAG Pipeline Quick Start Test
#
# This script sets all required environment variables and runs the RAG test.
# Use this for quick validation without manually exporting variables.
###############################################################################

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RAG Pipeline Quick Start Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
else
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "   Please create .env file with required API keys"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment variables set"
echo -e "${GREEN}✓${NC} OpenAI API Key: ${OPENAI_API_KEY:0:20}..."
echo -e "${GREEN}✓${NC} Pinecone Index: $PINECONE_INDEX_NAME"
echo ""

# Run the test
echo -e "${BLUE}Running RAG pipeline test...${NC}"
echo ""

npx ts-node scripts/test_rag_pipeline.ts

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ RAG PIPELINE TEST PASSED${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ RAG PIPELINE TEST FAILED${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
