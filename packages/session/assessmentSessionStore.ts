import { randomUUID } from "crypto";

export type Role = "student" | "agent";

export interface SessionMessage {
  role: Role;
  content: string;
  timestamp: string;
}

export interface AssessmentSession {
  sessionId: string;
  studentId: string;
  studentName?: string;
  intakeId?: string;
  createdAt: string;
  messages: SessionMessage[];
  status: "active" | "completed";
  assessmentOutput?: any; // AssessmentOutput_v2
  renderModel?: any; // RenderModel_v1
}

const sessions = new Map<string, AssessmentSession>();

export async function createAssessmentSession(input: {
  studentId: string;
  studentName?: string;
  intakeId?: string;
}): Promise<AssessmentSession> {
  const sessionId = randomUUID();
  const session: AssessmentSession = {
    sessionId,
    studentId: input.studentId,
    studentName: input.studentName,
    intakeId: input.intakeId,
    createdAt: new Date().toISOString(),
    messages: [],
    status: "active"
  };
  sessions.set(sessionId, session);
  return session;
}

export async function appendMessageToSession(
  sessionId: string,
  message: { role: Role; content: string }
): Promise<AssessmentSession> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  session.messages.push({
    ...message,
    timestamp: new Date().toISOString()
  });
  return session;
}

export async function getSessionById(
  sessionId: string
): Promise<AssessmentSession | undefined> {
  return sessions.get(sessionId);
}

export async function markSessionComplete(
  sessionId: string,
  assessmentOutput: any,
  renderModel: any
): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error("Session not found");
  session.status = "completed";
  session.assessmentOutput = assessmentOutput;
  session.renderModel = renderModel;
}
