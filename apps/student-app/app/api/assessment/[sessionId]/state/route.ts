/**
 * API Route: GET /api/assessment/[sessionId]/state
 *
 * Returns current chat session state for the assessment interface.
 *
 * Used by useAssessmentAgent hook to load session state and display:
 * - Chat history messages
 * - Current FSM stage and progress
 * - Student archetype
 * - EQ tone settings (warmth, strictness)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionById, getSessionByStudentId, createAssessmentSession } from '../../../../../../../packages/session/assessmentSessionStore';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const startTime = Date.now();
  const sessionId = params.sessionId;

  console.log(`[API] GET /api/assessment/${sessionId}/state - Request received`);

  try {
    // Try to get existing session - try by UUID first, then by student ID
    let session = await getSessionById(sessionId);
    if (!session) {
      // Try treating sessionId as studentId
      session = await getSessionByStudentId(sessionId);
    }

    // If session doesn't exist, create a new one
    if (!session) {
      console.log(`[API] Session ${sessionId} not found, creating new session`);
      session = await createAssessmentSession({
        studentId: sessionId,
        studentName: `Student ${sessionId}`,
      });
    }

    // Calculate progress based on message count (simple heuristic)
    const messageCount = session.messages.length;
    const progress = Math.min(Math.round((messageCount / 20) * 100), 95);

    // Determine stage based on message count
    let stage: string;
    let stageDescription: string;

    if (messageCount < 3) {
      stage = 'rapport';
      stageDescription = 'Building rapport and safety';
    } else if (messageCount < 8) {
      stage = 'current_state';
      stageDescription = 'Understanding current state';
    } else if (messageCount < 15) {
      stage = 'diagnostic';
      stageDescription = 'Diagnostic assessment';
    } else {
      stage = 'preview';
      stageDescription = 'Plan preview and next steps';
    }

    // Default EQ tone (would be dynamically computed by AssessmentAgent)
    const eqTone = {
      warmth: 0.7,
      strictness: 0.3,
      label: 'Warm & Supportive',
    };

    // Default archetype (would be detected by AssessmentAgent)
    const archetype = messageCount > 5 ? 'achiever' : undefined;

    const duration = Date.now() - startTime;
    console.log(`[API] Session state loaded in ${duration}ms`);
    console.log(`[API] Messages: ${messageCount}, Progress: ${progress}%, Stage: ${stage}`);

    return NextResponse.json({
      sessionId: session.sessionId,
      messages: session.messages.map((msg) => ({
        id: `${msg.timestamp}-${msg.role}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      progress,
      stage,
      stageDescription,
      archetype,
      eqTone,
      status: session.status,
    });
  } catch (error) {
    console.error(`[API] Error loading session state for ${sessionId}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to load session state',
        message: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
      },
      { status: 500 }
    );
  }
}
