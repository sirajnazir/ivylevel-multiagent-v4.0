/**
 * API Route: POST /api/assessment/[sessionId]/message
 *
 * Handles incoming student messages and generates assessment agent responses.
 *
 * Flow:
 * 1. Receive student message from UI
 * 2. Load student assessment data
 * 3. Initialize AssessmentAgent with full context
 * 4. Generate EQ-integrated response
 * 5. Return response with RAG evidence chips
 */

import { NextRequest, NextResponse } from 'next/server';
import { appendMessageToSession, getSessionById, getSessionByStudentId, createAssessmentSession } from '../../../../../../../packages/session/assessmentSessionStore';
import { AssessmentAgent } from '../../../../../../../packages/agents/assessment-agent/src/AssessmentAgent';
import { loadJennyAssessmentById } from '../../../../../../../packages/data-loaders/jennyAssessments';
import type { AssessmentInput_v1 } from '../../../../../../../packages/schema/assessmentInput_v1';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const startTime = Date.now();
  const sessionId = params.sessionId;

  console.log(`[API] POST /api/assessment/${sessionId}/message - Request received`);

  try {
    // Parse request body
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid message', message: 'Message text is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Student message: "${text.substring(0, 50)}..."`);

    // Load session - try by UUID first, then by student ID
    let session = await getSessionById(sessionId);
    if (!session) {
      // Try treating sessionId as studentId
      session = await getSessionByStudentId(sessionId);
      if (!session) {
        // Create a new session for this student
        console.log(`[API] No session found, creating new session for student: ${sessionId}`);
        session = await createAssessmentSession({
          studentId: sessionId,
          studentName: `Student ${sessionId}`,
        });
      }
    }

    // Append student message to session
    await appendMessageToSession(session.sessionId, { role: 'student', content: text });

    // Load student assessment data
    const rawAssessment = await loadJennyAssessmentById(sessionId);
    console.log(`[API] Loaded assessment for student: ${rawAssessment.student_id}`);

    // Build AssessmentInput for agent
    const input: AssessmentInput_v1 = {
      sessionId,
      studentId: rawAssessment.student_id,
      rawMessages: session.messages.map((msg) => ({
        role: msg.role === 'student' ? 'user' : 'assistant',
        content: msg.content,
      })),
      transcriptText: formatTranscriptText(session.messages),
    };

    // Initialize AssessmentAgent
    const agent = new AssessmentAgent(input);
    agent.initialize();

    console.log(`[API] AssessmentAgent initialized, generating response...`);

    // Generate response using simple chat turn method
    // Note: For full features, use generateAssessmentDialogueTurn() with FSM
    let responseMessage: string;

    try {
      // Try to generate a chat turn with EQ integration
      responseMessage = await agent.generateChatTurn(text);
      console.log(`[API] Generated EQ-integrated response: ${responseMessage.length} chars`);
    } catch (error) {
      console.warn(`[API] generateChatTurn failed, using fallback:`, error);
      // Fallback to simple echo response
      responseMessage = generateFallbackResponse(text);
    }

    // Append agent response to session
    await appendMessageToSession(session.sessionId, { role: 'agent', content: responseMessage });

    const duration = Date.now() - startTime;
    console.log(`[API] Response generated in ${duration}ms`);

    return NextResponse.json({
      message: responseMessage,
      timestamp: new Date().toISOString(),
      sessionId,
    });
  } catch (error) {
    console.error(`[API] Error processing message for ${sessionId}:`, error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('No Jenny assessment file found')) {
        return NextResponse.json(
          {
            error: 'Assessment not found',
            message: `No assessment data found for session ID: ${sessionId}`,
            sessionId,
          },
          { status: 404 }
        );
      }
    }

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
 * Format conversation history into readable transcript
 */
function formatTranscriptText(messages: Array<{ role: string; content: string }>): string {
  return messages
    .map((msg) => {
      const label = msg.role === 'student' ? 'Student' : 'Coach';
      return `${label}: ${msg.content}`;
    })
    .join('\n\n');
}

/**
 * Generate a fallback response when agent fails
 */
function generateFallbackResponse(studentMessage: string): string {
  const responses = [
    "I hear you. That's a really important point. Can you tell me more about what you're thinking?",
    "That's interesting. What would success look like for you in this area?",
    "I appreciate you sharing that. How do you feel about the progress you're making?",
    "That makes sense. What do you think would be the next best step?",
    "Thanks for being so open. What matters most to you as you think about this?",
  ];

  // Simple hash to pick consistent response based on message length
  const index = studentMessage.length % responses.length;
  return responses[index];
}
