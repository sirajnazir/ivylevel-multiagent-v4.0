/**
 * API Route: GET /api/assessments/[sessionId]
 *
 * Returns assessment data in RenderModel_v1 format for the UI.
 *
 * Flow:
 * 1. Load structured student assessment by sessionId
 * 2. Run AssessmentAgent pipeline (extract profile, oracles, narrative, strategy)
 * 3. Convert AssessmentOutput_v2 to RenderModel_v1 using adapter
 * 4. Return JSON response
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadJennyAssessmentById } from '../../../../../../packages/data-loaders/jennyAssessments';
import { convertToRenderModel } from '../../../../../../packages/rendering/assessmentToUIAdapter';
import type { AssessmentOutput_v2 } from '../../../../../../packages/schema/assessmentOutput_v2';
import type { JennyAssessmentStructured_v1 } from '../../../../../../packages/schema/jennyAssessmentStructured_v1';

/**
 * GET handler for assessment data
 * @param request Next.js request object
 * @param params Route parameters with sessionId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const startTime = Date.now();
  const sessionId = params.sessionId;

  console.log(`[API] GET /api/assessments/${sessionId} - Request received`);

  try {
    // Step 1: Load structured student assessment
    console.log(`[API] Loading student assessment for sessionId: ${sessionId}`);

    const rawAssessment = await loadJennyAssessmentById(sessionId);

    console.log(`[API] Loaded assessment for student: ${rawAssessment.student_id}`);

    console.log(`[API] Building assessment output from structured data...`);

    // Step 3: Build AssessmentOutput_v2 directly from structured data
    // Bypass LLM extraction since we have rich structured data already
    const assessmentOutput = buildOutputFromStructuredData(rawAssessment);

    console.log(`[API] Assessment output built from structured data`);

    // Step 4: Convert to RenderModel_v1 using adapter
    const renderModel = convertToRenderModel(
      assessmentOutput,
      sessionId,
      rawAssessment.student_id
    );

    console.log(`[API] Converted to RenderModel_v1`);

    // Log metrics
    const duration = Date.now() - startTime;
    console.log(`[API] Request completed in ${duration}ms`);
    console.log(`[API] Narrative blocks: ${renderModel.narrative.length}`);
    console.log(`[API] Strategy blocks: ${renderModel.strategy.length}`);
    console.log(`[API] Overall score: ${renderModel.scores.overall.score}`);

    // Step 5: Return JSON response
    return NextResponse.json(renderModel, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error(`[API] Error processing assessment for ${sessionId}:`, error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('No Jenny assessment file found')) {
        return NextResponse.json(
          {
            error: 'Assessment not found',
            message: `No assessment found for session ID: ${sessionId}`,
            sessionId,
          },
          { status: 404 }
        );
      }

      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          {
            error: 'Invalid assessment data',
            message: error.message,
            sessionId,
          },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
      },
      { status: 500 }
    );
  }
}

/**
 * Format transcript text from raw assessment
 * Concatenates all conversation turns into a single text
 */
function formatTranscriptText(assessment: any): string {
  // Handle format with conversation_history
  if (assessment.conversation_history?.exchanges) {
    return assessment.conversation_history.exchanges
      .map((exchange: any) => {
        const student = exchange.student_message || '';
        const coach = exchange.coach_response || '';
        return `Student: ${student}\n\nCoach: ${coach}`;
      })
      .join('\n\n---\n\n');
  }

  // Fallback: Generate transcript from other available data
  // For student_009 format, create a synthetic transcript from narrative development
  if (assessment.narrative_development || assessment.breakthrough_moments) {
    const parts = [];

    // Add session metadata context
    if (assessment.session_metadata) {
      parts.push(`Student Archetype: ${assessment.session_metadata.student_archetype || 'Unknown'}`);
      parts.push(`Grade Level: ${assessment.session_metadata.grade_level || 'Unknown'}`);
      if (assessment.session_metadata.primary_challenge) {
        parts.push(`Primary Challenge: ${assessment.session_metadata.primary_challenge}`);
      }
    }

    // Add key challenges as conversation context
    if (assessment.key_challenges && Array.isArray(assessment.key_challenges)) {
      assessment.key_challenges.slice(0, 3).forEach((challenge: any) => {
        if (challenge.challenge && challenge.quote) {
          parts.push(`Challenge: ${challenge.challenge}\nEvidence: ${challenge.quote}`);
        }
      });
    }

    // Add breakthrough moments if available
    if (assessment.breakthrough_moments && Array.isArray(assessment.breakthrough_moments)) {
      assessment.breakthrough_moments.slice(0, 3).forEach((moment: any) => {
        if (moment.trigger && moment.student_response) {
          parts.push(`Coach: ${moment.trigger}\nStudent: ${moment.student_response}`);
        }
      });
    }

    return parts.join('\n\n---\n\n');
  }

  // Last resort: use student_id as minimal transcript
  return `Student Assessment for: ${assessment.student_id || 'Unknown'}`;
}

