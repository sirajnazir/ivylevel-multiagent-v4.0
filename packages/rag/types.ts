export interface RagQueryContext {
  studentId?: string;
  gradeLevel?: string;
  topicTags?: string[]; // e.g. ["narrative", "ec_depth"]
}

export interface RagResultChunk {
  id: string;
  text: string;
  source: string;
  coach: string;
  student?: string;
  week?: number;
  score: number;
  metadata: Record<string, any>;
}
