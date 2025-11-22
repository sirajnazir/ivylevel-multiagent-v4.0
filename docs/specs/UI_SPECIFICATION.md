# IvyLevel Assessment UI Specification v1.0
**Date:** 2025-11-21  
**Status:** Production-Ready  
**Package:** `packages/ui-assessment` + `apps/student-app`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Library](#component-library)
4. [Student-Facing UI](#student-facing-ui)
5. [Coach Dashboard UI](#coach-dashboard-ui)
6. [Data Models](#data-models)
7. [Theming System](#theming-system)
8. [Integration Guide](#integration-guide)
9. [Component Reference](#component-reference)

---

## Overview

The IvyLevel Assessment UI is a **fully isolated, backend-agnostic** React component library designed for displaying rich, personalized assessment results with EQ-aware narrative and strategy recommendations.

### Design Principles

1. **Backend Agnostic** - Components consume standardized data models, work with any backend
2. **EQ-First Design** - Every component respects emotional intelligence signals and tone
3. **Evidence-Based** - All insights backed by RAG-retrieved KB chips with citations
4. **Responsive & Accessible** - Mobile-first design with WCAG AA compliance
5. **Theme-able** - Full design system customization via props
6. **Type-Safe** - Complete TypeScript coverage with Zod validation

### Key Features

- ✅ Real-time assessment progress tracking
- ✅ Multi-stage assessment flow (5 stages)
- ✅ EQ-modulated conversation display
- ✅ Evidence citations with KB chip references
- ✅ Interactive score visualizations
- ✅ Timeline-based strategy recommendations
- ✅ Summer program suggestions
- ✅ Awards target tracking
- ✅ Academic profile summaries
- ✅ Customizable themes
- ✅ Server-side rendering compatible

---

## Architecture

### Package Structure

```
ivylevel-multiagents-v4.0/
├── packages/
│   └── ui-assessment/           # Shared UI component library
│       ├── components/          # React components
│       ├── hooks/              # Custom React hooks
│       ├── styles/             # Theme system
│       ├── types.ts            # TypeScript types
│       └── index.ts            # Public API
│
└── apps/
    └── student-app/            # Student-facing Next.js app
        ├── app/                # Next.js 13 App Router
        ├── components/         # App-specific components
        ├── hooks/              # App-specific hooks
        ├── lib/                # Utilities
        └── styles/             # App styles
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.x | Component rendering |
| **Build** | Next.js | 13.x+ | SSR, routing, API routes |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | CSS Modules + Inline | N/A | Isolated styling |
| **State** | React Hooks | Built-in | Local state management |
| **Validation** | Zod | 3.x | Runtime type validation |
| **HTTP** | Fetch API | Native | Data fetching |

### Design Patterns

1. **Render Model Pattern** - Backend produces `RenderModel_v1`, UI consumes it
2. **Composition Over Configuration** - Small, composable components
3. **Props-Based Theming** - No context providers, theme passed via props
4. **Custom Hooks** - Encapsulate complex logic (data fetching, state management)
5. **Progressive Enhancement** - Works with JS disabled (SSR)

---

## Component Library

### Core Package: `packages/ui-assessment`

**Purpose:** Shared, reusable UI components for displaying assessment results

**Exports:**
```typescript
export { AssessmentDashboard } from './components/AssessmentDashboard';
export { ScoreCard } from './components/ScoreCard';
export { NarrativeSection } from './components/NarrativeSection';
export { StrategyTimeline } from './components/StrategyTimeline';
export { SummerPlans } from './components/SummerPlans';
export { AwardsTargets } from './components/AwardsTargets';
export { AcademicsSummary } from './components/AcademicsSummary';
export { LoadingState } from './components/LoadingState';
export { useAssessmentModel } from './hooks/useAssessmentModel';
export type * from './types';
```

### Component Hierarchy

```
AssessmentDashboard (Root)
├── Header
│   ├── Student Name
│   ├── Stage Badge
│   └── Session Date
├── Scores Section
│   ├── ScoreCard (Overall)
│   ├── ScoreCard (Academics)
│   ├── ScoreCard (Extracurriculars)
│   ├── ScoreCard (Personal Growth)
│   └── ScoreCard (College Readiness)
├── NarrativeSection
│   └── NarrativeBlock[] (Observations, Insights, Validations, Concerns)
├── StrategyTimeline
│   └── StrategyBlock[] (Immediate, Short-term, Long-term)
├── AcademicsSummary
│   ├── GPA & Test Scores
│   ├── Course Rigor
│   ├── Academic Interests
│   └── Strengths & Growth Areas
├── SummerPlans
│   └── SummerPlan[] (Programs, Research, Competitions)
├── AwardsTargets
│   └── AwardTarget[] (Recommended awards with deadlines)
└── Footer
    └── Session ID, Coach, Version
```

---

## Student-Facing UI

### App: `apps/student-app`

**Purpose:** Next.js 13 application for real-time assessment conversations

**Routes:**
```
/assessment                    → New assessment page (start session)
/assessment/[sessionId]        → Active assessment session
```

### Component Hierarchy

```
App Layout
└── AssessmentChatWrapper (Main UI)
    ├── Header
    │   ├── Session Title
    │   ├── Stage Indicator
    │   └── Progress Bar
    ├── Messages Container
    │   └── MessageDecorator[]
    │       ├── Message Content
    │       ├── EQ Tone Badge (Jenny only)
    │       ├── Evidence Citations
    │       └── KB Chip References
    ├── Input Area
    │   ├── Textarea
    │   └── Send Button
    └── Debug Panel (optional)
        ├── Current Stage
        ├── Archetype
        ├── EQ Tone
        └── Memory Stats
```

### Key Components

#### 1. `AssessmentChatWrapper`

**Purpose:** Root chat interface with real-time agent interaction

**Features:**
- Real-time message streaming
- Stage-based progress tracking
- EQ tone visualization
- Error handling with retry
- Loading states

**Props:**
```typescript
interface AssessmentChatWrapperProps {
  sessionId: string;
  showDebugPanel?: boolean;
}
```

**Usage:**
```tsx
<AssessmentChatWrapper 
  sessionId="abc123" 
  showDebugPanel={false} 
/>
```

#### 2. `MessageDecorator`

**Purpose:** Decorates messages with evidence, citations, and EQ metadata

**Features:**
- KB chip citation badges
- Evidence expansion on click
- EQ tone indicators
- Archetype hints
- Timestamp display

**Props:**
```typescript
interface MessageDecoratorProps {
  message: ChatMessage;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  eqTone?: string;
  evidence?: EvidenceItem[];
  citations?: string[];
}
```

#### 3. `AssessmentStageIndicator`

**Purpose:** Visual indicator of current assessment stage

**Features:**
- 5 stages: Rapport → Current State → Diagnostic → Preview → Completed
- Progress percentage
- Stage descriptions
- Animated transitions

**Props:**
```typescript
interface AssessmentStageIndicatorProps {
  stage: AssessmentStage;
  progress: number; // 0-100
}
```

#### 4. `AssessmentProgressBar`

**Purpose:** Linear progress bar showing completion

**Features:**
- Smooth animations
- Color-coded by stage
- Percentage display
- Accessible labels

---

## Coach Dashboard UI

### Component: `AssessmentDashboard`

**Purpose:** Comprehensive dashboard for coaches to review completed assessments

**Location:** `packages/ui-assessment/components/AssessmentDashboard.tsx`

### Sections

#### 1. Header Section

**Displays:**
- Student name
- Session date
- Current stage badge
- Session ID

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Assessment Dashboard                            │
│ Aarav Sharma                                   │
│                                  [Current State]│
│                                  April 16, 2024 │
└─────────────────────────────────────────────────┘
```

#### 2. Scores Section

**Displays:** 5 score cards in responsive grid

**Score Cards:**
1. **Overall** - Composite readiness score
2. **Academics** - GPA, rigor, test scores
3. **Extracurriculars** - Depth, leadership, impact
4. **Personal Growth** - Self-awareness, resilience
5. **College Readiness** - Strategy, execution, positioning

**Score Card Layout:**
```
┌───────────────────────────┐
│ Academics                 │
│                           │
│      [85]                 │
│   ████████░░              │
│                           │
│ Strong foundation with    │
│ room for AP expansion     │
└───────────────────────────┘
```

**Features:**
- 0-100 numeric score
- Progress bar visualization
- Trend indicator (↑↓→)
- Insight bullets
- Color-coded by performance

#### 3. Narrative Section

**Displays:** Conversational insights from Jenny

**Narrative Types:**
- 🔍 **Observation** - Factual patterns noticed
- 💡 **Insight** - Deeper analysis
- ✅ **Validation** - Affirmation of strengths
- ⚠️ **Concern** - Areas needing attention

**Layout:**
```
┌─────────────────────────────────────────────┐
│ 💡 INSIGHT                                  │
│                                             │
│ Aarav's profile shows the classic "parent- │
│ driven multitasker" pattern - strong       │
│ academic foundation but scattered ECs.     │
│                                             │
│ EQ Chips: IMSG-PATTERN-42, KB-SESS-891    │
│ Confidence: 87%                            │
└─────────────────────────────────────────────┘
```

**Features:**
- Rich text formatting
- EQ chip citations
- Confidence scores
- Timestamp tracking
- Related narrative linking

#### 4. Strategy Timeline

**Displays:** Actionable recommendations organized by timeline

**Timeline Categories:**
- ⚡ **Immediate** (0-2 months)
- 📅 **Short-term** (2-6 months)
- 🎯 **Long-term** (6-12 months)

**Strategy Block Layout:**
```
┌─────────────────────────────────────────────┐
│ ⚡ IMMEDIATE                  [HIGH PRIORITY]│
│                                             │
│ Consolidate Extracurricular Profile        │
│                                             │
│ Drop 2-3 low-impact activities and double  │
│ down on robotics club leadership role.     │
│                                             │
│ Action Steps:                              │
│  1. Audit current commitments              │
│  2. Identify 2-3 activities to drop        │
│  3. Increase robotics involvement          │
│                                             │
│ Category: Extracurriculars                 │
└─────────────────────────────────────────────┘
```

**Features:**
- Priority badges (High/Medium/Low)
- Category icons
- Expandable action steps
- Related narrative references
- Deadline tracking

#### 5. Academics Summary

**Displays:** Comprehensive academic profile

**Sections:**
- **GPA** - Weighted & Unweighted
- **Test Scores** - SAT, ACT, AP, SAT Subject
- **Course Rigor** - Rating with explanation
- **Class Rank** - Percentile if available
- **Academic Interests** - Subject areas
- **Strengths** - What's working well
- **Areas for Growth** - What needs work

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Academics Summary                           │
├─────────────────────────────────────────────┤
│ GPA: 3.85 (UW) / 4.2 (W)                   │
│ Course Rigor: Very Rigorous                │
│                                             │
│ Test Scores:                                │
│  • SAT: 1480 (M: 750, V: 730)             │
│  • AP Calc BC: 5                           │
│                                             │
│ Academic Interests:                         │
│  • Computer Science                         │
│  • Data Science                            │
│  • Environmental Science                    │
│                                             │
│ Strengths:                                  │
│  • Strong STEM foundation                   │
│  • Advanced math (Alg2 in 8th grade)      │
│                                             │
│ Areas for Growth:                           │
│  • Build humanities strength                │
│  • Develop research experience             │
└─────────────────────────────────────────────┘
```

#### 6. Summer Plans

**Displays:** Recommended summer programs and activities

**Program Types:**
- 🎓 Program
- 💼 Internship
- 🔬 Research
- ❤️ Volunteer
- 🏆 Competition

**Summer Plan Card Layout:**
```
┌─────────────────────────────────────────────┐
│ 🔬 RESEARCH                [HIGHLY SELECTIVE]│
│                                             │
│ MIT Research Science Institute (RSI)        │
│                                             │
│ 6-week residential STEM research program   │
│ working with MIT faculty.                  │
│                                             │
│ Duration: 6 weeks                          │
│ Application Deadline: Jan 15               │
│ Cost: Free (fully funded)                  │
│                                             │
│ Benefits:                                   │
│  • Original research publication           │
│  • MIT faculty mentorship                  │
│  • Strong signal for top colleges          │
│                                             │
│ [Visit Website →]                          │
└─────────────────────────────────────────────┘
```

**Features:**
- Competitiveness tags
- Deadline alerts
- Cost estimates
- Benefits list
- External links

#### 7. Awards Targets

**Displays:** Recommended awards to pursue

**Award Categories:**
- 📚 Academic
- 🌟 Extracurricular
- 👑 Leadership
- ❤️ Service
- 🎨 Creative

**Award Card Layout:**
```
┌─────────────────────────────────────────────┐
│ 🏆 ACADEMIC                     [ACHIEVABLE]│
│                                             │
│ National Merit Scholar                      │
│                                             │
│ Based on PSAT/NMSQT scores, recognizes    │
│ academic excellence nationwide.            │
│                                             │
│ Application Deadline: Oct 15               │
│                                             │
│ Requirements:                              │
│  • PSAT score ≥ 1400                      │
│  • Strong GPA (3.5+)                      │
│  • Essay submission                        │
│                                             │
│ Why Recommended:                           │
│ Your current trajectory puts you in range. │
│ Focus on PSAT prep this fall.             │
│                                             │
│ [Learn More →]                            │
└─────────────────────────────────────────────┘
```

---

## Data Models

### Primary Model: `RenderModel_v1`

**Purpose:** Complete data structure that drives all UI components

**Schema:**
```typescript
interface RenderModel_v1 {
  sessionId: string;
  stage: AssessmentStage;
  narrative: NarrativeBlock[];
  strategy: StrategyBlock[];
  scores: ScoresBlock;
  summerPlans?: SummerPlan[];
  awardsTargets?: AwardTarget[];
  academics?: AcademicsSummary;
  metadata?: {
    studentName?: string;
    coachName?: string;
    sessionDate?: string;
    version?: string;
  };
}
```

### Assessment Stages

```typescript
type AssessmentStage = 
  | 'rapport'           // Initial connection building
  | 'current_state'     // Understanding current situation
  | 'diagnostic'        // Deep dive analysis
  | 'preview'           // Strategy preview
  | 'completed';        // Assessment finished
```

### Narrative Block

**Purpose:** A single conversational insight from Jenny

```typescript
interface NarrativeBlock {
  id: string;
  type: 'observation' | 'insight' | 'validation' | 'concern';
  text: string;
  eqChips?: string[];      // EQ chips that influenced this
  confidence?: number;      // 0-1
  timestamp?: string;
}
```

**Example:**
```json
{
  "id": "narr-001",
  "type": "insight",
  "text": "Aarav's profile shows the classic 'parent-driven multitasker' pattern - strong academic foundation but scattered ECs that lack depth.",
  "eqChips": ["IMSG-PATTERN-42", "KB-SESS-891"],
  "confidence": 0.87,
  "timestamp": "2024-04-16T14:30:00Z"
}
```

### Strategy Block

**Purpose:** An actionable recommendation with timeline

```typescript
interface StrategyBlock {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeline: 'immediate' | 'short-term' | 'long-term';
  category: 'academics' | 'extracurriculars' | 'personal' | 'admissions';
  actionSteps?: string[];
  relatedNarratives?: string[];  // IDs of related narratives
}
```

**Example:**
```json
{
  "id": "strat-001",
  "title": "Consolidate Extracurricular Profile",
  "description": "Drop 2-3 low-impact activities and double down on robotics club leadership role.",
  "priority": "high",
  "timeline": "immediate",
  "category": "extracurriculars",
  "actionSteps": [
    "Audit current time commitments",
    "Identify 2-3 activities to gracefully exit",
    "Increase robotics involvement to 8-10 hrs/week"
  ],
  "relatedNarratives": ["narr-001"]
}
```

### Score Dimension

**Purpose:** A scored aspect of the student profile

```typescript
interface ScoreDimension {
  score: number;          // 0-100
  label: string;
  description?: string;
  trend?: 'improving' | 'stable' | 'declining';
  insights?: string[];
}
```

**Example:**
```json
{
  "score": 85,
  "label": "Academics",
  "description": "Strong foundation with room for AP expansion",
  "trend": "improving",
  "insights": [
    "Taking Algebra 2 in 8th grade shows advanced math trajectory",
    "Consider adding 1-2 more APs in freshman year"
  ]
}
```

### Summer Plan

**Purpose:** A recommended summer activity

```typescript
interface SummerPlan {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'internship' | 'research' | 'volunteer' | 'competition' | 'other';
  duration: string;
  competitiveness: 'highly-selective' | 'selective' | 'open';
  applicationDeadline?: string;
  estimatedCost?: string;
  benefits: string[];
  url?: string;
}
```

### Award Target

**Purpose:** A recommended award to pursue

```typescript
interface AwardTarget {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'extracurricular' | 'leadership' | 'service' | 'creative' | 'other';
  competitiveness: 'highly-selective' | 'selective' | 'achievable';
  applicationDeadline?: string;
  requirements: string[];
  whyRecommended: string;
  url?: string;
}
```

---

## Theming System

### Design Tokens

**Location:** `packages/ui-assessment/styles/tokens.ts`

**Structure:**
```typescript
interface AssessmentTheme {
  colors: {
    primary: string;      // Brand color
    secondary: string;    // Accent color
    background: string;   // Page background
    surface: string;      // Card background
    text: string;         // Primary text
    textSecondary: string; // Secondary text
    border: string;       // Borders
    success: string;      // Success states
    warning: string;      // Warning states
    error: string;        // Error states
    info: string;         // Info states
  };
  typography: {
    fontFamily: string;
    headingFontFamily?: string;
    fontSize: {
      xs: string;   // 12px
      sm: string;   // 14px
      md: string;   // 16px
      lg: string;   // 18px
      xl: string;   // 24px
      xxl: string;  // 32px
    };
    fontWeight: {
      normal: number;   // 400
      medium: number;   // 500
      semibold: number; // 600
      bold: number;     // 700
    };
  };
  spacing: {
    xs: string;   // 4px
    sm: string;   // 8px
    md: string;   // 16px
    lg: string;   // 24px
    xl: string;   // 32px
    xxl: string;  // 48px
  };
  borderRadius: {
    sm: string;   // 4px
    md: string;   // 8px
    lg: string;   // 12px
    full: string; // 9999px
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
```

### Default Theme

**Location:** `packages/ui-assessment/styles/defaults.ts`

```typescript
export const defaultTheme: AssessmentTheme = {
  colors: {
    primary: '#2563eb',        // Blue
    secondary: '#7c3aed',      // Purple
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
};
```

### Theme Customization

**Usage:**
```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';

const customTheme = {
  colors: {
    primary: '#8b5cf6',  // Purple brand
    secondary: '#ec4899', // Pink accent
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
};

<AssessmentDashboard 
  model={renderModel} 
  theme={customTheme} 
/>
```

**Features:**
- Partial theme overrides (deep merge)
- No CSS-in-JS dependencies
- SSR-compatible
- Props-based (no context)

---

## Integration Guide

### Option 1: Direct Model Usage

**Use when:** You already have assessment data

```tsx
import { AssessmentDashboard, RenderModel_v1 } from '@ivylevel/ui-assessment';

const model: RenderModel_v1 = {
  sessionId: 'abc123',
  stage: 'completed',
  narrative: [...],
  strategy: [...],
  scores: {...},
  // ... rest of model
};

function MyPage() {
  return <AssessmentDashboard model={model} />;
}
```

### Option 2: API Fetching

**Use when:** Data needs to be fetched from backend

```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';

function MyPage() {
  return (
    <AssessmentDashboard 
      sessionId="abc123"
      apiEndpoint="https://api.ivylevel.com/assessments"
      onLoading={(loading) => console.log('Loading:', loading)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

**Expected API Response:**
```
GET https://api.ivylevel.com/assessments/abc123

Response: RenderModel_v1 JSON
```

### Option 3: Student Chat Interface

**Use when:** Building real-time assessment experience

```tsx
import { AssessmentChatWrapper } from '@ivylevel/student-app';

function AssessmentPage({ params }: { params: { sessionId: string } }) {
  return (
    <AssessmentChatWrapper 
      sessionId={params.sessionId}
      showDebugPanel={process.env.NODE_ENV === 'development'}
    />
  );
}
```

### Backend Requirements

**Endpoint:** `GET /api/assessments/:sessionId`

**Response Schema:**
```typescript
{
  sessionId: string;
  stage: AssessmentStage;
  narrative: NarrativeBlock[];
  strategy: StrategyBlock[];
  scores: ScoresBlock;
  // ... optional fields
}
```

**Chat Endpoint:** `POST /api/chat/:sessionId`

**Request Schema:**
```typescript
{
  message: string;
}
```

**Response Schema:**
```typescript
{
  response: string;
  stage: AssessmentStage;
  progress: number;  // 0-100
  eqTone?: string;
  evidence?: EvidenceItem[];
  citations?: string[];
}
```

---

## Component Reference

### AssessmentDashboard

**Purpose:** Root dashboard component

**Props:**
```typescript
interface AssessmentDashboardProps {
  model?: RenderModel_v1;          // Provide model directly
  sessionId?: string;              // Or fetch by session ID
  apiEndpoint?: string;            // API base URL
  theme?: Partial<AssessmentTheme>; // Custom theme
  onLoading?: (loading: boolean) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}
```

**States:**
- Loading (shows spinner)
- Error (shows error + retry button)
- Empty (no data available)
- Success (renders dashboard)

**Example:**
```tsx
<AssessmentDashboard 
  sessionId="abc123"
  apiEndpoint="/api/assessments"
  theme={{ colors: { primary: '#8b5cf6' } }}
  onError={(err) => logError(err)}
/>
```

### ScoreCard

**Purpose:** Display single score dimension

**Props:**
```typescript
interface ScoreCardProps {
  dimension: ScoreDimension;
  theme?: Partial<AssessmentTheme>;
  className?: string;
}
```

**Features:**
- Circular or linear progress indicator
- Trend arrow (↑↓→)
- Insights list
- Color-coded by score range

**Score Ranges:**
- 90-100: Excellent (green)
- 70-89: Strong (blue)
- 50-69: Moderate (yellow)
- 0-49: Needs Work (red)

### NarrativeSection

**Purpose:** Display narrative blocks with EQ awareness

**Props:**
```typescript
interface NarrativeSectionProps {
  narratives: NarrativeBlock[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}
```

**Features:**
- Type-based icons (🔍💡✅⚠️)
- EQ chip citations
- Confidence badges
- Timestamp display
- Expandable content

### StrategyTimeline

**Purpose:** Timeline-based strategy display

**Props:**
```typescript
interface StrategyTimelineProps {
  strategies: StrategyBlock[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}
```

**Features:**
- Grouped by timeline
- Priority badges
- Expandable action steps
- Category icons
- Progress tracking

### SummerPlans

**Purpose:** Display summer program recommendations

**Props:**
```typescript
interface SummerPlansProps {
  plans: SummerPlan[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}
```

**Features:**
- Type badges
- Competitiveness indicators
- Deadline alerts
- Cost display
- External links

### AwardsTargets

**Purpose:** Display award recommendations

**Props:**
```typescript
interface AwardsTargetsProps {
  awards: AwardTarget[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}
```

**Features:**
- Category badges
- Requirements checklist
- Deadline tracking
- "Why recommended" section
- External links

### AcademicsSummary

**Purpose:** Comprehensive academic profile

**Props:**
```typescript
interface AcademicsSummaryProps {
  academics: AcademicsSummary;
  theme?: Partial<AssessmentTheme>;
  className?: string;
}
```

**Features:**
- GPA display (weighted/unweighted)
- Test scores grid
- Course rigor badge
- Interests tags
- Strengths/growth lists

### MessageDecorator

**Purpose:** Decorate chat messages with evidence

**Props:**
```typescript
interface MessageDecoratorProps {
  message: ChatMessage;
}
```

**Features:**
- EQ tone badges
- Evidence citations
- KB chip references
- Expandable evidence
- Timestamp

### AssessmentStageIndicator

**Purpose:** Visual stage progress

**Props:**
```typescript
interface AssessmentStageIndicatorProps {
  stage: AssessmentStage;
  progress: number;
}
```

**Features:**
- 5-stage visualization
- Animated transitions
- Stage descriptions
- Progress percentage

---

## Custom Hooks

### useAssessmentModel

**Purpose:** Fetch and manage assessment data

**Signature:**
```typescript
function useAssessmentModel(options: UseAssessmentModelOptions): UseAssessmentModelResult;
```

**Options:**
```typescript
interface UseAssessmentModelOptions {
  sessionId?: string;
  apiEndpoint?: string;
  model?: RenderModel_v1;       // Direct model (bypasses fetch)
  onError?: (error: Error) => void;
  refetchInterval?: number;      // Auto-refetch in ms
}
```

**Returns:**
```typescript
interface UseAssessmentModelResult {
  model: RenderModel_v1 | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

**Example:**
```tsx
function MyComponent({ sessionId }: { sessionId: string }) {
  const { model, isLoading, error, refetch } = useAssessmentModel({
    sessionId,
    apiEndpoint: '/api/assessments',
    refetchInterval: 5000,  // Poll every 5s
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!model) return <NoData />;

  return <AssessmentDashboard model={model} />;
}
```

### useAssessmentAgent

**Purpose:** Manage real-time chat with assessment agent

**Signature:**
```typescript
function useAssessmentAgent(sessionId: string): UseAssessmentAgentResult;
```

**Returns:**
```typescript
interface UseAssessmentAgentResult {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  status: 'idle' | 'typing' | 'thinking' | 'error';
  progress: number;  // 0-100
  stage: AssessmentStage;
  stageDescription: string;
  archetype: string;
  eqTone: string;
  error: Error | null;
  clearError: () => void;
}
```

**Example:**
```tsx
function ChatInterface({ sessionId }: { sessionId: string }) {
  const {
    messages,
    sendMessage,
    status,
    progress,
    stage,
    error,
  } = useAssessmentAgent(sessionId);

  return (
    <div>
      <ProgressBar value={progress} />
      <StageIndicator stage={stage} />
      <MessageList messages={messages} />
      <InputArea 
        onSend={sendMessage} 
        disabled={status === 'thinking'} 
      />
      {error && <ErrorBanner error={error} />}
    </div>
  );
}
```

### useAssessmentProgress

**Purpose:** Track assessment progress state

**Signature:**
```typescript
function useAssessmentProgress(sessionId: string): UseAssessmentProgressResult;
```

**Returns:**
```typescript
interface UseAssessmentProgressResult {
  stage: AssessmentStage;
  progress: number;  // 0-100
  isComplete: boolean;
  estimatedTimeRemaining: number | null;  // minutes
}
```

---

## Styling Guide

### CSS Architecture

**Approach:** CSS Modules + Inline Styles

**Rationale:**
- Component isolation
- No global style conflicts
- Theme props for customization
- SSR-compatible
- No CSS-in-JS runtime

### File Structure

```
packages/ui-assessment/styles/
├── tokens.ts          # Design tokens (colors, spacing, etc.)
├── defaults.ts        # Default theme
├── theme.ts           # Theme utilities
└── globals.css        # Global resets (optional)

apps/student-app/styles/
└── chat.css           # Chat-specific styles
```

### Style Patterns

**1. Theme-Driven Inline Styles**
```tsx
<div style={{
  backgroundColor: theme.colors.surface,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.md,
  fontFamily: theme.typography.fontFamily,
}}>
  Content
</div>
```

**2. CSS Modules for Layout**
```css
/* component.module.css */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-md);
}
```

```tsx
import styles from './component.module.css';

<div className={styles.container}>
  {/* Content */}
</div>
```

**3. Utility Classes**
```tsx
<div className="assessment-dashboard">
  <div className="assessment-section">
    {/* Content */}
  </div>
</div>
```

### Responsive Design

**Breakpoints:**
```css
/* Mobile first */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1280px;
    margin: 0 auto;
  }
}
```

---

## Accessibility

### WCAG AA Compliance

**Color Contrast:**
- Text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Interactive elements: 3:1 minimum

**Keyboard Navigation:**
- All interactive elements focusable
- Visual focus indicators
- Logical tab order
- Escape to dismiss modals

**Screen Readers:**
- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Live regions for updates

**Example:**
```tsx
<button
  onClick={handleClick}
  aria-label="Send message"
  aria-disabled={isDisabled}
>
  Send
</button>

<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

---

## Performance

### Optimization Strategies

1. **Code Splitting**
   ```tsx
   const AssessmentDashboard = lazy(() => import('./AssessmentDashboard'));
   ```

2. **Memoization**
   ```tsx
   const ScoreCard = memo(({ dimension, theme }: ScoreCardProps) => {
     // Component logic
   });
   ```

3. **Virtual Scrolling** (for large lists)
   ```tsx
   <VirtualList
     items={narratives}
     itemHeight={120}
     renderItem={(item) => <NarrativeBlock {...item} />}
   />
   ```

4. **Lazy Loading Images**
   ```tsx
   <img 
     src={imageUrl} 
     loading="lazy" 
     alt={altText} 
   />
   ```

### Bundle Size

**Target Metrics:**
- Main bundle: <100KB gzipped
- Component library: <50KB gzipped
- Initial load: <300ms (3G)
- Time to Interactive: <3s (3G)

---

## Testing

### Component Tests

**Framework:** React Testing Library + Jest

**Example:**
```tsx
import { render, screen } from '@testing-library/react';
import { AssessmentDashboard } from './AssessmentDashboard';
import { mockRenderModel } from '../__mocks__/renderModel';

describe('AssessmentDashboard', () => {
  it('renders student name from model', () => {
    render(<AssessmentDashboard model={mockRenderModel} />);
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
  });

  it('displays all score cards', () => {
    render(<AssessmentDashboard model={mockRenderModel} />);
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('handles loading state', () => {
    render(<AssessmentDashboard sessionId="abc" apiEndpoint="/api" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });
});
```

### Integration Tests

**Example:**
```tsx
it('fetches and displays assessment data', async () => {
  mockFetch('/api/assessments/abc123', mockRenderModel);

  render(<AssessmentDashboard sessionId="abc123" apiEndpoint="/api" />);

  await waitFor(() => {
    expect(screen.getByText('Assessment Dashboard')).toBeInTheDocument();
  });
});
```

---

## Deployment

### Production Build

**Next.js App:**
```bash
cd apps/student-app
npm run build
npm start
```

**Component Library:**
```bash
cd packages/ui-assessment
npm run build  # Builds to dist/
```

### Environment Variables

**Required:**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.ivylevel.com
NEXT_PUBLIC_WS_URL=wss://api.ivylevel.com

# Optional
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### CDN Deployment

**Static Assets:**
- Images: CloudFront
- Fonts: CloudFront
- JS/CSS bundles: CloudFront with versioning

---

## Future Enhancements

### Phase 2 (Planned)

- [ ] Real-time collaboration (multiple coaches viewing)
- [ ] Export to PDF
- [ ] Interactive chart drill-downs
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Print-optimized layouts

### Phase 3 (Exploration)

- [ ] Parent dashboard
- [ ] Student progress tracking over time
- [ ] Gamification elements
- [ ] AI-powered insights summary
- [ ] Video call integration
- [ ] Calendar integration

---

## Support

### Documentation

- [Component Storybook](https://storybook.ivylevel.com) (Coming soon)
- [API Reference](https://docs.ivylevel.com/api)
- [Integration Guide](https://docs.ivylevel.com/integration)

### Contact

- Technical Support: tech@ivylevel.com
- Product Questions: product@ivylevel.com
- GitHub Issues: https://github.com/sirajnazir/ivylevel-multiagent-v4.0/issues

---

## Changelog

### v1.0.0 (2025-11-21)

**Initial Release**
- ✅ AssessmentDashboard component
- ✅ 6 specialized sub-components
- ✅ Student chat interface
- ✅ Full theming system
- ✅ TypeScript definitions
- ✅ Responsive design
- ✅ Accessibility (WCAG AA)
- ✅ SSR support
- ✅ Custom hooks
- ✅ API integration

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-21  
**Maintained By:** IvyLevel Engineering Team  
**Status:** Production-Ready ✅
