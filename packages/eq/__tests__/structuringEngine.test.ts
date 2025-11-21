/**
 * Tests for Conversational Structuring Engine v4.0
 *
 * Verifies:
 * - Topic detection
 * - Drift detection
 * - Agenda progression
 * - Section completion
 * - Summary triggers
 * - Checkpoint triggers
 * - Re-rail detection
 */

import {
  StructuringEngine,
  StructuringDirectives,
  buildStructuringHints,
  getStructuringSummary
} from "../structuringEngine";
import { MomentumState } from "../momentumEngine";
import { EQRuntimeState } from "../../agents/assessment-agent/src/eqRuntime";

// Mock helpers
const fakeMomentum = (
  overrides?: Partial<MomentumState>
): MomentumState => ({
  momentumScore: 50,
  trend: "flat" as const,
  spikes: 0,
  dips: 0,
  disengaged: false,
  focusLost: false,
  energyHistory: [50],
  ...overrides
});

const fakeEQ = (overrides?: Partial<EQRuntimeState>): EQRuntimeState => ({
  stage: "rapport-building" as const,
  archetype: "unknown" as const,
  anxietyLevel: "medium" as const,
  confidenceSignal: 0,
  lastDirectives: null,
  messageCountInStage: 0,
  totalMessages: 0,
  sessionStartTime: Date.now(),
  confidenceHistory: [],
  ...overrides
});

describe("StructuringEngine - Topic Detection", () => {
  test("Should detect intro topic from greeting", () => {
    const s = new StructuringEngine();
    const d = s.evaluate("Hi, I need help with college", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("intro");
  });

  test("Should detect academics topic from GPA mention", () => {
    const s = new StructuringEngine();
    // First message to establish baseline
    s.evaluate("Hi there", fakeMomentum(), fakeEQ());
    // Academics topic
    const d = s.evaluate("My GPA is 3.8 and I took AP Calc", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("academics");
  });

  test("Should detect activities topic from extracurriculars", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("My grades are good", fakeMomentum(), fakeEQ());
    const d = s.evaluate("I'm president of the robotics club", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("activities");
  });

  test("Should detect narrative topic from passion/why questions", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("GPA 3.9", fakeMomentum(), fakeEQ());
    s.evaluate("I volunteer at hospital", fakeMomentum(), fakeEQ());
    const d = s.evaluate("What drives me is helping people", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("narrative");
  });

  test("Should detect strategy topic from planning questions", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("GPA 3.9", fakeMomentum(), fakeEQ());
    s.evaluate("Clubs", fakeMomentum(), fakeEQ());
    s.evaluate("I care about science", fakeMomentum(), fakeEQ());
    const d = s.evaluate("What should I do this summer?", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("strategy");
  });

  test("Should detect closing topic from thank you", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("My GPA is 3.9", fakeMomentum(), fakeEQ());
    s.evaluate("I'm in debate club", fakeMomentum(), fakeEQ());
    s.evaluate("I care about education", fakeMomentum(), fakeEQ());
    s.evaluate("What should I do this summer?", fakeMomentum(), fakeEQ());

    // Send completion signals to advance to closing
    s.evaluate("got it", fakeMomentum(), fakeEQ());
    const d = s.evaluate("makes sense", fakeMomentum(), fakeEQ());

    // Should now be in closing step
    expect(d.agendaStep).toBe("closing");
  });
});

describe("StructuringEngine - Drift Detection", () => {
  test("Should NOT detect drift on first topic change", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    const d = s.evaluate("My GPA is 3.8", fakeMomentum(), fakeEQ());
    expect(d.driftDetected).toBe(false);
  });

  test("Should detect drift after 2 consecutive topic changes", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi there", fakeMomentum(), fakeEQ()); // intro
    s.evaluate("My GPA is 3.8", fakeMomentum(), fakeEQ()); // academics
    const d = s.evaluate("I'm president of debate club", fakeMomentum(), fakeEQ()); // activities
    expect(d.driftDetected).toBe(true);
  });

  test("Should reset drift counter when topic stays same", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ());
    s.evaluate("Also took AP Bio", fakeMomentum(), fakeEQ()); // Same topic
    const d = s.evaluate("And honors chemistry", fakeMomentum(), fakeEQ()); // Same topic
    expect(d.driftDetected).toBe(false);
  });

  test("Should detect drift when student jumps between topics", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ()); // intro
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ()); // academics
    s.evaluate("I'm in robotics", fakeMomentum(), fakeEQ()); // activities
    const d = s.evaluate("What's my story theme?", fakeMomentum(), fakeEQ()); // narrative
    expect(d.driftDetected).toBe(true);
  });
});

