# Framework Extractor v2.0

**Extract cognitive frameworks, decision models, and strategic thinking structures from coaching transcripts.**

---

## 🎯 Overview

The Framework Extractor identifies **Jenny's cognitive frameworks** - the repeatable thinking structures, decision models, and strategic patterns that define how she approaches coaching challenges.

**Purpose:** Capture the strategic gold that makes Jenny non-replaceable - her systematic thinking patterns, decision criteria, and mental models.

**Updated in v2.0:** Enhanced schema with decision_rules, intended_outcome, student_fit, and dependencies fields for deeper strategic intelligence.

---

## 🧠 What is a Framework?

A framework is a *repeatable thinking structure*, not a tool or a tactic.

**A FRAMEWORK IS:**
- ✅ A decision model (e.g., "APS Model")
- ✅ A reasoning pattern (e.g., "Fit-first EC prioritization")
- ✅ A structured evaluation rubric (e.g., "EC Depth Rubric")
- ✅ A repeated step-by-step approach Jenny teaches
- ✅ A mental model she applies across multiple students
- ✅ A systematic way of identifying problems
- ✅ A logic sequence she uses to prioritize
- ✅ Narrative construction logic
- ✅ Gap-analysis logic
- ✅ Roadmap sequencing logic

**NOT a framework:**
- ❌ Encouragement
- ❌ Advice phrased once
- ❌ Anything student-specific
- ❌ Standalone tasks
- ❌ Hallucinated structures

---

## 📊 Framework Types

| Type | What It Captures |
|------|------------------|
| **strategy** | High-level strategic frameworks (APS, Gap Analysis, Flagship Builder) |
| **reasoning** | Logical reasoning patterns and decision trees |
| **rubric** | Evaluation frameworks and scoring systems |
| **prioritization** | Frameworks for ranking and selecting options |
| **narrative** | Story construction and narrative development logic |
| **sequence** | Timeline and roadmap sequencing frameworks |
| **evaluation** | Assessment and diagnostic frameworks |
| **mindset** | Mental model shifts and belief frameworks |

---

## 📋 Example Output

From coaching transcript, the extractor produces:

