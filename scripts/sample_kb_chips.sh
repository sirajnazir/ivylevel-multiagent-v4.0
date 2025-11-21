#!/bin/bash
###############################################################################
# Sample KB Chip Files
# Quick investigation to see what's in the v6 KB chips folder
###############################################################################

echo "📁 SAMPLING KB CHIP FILES"
echo "================================================================================"
echo ""

KB_DIR="data/v4_organized/coaches/jenny/kb_intelligence_chips_v6"
EQ_DIR="data/v4_organized/coaches/jenny/eq_intelligence_chips_v2"

echo "📊 KB CHIPS DIRECTORY"
echo "--------------------------------------------------------------------------------"
echo "Path: $KB_DIR"
echo ""

if [ ! -d "$KB_DIR" ]; then
  echo "❌ Directory not found: $KB_DIR"
  exit 1
fi

# Count files
KB_COUNT=$(find "$KB_DIR" -type f ! -name "*.DS_Store" | wc -l | xargs)
echo "Total files: $KB_COUNT"
echo ""

# List first 20 files
echo "📄 First 20 KB chip files:"
echo "--------------------------------------------------------------------------------"
find "$KB_DIR" -type f ! -name "*.DS_Store" | head -20
echo ""

# Show sample file content
echo "📖 SAMPLE KB CHIP CONTENT (First file)"
echo "--------------------------------------------------------------------------------"
FIRST_FILE=$(find "$KB_DIR" -type f ! -name "*.DS_Store" | head -1)
echo "File: $FIRST_FILE"
echo ""
if [ -f "$FIRST_FILE" ]; then
  head -50 "$FIRST_FILE"
  echo ""
  echo "[... truncated for brevity ...]"
else
  echo "❌ No files found"
fi
echo ""

echo "================================================================================"
echo ""

echo "📊 EQ CHIPS DIRECTORY"
echo "--------------------------------------------------------------------------------"
echo "Path: $EQ_DIR"
echo ""

if [ ! -d "$EQ_DIR" ]; then
  echo "❌ Directory not found: $EQ_DIR"
  exit 1
fi

# Count files
EQ_COUNT=$(find "$EQ_DIR" -type f ! -name "*.DS_Store" | wc -l | xargs)
echo "Total files: $EQ_COUNT"
echo ""

# List first 10 files
echo "📄 First 10 EQ chip files:"
echo "--------------------------------------------------------------------------------"
find "$EQ_DIR" -type f ! -name "*.DS_Store" | head -10
echo ""

# Show sample file content
echo "📖 SAMPLE EQ CHIP CONTENT (First file)"
echo "--------------------------------------------------------------------------------"
FIRST_EQ=$(find "$EQ_DIR" -type f ! -name "*.DS_Store" | head -1)
echo "File: $FIRST_EQ"
echo ""
if [ -f "$FIRST_EQ" ]; then
  head -50 "$FIRST_EQ"
  echo ""
  echo "[... truncated for brevity ...]"
else
  echo "❌ No files found"
fi
echo ""

echo "================================================================================"
echo "✅ Sampling complete"
echo "================================================================================"
echo ""

echo "🎯 NEXT STEPS:"
echo "--------------------------------------------------------------------------------"
echo "1. Review the file names and content structure above"
echo "2. Compare against existing Pinecone vector metadata:"
echo "   - Filenames like '2023-08-02_W001-064...' in Pinecone"
echo "   - vs. filenames in kb_intelligence_chips_v6/"
echo ""
echo "3. Determine if there's overlap:"
echo "   - If filenames match → Possible duplicates"
echo "   - If filenames differ → Different content, safe to add"
echo ""
echo "4. Make decision:"
echo "   - Option A (Hybrid): Keep existing + add new namespaces"
echo "   - Option B (Fresh): Delete existing + embed only v6/v2"
echo ""
echo "5. See full analysis: cat PINECONE_VECTOR_ANALYSIS_REPORT.md"
echo ""