describe("StructuringEngine - Agenda Progression", () => {
  test("Should start at intro step", () => {
    const s = new StructuringEngine();
    const state = s.getState();
    expect(state.agendaStep).toBe("intro");
    expect(state.agendaIndex).toBe(0);
  });

  test("Should advance from intro to academics when academics topic detected", () => {
    const s = new StructuringEngine();
    expect(s.getState().agendaStep).toBe("intro");
    s.evaluate("My GPA is 3.9", fakeMomentum(), fakeEQ());
    expect(s.getState().agendaStep).toBe("academics");
  });

  test("Should advance from academics to activities when activities topic detected", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA 3.9", fakeMomentum(), fakeEQ()); // Advances to academics
    s.evaluate("I'm president of chess club", fakeMomentum(), fakeEQ());
    expect(s.getState().agendaStep).toBe("activities");
  });

  test("Should advance from activities to narrative when narrative topic detected", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA 3.9", fakeMomentum(), fakeEQ());
    s.evaluate("Chess club president", fakeMomentum(), fakeEQ());
    s.evaluate("I care about education equity", fakeMomentum(), fakeEQ());
    expect(s.getState().agendaStep).toBe("narrative");
  });

  test("Should advance from narrative to strategy when strategy topic detected", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA 3.9", fakeMomentum(), fakeEQ());
    s.evaluate("Chess club", fakeMomentum(), fakeEQ());
    s.evaluate("Passion for education", fakeMomentum(), fakeEQ());
    s.evaluate("What's my 12-month timeline?", fakeMomentum(), fakeEQ());
    expect(s.getState().agendaStep).toBe("strategy");
  });

  test("Should advance from strategy to closing when section complete", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA", fakeMomentum(), fakeEQ());
    s.evaluate("Club", fakeMomentum(), fakeEQ());
    s.evaluate("Passion", fakeMomentum(), fakeEQ());
    s.evaluate("Timeline?", fakeMomentum(), fakeEQ()); // Now in strategy

    // Send completion signals
    for (let i = 0; i < 3; i++) {
      s.evaluate("Got it, makes sense, sounds good", fakeMomentum(), fakeEQ());
    }

    expect(s.getState().agendaStep).toBe("closing");
  });

  test("Should calculate agenda progress correctly", () => {
    const s = new StructuringEngine();

    expect(s.evaluate("Hi", fakeMomentum(), fakeEQ()).agendaProgress).toBe(0); // intro = 0/5 = 0%
    s.evaluate("GPA", fakeMomentum(), fakeEQ()); // academics = 1/5 = 20%
    expect(s.getState().agendaIndex).toBe(1);

    s.evaluate("Club", fakeMomentum(), fakeEQ()); // activities = 2/5 = 40%
    expect(s.getState().agendaIndex).toBe(2);

    s.evaluate("Passion", fakeMomentum(), fakeEQ()); // narrative = 3/5 = 60%
    expect(s.getState().agendaIndex).toBe(3);

    s.evaluate("Timeline?", fakeMomentum(), fakeEQ()); // strategy = 4/5 = 80%
    const d = s.evaluate("ok", fakeMomentum(), fakeEQ());
    expect(d.agendaProgress).toBe(80);
  });

  test("Should reset message count when advancing agenda", () => {
    const s = new StructuringEngine();
    s.evaluate("Hello", fakeMomentum(), fakeEQ());
    s.evaluate("test", fakeMomentum(), fakeEQ());
    s.evaluate("test", fakeMomentum(), fakeEQ());
    expect(s.getState().messagesInCurrentStep).toBe(3);

    s.evaluate("My GPA is 3.8", fakeMomentum(), fakeEQ()); // Advances to academics
    expect(s.getState().messagesInCurrentStep).toBe(1); // Reset
  });
});

