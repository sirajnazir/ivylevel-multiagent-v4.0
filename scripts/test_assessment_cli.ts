#!/usr/bin/env ts-node
/**
 * Simple CLI for Testing Assessment Agent
 *
 * Usage:
 *   npx ts-node scripts/test_assessment_cli.ts <student_id>
 *   npx ts-node scripts/test_assessment_cli.ts 001
 *   npx ts-node scripts/test_assessment_cli.ts huda_000
 */

import { loadJennyAssessmentById } from '../packages/data-loaders/jennyAssessments';
import * as fs from 'fs';
import * as path from 'path';

async function runAssessmentTest(studentId: string) {
  console.log('🎯 Assessment Agent E2E Test');
  console.log('=' .repeat(80));
  console.log(`Student ID: ${studentId}`);
  console.log('=' .repeat(80));
  console.log('');

  try {
    // Step 1: Load structured student data
    console.log('📂 Step 1: Loading student structured data...');
    const studentData = await loadJennyAssessmentById(studentId);
    console.log(`✅ Loaded: ${studentData.student_id}`);
    console.log(`   Archetype: ${studentData.session_metadata?.student_archetype || 'N/A'}`);
    console.log(`   Grade: ${studentData.session_metadata?.grade_level || 'N/A'}`);
    console.log('');

    // Step 2: Display profile summary
    console.log('📊 Step 2: Student Profile Summary');
    console.log('-' .repeat(80));
    console.log(`   GPA: ${studentData.student_profile?.academic_standing?.gpa || 'N/A'}`);
    console.log(`   SAT: ${studentData.student_profile?.academic_standing?.sat_practice || studentData.student_profile?.academic_standing?.sat_final || 'N/A'}`);
    console.log(`   Major: ${studentData.session_metadata?.intended_major || 'N/A'}`);
    console.log('');

    // Step 3: List ECs
    if (studentData.extracurriculars && studentData.extracurriculars.length > 0) {
      console.log('🎯 Step 3: Extracurriculars');
      console.log('-' .repeat(80));
      studentData.extracurriculars.slice(0, 5).forEach((ec: any, i: number) => {
        console.log(`   ${i + 1}. ${ec.activity_name} (${ec.category})`);
        console.log(`      Role: ${ec.role}`);
        console.log(`      Narrative Significance: ${ec.narrative_significance || 'N/A'}/10`);
      });
      console.log('');
    }

    // Step 4: Narrative themes
    if (studentData.narrative_themes && studentData.narrative_themes.length > 0) {
      console.log('📖 Step 4: Narrative Themes');
      console.log('-' .repeat(80));
      studentData.narrative_themes.forEach((theme: any, i: number) => {
        console.log(`   ${i + 1}. ${theme.theme} (Strength: ${theme.strength}/10)`);
        console.log(`      Evidence: ${theme.evidence}`);
      });
      console.log('');
    }

    // Step 5: Key challenges
    if (studentData.key_challenges && studentData.key_challenges.length > 0) {
      console.log('⚠️  Step 5: Key Challenges');
      console.log('-' .repeat(80));
      studentData.key_challenges.forEach((challenge: any, i: number) => {
        console.log(`   ${i + 1}. ${challenge.challenge} (Severity: ${challenge.severity})`);
      });
      console.log('');
    }

    // Step 6: Write test output
    const outputDir = path.join(process.cwd(), 'test_outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `assessment_test_${studentId}_${Date.now()}.json`);
    fs.writeFileSync(outputFile, JSON.stringify({
      test_timestamp: new Date().toISOString(),
      student_id: studentId,
      student_data: studentData,
      test_status: 'success'
    }, null, 2));

    console.log('📄 Step 6: Test Output');
    console.log('-' .repeat(80));
    console.log(`   Output written to: ${outputFile}`);
    console.log('');

    console.log('=' .repeat(80));
    console.log('✅ ASSESSMENT TEST COMPLETE');
    console.log('=' .repeat(80));
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review output file for completeness');
    console.log('  2. Run full assessment agent pipeline (when ready)');
    console.log('  3. Compare against golden traces');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('=' .repeat(80));
    console.error('❌ TEST FAILED');
    console.error('=' .repeat(80));
    console.error(`Error: ${error}`);
    console.error('');
    process.exit(1);
  }
}

// Main execution
const studentId = process.argv[2];

if (!studentId) {
  console.error('Usage: npx ts-node scripts/test_assessment_cli.ts <student_id>');
  console.error('');
  console.error('Examples:');
  console.error('  npx ts-node scripts/test_assessment_cli.ts 001');
  console.error('  npx ts-node scripts/test_assessment_cli.ts huda_000');
  console.error('');
  process.exit(1);
}

runAssessmentTest(studentId).catch(console.error);
