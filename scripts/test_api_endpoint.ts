/**
 * Test Script: API Endpoint End-to-End Test
 *
 * Tests the full pipeline:
 * 1. Load student assessment data
 * 2. Run AssessmentAgent pipeline
 * 3. Convert to RenderModel_v1
 * 4. Verify output structure
 *
 * Usage: npx ts-node scripts/test_api_endpoint.ts [studentId]
 */

import { AssessmentAgent } from '../packages/agents/assessment-agent/src/AssessmentAgent';
import { loadJennyAssessmentById } from '../packages/data-loaders/jennyAssessments';
import { convertToRenderModel } from '../packages/rendering/assessmentToUIAdapter';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

async function testApiEndpoint(studentId: string = '009') {
  console.log('='.repeat(60));
  console.log('API Endpoint End-to-End Test');
  console.log('='.repeat(60));
  console.log();

  const startTime = Date.now();

  try {
    // Step 1: Load student assessment
    console.log(`[1/5] Loading student assessment: ${studentId}`);
    const rawAssessment = await loadJennyAssessmentById(studentId);
    console.log(`✓ Loaded assessment for: ${rawAssessment.student_id}`);
    console.log(`  - Grade: ${rawAssessment.session_metadata.grade_level}`);
    console.log(`  - Archetype: ${rawAssessment.session_metadata.student_archetype}`);
    console.log();

    // Step 2: Prepare agent input
    console.log(`[2/5] Preparing AssessmentAgent input`);
    const transcriptText = formatTranscriptText(rawAssessment);
    const rawMessages = formatRawMessages(rawAssessment);

    const agentInput = {
      studentId: rawAssessment.student_id,
      transcriptText,
      rawMessages,
      contextDocuments: [],
      existingStudentProfile: null,
    };
    console.log(`✓ Input prepared:`);
    console.log(`  - Transcript length: ${transcriptText.length} chars`);
    console.log(`  - Message count: ${rawMessages.length}`);
    console.log();

    // Step 3: Run AssessmentAgent pipeline
    console.log(`[3/5] Running AssessmentAgent pipeline`);
    const agent = new AssessmentAgent(agentInput);

    await agent.extractProfile();
    console.log(`  ✓ Profile extracted`);

    await agent.runIntelligenceOracles();
    console.log(`  ✓ Intelligence oracles completed`);

    agent.determineStudentType();
    console.log(`  ✓ Student type determined`);

    agent.buildNarrative();
    console.log(`  ✓ Narrative built`);

    agent.buildPlan();
    console.log(`  ✓ Strategy plan built`);

    const assessmentOutput = agent.buildOutput();
    console.log();

    // Step 4: Convert to RenderModel_v1
    console.log(`[4/5] Converting to RenderModel_v1`);
    const renderModel = convertToRenderModel(
      assessmentOutput,
      studentId,
      rawAssessment.student_id
    );
    console.log(`✓ Conversion complete`);
    console.log();

    // Step 5: Verify output structure
    console.log(`[5/5] Verifying output structure`);
    console.log(`✓ RenderModel_v1 structure:`);
    console.log(`  - Session ID: ${renderModel.sessionId}`);
    console.log(`  - Stage: ${renderModel.stage}`);
    console.log(`  - Narrative blocks: ${renderModel.narrative.length}`);
    console.log(`  - Strategy blocks: ${renderModel.strategy.length}`);
    console.log(`  - Scores: Overall=${renderModel.scores.overall.score}, Academics=${renderModel.scores.academics.score}`);
    console.log(`  - Summer plans: ${renderModel.summerPlans?.length || 0}`);
    console.log(`  - Awards targets: ${renderModel.awardsTargets?.length || 0}`);
    console.log(`  - Metadata: ${JSON.stringify(renderModel.metadata)}`);
    console.log();

    // Detailed breakdown
    console.log('='.repeat(60));
    console.log('Detailed Output Breakdown');
    console.log('='.repeat(60));
    console.log();

    console.log('📊 SCORES:');
    console.log(`  Overall: ${renderModel.scores.overall.score} (${renderModel.scores.overall.trend})`);
    console.log(`  Academics: ${renderModel.scores.academics.score} (${renderModel.scores.academics.trend})`);
    console.log(`  Extracurriculars: ${renderModel.scores.extracurriculars.score} (${renderModel.scores.extracurriculars.trend})`);
    console.log(`  Personal Growth: ${renderModel.scores.personalGrowth.score} (${renderModel.scores.personalGrowth.trend})`);
    console.log(`  College Readiness: ${renderModel.scores.collegeReadiness.score} (${renderModel.scores.collegeReadiness.trend})`);
    console.log();

    console.log('📝 NARRATIVE BLOCKS:');
    const flagshipNarrative = renderModel.narrative.find(n => n.id === 'narr-flagship');
    if (flagshipNarrative) {
      console.log(`  Flagship: ${flagshipNarrative.text.substring(0, 100)}...`);
    }
    const hubCount = renderModel.narrative.filter(n => n.id.startsWith('narr-hub-')).length;
    const riskCount = renderModel.narrative.filter(n => n.type === 'concern').length;
    const oppCount = renderModel.narrative.filter(n => n.id.startsWith('narr-opp-')).length;
    console.log(`  Thematic hubs: ${hubCount}`);
    console.log(`  Risks: ${riskCount}`);
    console.log(`  Opportunities: ${oppCount}`);
    console.log();

    console.log('🎯 STRATEGY BLOCKS:');
    const immediate = renderModel.strategy.filter(s => s.timeline === 'immediate').length;
    const shortTerm = renderModel.strategy.filter(s => s.timeline === 'short-term').length;
    const longTerm = renderModel.strategy.filter(s => s.timeline === 'long-term').length;
    console.log(`  Immediate: ${immediate}`);
    console.log(`  Short-term: ${shortTerm}`);
    console.log(`  Long-term: ${longTerm}`);
    console.log();

    if (renderModel.strategy.length > 0) {
      const sample = renderModel.strategy[0];
      console.log(`  Sample strategy:`);
      console.log(`    - Title: ${sample.title}`);
      console.log(`    - Priority: ${sample.priority}`);
      console.log(`    - Timeline: ${sample.timeline}`);
      console.log(`    - Action steps: ${sample.actionSteps?.length || 0}`);
    }
    console.log();

    // Performance metrics
    const duration = Date.now() - startTime;
    console.log('='.repeat(60));
    console.log('Performance Metrics');
    console.log('='.repeat(60));
    console.log(`✓ Total execution time: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log();

    console.log('='.repeat(60));
    console.log('✅ API ENDPOINT TEST PASSED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ API ENDPOINT TEST FAILED');
    console.error(error);
    process.exit(1);
  }
}

function formatTranscriptText(assessment: any): string {
  if (!assessment.conversation_history?.exchanges) {
    return '';
  }

  return assessment.conversation_history.exchanges
    .map((exchange: any) => {
      const student = exchange.student_message || '';
      const coach = exchange.coach_response || '';
      return `Student: ${student}\n\nCoach: ${coach}`;
    })
    .join('\n\n---\n\n');
}

function formatRawMessages(assessment: any): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!assessment.conversation_history?.exchanges) {
    return [];
  }

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const exchange of assessment.conversation_history.exchanges) {
    if (exchange.student_message) {
      messages.push({
        role: 'user',
        content: exchange.student_message,
      });
    }

    if (exchange.coach_response) {
      messages.push({
        role: 'assistant',
        content: exchange.coach_response,
      });
    }
  }

  return messages;
}

// Run test
const studentId = process.argv[2] || '009';
testApiEndpoint(studentId);