describe("StructuringEngine - Section Completion", () => {
  test("Should detect section complete after 2 completion signals", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("Got it, makes sense", fakeMomentum(), fakeEQ());
    const d = s.evaluate("Sounds good, what's next?", fakeMomentum(), fakeEQ());
    expect(d.sectionComplete).toBe(true);
  });

  test("Should detect section complete after 8 messages in current step", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());

    for (let i = 0; i < 7; i++) {
      s.evaluate("test message", fakeMomentum(), fakeEQ());
    }

    const d = s.evaluate("another message", fakeMomentum(), fakeEQ());
    expect(d.sectionComplete).toBe(true);
  });

  test("Should accumulate completion signals across messages", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("okay", fakeMomentum(), fakeEQ()); // 1 signal
    expect(s.getState().sectionCompletionSignals).toBe(1);

    s.evaluate("makes sense", fakeMomentum(), fakeEQ()); // +1 = 2 signals
    expect(s.getState().sectionCompletionSignals).toBe(2);
  });

  test("Should reset section completion signals when advancing agenda", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("got it", fakeMomentum(), fakeEQ());
    s.evaluate("makes sense", fakeMomentum(), fakeEQ());
    expect(s.getState().sectionCompletionSignals).toBe(2);

    s.evaluate("My GPA is 3.8", fakeMomentum(), fakeEQ()); // Advance
    expect(s.getState().sectionCompletionSignals).toBe(0); // Reset
  });
});

describe("StructuringEngine - Summary Triggers", () => {
  test("Should trigger summary when momentum trending down", () => {
    const s = new StructuringEngine();
    const momentum = fakeMomentum({ trend: "down" });
    const d = s.evaluate("test", momentum, fakeEQ());
    expect(d.shouldSummarize).toBe(true);
  });

  test("Should trigger summary when drift detected", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ());
    const d = s.evaluate("I'm in chess club", fakeMomentum(), fakeEQ()); // Drift
    expect(d.shouldSummarize).toBe(true);
  });

  test("Should trigger summary when focus lost", () => {
    const s = new StructuringEngine();
    const momentum = fakeMomentum({ focusLost: true });
    const d = s.evaluate("test", momentum, fakeEQ());
    expect(d.shouldSummarize).toBe(true);
  });

  test("Should trigger summary after 6 messages without completion", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());

    for (let i = 0; i < 5; i++) {
      s.evaluate("test", fakeMomentum(), fakeEQ());
    }

    const d = s.evaluate("test", fakeMomentum(), fakeEQ()); // 6th message
    expect(d.shouldSummarize).toBe(true);
  });

  test("Should NOT trigger summary when momentum stable and on-track", () => {
    const s = new StructuringEngine();
    const momentum = fakeMomentum({ trend: "flat", focusLost: false });
    const d = s.evaluate("My GPA is 3.8", momentum, fakeEQ());
    expect(d.shouldSummarize).toBe(false);
  });
});

