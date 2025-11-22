# 🚀 DEPLOYMENT RUNBOOK - Phase 1 MVP

**Project:** IvyLevel v4.0 Assessment Agent
**Version:** 1.0
**Date:** 2025-11-19
**Status:** Ready for Deployment

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Data Organization Complete](#data-organization-complete)
3. [Embedding Pipeline](#embedding-pipeline)
4. [Testing](#testing)
5. [Deployment Steps](#deployment-steps)
6. [Validation](#validation)
7. [Rollback Plan](#rollback-plan)
8. [Troubleshooting](#troubleshooting)

---

## 1. PREREQUISITES

### ✅ Environment Variables

Ensure these are set:

```bash
export OPENAI_API_KEY="sk-..."
export PINECONE_API_KEY="..."
export DATABASE_URL="postgresql://..."
```

### ✅ Dependencies Installed

```bash
npm install
```

### ✅ Data Reorganization Complete

- ✅ 869 files organized in `data/v4_organized/`
- ✅ Backup created: `data_backup_20251119.tar.gz` (36 MB)
- ✅ Huda structured JSON created: `student_000_huda_structured.json`

---

## 2. DATA ORGANIZATION COMPLETE ✅

### File Structure

```
data/v4_organized/
├── coaches/jenny/                  (806 files)
│   ├── raw/                        RAW source materials
│   │   └── huda/
│   │       ├── 01_assess_session/
│   │       ├── 02_gameplan_reports/
│   │       ├── 03_session_transcripts/  # 93 weeks!
│   │       ├── 04_exec_docs/
│   │       ├── 05_imessage/
│   │       └── 06_college_apps/
│   │
│   └── curated/                    CURATED intelligence
│       ├── kb_chips/               # 455 files
│       ├── eq_chips/               # 107 files
│       ├── frameworks/             # 2 files
│       └── narrative/              # 5 files
│
├── students/jenny_assessments_v1/  (22 files)
│   ├── student_000_huda_structured.json
│   ├── student_001_anoushka_structured.json
│   └── ... (11 total students)
│
└── reports/
```

### Data Paths Updated

- ✅ `/packages/data-loaders/jennyAssessments.ts` → `v4_organized/`
- ✅ `/packages/ingestion/batch/ingestConfig.ts` → `v4_organized/`

---

## 3. EMBEDDING PIPELINE

### Scripts Created

1. **`scripts/embed_kb_chips.ts`**
   - Embeds KB intelligence chips to Pinecone
   - Namespace: `KB_v6_2025`
   - Model: `text-embedding-3-large`

2. **`scripts/embed_eq_chips.ts`**
   - Embeds EQ/emotional intelligence chips
   - Namespace: `EQ_v2_2025`
   - Model: `text-embedding-3-large`

3. **`scripts/run_embeddings.sh`**
   - Master script to run both pipelines

### Execution

```bash
# Set environment variables
export OPENAI_API_KEY="sk-..."
export PINECONE_API_KEY="..."

# Run full embedding pipeline
./scripts/run_embeddings.sh
```

**Expected Duration:** 10-30 minutes (depending on API rate limits)

**Expected Outputs:**
- KB chips: ~455 vectors in `KB_v6_2025` namespace
- EQ chips: ~107 vectors in `EQ_v2_2025` namespace

---

## 4. TESTING

### Test Script Created

**`scripts/test_assessment_cli.ts`**

Tests student data loading and profile extraction.

### Run Test

```bash
# Test with Anoushka (student_001)
npx ts-node scripts/test_assessment_cli.ts 001

# Test with Huda (student_000)
npx ts-node scripts/test_assessment_cli.ts huda_000

# Test with any other student
npx ts-node scripts/test_assessment_cli.ts 004
```

### Expected Output

```
🎯 Assessment Agent E2E Test
================================================================================
Student ID: 001
================================================================================

📂 Step 1: Loading student structured data...
✅ Loaded: anoushka_001
   Archetype: Well-Rounded Late-Starter with Scattered Excellence
   Grade: 11

📊 Step 2: Student Profile Summary
--------------------------------------------------------------------------------
   GPA: 4.0
   SAT: 1560
   Major: Computer Science

...

✅ ASSESSMENT TEST COMPLETE
```

---

## 5. DEPLOYMENT STEPS

### Step 1: Pre-Deployment Checklist

- [ ] Environment variables set
- [ ] Dependencies installed (`npm install`)
- [ ] Data backup exists (`data_backup_20251119.tar.gz`)
- [ ] Tests passing

### Step 2: Run Embedding Pipeline

```bash
./scripts/run_embeddings.sh
```

**Verification:**
- Check Pinecone console for `KB_v6_2025` namespace
- Check Pinecone console for `EQ_v2_2025` namespace
- Verify vector counts match expectations

### Step 3: Run Test Suite

```bash
# Run all assessment tests
npm run test:assessment

# Or run individual student tests
npx ts-node scripts/test_assessment_cli.ts 001
npx ts-node scripts/test_assessment_cli.ts 004
npx ts-node scripts/test_assessment_cli.ts huda_000
```

### Step 4: Deploy AssessmentAgent

The Assessment Agent is already implemented in:
```
/packages/agents/assessment-agent/src/AssessmentAgent.ts
```

**Key files:**
- `AssessmentAgent.ts` - Main agent class
- `dialogue/` - Dialogue engine
- `session/` - Session FSM
- `classifiers/` - Student type classification
- `eqModulationEngine.ts` - EQ tone planning
- `responseGenerator.ts` - EQ-integrated responses

**No deployment needed** - code is already in place.

### Step 5: Update Application Routes

The Assessment Agent is integrated into the orchestrator:

```
/packages/orchestrator/handlers/assessmentHandler.ts
/packages/orchestrator/task-graph/assessment.graph.ts
```

---

## 6. VALIDATION

### Checklist

- [ ] **Data Paths**: All loaders point to `v4_organized/`
- [ ] **Embeddings**: KB_v6_2025 and EQ_v2_2025 namespaces populated
- [ ] **Student Data**: All 12 students load successfully (000-011)
- [ ] **Schemas**: All JSON files validate against Zod schemas
- [ ] **Tests**: `test_assessment_cli.ts` passes for multiple students

### Validation Commands

```bash
# Verify data loaders
npx ts-node -e "import { listJennyStudentIds } from './packages/data-loaders/jennyAssessments'; listJennyStudentIds().then(console.log)"

# Expected output: Array of 12 student IDs including huda_000

# Verify Pinecone embeddings (requires API access)
# Check via Pinecone console: https://app.pinecone.io
```

---

## 7. ROLLBACK PLAN

If anything goes wrong:

### Option A: Restore from Backup

```bash
cd /Users/snazir/ivylevel-multiagents-v4.0

# Remove new structure
rm -rf data/v4_organized

# Restore from backup
tar -xzf data_backup_20251119.tar.gz

# Revert code changes
git checkout packages/data-loaders/jennyAssessments.ts
git checkout packages/ingestion/batch/ingestConfig.ts
```

### Option B: Keep Both Structures

The backup and new structure can coexist. Simply update paths back to original:

```typescript
// In jennyAssessments.ts
const JENNY_ASSESSMENTS_ROOT = path.join(
  process.cwd(),
  'data',  // Remove 'v4_organized'
  'students',
  'jenny_assessments_v1'
);
```

---

## 8. TROUBLESHOOTING

### Issue: "Directory not found" errors

**Solution:**
```bash
# Verify v4_organized structure exists
ls data/v4_organized

# If missing, run reorganization again
python3 data/reorganize_data.py
```

### Issue: "Student ID not found"

**Solution:**
```bash
# List available students
ls data/v4_organized/students/jenny_assessments_v1/

# Ensure student IDs match filename pattern
# Expected: student_000_huda_structured.json, student_001_..., etc.
```

### Issue: Embedding pipeline fails

**Possible causes:**
1. Missing API keys
2. Rate limiting
3. Invalid JSON in chip files

**Solution:**
```bash
# Check API keys
echo $OPENAI_API_KEY
echo $PINECONE_API_KEY

# Run with debug logging
DEBUG=* npx ts-node scripts/embed_kb_chips.ts

# Check for invalid JSON
find data/v4_organized/coaches/jenny/curated/kb_chips -name "*.jsonl" -exec sh -c 'echo "Checking: $1"; python3 -m json.tool "$1" > /dev/null' _ {} \;
```

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Clean and rebuild
npm run clean
npm install
npx tsc --noEmit

# If errors persist, check schema versions
cat packages/schema/jennyAssessmentStructured_v1.ts
```

---

## 9. POST-DEPLOYMENT

### Next Steps

1. **Monitor Logs**: Check for any runtime errors
2. **Run Golden Tests**: Compare outputs against expected results
3. **Performance Metrics**: Track retrieval latency, embedding quality
4. **User Acceptance**: Run assessment with real student data
5. **Documentation**: Update API docs with new endpoints

### Metrics to Track

| Metric | Target | Actual |
|--------|--------|--------|
| KB Chips Embedded | 455 | TBD |
| EQ Chips Embedded | 107 | TBD |
| Students Loaded | 12 | TBD |
| Test Pass Rate | 100% | TBD |
| Embedding Latency | <2s per chip | TBD |
| Retrieval Accuracy | >90% | TBD |

---

## 10. REFERENCE DOCUMENTS

All deliverables are in `/data/`:

1. **PHASE1_FILE_INVENTORY.json** - Complete file catalog
2. **PHASE2_FILE_MAPPING.json** - Classification mapping
3. **PHASE3_SOURCE_OF_TRUTH_DATA_SPEC_v1.0.md** - 13-section comprehensive spec
4. **PHASE4_EXECUTIVE_SUMMARY.md** - Executive overview
5. **REORGANIZATION_REPORT.json** - Execution statistics
6. **FINAL_AUDIT_REPORT.md** - Complete audit summary

---

## 11. QUICK REFERENCE

### Key Paths

```bash
# Data root
/Users/snazir/ivylevel-multiagents-v4.0/data/v4_organized

# Student data
/data/v4_organized/students/jenny_assessments_v1/

# KB chips
/data/v4_organized/coaches/jenny/curated/kb_chips/

# EQ chips
/data/v4_organized/coaches/jenny/curated/eq_chips/

# Scripts
/scripts/embed_kb_chips.ts
/scripts/embed_eq_chips.ts
/scripts/run_embeddings.sh
/scripts/test_assessment_cli.ts
```

### Key Commands

```bash
# Run full embedding pipeline
./scripts/run_embeddings.sh

# Test student loading
npx ts-node scripts/test_assessment_cli.ts 001

# List all students
ls data/v4_organized/students/jenny_assessments_v1/

# Restore backup
tar -xzf data_backup_20251119.tar.gz
```

---

## 12. SIGN-OFF

### Readiness Checklist

- [x] Data reorganization complete (869 files)
- [x] Backup created and verified (36 MB)
- [x] Huda structured JSON created
- [x] Data loaders updated to v4_organized
- [x] Embedding pipelines implemented (KB + EQ)
- [x] Test CLI created
- [x] Documentation complete

**Status:** ✅ **READY FOR DEPLOYMENT**

**Approver:** _________________

**Date:** _________________

---

**END OF RUNBOOK**

*For questions or issues, refer to PHASE3_SOURCE_OF_TRUTH_DATA_SPEC_v1.0.md or FINAL_AUDIT_REPORT.md*
