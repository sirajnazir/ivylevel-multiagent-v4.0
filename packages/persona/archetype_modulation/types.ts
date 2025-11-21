/**
 * types.ts
 *
 * Type definitions for Component 43 - Persona-Archetype Adaptive Modulation Layer
 */

/**
 * The 9 IvyLevel Student Archetypes
 */
export type StudentArchetype =
  | 'high_achieving_robot'      // Tightly wound perfectionist
  | 'lost_dreamer'               // High-potential, no clarity
  | 'discouraged_underdog'       // Needs encouragement & wins
  | 'burnt_out_overloader'       // Doing too much, needs boundaries
  | 'detached_minimalist'        // Low engagement, needs activation
  | 'hyper_ambitious_spiky'      // Sharp peaks & valleys, needs focus
  | 'low_confidence_high_talent' // Imposter syndrome, needs validation
  | 'chaotic_creative'           // Creative but disorganized
  | 'anxious_overthinker';       // Analysis paralysis, needs grounding

/**
 * Detected archetype with confidence
 */
export interface DetectedArchetype {
  primary: StudentArchetype;
  secondary: StudentArchetype | null;
  confidence: number; // 0-1
  signals: string[]; // What led to this classification
}

/**
 * Tone modulation settings
 */
export type ToneStyle =
  | 'calm_anchoring'           // For anxious/perfectionist students
  | 'energizing_structured'    // For creative/chaotic students
  | 'soothing_reassuring'      // For overthinkers/anxious
  | 'compassionate_exploratory' // For lost dreamers
  | 'firm_loving'              // For minimalists/detached
  | 'validating_empowering'    // For low confidence
  | 'grounding_realistic'      // For hyper-ambitious
  | 'encouraging_momentum';    // For discouraged/burnt-out

/**
 * Structure level for messaging
 */
export type StructureLevel = 'low' | 'medium' | 'medium_high' | 'high';

/**
 * Warmth level for emotional tone
 */
export type WarmthLevel = 'medium' | 'medium_high' | 'high' | 'very_high';

/**
 * Pacing preference
 */
export type PacingStyle = 'gentle' | 'moderate' | 'brisk' | 'slow';

/**
 * Modulation directives
 */
export interface ModulationDirectives {
  reduce: string[];   // What to reduce (e.g., "pressure language", "abstract meta-talk")
  increase: string[]; // What to increase (e.g., "validation", "grounding statements")
  emphasize: string[]; // What to emphasize (e.g., "single-path clarity", "containers")
}

/**
 * Complete modulation profile for an archetype
 */
export interface ModulationProfile {
  archetype: StudentArchetype;
  tone: ToneStyle;
  structure: StructureLevel;
  warmth: WarmthLevel;
  pacing: PacingStyle;
  directives: ModulationDirectives;
  strategyLanguage: string; // Key phrases for this archetype
  examplePhrases: string[]; // Signature phrases Jenny uses with this type
}

/**
 * Modulation envelope passed to Component 42
 */
export interface ModulationEnvelope {
  persona: 'jenny';
  archetype: StudentArchetype;
  secondary: StudentArchetype | null;
  confidence: number;
  toneProfile: ModulationProfile;
  constraints: {
    driftTolerance: 'strict' | 'moderate' | 'relaxed';
    creativityLevel: 'low' | 'medium' | 'high';
    groundingRequired: boolean;
  };
  metadata: {
    detectionSignals: string[];
    timestamp: string;
  };
}

/**
 * Archetype detection input signals
 */
export interface ArchetypeSignals {
  // From personality
  coreValues: string[];
  stressors: string[];
  motivators: string[];

  // From academics
  gpa: number | null;
  rigorLevel: 'high' | 'medium' | 'low';
  performancePattern: 'consistent' | 'spiky' | 'declining' | 'improving';

  // From activities
  activityTypes: string[];
  commitmentLevel: 'overloaded' | 'balanced' | 'minimal';
  leadershipRoles: number;

  // From emotional indicators
  anxietyMarkers: number; // 0-10
  confidenceMarkers: number; // 0-10
  clarityMarkers: number; // 0-10
  burnoutMarkers: number; // 0-10

  // From conversation
  conversationTone: 'overwhelmed' | 'lost' | 'driven' | 'detached' | 'anxious';
  questionPatterns: 'analytical' | 'uncertain' | 'strategic' | 'minimal';
}