describe("StructuringEngine - Checkpoint Triggers", () => {
  test("Should NOT trigger checkpoint in intro stage", () => {
    const s = new StructuringEngine();
    const d = s.evaluate("Hi there", fakeMomentum(), fakeEQ());
    expect(d.shouldCheckpoint).toBe(false);
  });

  test("Should trigger checkpoint at activities step (index 2)", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ()); // academics
    const d = s.evaluate("Chess club president", fakeMomentum(), fakeEQ()); // activities
    expect(d.shouldCheckpoint).toBe(true);
  });

  test("Should trigger checkpoint at strategy step (index 4)", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA", fakeMomentum(), fakeEQ());
    s.evaluate("Club", fakeMomentum(), fakeEQ());
    s.evaluate("Passion", fakeMomentum(), fakeEQ());
    const d = s.evaluate("Timeline?", fakeMomentum(), fakeEQ()); // strategy
    expect(d.shouldCheckpoint).toBe(true);
  });

  test("Should trigger checkpoint when section complete", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ()); // academics (index 1)
    s.evaluate("got it", fakeMomentum(), fakeEQ());
    const d = s.evaluate("makes sense", fakeMomentum(), fakeEQ()); // Section complete
    expect(d.shouldCheckpoint).toBe(true);
  });
});

describe("StructuringEngine - Re-rail Detection", () => {
  test("Should detect need for re-rail when drifted", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ());
    const d = s.evaluate("Chess club", fakeMomentum(), fakeEQ()); // Drift
    expect(d.needsRerail).toBe(true);
  });

  test("Should detect need for re-rail when drift counter > 0 and disengaged", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ()); // Topic change, drift counter = 1
    const momentum = fakeMomentum({ disengaged: true });
    const d = s.evaluate("ok", momentum, fakeEQ());
    expect(d.needsRerail).toBe(true);
  });

  test("Should NOT need re-rail when on-track and engaged", () => {
    const s = new StructuringEngine();
    const momentum = fakeMomentum({ disengaged: false });
    const d = s.evaluate("My GPA is 3.8", momentum, fakeEQ());
    expect(d.needsRerail).toBe(false);
  });
});

describe("StructuringEngine - Next Topic Hint", () => {
  test("Should provide next topic hint when not at end", () => {
    const s = new StructuringEngine();
    const d = s.evaluate("Hi", fakeMomentum(), fakeEQ()); // intro
    expect(d.nextTopicHint).toBe("academics");
  });

  test("Should provide activities as next hint from academics", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ()); // academics
    const d = s.evaluate("test", fakeMomentum(), fakeEQ());
    expect(d.nextTopicHint).toBe("activities");
  });

  test("Should provide undefined when at closing step", () => {
    const s = new StructuringEngine();
    s.forceAdvanceAgenda(); // academics
    s.forceAdvanceAgenda(); // activities
    s.forceAdvanceAgenda(); // narrative
    s.forceAdvanceAgenda(); // strategy
    s.forceAdvanceAgenda(); // closing
    const d = s.evaluate("test", fakeMomentum(), fakeEQ());
    expect(d.nextTopicHint).toBeUndefined();
  });
});

