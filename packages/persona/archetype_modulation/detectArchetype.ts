/**
 * detectArchetype.ts
 *
 * Detects student archetype from ExtractedProfile_v2
 * Uses personality signals, academic patterns, activities, and emotional indicators
 */

import type { ExtractedProfile_v2 } from '../../schema/extractedProfile_v2';
import type { DetectedArchetype, StudentArchetype, ArchetypeSignals } from './types';

/**
 * Extract archetype signals from profile
 */
function extractSignals(profile: ExtractedProfile_v2): ArchetypeSignals {
  const academics = profile.academics;
  const activities = profile.activities;
  const personality = profile.personality;

  // Compute GPA metrics
  const gpa = academics.gpa?.weighted || academics.gpa?.unweighted || null;

  // Compute rigor level
  const apIbCount = academics.courseLoad.filter(
    c => c.rigorLevel === 'AP' || c.rigorLevel === 'IB'
  ).length;
  const rigorLevel = apIbCount >= 4 ? 'high' : apIbCount >= 2 ? 'medium' : 'low';

  // Compute activity commitment
  const activityCount = activities.length;
  const leadershipRoles = activities.filter(a => a.leadership).length;
  const commitmentLevel =
    activityCount >= 8 ? 'overloaded' :
    activityCount >= 4 ? 'balanced' :
    'minimal';

  // Extract activity types
  const activityTypes = activities.map(a => a.type.toLowerCase());

  // Analyze personality markers
  const coreValues = personality.coreValues || [];
  const identityThreads = personality.identityThreads || [];
  const passions = personality.passions || [];

  // Compute emotional markers (0-10 scale)
  // Use identityThreads and communicationStyle to infer stress/confidence
  const allText = [
    ...coreValues,
    ...identityThreads,
    ...passions,
    personality.communicationStyle || '',
    personality.emotionalIntelligence || ''
  ].join(' ').toLowerCase();

  const anxietyMarkers = Math.min(10, (
    allText.match(/anxiety|worry|stress|overwhelm|fear|nervous/g) || []
  ).length * 2);

  const confidenceMarkers = Math.max(0, 10 - (
    allText.match(/doubt|imposter|insecure|uncertain/g) || []
  ).length * 2);

  const clarityMarkers = Math.min(10, (
    allText.match(/direction|purpose|clarity|vision|goal|clear/g) || []
  ).length * 2);

  const burnoutMarkers = Math.min(10, (
    allText.match(/burnout|exhaust|tired|overwork|too much|overwhelm/g) || []
  ).length * 2);

  // Determine conversation tone (simplified)
  let conversationTone: ArchetypeSignals['conversationTone'] = 'lost';
  if (anxietyMarkers > 6) conversationTone = 'anxious';
  else if (burnoutMarkers > 6) conversationTone = 'overwhelmed';
  else if (clarityMarkers < 3) conversationTone = 'lost';
  else if (commitmentLevel === 'minimal') conversationTone = 'detached';
  else conversationTone = 'driven';

  return {
    coreValues,
    stressors: identityThreads, // Map identityThreads to stressors for compatibility
    motivators: passions, // Map passions to motivators
    gpa,
    rigorLevel,
    performancePattern: 'consistent', // TODO: derive from grade trends
    activityTypes,
    commitmentLevel,
    leadershipRoles,
    anxietyMarkers,
    confidenceMarkers,
    clarityMarkers,
    burnoutMarkers,
    conversationTone,
    questionPatterns: 'analytical' // TODO: derive from conversation history
  };
}

/**
 * Detect student archetype using rule-based heuristics
 *
 * In Component 44, this will be replaced with LLM-based classification
 */