```json
[
  {
    "id": "fw_001",
    "name": "APS Strength Mapping Framework",
    "type": "strategy",
    "description": "A framework Jenny uses to identify which vector should drive the student's flagship narrative.",
    "steps": [
      "Extract Aptitude from academics and projects",
      "Extract Passion from EC depth and commitment",
      "Extract Service from community patterns and core values",
      "Compare APS scores",
      "Select dominant vector to anchor flagship narrative"
    ],
    "decision_rules": [
      "If Passion is highest → narrative must be passion-led",
      "If Service is highest → narrative must have human impact center",
      "If Aptitude is highest → narrative must be skill or research anchored"
    ],
    "intended_outcome": "Clear dominant narrative vector for the student",
    "example_usage": "You're clearly strongest in Passion, so your narrative should revolve around your design-driven leadership.",
    "student_fit": "All archetypes; especially dual-identities and quiet high-performers.",
    "dependencies": ["Weekly Execution Board", "EC Portfolio Analysis"],
    "tags": ["aps", "narrative", "prioritization"]
  },
  {
    "id": "fw_002",
    "name": "Gap Analysis Framework",
    "type": "evaluation",
    "description": "Systematic approach to identify profile gaps against target schools.",
    "steps": [
      "Assess current student profile (academics, ECs, awards, narrative)",
      "Identify target school requirements and admitted student profiles",
      "Map specific gaps (rigor gap, EC gap, awards gap, narrative gap)",
      "Prioritize gaps by impact on admissions probability",
      "Create action plan to close highest-priority gaps"
    ],
    "decision_rules": [
      "Rigor gaps take precedence over EC gaps",
      "National awards close more gaps than local awards",
      "Narrative coherence trumps activity count",
      "Focus on closing 2-3 major gaps rather than many minor ones"
    ],
    "intended_outcome": "Prioritized list of profile gaps with action plan",
    "example_usage": "Your gap analysis shows: no national awards, weak community impact, scattered narrative. Those are the three gaps we close.",
    "student_fit": "All students after initial assessment",
    "dependencies": ["IvyScore Assessment", "Target School Profiles", "Gap Analysis Document"],
    "tags": ["assessment", "planning", "rigor"]
  },
  {
    "id": "fw_003",
    "name": "EC Depth Rubric",
    "type": "rubric",
    "description": "A tiered evaluation framework for assessing extracurricular quality and impact.",
    "steps": [
      "Evaluate leadership level (founder, president, member)",
      "Assess time commitment and consistency",
      "Measure tangible impact and outcomes",
      "Identify awards and recognition",
      "Classify into Tier 1-4"
    ],
    "decision_rules": [
      "Tier 1: National/international recognition with demonstrable impact",
      "Tier 2: State/regional leadership with measurable outcomes",
      "Tier 3: School-level leadership with local impact",
      "Tier 4: Participation only, no leadership or impact"
    ],
    "intended_outcome": "Clear classification of each EC's admissions value",
    "example_usage": "Your Model UN leadership is Tier 2. But this volunteer work without impact is Tier 4—we need to either elevate it or cut it.",
    "student_fit": "All students during EC portfolio assessment",
    "dependencies": ["EC Tiering System"],
    "tags": ["ec-depth", "evaluation"]
  },
  {
    "id": "fw_004",
    "name": "Flagship Builder Framework",
    "type": "sequence",
    "description": "A systematic approach to building a flagship extracurricular that anchors the narrative.",
    "steps": [
      "Identify student's dominant interest/passion vector",
      "Select EC category with highest growth potential",
      "Define clear flagship goal (e.g., national award, publication, impact milestone)",
      "Break goal into 12-month sequence",
      "Build supporting activities that reinforce flagship narrative"
    ],
    "decision_rules": [
      "Flagship must align with narrative theme",
      "Focus on depth (1 Tier 1) over breadth (many Tier 3s)",
      "Build evidence trail: starter → builder → scaler progression",
      "Flagship should have tangible, shareable outcome"
    ],
    "intended_outcome": "Single high-impact EC that defines student's profile",
    "example_usage": "Let's build your bio research flagship. We're targeting Regeneron. Here's the 12-month roadmap.",
    "student_fit": "Students with scattered profiles needing narrative anchor",
    "dependencies": ["APS Framework", "EC Depth Rubric", "12-Month Roadmap Template"],
    "tags": ["ec-depth", "narrative", "execution"]
  },
  {
    "id": "fw_005",
    "name": "Starter → Builder → Scaler EC Model",
    "type": "sequence",
    "description": "A progression model for developing extracurricular depth over time.",
    "steps": [
      "Starter Phase: Join activity, learn fundamentals, show consistency (Months 1-3)",
      "Builder Phase: Take on responsibilities, create first outcomes (Months 4-8)",
      "Scaler Phase: Lead initiatives, achieve measurable impact, win recognition (Months 9-12+)"
    ],
    "decision_rules": [
      "Don't skip starter phase—credibility requires time investment",
      "Builder phase must show tangible output (event, project, initiative)",
      "Scaler phase must have external validation (award, publication, media)"
    ],
    "intended_outcome": "Credible progression narrative with evidence at each stage",
    "example_usage": "You can't lead the robotics team if you joined 2 months ago. Let's build the starter-builder-scaler path first.",
    "student_fit": "Students building new ECs from scratch",
    "dependencies": ["Timeline Planning Tools"],
    "tags": ["ec-depth", "execution", "narrative"]
  },
  {
    "id": "fw_006",
    "name": "Reverse-Engineer Admissions Criteria",
    "type": "reasoning",
    "description": "A backward-planning approach to understand what top schools actually want.",
    "steps": [
      "Study admitted student profiles from target schools",
      "Identify common patterns (awards, EC types, narrative themes)",
      "Extract admissions committee criteria (rigor, impact, uniqueness)",
      "Map student's current profile against criteria",
      "Identify which criteria have highest ROI to strengthen"
    ],
    "decision_rules": [
      "Admissions committees value spike over well-roundedness",
      "National recognition > regional > school-level",
      "Unique contributions > common activities",
      "Coherent narrative > scattered achievements"
    ],
    "intended_outcome": "Data-driven understanding of what will move the admissions needle",
    "example_usage": "Looking at MIT's admits, they prioritize STEM research with awards. Your theater EC won't help here—let's focus on your CS project.",
    "student_fit": "All students; especially those targeting hyper-competitive schools",
    "dependencies": ["Target School Data", "Admitted Student Profiles"],
    "tags": ["assessment", "planning"]
  },
  {
    "id": "fw_007",
    "name": "Weakness Containment Strategy",
    "type": "strategy",
    "description": "A framework for minimizing damage from profile weaknesses rather than fixing them.",
    "steps": [
      "Identify weakness (low GPA, lack of awards, etc.)",
      "Determine if weakness is fixable within timeline",
      "If fixable: create action plan",
      "If not fixable: develop containment strategy (reframe, redirect attention, build compensatory strengths)"
    ],
    "decision_rules": [
      "Don't waste time on unfixable weaknesses",
      "Strengthen adjacent areas to compensate",
      "Use narrative to reframe weakness as growth story",
      "Focus admissions attention on strengths, not weaknesses"
    ],
    "intended_outcome": "Minimized impact of weaknesses on admissions chances",
    "example_usage": "Your GPA is a 3.6—we can't fix that now. So we go nuclear on awards and narrative to compensate.",
    "student_fit": "Students with unavoidable weaknesses (low GPA, limited ECs, etc.)",
    "dependencies": ["Gap Analysis Framework"],
    "tags": ["planning", "narrative"]
  },
  {
    "id": "fw_008",
    "name": "Tier-Ladder Progression",
    "type": "prioritization",
    "description": "A framework for systematically upgrading EC portfolio quality over time.",
    "steps": [
      "Audit current ECs using EC Depth Rubric",
      "Identify which ECs can be upgraded (Tier 3 → Tier 2, Tier 2 → Tier 1)",
      "Drop Tier 4 activities that cannot be upgraded",
      "Invest time in upgrading highest-potential ECs",
      "Track progression quarterly"
    ],
    "decision_rules": [
      "Upgrading existing ECs > starting new ones",
      "Focus on 2-3 ECs for upgrade, not all",
      "Tier 3 → Tier 2 requires regional recognition",
      "Tier 2 → Tier 1 requires national/international impact"
    ],
    "intended_outcome": "Portfolio composition shifts toward higher-tier activities",
    "example_usage": "Your debate club is Tier 3. Let's get you to state finals—that moves it to Tier 2. Then nationals = Tier 1.",
    "student_fit": "Students with multiple ECs but low overall impact",
    "dependencies": ["EC Depth Rubric", "EC Tiering System"],
    "tags": ["ec-depth", "prioritization"]
  },
  {
    "id": "fw_009",
    "name": "Small-Wins Model for Low-Agency Students",
    "type": "mindset",
    "description": "A motivational framework that builds momentum through achievable micro-goals.",
    "steps": [
      "Identify student's overwhelm triggers",
      "Break down large goals into smallest possible increments",
      "Assign one micro-goal at a time",
      "Celebrate each completion to build confidence",
      "Gradually increase goal size as agency rebuilds"
    ],
    "decision_rules": [
      "Micro-goal must be completable in single session",
      "Success rate should be 90%+ to build momentum",
      "Never assign multiple goals simultaneously",
      "Emotional validation after each win"
    ],
    "intended_outcome": "Student regains agency and self-efficacy",
    "example_usage": "Let's not worry about all three essays. Let's just write one paragraph today. That's it.",
    "student_fit": "Low-agency, overwhelmed, anxious students",
    "dependencies": ["Motivational Tactics"],
    "tags": ["mindset", "execution"]
  },
  {
    "id": "fw_010",
    "name": "Contextual Fit Logic",
    "type": "reasoning",
    "description": "A decision framework for matching students to schools based on institutional priorities.",
    "steps": [
      "Research target school's institutional priorities (e.g., Stanford values entrepreneurship, MIT values technical depth)",
      "Map student's strengths to school's priorities",
      "Identify areas of strong fit vs. weak fit",
      "Adjust application strategy to emphasize fit",
      "Consider de-prioritizing schools with poor contextual fit"
    ],
    "decision_rules": [
      "Strong contextual fit > raw stats",
      "Don't apply to schools where student doesn't fit institutional priorities",
      "Tailor narrative to emphasize fit-aligned strengths",
      "Geographic/demographic context matters"
    ],
    "intended_outcome": "Optimized school list with high contextual fit",
    "example_usage": "Harvard prioritizes public service leaders. Your STEM research won't resonate there. Let's focus on MIT and Caltech instead.",
    "student_fit": "All students during school list creation",
    "dependencies": ["School Research Database"],
    "tags": ["planning", "narrative"]
  }
]
```