describe("StructuringEngine - State Management", () => {
  test("Should track topic history", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("My GPA is 3.8", fakeMomentum(), fakeEQ());
    s.evaluate("I'm in chess club", fakeMomentum(), fakeEQ());

    const state = s.getState();
    expect(state.topicHistory).toContain("intro");
    expect(state.topicHistory).toContain("academics");
    expect(state.topicHistory).toContain("activities");
  });

  test("Should limit topic history to 5 items", () => {
    const s = new StructuringEngine();
    s.evaluate("hi", fakeMomentum(), fakeEQ()); // intro
    s.evaluate("gpa", fakeMomentum(), fakeEQ()); // academics
    s.evaluate("club", fakeMomentum(), fakeEQ()); // activities
    s.evaluate("passion", fakeMomentum(), fakeEQ()); // narrative
    s.evaluate("timeline", fakeMomentum(), fakeEQ()); // strategy
    s.evaluate("thanks", fakeMomentum(), fakeEQ()); // closing

    const state = s.getState();
    expect(state.topicHistory.length).toBeLessThanOrEqual(5);
  });

  test("Should provide agenda summary", () => {
    const s = new StructuringEngine();
    const summary = s.getAgendaSummary();
    expect(summary).toContain("intro");
    expect(summary).toContain("0% complete");
  });

  test("Should reset all state", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA", fakeMomentum(), fakeEQ());
    s.evaluate("Club", fakeMomentum(), fakeEQ());
    s.evaluate("Passion", fakeMomentum(), fakeEQ());

    s.reset();

    const state = s.getState();
    expect(state.agendaIndex).toBe(0);
    expect(state.agendaStep).toBe("intro");
    expect(state.lastTopic).toBeNull();
    expect(state.driftCounter).toBe(0);
    expect(state.messagesInCurrentStep).toBe(0);
    expect(state.topicHistory).toEqual([]);
    expect(state.sectionCompletionSignals).toBe(0);
  });

  test("Should force advance agenda", () => {
    const s = new StructuringEngine();
    expect(s.getState().agendaStep).toBe("intro");

    s.forceAdvanceAgenda();
    expect(s.getState().agendaStep).toBe("academics");

    s.forceAdvanceAgenda();
    expect(s.getState().agendaStep).toBe("activities");
  });

  test("Should not advance past closing step", () => {
    const s = new StructuringEngine();
    for (let i = 0; i < 10; i++) {
      s.forceAdvanceAgenda();
    }
    expect(s.getState().agendaStep).toBe("closing");
    expect(s.getState().agendaIndex).toBe(5);
  });
});

describe("buildStructuringHints", () => {
  test("Should build hints for summary directive", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: true,
      shouldCheckpoint: false,
      driftDetected: false,
      agendaProgress: 20,
      agendaStep: "academics",
      sectionComplete: false,
      needsRerail: false
    };

    const hints = buildStructuringHints(directives);
    expect(hints).toContain("SUMMARIZE");
    expect(hints).toContain("recap");
  });

  test("Should build hints for checkpoint directive", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: false,
      shouldCheckpoint: true,
      driftDetected: false,
      agendaProgress: 40,
      agendaStep: "activities",
      sectionComplete: false,
      needsRerail: false
    };

    const hints = buildStructuringHints(directives);
    expect(hints).toContain("CHECKPOINT");
    expect(hints).toContain("check in");
  });

  test("Should build hints for drift detection", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: false,
      shouldCheckpoint: false,
      driftDetected: true,
      agendaProgress: 20,
      agendaStep: "academics",
      sectionComplete: false,
      needsRerail: false
    };

    const hints = buildStructuringHints(directives);
    expect(hints).toContain("DRIFT DETECTED");
    expect(hints).toContain("guide back");
  });

  test("Should build hints for re-rail", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: false,
      shouldCheckpoint: false,
      driftDetected: false,
      agendaProgress: 20,
      agendaStep: "academics",
      sectionComplete: false,
      needsRerail: true
    };

    const hints = buildStructuringHints(directives);
    expect(hints).toContain("RE-RAIL");
    expect(hints).toContain("redirect");
  });

  test("Should build hints for section complete", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: false,
      shouldCheckpoint: false,
      driftDetected: false,
      agendaProgress: 40,
      agendaStep: "activities",
      sectionComplete: true,
      needsRerail: false
    };

    const hints = buildStructuringHints(directives);
    expect(hints).toContain("SECTION COMPLETE");
    expect(hints).toContain("Transition");
  });

  test("Should include next topic hint", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: false,
      shouldCheckpoint: false,
      nextTopicHint: "narrative",
      driftDetected: false,
      agendaProgress: 40,
      agendaStep: "activities",
      sectionComplete: false,
      needsRerail: false
    };

    const hints = buildStructuringHints(directives);
    expect(hints).toContain("NEXT TOPIC");
    expect(hints).toContain("narrative");
  });

  test("Should always include agenda info", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: false,
      shouldCheckpoint: false,
      driftDetected: false,
      agendaProgress: 60,
      agendaStep: "narrative",
      sectionComplete: false,
      needsRerail: false
    };

    const hints = buildStructuringHints(directives);
    expect(hints).toContain("AGENDA");
    expect(hints).toContain("narrative");
    expect(hints).toContain("60%");
  });
});

