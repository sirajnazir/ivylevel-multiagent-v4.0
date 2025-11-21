#!/usr/bin/env ts-node
/**
 * Batch Assessment Runner - Phase 1 MVP
 *
 * Runs assessment pipeline for all 11 Jenny students
 * and generates smoke test report.
 *
 * Usage:
 *   npx ts-node scripts/run_all_students_mvp.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

const STUDENTS_DIR = path.resolve(
  'data/v4_organized/students/jenny_assessments_v1'
);

interface StudentResult {
  studentId: string;
  fileName: string;
  status: 'success' | 'failed';
  ragChunks?: number;
  eqChunks?: number;
  error?: string;
  duration?: number;
}

function extractStudentId(fileName: string): string {
  // Extract student ID from file name pattern: student_000_huda_structured.json
  const match = fileName.match(/student_(\w+)_\w+_structured\.json/) ||
                fileName.match(/student_(\d+)_structured\.json/);

  if (match) {
    return match[1];
  }

  // Fallback: use first segment after "student_"
  const parts = fileName.split('_');
  if (parts.length >= 2 && parts[0] === 'student') {
    return parts[1];
  }

  throw new Error(`Cannot extract student ID from filename: ${fileName}`);
}

function parseLogOutput(output: string): { ragChunks?: number; eqChunks?: number } {
  const result: { ragChunks?: number; eqChunks?: number } = {};

  // Look for RAG log line: [RAG] student=... chunks=5 eqChunks=0
  const ragMatch = output.match(/\[RAG\].*chunks=(\d+).*eqChunks=(\d+)/);
  if (ragMatch) {
    result.ragChunks = parseInt(ragMatch[1], 10);
    result.eqChunks = parseInt(ragMatch[2], 10);
  }

  return result;
}

async function main() {
  console.log('🎯 Phase 1 MVP - Batch Assessment Runner');
  console.log('='.repeat(80));
  console.log('');

  // Step 1: List all student files
  console.log('📂 Step 1: Scanning student files...');

  if (!fs.existsSync(STUDENTS_DIR)) {
    console.error(`❌ Students directory not found: ${STUDENTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(STUDENTS_DIR)
    .filter(f => f.startsWith('student_') && f.endsWith('_structured.json'))
    .sort();

  console.log(`✅ Found ${files.length} student files`);
  console.log('');

  // Step 2: Run assessment for each student
  console.log('⚙️  Step 2: Running assessments...');
  console.log('-'.repeat(80));

  const results: StudentResult[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const fileName of files) {
    try {
      const studentId = extractStudentId(fileName);
      console.log(`\n▶ Processing: ${studentId} (${fileName})`);

      const startTime = Date.now();

      const result = spawnSync('npx', [
        'ts-node',
        'scripts/run_assessment_mvp.ts',
        studentId
      ], {
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 120000 // 2 minute timeout per student
      });

      const duration = Date.now() - startTime;

      if (result.status === 0) {
        const logData = parseLogOutput(result.stdout || '');

        results.push({
          studentId,
          fileName,
          status: 'success',
          ragChunks: logData.ragChunks,
          eqChunks: logData.eqChunks,
          duration
        });

        successCount++;
        console.log(`✅ Success (${(duration / 1000).toFixed(1)}s)`);

        if (logData.ragChunks !== undefined) {
          console.log(`   RAG: ${logData.ragChunks} chunks, EQ: ${logData.eqChunks || 0} chunks`);
        }

      } else {
        const errorMsg = result.stderr || result.stdout || 'Unknown error';

        results.push({
          studentId,
          fileName,
          status: 'failed',
          error: errorMsg.split('\n')[0], // First line of error
          duration
        });

        failureCount++;
        console.log(`❌ Failed (${(duration / 1000).toFixed(1)}s)`);
        console.log(`   Error: ${errorMsg.split('\n')[0]}`);
      }

    } catch (error) {
      const studentId = extractStudentId(fileName);
      results.push({
        studentId,
        fileName,
        status: 'failed',
        error: (error as Error).message
      });

      failureCount++;
      console.log(`❌ Exception: ${(error as Error).message}`);
    }
  }

  console.log('');
  console.log('-'.repeat(80));
  console.log('');

  // Step 3: Generate summary report
  console.log('📊 Step 3: Generating summary report...');

  const reportLines: string[] = [];
  reportLines.push('# Phase 1 MVP - Batch Assessment Report');
  reportLines.push('');
  reportLines.push(`**Generated:** ${new Date().toISOString()}`);
  reportLines.push(`**Total Students:** ${files.length}`);
  reportLines.push(`**Successful:** ${successCount}`);
  reportLines.push(`**Failed:** ${failureCount}`);
  reportLines.push('');

  // Success rate
  const successRate = files.length > 0 ? (successCount / files.length * 100).toFixed(1) : '0.0';
  reportLines.push(`**Success Rate:** ${successRate}%`);
  reportLines.push('');

  // Detailed results table
  reportLines.push('## Detailed Results');
  reportLines.push('');
  reportLines.push('| Student ID | Status | Duration | RAG Chunks | EQ Chunks | Error |');
  reportLines.push('|------------|--------|----------|------------|-----------|-------|');

  for (const result of results) {
    const status = result.status === 'success' ? '✅' : '❌';
    const duration = result.duration ? `${(result.duration / 1000).toFixed(1)}s` : 'N/A';
    const ragChunks = result.ragChunks !== undefined ? result.ragChunks.toString() : 'N/A';
    const eqChunks = result.eqChunks !== undefined ? result.eqChunks.toString() : 'N/A';
    const error = result.error ? result.error.substring(0, 50) : '';

    reportLines.push(
      `| ${result.studentId} | ${status} ${result.status} | ${duration} | ${ragChunks} | ${eqChunks} | ${error} |`
    );
  }

  reportLines.push('');

  // Failed students section
  if (failureCount > 0) {
    reportLines.push('## Failed Students');
    reportLines.push('');

    const failed = results.filter(r => r.status === 'failed');
    for (const result of failed) {
      reportLines.push(`### ${result.studentId}`);
      reportLines.push('');
      reportLines.push('```');
      reportLines.push(result.error || 'Unknown error');
      reportLines.push('```');
      reportLines.push('');
    }
  }

  // RAG stats section
  const withRagData = results.filter(r => r.ragChunks !== undefined);
  if (withRagData.length > 0) {
    const avgRagChunks = withRagData.reduce((sum, r) => sum + (r.ragChunks || 0), 0) / withRagData.length;
    const avgEqChunks = withRagData.reduce((sum, r) => sum + (r.eqChunks || 0), 0) / withRagData.length;

    reportLines.push('## RAG Statistics');
    reportLines.push('');
    reportLines.push(`- **Average RAG Chunks:** ${avgRagChunks.toFixed(1)}`);
    reportLines.push(`- **Average EQ Chunks:** ${avgEqChunks.toFixed(1)}`);
    reportLines.push(`- **Students with RAG Data:** ${withRagData.length}/${results.length}`);
    reportLines.push('');
  }

  const reportContent = reportLines.join('\n');

  // Write report to file
  const reportPath = path.resolve(
    'data/v4_organized/outputs/phase1_assessment',
    'batch_assessment_report.md'
  );

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportContent, 'utf-8');

  console.log(`✅ Report written: ${reportPath}`);
  console.log('');

  // Step 4: Print summary
  console.log('='.repeat(80));

  if (failureCount === 0) {
    console.log('✅ PHASE 1 MVP BATCH ASSESSMENT: ALL STUDENTS PASSED');
  } else if (successCount > 0) {
    console.log('⚠️  PHASE 1 MVP BATCH ASSESSMENT: PARTIAL SUCCESS');
  } else {
    console.log('❌ PHASE 1 MVP BATCH ASSESSMENT: ALL STUDENTS FAILED');
  }

  console.log('='.repeat(80));
  console.log(`   Successful: ${successCount}/${files.length}`);
  console.log(`   Failed: ${failureCount}/${files.length}`);
  console.log(`   Success Rate: ${successRate}%`);
  console.log(`   Report: ${reportPath}`);
  console.log('');

  // Exit with appropriate code
  process.exit(failureCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('');
  console.error('='.repeat(80));
  console.error('❌ BATCH RUNNER FAILED');
  console.error('='.repeat(80));
  console.error(`Error: ${error.message}`);
  console.error('');
  process.exit(1);
});
