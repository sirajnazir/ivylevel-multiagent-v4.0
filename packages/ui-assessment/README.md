# Component 48 - Assessment Agent Dashboard UI

**Fully isolated, backend-agnostic React UI module for displaying assessment results.**

## Overview

This package provides a complete UI system for rendering assessment data produced by the assessment agent. It is:

- **100% Backend-Agnostic**: No business logic, no LLM calls, no database access
- **Data-Driven**: Entirely powered by `RenderModel_v1`
- **Themeable**: Full theming system with light/dark variants
- **Modular**: Use the full dashboard or individual components
- **Framework-Ready**: Works with Next.js, React, React Native, or embedded widgets

## Installation

```bash
# Install the package
npm install @ivylevel/ui-assessment

# Peer dependencies (if not already installed)
npm install react react-dom
```

## Quick Start

### Option 1: Provide Model Directly

```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';
import type { RenderModel_v1 } from '@ivylevel/ui-assessment';

const myModel: RenderModel_v1 = {
  sessionId: 'abc123',
  stage: 'diagnostic',
  narrative: [...],
  strategy: [...],
  scores: {...},
  // ... other fields
};

function App() {
  return <AssessmentDashboard model={myModel} />;
}
```

### Option 2: Fetch from API

```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';

function App() {
  return (
    <AssessmentDashboard
      sessionId="abc123"
      apiEndpoint="https://api.example.com/assessments"
      onLoading={(isLoading) => console.log('Loading:', isLoading)}
      onError={(error) => console.error('Error:', error)}
    />
  );
}
```

## Components

### AssessmentDashboard

Main dashboard component that orchestrates all sub-components.

**Props:**
- `model?: RenderModel_v1` - Assessment data to display
- `sessionId?: string` - Session ID to fetch from API
- `apiEndpoint?: string` - API endpoint (returns `RenderModel_v1` at `GET {endpoint}/{sessionId}`)
- `theme?: Partial<AssessmentTheme>` - Custom theme
- `onLoading?: (isLoading: boolean) => void` - Loading state callback
- `onError?: (error: Error) => void` - Error callback
- `className?: string` - Custom class name
- `style?: React.CSSProperties` - Custom styles

### ScoreCard

Displays a single dimension score with trend indicator.

```tsx
import { ScoreCard } from '@ivylevel/ui-assessment';

<ScoreCard
  dimension={{
    score: 85,
    label: 'Overall Assessment',
    description: 'Comprehensive evaluation',
    trend: 'improving',
    insights: ['Strong academic foundation', 'Growing leadership presence']
  }}
/>
```

### NarrativeSection

Displays Jenny's narrative insights.

```tsx
import { NarrativeSection } from '@ivylevel/ui-assessment';

<NarrativeSection
  narratives={[
    {
      id: '1',
      type: 'insight',
      text: "You have a strong passion for environmental science...",
      eqChips: ['passion_signals', 'intellectual_curiosity'],
      confidence: 0.92
    }
  ]}
/>
```

### StrategyTimeline

Displays strategic recommendations grouped by timeline.

```tsx
import { StrategyTimeline } from '@ivylevel/ui-assessment';

<StrategyTimeline
  strategies={[
    {
      id: '1',
      title: 'Start Research Project',
      description: 'Begin independent research in marine biology',
      priority: 'high',
      timeline: 'immediate',
      category: 'academics',
      actionSteps: ['Find mentor', 'Define research question', 'Set up lab access']
    }
  ]}
/>
```

### SummerPlans

Displays recommended summer opportunities.

```tsx
import { SummerPlans } from '@ivylevel/ui-assessment';

<SummerPlans
  plans={[
    {
      id: '1',
      title: 'Stanford Summer Research Program',
      description: 'Competitive 6-week research program',
      type: 'research',
      duration: '6 weeks',
      competitiveness: 'highly-selective',
      benefits: ['Research experience', 'Stanford mentorship', 'College credit'],
      url: 'https://...'
    }
  ]}
/>
```

### AwardsTargets

Displays recommended awards to pursue.

```tsx
import { AwardsTargets } from '@ivylevel/ui-assessment';

<AwardsTargets
  awards={[
    {
      id: '1',
      name: 'National Merit Scholarship',
      description: 'Prestigious academic scholarship',
      category: 'academic',
      competitiveness: 'selective',
      requirements: ['PSAT score', 'High GPA', 'Strong essay'],
      whyRecommended: 'Your test scores align perfectly with this award'
    }
  ]}
/>
```

### AcademicsSummary

Displays comprehensive academic profile.

```tsx
import { AcademicsSummary } from '@ivylevel/ui-assessment';

<AcademicsSummary
  academics={{
    gpa: '3.95',
    gpaWeighted: '4.45',
    testScores: { sat: 1520, ap: { 'Calculus BC': 5, 'Chemistry': 5 } },
    courseRigor: 'most-rigorous',
    academicInterests: ['Computer Science', 'Mathematics', 'Physics'],
    strengths: ['Strong analytical skills', 'Advanced coursework'],
    areasForGrowth: ['Strengthen writing portfolio']
  }}
/>
```

## Theming

### Using Default Theme

```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';

// Uses light theme by default
<AssessmentDashboard model={model} />
```

### Using Dark Theme

```tsx
import { AssessmentDashboard, darkTheme } from '@ivylevel/ui-assessment';

<AssessmentDashboard model={model} theme={darkTheme} />
```

### Custom Theme