describe("getStructuringSummary", () => {
  test("Should summarize basic state", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: false,
      shouldCheckpoint: false,
      driftDetected: false,
      agendaProgress: 20,
      agendaStep: "academics",
      sectionComplete: false,
      needsRerail: false
    };

    const summary = getStructuringSummary(directives);
    expect(summary).toContain("academics");
    expect(summary).toContain("20%");
  });

  test("Should include active directives in summary", () => {
    const directives: StructuringDirectives = {
      shouldSummarize: true,
      shouldCheckpoint: true,
      driftDetected: true,
      agendaProgress: 40,
      agendaStep: "activities",
      sectionComplete: true,
      nextTopicHint: "narrative",
      needsRerail: false
    };

    const summary = getStructuringSummary(directives);
    expect(summary).toContain("Summary needed");
    expect(summary).toContain("Checkpoint ready");
    expect(summary).toContain("Drift detected");
    expect(summary).toContain("Section complete");
    expect(summary).toContain("Next: narrative");
  });
});

describe("StructuringEngine - Integration Scenarios", () => {
  test("Scenario: Student completes full assessment flow", () => {
    const s = new StructuringEngine();

    // Intro
    let d = s.evaluate("Hi, I need help with college apps", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("intro");

    // Academics
    d = s.evaluate("My GPA is 3.7, I've taken 5 APs", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("academics");

    // Activities
    d = s.evaluate("I'm president of debate club and volunteer weekly", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("activities");

    // Narrative
    d = s.evaluate("What drives me is making education accessible", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("narrative");

    // Strategy
    d = s.evaluate("What should I do this summer to strengthen my profile?", fakeMomentum(), fakeEQ());
    expect(d.agendaStep).toBe("strategy");
    expect(d.agendaProgress).toBe(80);
  });

  test("Scenario: Student drifts and gets re-railed", () => {
    const s = new StructuringEngine();

    s.evaluate("Hi", fakeMomentum(), fakeEQ());
    s.evaluate("My GPA is 3.8", fakeMomentum(), fakeEQ()); // academics

    // Student jumps to activities (drift)
    let d = s.evaluate("I'm in robotics club", fakeMomentum(), fakeEQ());
    expect(d.driftDetected).toBe(true);
    expect(d.needsRerail).toBe(true);

    // Agent re-rails, student gets back on track
    d = s.evaluate("More about my courses: AP Calc and Physics", fakeMomentum(), fakeEQ());
    expect(d.driftDetected).toBe(false);
  });

  test("Scenario: Low momentum triggers summary", () => {
    const s = new StructuringEngine();
    const lowMomentum = fakeMomentum({ trend: "down", momentumScore: 35 });

    const d = s.evaluate("My GPA is 3.8", lowMomentum, fakeEQ());
    expect(d.shouldSummarize).toBe(true);
  });

  test("Scenario: Section completes and triggers checkpoint", () => {
    const s = new StructuringEngine();
    s.evaluate("GPA 3.8", fakeMomentum(), fakeEQ()); // academics
    s.evaluate("Got it", fakeMomentum(), fakeEQ());
    const d = s.evaluate("Makes sense, what's next?", fakeMomentum(), fakeEQ());

    expect(d.sectionComplete).toBe(true);
    expect(d.shouldCheckpoint).toBe(true);
  });

  test("Scenario: Long unfocused discussion triggers summary", () => {
    const s = new StructuringEngine();
    s.evaluate("Hi", fakeMomentum(), fakeEQ());

    for (let i = 0; i < 5; i++) {
      s.evaluate("yeah", fakeMomentum(), fakeEQ());
    }

    const d = s.evaluate("uh huh", fakeMomentum(), fakeEQ());
    expect(d.shouldSummarize).toBe(true);
  });
});
