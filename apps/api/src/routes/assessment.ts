import { Router } from "express";
import type {
  AssessmentStartPayload,
  AssessmentMessagePayload,
  AssessmentCompletePayload,
  ApiResponse
} from "../types";

import {
  createAssessmentSession,
  appendMessageToSession,
  getSessionById,
  markSessionComplete
} from "../../../../packages/session/assessmentSessionStore";

import { handleAssessment } from "../../../../packages/orchestrator/handlers/assessmentHandler";
import { buildRenderModel_v1 } from "../../../../packages/rendering/assessment";
import { logSessionStart, logMessageSent, logSessionComplete } from "../../../../packages/telemetry/events";
import { z } from "zod";

const router = Router();

// Simple zod validation for safety
const startSchema = z.object({
  studentId: z.string(),
  studentName: z.string().optional(),
  intakeId: z.string().optional()
});

const messageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1)
});

const completeSchema = z.object({
  sessionId: z.string()
});

// POST /assessment/start
router.post(
  "/start",
  async (req, res: { json: (body: ApiResponse<any>) => void }) => {
    try {
      const parsed = startSchema.parse(req.body as AssessmentStartPayload);
      const session = await createAssessmentSession(parsed);

      // Log telemetry event
      logSessionStart(session.sessionId, parsed.studentId);

      res.json({ success: true, data: { sessionId: session.sessionId } });
    } catch (err: any) {
      console.error("Error in /assessment/start", err);
      res.json({ success: false, error: err.message || "Invalid request" });
    }
  }
);

// POST /assessment/message
router.post(
  "/message",
  async (req, res: { json: (body: ApiResponse<any>) => void }) => {
    try {
      const parsed = messageSchema.parse(req.body as AssessmentMessagePayload);

      const { sessionId, message } = parsed;
      const session = await appendMessageToSession(sessionId, {
        role: "student",
        content: message
      });

      // TODO: call LLM chat agent here – for now just echo
      // In real implementation: call Assessment Chat Agent (Claude) with RAG + session history
      const agentReply = {
        role: "agent" as const,
        content: "Thanks for sharing that. Tell me more about your activities."
      };

      await appendMessageToSession(sessionId, agentReply);

      // Log telemetry events
      logMessageSent(sessionId, "student");
      logMessageSent(sessionId, "agent");

      res.json({
        success: true,
        data: {
          sessionId,
          agentMessage: agentReply.content
        }
      });
    } catch (err: any) {
      console.error("Error in /assessment/message", err);
      res.json({ success: false, error: err.message || "Invalid request" });
    }
  }
);

// POST /assessment/complete
router.post(
  "/complete",
  async (req, res: { json: (body: ApiResponse<any>) => void }) => {
    try {
      const parsed = completeSchema.parse(req.body as AssessmentCompletePayload);
      const session = await getSessionById(parsed.sessionId);
      if (!session) {
        res.json({ success: false, error: "Session not found" });
        return;
      }

      // Map session messages to format expected by handleAssessment
      const rawMessages = session.messages.map((m) => ({
        role: m.role === "student" ? "user" as const : "assistant" as const,
        content: m.content
      }));

      // Call orchestrator with full transcript & context
      const assessmentOutput = await handleAssessment({
        studentId: session.studentId,
        transcriptText: session.messages
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n"),
        rawMessages,
        contextDocuments: [], // RAG, if any, can be wired in when ready
        existingStudentProfile: null
      });

      // Build render model
      const renderModel = buildRenderModel_v1({
        studentName: session.studentName ?? "Student",
        profile: assessmentOutput.profile,
        oracles: assessmentOutput.oracles,
        narrative: assessmentOutput.narrative,
        strategy: assessmentOutput.strategy
      });

      await markSessionComplete(parsed.sessionId, assessmentOutput, renderModel);

      // Log completion telemetry
      logSessionComplete(parsed.sessionId);

      res.json({
        success: true,
        data: {
          sessionId: parsed.sessionId,
          assessmentOutput,
          renderModel
        }
      });
    } catch (err: any) {
      console.error("Error in /assessment/complete", err);
      res.json({ success: false, error: err.message || "Unable to complete assessment" });
    }
  }
);

// GET /assessment/:id
router.get(
  "/:sessionId",
  async (req, res: { json: (body: ApiResponse<any>) => void }) => {
    try {
      const { sessionId } = req.params;
      const session = await getSessionById(sessionId);
      if (!session) {
        res.json({ success: false, error: "Session not found" });
        return;
      }
      res.json({ success: true, data: session });
    } catch (err: any) {
      console.error("Error in GET /assessment/:sessionId", err);
      res.json({ success: false, error: err.message || "Error loading assessment" });
    }
  }
);

export { router as assessmentRouter };