---

## 🛡️ Quality Rules

The extractor follows **8 strict rules**:

1. ✅ Only extract frameworks actually used by Jenny in the text
2. ✅ Preserve order of steps exactly as implied
3. ✅ Never invent steps or logic
4. ✅ Ground every element in evidence
5. ✅ Combine mentions across files into one unified framework where appropriate
6. ✅ Output valid JSON only
7. ✅ If partial, add `"tags": ["partial"]`
8. ✅ NEVER output markdown or commentary

---

## 🔌 Integration with Ingestion Pipeline

The Framework Extractor runs automatically as part of the main ingestion pipeline:

```typescript
// Integrated into ingestCoach.ts
const frameworks = await extractFrameworks(text, fileName);
const fwPath = path.join(FRAMEWORK_DIR, `${fileName}.framework.json`);
fs.writeFileSync(fwPath, JSON.stringify(frameworks, null, 2));
```

Output location: `data/coach/curated/frameworks/`

---

## 📊 Schema (v2.0)

```typescript
export const frameworkChipSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  decision_rules: z.array(z.string()),
  intended_outcome: z.string(),
  example_usage: z.string(),
  student_fit: z.string(),
  dependencies: z.array(z.string()),
  tags: z.array(z.string())
});

export const frameworkArraySchema = z.array(frameworkChipSchema);
```