export function detectStudentArchetype(
  profile: ExtractedProfile_v2
): DetectedArchetype {
  const signals = extractSignals(profile);
  const detectionSignals: string[] = [];

  let primary: StudentArchetype = 'lost_dreamer'; // default
  let secondary: StudentArchetype | null = null;
  let confidence = 0.5;

  // Rule 1: High-Achieving Robot
  if (
    signals.gpa && signals.gpa >= 3.8 &&
    signals.rigorLevel === 'high' &&
    (signals.anxietyMarkers > 6 || signals.burnoutMarkers > 5)
  ) {
    primary = 'high_achieving_robot';
    confidence = 0.75;
    detectionSignals.push('High GPA + High rigor + Anxiety/burnout markers');

    if (signals.commitmentLevel === 'overloaded') {
      secondary = 'burnt_out_overloader';
      confidence = 0.82;
      detectionSignals.push('Also showing overload patterns');
    }
  }

  // Rule 2: Anxious Overthinker
  else if (signals.anxietyMarkers >= 7) {
    primary = 'anxious_overthinker';
    confidence = 0.78;
    detectionSignals.push('High anxiety markers');

    if (signals.gpa && signals.gpa >= 3.5) {
      secondary = 'high_achieving_robot';
      detectionSignals.push('Also high-achieving');
    }
  }

  // Rule 3: Burnt-Out Overloader
  else if (
    signals.commitmentLevel === 'overloaded' &&
    signals.burnoutMarkers >= 6
  ) {
    primary = 'burnt_out_overloader';
    confidence = 0.72;
    detectionSignals.push('Overloaded activities + burnout markers');
  }

  // Rule 4: Lost Dreamer
  else if (
    signals.clarityMarkers <= 3 &&
    signals.conversationTone === 'lost'
  ) {
    primary = 'lost_dreamer';
    confidence = 0.68;
    detectionSignals.push('Low clarity markers + uncertain tone');

    if (signals.gpa && signals.gpa >= 3.3) {
      detectionSignals.push('High potential despite lack of direction');
      confidence = 0.73;
    }
  }

  // Rule 5: Chaotic Creative
  else if (
    signals.activityTypes.some(t => t.match(/art|music|creative|design|writing/)) &&
    signals.commitmentLevel !== 'minimal'
  ) {
    primary = 'chaotic_creative';
    confidence = 0.65;
    detectionSignals.push('Creative activities present');

    // Check for organization issues
    if (signals.stressors.some(s => s.toLowerCase().match(/organization|time|deadline/))) {
      confidence = 0.72;
      detectionSignals.push('Organization/time management stressors');
    }
  }

  // Rule 6: Detached Minimalist
  else if (
    signals.commitmentLevel === 'minimal' &&
    signals.conversationTone === 'detached'
  ) {
    primary = 'detached_minimalist';
    confidence = 0.70;
    detectionSignals.push('Minimal activities + detached tone');
  }

  // Rule 7: Low-Confidence High-Talent
  else if (
    signals.confidenceMarkers <= 4 &&
    signals.gpa && signals.gpa >= 3.5
  ) {
    primary = 'low_confidence_high_talent';
    confidence = 0.71;
    detectionSignals.push('Low confidence + high academic performance');

    if (signals.stressors.some(s => s.toLowerCase().match(/imposter|doubt|belong/))) {
      confidence = 0.80;
      detectionSignals.push('Explicit imposter syndrome markers');
    }
  }

  // Rule 8: Hyper-Ambitious Spiky Kid
  else if (
    signals.leadershipRoles >= 2 &&
    signals.commitmentLevel === 'overloaded' &&
    signals.conversationTone === 'driven'
  ) {
    primary = 'hyper_ambitious_spiky';
    confidence = 0.69;
    detectionSignals.push('High leadership + overloaded + driven');

    // Check for spiky patterns
    if (signals.performancePattern === 'spiky') {
      confidence = 0.76;
      detectionSignals.push('Spiky performance pattern');
    }
  }

  // Rule 9: Discouraged Underdog
  else if (
    signals.gpa && signals.gpa < 3.2 &&
    signals.stressors.some(s => s.toLowerCase().match(/discourage|behind|fail|struggle/))
  ) {
    primary = 'discouraged_underdog';
    confidence = 0.70;
    detectionSignals.push('Below 3.2 GPA + discouragement markers');
  }

  // Fallback: Lost Dreamer (most common)
  else {
    primary = 'lost_dreamer';
    confidence = 0.55;
    detectionSignals.push('Default classification - needs more data');
  }

  return {
    primary,
    secondary,
    confidence,
    signals: detectionSignals
  };
}

/**
 * Batch detect archetypes for multiple profiles
 */
export function batchDetectArchetypes(
  profiles: ExtractedProfile_v2[]
): DetectedArchetype[] {
  return profiles.map(detectStudentArchetype);
}

/**
 * Get archetype name in human-readable format
 */
export function getArchetypeName(archetype: StudentArchetype): string {
  const names: Record<StudentArchetype, string> = {
    high_achieving_robot: 'The High-Achieving Robot',
    lost_dreamer: 'The Lost Dreamer',
    discouraged_underdog: 'The Discouraged Underdog',
    burnt_out_overloader: 'The Burnt-Out Overloader',
    detached_minimalist: 'The Detached Minimalist',
    hyper_ambitious_spiky: 'The Hyper-Ambitious Spiky Kid',
    low_confidence_high_talent: 'The Low-Confidence High-Talent Kid',
    chaotic_creative: 'The Chaotic Creative',
    anxious_overthinker: 'The Highly Anxious Overthinker'
  };

  return names[archetype];
}
