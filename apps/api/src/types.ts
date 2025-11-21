export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AssessmentStartPayload {
  studentId: string;
  studentName?: string;
  intakeId?: string;
}

export interface AssessmentMessagePayload {
  sessionId: string;
  message: string;
}

export interface AssessmentCompletePayload {
  sessionId: string;
}