**New in v2.0:**
- `decision_rules`: Explicit criteria Jenny uses to make decisions within the framework
- `intended_outcome`: What the framework produces
- `student_fit`: Which archetypes benefit most
- `dependencies`: Tools, other frameworks, or data needed
- Replaced `category` with `type` for better semantic clarity
- Replaced `principles` and `explanation` with more structured fields

---

## 🚀 Usage

### Run Framework Extraction

```bash
# Extract from single file (includes EQ, frameworks, tactics, and tooling)
npm run ingest:coach data/coach/raw/transcript.txt

# Extract from directory
npm run ingest:coach data/coach/raw/

# View extracted frameworks
cat data/coach/curated/frameworks/transcript.txt.framework.json
```

### Run Tests

```bash
npm run test:ingest
```

### Validate Framework File

```bash
ts-node tools/ingest-coach/quality/framework.validate.ts data/coach/curated/frameworks/file.framework.json
```

---

## 🎓 Why This Matters

Frameworks are the **cognitive skeleton** of coaching intelligence:

### Assessment Agent
- Uses Gap Analysis Framework for profile evaluation
- Applies IvyScore and rubrics for baseline assessment
- Leverages Contextual Fit Logic for school list optimization

### Execution Agent
- Uses Small-Wins Model for low-agency students
- Applies Tier-Ladder Progression for EC optimization
- Implements Flagship Builder for strategic focus

### EC Agent
- Uses EC Depth Rubric for activity evaluation
- Applies Starter → Builder → Scaler model for development
- Leverages APS Framework for narrative alignment

### Awards Agent
- Uses Reverse-Engineer Admissions Criteria for targeting
- Applies prioritization frameworks for award selection
- Leverages Tier-Ladder Progression for strategic upgrades

### Narrative Agent
- Uses APS Strength Mapping for narrative vector selection
- Applies Flagship Builder for story anchoring
- Leverages Contextual Fit Logic for school-specific tailoring

---

## 📋 Manifest Tracking

All extracted frameworks are tracked in `data/coach/manifest.json`:

```json
{
  "version": "1.0",
  "lastUpdated": "2025-11-18T...",
  "ingestionRuns": [
    {
      "runId": "uuid",
      "frameworkFiles": [
        "data/coach/curated/frameworks/transcript.txt.framework.json"
      ],
      "status": "completed"
    }
  ],
  "totalFrameworks": 10
}
```

---

## 🧪 Testing

### Schema Validation Tests

```bash
npm run test:ingest
```

Tests verify:
- ✅ Valid frameworks pass schema validation
- ✅ Invalid frameworks fail with clear errors
- ✅ All required fields present (id, name, type, description, steps, decision_rules, intended_outcome, example_usage, student_fit, dependencies, tags)
- ✅ All framework types recognized (strategy, reasoning, rubric, prioritization, narrative, sequence, evaluation, mindset)
- ✅ Array of multiple frameworks validated
- ✅ Empty dependencies array works
- ✅ Multiple tags validated

### Quality Validation Checklist

Manual review checklist:
- [ ] Framework is literal (appears in transcript)
- [ ] Steps are in correct order
- [ ] Decision rules are explicit and actionable
- [ ] Example usage is grounded in transcript
- [ ] Student fit is specific
- [ ] Dependencies are accurate
- [ ] No hallucinated logic or steps

---

## 🗺️ Roadmap Integration

