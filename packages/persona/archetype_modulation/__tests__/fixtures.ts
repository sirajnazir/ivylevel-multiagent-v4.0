/**
 * Test fixtures for archetype detection tests
 */

import type { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';

export const mockHighAchieverProfile: Partial<ExtractedProfile_v2> = {
  academics: {
    gpa: { weighted: 4.3, unweighted: 3.95 },
    courseLoad: [
      { name: 'AP Calculus BC', rigorLevel: 'AP', subject: 'Math', grade: 'A' },
      { name: 'AP Physics C', rigorLevel: 'AP', subject: 'Science', grade: 'A' },
      { name: 'AP English Lit', rigorLevel: 'AP', subject: 'English', grade: 'A-' },
      { name: 'AP US History', rigorLevel: 'AP', subject: 'Social Studies', grade: 'A' }
    ],
    testScores: { sat: 1520, act: null, apScores: [] },
    academicInterests: ['STEM', 'Engineering'],
    plannedCourses: [],
    rigorGaps: []
  },
  activities: [
    {
      name: 'Robotics Team',
      type: 'Club',
      role: 'Team Captain',
      hoursPerWeek: 10,
      yearsInvolved: 3,
      leadership: true,
      depthSignals: ['Regional Competition Winner'],
      outcomes: ['Built autonomous robot']
    },
    {
      name: 'Math Olympiad',
      type: 'Club',
      role: 'Member',
      hoursPerWeek: 5,
      yearsInvolved: 3,
      leadership: false,
      depthSignals: [],
      outcomes: []
    }
  ],
  awards: [],
  personality: {
    coreValues: ['achievement', 'perfection', 'excellence'],
    identityThreads: ['high anxiety', 'pressure to succeed', 'fear of failure'],
    passions: ['robotics', 'mathematics'],
    communicationStyle: 'analytical and stressed',
    emotionalIntelligence: 'aware but overwhelmed'
  }
};

export const mockLostDreamerProfile: Partial<ExtractedProfile_v2> = {
  academics: {
    gpa: { weighted: 3.5, unweighted: 3.4 },
    courseLoad: [
      { name: 'English 11', rigorLevel: 'Regular', subject: 'English', grade: 'B+' },
      { name: 'Chemistry', rigorLevel: 'Honors', subject: 'Science', grade: 'B' }
    ],
    testScores: { sat: null, act: null, apScores: [] },
    academicInterests: [],
    plannedCourses: [],
    rigorGaps: []
  },
  activities: [
    {
      name: 'Art Club',
      type: 'Arts',
      role: 'Member',
      hoursPerWeek: 4,
      yearsInvolved: 2,
      leadership: false,
      depthSignals: [],
      outcomes: []
    }
  ],
  awards: [],
  personality: {
    coreValues: ['exploration', 'creativity'],
    identityThreads: ['uncertain about direction', 'exploring interests'],
    passions: ['art', 'design'],
    communicationStyle: 'thoughtful and uncertain',
    emotionalIntelligence: 'reflective'
  }
};

export const mockAnxiousOverthinkerProfile: Partial<ExtractedProfile_v2> = {
  academics: {
    gpa: { weighted: 3.7, unweighted: 3.6 },
    courseLoad: [
      { name: 'AP English', rigorLevel: 'AP', subject: 'English', grade: 'A-' },
      { name: 'Honors Chemistry', rigorLevel: 'Honors', subject: 'Science', grade: 'B+' }
    ],
    testScores: { sat: 1450, act: null, apScores: [] },
    academicInterests: ['Writing'],
    plannedCourses: [],
    rigorGaps: []
  },
  activities: [
    {
      name: 'Debate Team',
      type: 'Club',
      role: 'Member',
      hoursPerWeek: 6,
      yearsInvolved: 2,
      leadership: false,
      depthSignals: [],
      outcomes: []
    }
  ],
  awards: [],
  personality: {
    coreValues: ['analysis', 'understanding'],
    identityThreads: ['chronic anxiety', 'worry about future', 'fear of making wrong decisions', 'stress about college', 'overwhelmed by choices'],
    passions: ['writing', 'debate'],
    communicationStyle: 'analytical but anxious',
    emotionalIntelligence: 'highly aware but overthinks'
  }
};