```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';

<AssessmentDashboard
  model={model}
  theme={{
    colors: {
      primary: '#6366f1',
      secondary: '#ec4899',
      background: '#ffffff',
      text: '#1f2937'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }}
/>
```

### Full Theme Object

```tsx
import type { AssessmentTheme } from '@ivylevel/ui-assessment';

const myTheme: AssessmentTheme = {
  colors: {
    primary: '#0284c7',
    secondary: '#d946ef',
    background: '#ffffff',
    surface: '#fafafa',
    text: '#171717',
    textSecondary: '#525252',
    border: '#e5e5e5',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    headingFontFamily: 'Georgia, serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};
```

## Hooks

### useAssessmentModel

Hook for fetching and managing assessment data.

```tsx
import { useAssessmentModel } from '@ivylevel/ui-assessment';

function MyComponent() {
  const { model, isLoading, error, refetch } = useAssessmentModel({
    sessionId: 'abc123',
    apiEndpoint: 'https://api.example.com/assessments',
    refetchInterval: 30000, // Auto-refetch every 30 seconds
    onError: (error) => console.error(error)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{model?.sessionId}</div>;
}
```

## RenderModel_v1 Specification

The complete data model expected by the dashboard:

```typescript
interface RenderModel_v1 {
  sessionId: string;
  stage: 'rapport' | 'current_state' | 'diagnostic' | 'preview' | 'completed';
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

See `types.ts` for complete type definitions.

## Integration Examples

### Next.js Integration

```tsx
// pages/assessment/[sessionId].tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';
import { useRouter } from 'next/router';

export default function AssessmentPage() {
  const router = useRouter();
  const { sessionId } = router.query;

  return (
    <AssessmentDashboard
      sessionId={sessionId as string}
      apiEndpoint="/api/assessments"
    />
  );
}
```

### React Native Integration

```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';
import { ScrollView } from 'react-native';

export default function AssessmentScreen({ route }) {
  const { sessionId } = route.params;

  return (
    <ScrollView>
      <AssessmentDashboard
        sessionId={sessionId}
        apiEndpoint="https://api.example.com/assessments"
      />
    </ScrollView>
  );
}
```

### Embedded Widget

```tsx
import { AssessmentDashboard } from '@ivylevel/ui-assessment';

// Embedded in existing app
function ParentApp() {
  return (
    <div>
      <header>My App Header</header>

      <AssessmentDashboard
        sessionId="abc123"
        apiEndpoint="https://api.example.com/assessments"
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      />

      <footer>My App Footer</footer>
    </div>
  );
}
```

## API Requirements

Your API endpoint should return `RenderModel_v1` at:

```
GET {apiEndpoint}/{sessionId}
```

**Example Response:**

```json
{
  "sessionId": "abc123",
  "stage": "diagnostic",
  "narrative": [
    {
      "id": "n1",
      "type": "insight",
      "text": "You demonstrate strong analytical thinking...",
      "eqChips": ["analytical_mind", "problem_solver"],
      "confidence": 0.89
    }
  ],
  "strategy": [
    {
      "id": "s1",
      "title": "Strengthen Leadership Profile",
      "description": "Take on executive role in existing club",
      "priority": "high",
      "timeline": "immediate",
      "category": "extracurriculars",
      "actionSteps": ["Run for club president", "Lead new initiative"]
    }
  ],
  "scores": {
    "overall": {
      "score": 82,
      "label": "Overall Assessment",
      "trend": "improving"
    },
    "academics": { "score": 88, "label": "Academic Profile" },
    "extracurriculars": { "score": 75, "label": "Extracurriculars" },
    "personalGrowth": { "score": 80, "label": "Personal Growth" },
    "collegeReadiness": { "score": 78, "label": "College Readiness" }
  },
  "metadata": {
    "studentName": "Alex Chen",
    "coachName": "Jenny",
    "sessionDate": "2025-01-15T10:30:00Z",
    "version": "v4.0"
  }
}
```

## Architecture

```
packages/ui-assessment/
├── index.ts              # Public API exports
├── types.ts              # TypeScript type definitions
├── hooks/
│   └── useAssessmentModel.ts    # Data fetching hook
├── components/
│   ├── AssessmentDashboard.tsx  # Main orchestrator
│   ├── ScoreCard.tsx
│   ├── NarrativeSection.tsx
│   ├── StrategyTimeline.tsx
│   ├── SummerPlans.tsx
│   ├── AwardsTargets.tsx
│   ├── AcademicsSummary.tsx
│   └── LoadingState.tsx
├── styles/
│   ├── theme.ts          # Theme exports
│   ├── defaults.ts       # Default & dark themes
│   └── tokens.ts         # Design tokens
└── README.md
```

## Design Principles

1. **Backend Agnostic**: No coupling to specific backend implementation
2. **Data-Driven**: Entirely powered by `RenderModel_v1`
3. **No Business Logic**: Pure presentation layer
4. **Composable**: Use full dashboard or individual components
5. **Themeable**: Full control over appearance
6. **Accessible**: Semantic HTML, proper ARIA labels
7. **Responsive**: Works on mobile, tablet, desktop

## Benefits

- **Pluggable**: Drop into any frontend (v3, v4, mobile, widget)
- **Maintainable**: Single source of truth for UI
- **Testable**: Pure components, easy to test
- **Flexible**: Theme and customize to match any brand
- **Future-Proof**: Backend can evolve independently

## Related Components

- **Component 47**: Assessment Session Tracker (telemetry/quality monitoring)
- **Component 46**: Assessment FSM (state machine)
- **Component 45**: EQ Modulation Engine (tone adjustments)

## License

MIT
