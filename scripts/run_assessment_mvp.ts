#!/usr/bin/env ts-node
/**
 * Assessment Agent MVP CLI Runner
 *
 * Runs full assessment pipeline for a single student
 * and outputs structured assessment results.
 *
 * Usage:
 *   npx ts-node scripts/run_assessment_mvp.ts <studentId>
 *   npx ts-node scripts/run_assessment_mvp.ts 000
 *   npx ts-node scripts/run_assessment_mvp.ts huda
 */

import * as fs from 'fs';
import * as path from 'path';
import { AssessmentAgent } from '../packages/agents/assessment-agent/src/AssessmentAgent';
import { loadJennyAssessmentById } from '../packages/data-loaders/jennyAssessments';
import type { AssessmentInput_v1 } from '../packages/schema/assessmentInput_v1';
import type { AssessmentOutput_v2 } from '../packages/schema/assessmentOutput_v2';

interface CliArgs {
  studentId: string;
  outputDir?: string;
}

function parseArgs(): CliArgs {
  const [, , ...rest] = process.argv;

  if (rest.length === 0) {
    console.error('Usage: run_assessment_mvp.ts <studentId> [outputDir]');
    console.error('');
    console.error('Examples:');
    console.error('  npx ts-node scripts/run_assessment_mvp.ts 000');
    console.error('  npx ts-node scripts/run_assessment_mvp.ts huda');
    console.error('  npx ts-node scripts/run_assessment_mvp.ts 011 ./custom_output');
    console.error('');
    process.exit(1);
  }

  const [studentId, outputDir] = rest;
  return { studentId, outputDir };
}

function formatAssessmentSummary(output: AssessmentOutput_v2): string {
  const lines: string[] = [];

  lines.push('# Assessment Summary');
  lines.push('');
  lines.push(`**Generated:** ${output.metadata.generatedAt}`);
  lines.push(`**Model Version:** ${output.metadata.modelVersion}`);
  lines.push(`**Agent Version:** ${output.metadata.agentVersion}`);
  lines.push('');

  // Profile summary
  lines.push('## Student Profile');
  lines.push('');
  lines.push(`- **Grade:** ${output.profile.grade}`);
  lines.push(`- **GPA:** ${output.profile.gpa || 'N/A'}`);
  lines.push(`- **Test Scores:** SAT ${output.profile.sat || 'N/A'} / ACT ${output.profile.act || 'N/A'}`);
  lines.push(`- **Intended Major:** ${output.profile.intendedMajor || 'N/A'}`);
  lines.push('');

  // Oracle results
  if (output.oracles) {
    lines.push('## APS Intelligence Oracles');
    lines.push('');

    if (output.oracles.aptitude) {
      lines.push('### Aptitude');
      lines.push(`- **Score:** ${output.oracles.aptitude.score}/10`);
      lines.push(`- **Profile:** ${output.oracles.aptitude.profile}`);
      lines.push('');
    }

    if (output.oracles.passion) {
      lines.push('### Passion');
      lines.push(`- **Score:** ${output.oracles.passion.score}/10`);
      lines.push(`- **Primary Domain:** ${output.oracles.passion.primary_domain || 'N/A'}`);
      lines.push('');
    }

    if (output.oracles.service) {
      lines.push('### Service');
      lines.push(`- **Score:** ${output.oracles.service.score}/10`);
      lines.push(`- **Profile:** ${output.oracles.service.profile || 'N/A'}`);
      lines.push('');
    }
  }

  // Narrative themes
  if (output.narrative) {
    lines.push('## Narrative Themes');
    lines.push('');

    if (output.narrative.primary_theme) {
      lines.push(`**Primary:** ${output.narrative.primary_theme}`);
    }

    if (output.narrative.secondary_themes && output.narrative.secondary_themes.length > 0) {
      lines.push(`**Secondary:** ${output.narrative.secondary_themes.join(', ')}`);
    }

    lines.push('');
  }

  // Strategy recommendations
  if (output.strategy) {
    lines.push('## Strategy Recommendations');
    lines.push('');

    if (output.strategy.immediate_actions && output.strategy.immediate_actions.length > 0) {
      lines.push('### Immediate Actions');
      output.strategy.immediate_actions.forEach((action, i) => {
        lines.push(`${i + 1}. ${action}`);
      });
      lines.push('');
    }

    if (output.strategy.timeline_milestones && output.strategy.timeline_milestones.length > 0) {
      lines.push('### Timeline Milestones');
      output.strategy.timeline_milestones.forEach((milestone, i) => {
        lines.push(`${i + 1}. ${milestone}`);
      });
      lines.push('');
    }
  }

  return lines.join('\n');
}