/**
 * Format raw messages array from raw assessment
 * Converts conversation exchanges to role/content format
 */
function formatRawMessages(assessment: any): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Handle format with conversation_history
  if (assessment.conversation_history?.exchanges) {
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

  // Fallback for student_009 format: Create synthetic messages from breakthrough moments
  if (assessment.breakthrough_moments && Array.isArray(assessment.breakthrough_moments)) {
    assessment.breakthrough_moments.forEach((moment: any) => {
      if (moment.language) {
        messages.push({
          role: 'assistant',
          content: moment.language,
        });
      }
      if (moment.student_response || moment.student_breakthrough) {
        messages.push({
          role: 'user',
          content: moment.student_response || moment.student_breakthrough,
        });
      }
    });
  }

  // Add at least one message if we have nothing
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: `Student assessment for ${assessment.student_id || 'Unknown'}`,
    });
  }

  return messages;
}

/**
 * Build AssessmentOutput_v2 directly from JennyAssessmentStructured_v1
 * Bypasses LLM extraction since structured data is already rich and complete
 */
function buildOutputFromStructuredData(assessment: JennyAssessmentStructured_v1): AssessmentOutput_v2 {
  const metadata = assessment.session_metadata;
  const profile = assessment.student_profile;
  const narrative = assessment.narrative_development;

  // Extract profile data
  const extractedProfile = {
    academics: {
      gpa: {
        weighted: null,
        unweighted: null,
      },
      courseLoad: [],
      testScores: {
        sat: null,
        act: null,
        apScores: [],
      },
      academicInterests: [],
      plannedCourses: [],
      rigorGaps: [],
    },
    activities: [],
    awards: [],
    personality: {
      coreValues: [],
      identityThreads: [],
      passions: [],
      communicationStyle: profile?.communication_style || 'Not assessed',
      emotionalIntelligence: profile?.emotional_intelligence || 'Not assessed',
    },
    context: {
      familyInvolvement: metadata.parent_involvement || 'Unknown',
      resourceConstraints: [],
      lifeCircumstances: [],
    },
    diagnostics: {
      rigorGaps: assessment.key_challenges?.map((c: any) => c.challenge) || [],
      ecDepthGaps: [],
      narrativeIssues: [],
      strategicRisks: [],
    },
    narrativeScaffolding: {
      thematicHubs: [
        narrative?.final_narrative_synthesis?.components?.[0] || 'Academic Excellence',
        narrative?.final_narrative_synthesis?.components?.[1] || 'Extracurricular Leadership',
        narrative?.final_narrative_synthesis?.components?.[2] || 'Community Impact',
      ] as [string, string, string],
      flagshipNarrative: narrative?.final_narrative_synthesis?.articulation ||
        `${metadata.student_archetype} pursuing ${metadata.intended_major_stated}`,
      admissionsPositioning: narrative?.final_narrative_synthesis?.primary ||
        metadata.intended_major_recommended ||
        metadata.intended_major_stated ||
        'Well-rounded student',
    },
  };

  // Build oracle scores from session metadata
  const oracleScores = {
    aptitude: {
      score: (metadata.student_readiness_score || 5) * 10, // Convert 0-10 to 0-100
      evidence: [
        `Grade Level: ${metadata.grade_level}`,
        `School Type: ${metadata.school_type || 'Not specified'}`,
        `Readiness Score: ${metadata.student_readiness_score || 'Not assessed'}`,
      ],
      rationale: `Student demonstrates ${metadata.student_readiness_score || 5}/10 readiness with ${metadata.achievement_orientation || 'moderate'} achievement orientation`,
    },
    passion: {
      score: (metadata.authentic_passion_level || 5) * 10, // Convert 0-10 to 0-100
      evidence: [
        `Authentic Passion Level: ${metadata.authentic_passion_level || 'Not assessed'}`,
        `Discovery vs Prescriptive: ${metadata.discovery_vs_prescriptive_ratio || 'Not assessed'}`,
      ],
      rationale: `Student shows ${metadata.authentic_passion_level || 5}/10 authentic passion with ${metadata.discovery_vs_prescriptive_ratio || 'balanced'} discovery approach`,
    },
    service: {
      score: 60, // Default baseline
      evidence: [
        `Community focus: ${metadata.primary_challenge || 'Exploring opportunities'}`,
      ],
      rationale: 'Service orientation being developed through coaching program',
    },
  };

  // Build narrative from structured data
  const narrativeBlocks = {
    thematicHubs: extractedProfile.narrativeScaffolding.thematicHubs,
    flagshipNarrative: extractedProfile.narrativeScaffolding.flagshipNarrative,
    positioning: extractedProfile.narrativeScaffolding.admissionsPositioning,
    identityThread: narrative?.final_narrative_synthesis?.primary ||
      metadata.student_archetype ||
      'Engaged learner and emerging leader',
    risks: assessment.key_challenges?.slice(0, 3).map((c: any) => c.challenge) || [
      'Narrative clarity needs development',
      'Leadership opportunities to be identified',
    ],
    opportunities: narrative?.narrative_bridges_built ?
      Object.entries(narrative.narrative_bridges_built).map(([key, value]) => `${key}: ${value}`) :
      [
        'Build flagship project in area of interest',
        'Develop leadership roles in current activities',
        'Create measurable community impact',
      ],
  };

  // Build strategy from structured data
  const strategyBlocks = {
    twelveMonthPlan: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'long', year: 'numeric' }),
      priorities: [
        i < 3 ? 'Establish baseline activities and assess current commitments' :
        i < 6 ? 'Build depth in chosen activities with measurable outcomes' :
        i < 9 ? 'Develop leadership roles and community impact projects' :
        'Prepare application materials and finalize positioning',
      ],
      risks: [
        'Overcommitment',
        'Lack of focus',
      ],
      tasks: [
        i < 3 ? 'Audit current time allocation and activities' :
        i < 6 ? 'Implement flagship project in primary interest area' :
        i < 9 ? 'Pursue leadership opportunities' :
        'Document achievements and prepare narratives',
      ],
    })),
    summerPlanning: [
      {
        scenario: 'baseline' as const,
        focusAreas: ['Academic enrichment', 'Skill development'],
        commitments: ['Local programs', 'Part-time engagement'],
        risks: ['Limited differentiation'],
      },
      {
        scenario: 'stretch' as const,
        focusAreas: ['Competitive programs', 'Research opportunities'],
        commitments: ['Selective summer programs', 'Intensive projects'],
        risks: ['High competition', 'Time commitment'],
      },
      {
        scenario: 'moonshot' as const,
        focusAreas: ['Elite programs (RSI, SSP)', 'Major research/impact'],
        commitments: ['Top-tier free programs', 'Publication-worthy work'],
        risks: ['Very high selectivity', 'Significant preparation required'],
      },
    ],
    awardsTargets: [
      {
        name: 'Regional Science Fair',
        tier: 'state' as const,
        likelihood: 'medium' as const,
        rationale: 'Accessible with focused project work',
      },
      {
        name: 'National Merit Scholarship',
        tier: 'national' as const,
        likelihood: 'medium' as const,
        rationale: 'Based on PSAT performance and academic standing',
      },
    ],
  };

  return {
    profile: extractedProfile,
    oracles: oracleScores,
    narrative: narrativeBlocks,
    strategy: strategyBlocks,
    metadata: {
      modelVersion: 'structured-data-v1',
      generatedAt: new Date().toISOString(),
      agentVersion: 'direct-transformation-v1',
    },
  };
}