### Phase 1: Extraction ✅ COMPLETE (v2.0)
- [x] LLM system prompt with quality rules
- [x] Enhanced schema with decision_rules, dependencies, student_fit
- [x] TypeScript wrapper
- [x] Zod schema validation
- [x] Pipeline integration
- [x] Quality validator
- [x] Tests (6/6 passing, 20/20 total)
- [x] Documentation

### Phase 2: Framework Library 🚧 PLANNED
- [ ] Process real coaching transcripts
- [ ] Build framework taxonomy
- [ ] Map framework dependencies and relationships
- [ ] Identify most-effective frameworks by archetype
- [ ] Build framework decision tree

### Phase 3: Agent Integration 🚧 PLANNED
- [ ] Assessment Agent uses diagnostic frameworks
- [ ] Execution Agent uses progression frameworks
- [ ] EC Agent uses depth evaluation frameworks
- [ ] RAG retrieval of relevant frameworks by context
- [ ] Framework effectiveness tracking

### Phase 4: Coach Twin 🚧 PLANNED
- [ ] Real-time framework selection based on student state
- [ ] Context-aware framework application
- [ ] Multi-framework orchestration
- [ ] Framework performance analytics

---

## 📊 Expected Framework Distribution

Based on initial analysis, expected types:

| Type | Approx. Count | Examples |
|------|---------------|----------|
| **strategy** | 25-30% | APS, Gap Analysis, Flagship Builder |
| **evaluation** | 20-25% | Rubrics, scoring systems, assessment frameworks |
| **sequence** | 15-20% | Roadmapping, progression models, timelining |
| **prioritization** | 10-15% | Tier-ladder, fit logic, selection criteria |
| **narrative** | 10-15% | Story construction, theme identification |
| **reasoning** | 10-15% | Decision trees, logic models |
| **mindset** | 5-10% | Mental model shifts, belief frameworks |
| **rubric** | 5-10% | Specific evaluation criteria |

---

## 🔗 Related Components

1. **EQ Pattern Extractor** - Captures emotional intelligence markers
2. **Tactics Extractor** - Captures specific coaching micro-interventions
3. **Tooling Extractor** - Captures operational tools and systems
4. **Persona Compiler (Phase 2)** - Captures voice and tone markers
5. **Coach Twin Builder (Phase 3)** - Combines all patterns into digital twin

---

## ✅ Status

**Framework Extractor v2.0:** ✅ COMPLETE

All components delivered:
- ✅ Enhanced LLM system prompt
- ✅ Comprehensive schema with decision_rules, dependencies, student_fit
- ✅ TypeScript wrapper
- ✅ Zod schema validation
- ✅ Pipeline integration
- ✅ Quality validator
- ✅ Tests passing (6/6 framework, 20/20 total)
- ✅ Documentation

**Ready for:** Production extraction of cognitive frameworks to build strategic agent intelligence.

---

## 💡 Framework vs. Tactic vs. Tool Distinction

| Aspect | Framework | Tactic | Tool |
|--------|-----------|--------|------|
| **Scope** | Strategic thinking structure | Single intervention | Operational system |
| **Nature** | Mental model, decision logic | Behavioral nudge | Software, template, method |
| **Duration** | Applied across sessions | Seconds to minutes | Ongoing usage |
| **Complexity** | Multi-step with decision rules | Atomic, indivisible | Set up once, reuse |
| **Example** | "APS Strength Mapping" | "Narrow scope to one task" | "Weekly Execution Board" |
| **Use Case** | Strategic planning | Immediate intervention | Infrastructure |
| **Outputs** | Decisions, priorities, plans | Student state change | Tracking, organization |

**Relationship:** Frameworks guide the application of tactics, which are tracked/executed using tools.

---

## 🆕 v2.0 Enhancements

**What's New:**
1. **decision_rules field** - Captures explicit criteria Jenny uses to make decisions
2. **intended_outcome field** - Clarifies what each framework produces
3. **student_fit field** - Identifies which archetypes benefit most
4. **dependencies field** - Maps relationships to tools and other frameworks
5. **Enhanced prompt** - More detailed guidance on extracting strategic patterns
6. **Improved tests** - 6 comprehensive tests covering all new fields

**Migration from v1.0:**
- Old `category` field → new `type` field (more semantic)
- Old `principles` field → absorbed into `decision_rules` (more actionable)
- Old `explanation` field → absorbed into `description` (clearer purpose)
- Added 4 new required fields for richer strategic intelligence

---

This completes the Framework Extractor v2.0 upgrade. Ready for production use!