function formatGameplanSummary(output: AssessmentOutput_v2): string {
  const lines: string[] = [];

  lines.push('# College Application Gameplan');
  lines.push('');
  lines.push(`**Student Assessment Date:** ${output.metadata.generatedAt}`);
  lines.push('');

  if (output.strategy) {
    lines.push('## Action Plan');
    lines.push('');

    if (output.strategy.immediate_actions) {
      lines.push('### Priority Actions');
      lines.push('');
      output.strategy.immediate_actions.forEach((action, i) => {
        lines.push(`**${i + 1}.** ${action}`);
        lines.push('');
      });
    }

    if (output.strategy.timeline_milestones) {
      lines.push('### Key Milestones');
      lines.push('');
      output.strategy.timeline_milestones.forEach((milestone, i) => {
        lines.push(`- ${milestone}`);
      });
      lines.push('');
    }

    if (output.strategy.application_strategy) {
      lines.push('## Application Strategy');
      lines.push('');
      lines.push(output.strategy.application_strategy);
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main() {
  const { studentId, outputDir } = parseArgs();

  console.log('🎯 Assessment Agent MVP');
  console.log('='.repeat(80));
  console.log(`Student ID: ${studentId}`);
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Load structured student data
    console.log('📂 Step 1: Loading student data...');
    const studentData = await loadJennyAssessmentById(studentId);
    console.log(`✅ Loaded: ${studentData.student_id}`);
    console.log(`   Grade: ${studentData.session_metadata?.grade_level || 'N/A'}`);
    console.log(`   Archetype: ${studentData.session_metadata?.student_archetype || 'N/A'}`);
    console.log('');

    // Step 2: Convert to AssessmentInput format
    console.log('🔄 Step 2: Preparing assessment input...');

    // Build raw messages from conversation if available
    const rawMessages = studentData.conversation_data?.turns?.map(turn => ({
      role: turn.speaker === 'jenny' ? 'assistant' : 'user',
      content: turn.message
    })) || [];

    // Build transcript text
    const transcriptText = studentData.conversation_data?.turns?.map(turn =>
      `${turn.speaker === 'jenny' ? 'Coach Jenny' : 'Student'}: ${turn.message}`
    ).join('\n\n') || '';

    const assessmentInput: AssessmentInput_v1 = {
      studentId: studentData.student_id,
      rawMessages,
      transcriptText,
      contextDocuments: [],
      metadata: {
        sessionId: studentData.session_id || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'mvp_cli'
      }
    };

    console.log(`✅ Input prepared: ${rawMessages.length} messages, ${transcriptText.length} chars`);
    console.log('');

    // Step 3: Initialize AssessmentAgent
    console.log('🤖 Step 3: Initializing AssessmentAgent...');
    const agent = new AssessmentAgent(assessmentInput);
    agent.initialize();
    console.log('✅ Agent initialized');
    console.log('');

    // Step 4: Run assessment pipeline
    console.log('⚙️  Step 4: Running assessment pipeline...');
    console.log('-'.repeat(80));

    // 4.1: Extract profile
    console.log('   [4.1] Extracting student profile...');
    const profile = await agent.extractProfile();
    console.log(`   ✅ Profile extracted: Grade ${profile.grade}, GPA ${profile.gpa || 'N/A'}`);

    // 4.2: Run intelligence oracles
    console.log('   [4.2] Running APS intelligence oracles...');
    const oracles = await agent.runIntelligenceOracles();
    console.log(`   ✅ Oracles complete: A=${oracles.aptitude?.score}/10, P=${oracles.passion?.score}/10, S=${oracles.service?.score}/10`);

    // 4.3: Determine student type
    console.log('   [4.3] Determining student type...');
    const studentType = await agent.determineStudentType();
    console.log(`   ✅ Student type: ${studentType.primary_type} (confidence: ${studentType.confidence})`);

    // 4.4: Build narrative (placeholder - needs implementation)
    console.log('   [4.4] Building narrative blocks...');
    agent.buildNarrative();
    console.log('   ✅ Narrative built');

    // 4.5: Build strategy plan (placeholder - needs implementation)
    console.log('   [4.5] Building strategy plan...');
    agent.buildPlan();
    console.log('   ✅ Strategy plan built');

    console.log('-'.repeat(80));
    console.log('');

    // Step 5: Build final output
    console.log('📊 Step 5: Building final output...');
    const output = agent.buildOutput();
    console.log('✅ Final output assembled');
    console.log('');

    // Step 6: Write outputs to disk
    console.log('💾 Step 6: Writing outputs...');

    const baseOutputDir = outputDir || path.resolve(
      'data/v4_organized/outputs/phase1_assessment'
    );
    const studentOutputDir = path.join(baseOutputDir, `student_${studentId}`);

    fs.mkdirSync(studentOutputDir, { recursive: true });

    // Write full assessment JSON
    const fullJsonPath = path.join(studentOutputDir, 'assessment_full.json');
    fs.writeFileSync(fullJsonPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`   ✅ Full assessment: ${fullJsonPath}`);

    // Write summary markdown
    const summaryPath = path.join(studentOutputDir, 'assessment_summary.md');
    const summaryContent = formatAssessmentSummary(output);
    fs.writeFileSync(summaryPath, summaryContent, 'utf-8');
    console.log(`   ✅ Summary: ${summaryPath}`);

    // Write gameplan markdown
    const gameplanPath = path.join(studentOutputDir, 'gameplan_recommendations.md');
    const gameplanContent = formatGameplanSummary(output);
    fs.writeFileSync(gameplanPath, gameplanContent, 'utf-8');
    console.log(`   ✅ Gameplan: ${gameplanPath}`);

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ ASSESSMENT MVP COMPLETE');
    console.log('='.repeat(80));
    console.log(`   Output directory: ${studentOutputDir}`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ ASSESSMENT MVP FAILED');
    console.error('='.repeat(80));
    console.error(`Error: ${(error as Error).message}`);
    if ((error as Error).stack) {
      console.error('');
      console.error('Stack trace:');
      console.error((error as Error).stack);
    }
    console.error('');
    process.exit(1);
  }
}

main().catch(console.error);
