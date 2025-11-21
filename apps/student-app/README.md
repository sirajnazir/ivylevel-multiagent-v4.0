# IvyLevel Student Assessment App

Next.js-based frontend for the IvyLevel Assessment Platform v4.0.

## Quick Start

```bash
npm install
npm run dev
```

App runs on **http://localhost:3000**

## Pages

### Assessment Chat (`/assessment`)

Interactive chat interface for conducting student assessments.

**Features:**
- Auto-starts assessment session on page load
- Real-time message exchange with assessment agent
- Student/agent message bubbles with distinct styling
- Loading states and error handling
- "Finish" button to complete assessment and view summary

### Assessment Summary (`/assessment/[sessionId]`)

Comprehensive summary view of completed assessment.

**Sections:**
- **APS Scores:** Aptitude, Passion, Service, Composite
- **Academics:** GPA, rigor level, planned APs, test scores
- **Narrative:** Flagship narrative, positioning, themes, risks, opportunities
- **Strategy:** 12-month plan, summer planning, awards targets

**Features:**
- Responsive grid layouts
- Color-coded sections
- Last updated timestamp

## Environment Variables

Create a `.env.local` file in the app root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Architecture

- **Framework:** Next.js 14 with App Router
- **Styling:** Inline React styles (TailwindCSS can be added in Phase 2)
- **State Management:** React useState hooks
- **API Communication:** Fetch API

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Integration

The app connects to the IvyLevel Assessment API:

- `POST /assessment/start` - Initialize session
- `POST /assessment/message` - Send/receive messages
- `POST /assessment/complete` - Complete assessment
- `GET /assessment/:sessionId` - Retrieve session data

## Styling

Current implementation uses inline styles for simplicity. For Phase 2:
- Add TailwindCSS for utility-first styling
- Create reusable component library
- Add animations and transitions
- Implement responsive design breakpoints

## Future Enhancements

### Phase 2
- [ ] Replace inline styles with TailwindCSS
- [ ] Add authentication (login/signup)
- [ ] Add progress indicators
- [ ] Add assessment history view
- [ ] Add PDF export button
- [ ] Add social sharing
- [ ] Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Add error boundary components
- [ ] Add loading skeletons

### Phase 3
- [ ] Real-time chat with WebSocket
- [ ] Typing indicators
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)

## Project Structure

```
apps/student-app/
├── app/
│   ├── layout.tsx              # Root layout
│   └── assessment/
│       ├── page.tsx            # Chat interface
│       └── [sessionId]/
│           └── page.tsx        # Summary view
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md                   # This file
```

## Testing

```bash
# Run tests (when added)
npm test

# Run E2E tests (when added)
npm run test:e2e
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build
docker build -t ivylevel-student-app .

# Run
docker run -p 3000:3000 ivylevel-student-app
```

## Notes

- Chat agent currently uses stub echo responses (Phase 2: integrate real Claude API)
- Assessment completion calls full orchestrator pipeline
- Summary page fetches data client-side (can be moved to server-side rendering for SEO)
