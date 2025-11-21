/**
 * jennyPhrasebankEngine.ts
 *
 * Phrase Selection Engine - dynamically selects Jenny-style phrases based on:
 * - Tone Directive (warmth, directness, assertiveness, pacing, specificity)
 * - Coaching Move (affirm, reframe, challenge, etc.)
 * - Archetype context
 *
 * This is the "moat chip" that prevents LLM drift and maintains Jenny's voice.
 */

import { JENNY_PHRASEBANK, JENNY_FINGERPRINT } from './jennyPhraseBank.data';
import { JennyPhraseBank, VoiceAtom, SelectedPhrases, LinguisticFingerprint } from './jennyPhraseBank.types';
import { ToneDirective } from './toneModulationEngine';
import { CoachingMove } from './microCoachingEngine';

/**
 * Phrase selection engine that picks appropriate Jenny-style phrases
 * based on tone directive and coaching move.
 */
export class JennyPhrasebankEngine {
  private phrasebank: JennyPhraseBank;
  private fingerprint: LinguisticFingerprint;
  private recentlyUsedPhrases: Set<string> = new Set();
  private maxRecentPhrases = 20; // Track last 20 phrases to avoid repetition

  constructor(phrasebank?: JennyPhraseBank, fingerprint?: LinguisticFingerprint) {
    this.phrasebank = phrasebank || JENNY_PHRASEBANK;
    this.fingerprint = fingerprint || JENNY_FINGERPRINT;
  }

  /**
   * Select phrases for a specific turn based on tone directive and coaching move.
   */
  selectPhrases(tone: ToneDirective, move: CoachingMove): SelectedPhrases {
    const selected: SelectedPhrases = {
      body: [],
      styleMarkers: [...tone.styleMarkers],
    };

    // 1. Select pacing marker if appropriate
    if (tone.pacing) {
      selected.pacingMarker = this.selectPacingMarker(tone.pacing);
    }

    // 2. Select core body phrases based on coaching move and tone
    selected.body = this.selectBodyPhrases(move, tone);

    // 3. Add move-specific style markers
    selected.styleMarkers.push(...this.getMoveStyleMarkers(move));

    // 4. Add fingerprint style markers based on tone
    selected.styleMarkers.push(...this.getFingerprintMarkers(tone));

    return selected;
  }

  /**
   * Select 2-3 core phrases for the response body based on move and tone.
   */
  private selectBodyPhrases(move: CoachingMove, tone: ToneDirective): string[] {
    const phrases: string[] = [];
    const warmth = tone.warmth;
    const directness = tone.directness;
    const assertiveness = tone.assertiveness;

    // Select phrases based on coaching move
    switch (move) {
      case 'affirm':
        // High warmth → validation + empathy
        if (warmth >= 7) {
          phrases.push(this.pickPhrase(this.phrasebank.validations, 'medium').text);
          phrases.push(this.pickPhrase(this.phrasebank.empathyInfusions, 'medium').text);
        } else if (warmth >= 4) {
          phrases.push(this.pickPhrase(this.phrasebank.validations, 'light').text);
          phrases.push(this.pickPhrase(this.phrasebank.motivationalBursts, 'light').text);
        } else {
          // Lower warmth → concise validation
          phrases.push(this.pickPhrase(this.phrasebank.validations, 'light').text);
        }
        break;

      case 'reframe':
        // Always include perspective shift
        phrases.push(this.pickPhrase(this.phrasebank.perspectiveShift, 'medium').text);
        // Add grounding if warmth is high
        if (warmth >= 6) {
          phrases.push(this.pickPhrase(this.phrasebank.grounding, 'light').text);
        }
        // Add clarity frame for high directness
        if (directness >= 7) {
          phrases.push(this.pickPhrase(this.phrasebank.clarityFrames, 'medium').text);
        }
        break;

      case 'challenge':
        // Always include micro-challenge
        phrases.push(this.pickPhrase(this.phrasebank.microChallenges, assertiveness >= 7 ? 'strong' : 'medium').text);
        // Add validation cushion if warmth is high
        if (warmth >= 6) {
          phrases.push(this.pickPhrase(this.phrasebank.validations, 'light').text);
        }
        break;

      case 'motivate':
        // Always include motivational burst
        phrases.push(this.pickPhrase(this.phrasebank.motivationalBursts, assertiveness >= 7 ? 'strong' : 'medium').text);
        // Add tactical pivot if directness is high
        if (directness >= 7) {
          phrases.push(this.pickPhrase(this.phrasebank.tacticalPivots, 'medium').text);
        }
        break;

      case 'accountability':
        // Clarity frame + micro-challenge
        phrases.push(this.pickPhrase(this.phrasebank.clarityFrames, 'medium').text);
        phrases.push(this.pickPhrase(this.phrasebank.microChallenges, 'medium').text);
        // Add grounding if warmth is high
        if (warmth >= 6) {
          phrases.push(this.pickPhrase(this.phrasebank.grounding, 'light').text);
        }
        break;

      case 'anchor':
        // Always include grounding
        phrases.push(this.pickPhrase(this.phrasebank.grounding, assertiveness >= 7 ? 'strong' : 'medium').text);
        // Add clarity frame
        phrases.push(this.pickPhrase(this.phrasebank.clarityFrames, 'medium').text);
        break;

      case 'mirror':
        // Reflective prompt + empathy
        phrases.push(this.pickPhrase(this.phrasebank.reflectivePrompts, 'medium').text);
        if (warmth >= 6) {
          phrases.push(this.pickPhrase(this.phrasebank.empathyInfusions, 'light').text);
        }
        break;

      case 'breaker':
        // Strong grounding + tactical pivot
        phrases.push(this.pickPhrase(this.phrasebank.grounding, 'strong').text);
        phrases.push(this.pickPhrase(this.phrasebank.tacticalPivots, 'strong').text);
        break;

      case 'none':
      default:
        // Neutral fallback: autonomy respect + reflective prompt
        phrases.push(this.pickPhrase(this.phrasebank.autonomyRespect, 'light').text);
        phrases.push(this.pickPhrase(this.phrasebank.reflectivePrompts, 'light').text);
        break;
    }

    return phrases;
  }

  /**
   * Select a pacing marker based on pacing directive.
   */
  private selectPacingMarker(pacing: 'slow' | 'medium' | 'fast'): string {
    const markers = this.phrasebank.pacingMarkers[pacing];
    return this.pickPhrase(markers).text;
  }

  /**
   * Get style markers specific to the coaching move.
   */
  private getMoveStyleMarkers(move: CoachingMove): string[] {
    switch (move) {
      case 'affirm':
        return ['affirming', 'validating'];
      case 'reframe':
        return ['perspective-shifting', 'reframing'];
      case 'challenge':
        return ['challenging-gently', 'accountability-oriented'];
      case 'motivate':
        return ['energizing', 'momentum-building'];
      case 'accountability':
        return ['clarity-focused', 'action-oriented'];
      case 'anchor':
        return ['grounding', 'concrete'];
      case 'mirror':
        return ['reflective', 'metacognitive'];
      case 'breaker':
        return ['pattern-breaking', 'strategic-redirect'];
      default:
        return [];
    }
  }

  /**
   * Get fingerprint-based style markers from tone directive.
   */
  private getFingerprintMarkers(tone: ToneDirective): string[] {
    const markers: string[] = [];

    // Warmth-based markers
    if (tone.warmth >= 7) {
      markers.push('warm-empathetic');
    } else if (tone.warmth <= 3) {
      markers.push('crisp-efficient');
    }

    // Directness-based markers
    if (tone.directness >= 8) {
      markers.push('direct-clear');
    }

    // Assertiveness-based markers
    if (tone.assertiveness >= 7) {
      markers.push('confident-decisive');
    } else if (tone.assertiveness <= 3) {
      markers.push('gentle-invitational');
    }

    // Specificity-based markers
    if (tone.specificity >= 8) {
      markers.push('concrete-actionable');
    }

    return markers;
  }

  /**
   * Pick a phrase from a category, optionally filtering by intensity.
   * Avoids recently used phrases when possible.
   */
  private pickPhrase(atoms: VoiceAtom[], targetIntensity?: 'light' | 'medium' | 'strong'): { text: string } {
    // Filter by intensity if specified
    let candidates = targetIntensity
      ? atoms.filter(a => a.intensity === targetIntensity)
      : atoms;

    // If no matches, fall back to all atoms in category
    if (candidates.length === 0) {
      candidates = atoms;
    }

    // Filter out recently used phrases if possible
    const fresh = candidates.filter(a => !this.recentlyUsedPhrases.has(a.text));
    if (fresh.length > 0) {
      candidates = fresh;
    }

    // Random selection
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    // Track as recently used
    this.recentlyUsedPhrases.add(selected.text);
    if (this.recentlyUsedPhrases.size > this.maxRecentPhrases) {
      // Remove oldest (first added)
      const first = this.recentlyUsedPhrases.values().next().value;
      if (first !== undefined) {
        this.recentlyUsedPhrases.delete(first);
      }
    }

    return { text: selected.text };
  }

  /**
   * Build style hints for LLM system prompt.
   * These guide the LLM to write in Jenny's voice.
   */
  buildStyleHints(selected: SelectedPhrases): string {
    const hints: string[] = [];

    hints.push('VOICE STYLE GUIDE:');
    hints.push('- Write in Jenny\'s coaching voice: warm but direct, curious without interrogation, action-oriented without rushing.');
    hints.push('- Use short sentences for clarity, longer sentences for reflection.');
    hints.push('- Avoid corporate jargon, educational buzzwords, and excessive qualifiers.');

    if (selected.pacingMarker) {
      hints.push(`- Pacing: ${selected.pacingMarker}`);
    }

    if (selected.styleMarkers.length > 0) {
      hints.push(`- Style markers: ${selected.styleMarkers.join(', ')}`);
    }

    if (selected.body.length > 0) {
      hints.push('\nPHRASE ATOMS TO WEAVE IN:');
      selected.body.forEach((phrase, i) => {
        hints.push(`${i + 1}. "${phrase}"`);
      });
    }

    hints.push('\nUse these phrases naturally in your response, adapting them to fit the context.');

    return hints.join('\n');
  }

  /**
   * Get linguistic fingerprint for reference.
   */
  getFingerprint(): LinguisticFingerprint {
    return this.fingerprint;
  }

  /**
   * Get current state for debugging/monitoring.
   */
  getState() {
    return {
      recentlyUsedCount: this.recentlyUsedPhrases.size,
      fingerprint: this.fingerprint,
    };
  }

  /**
   * Reset recently used phrase tracking.
   */
  reset(): void {
    this.recentlyUsedPhrases.clear();
  }
}

/**
 * Helper function to build style hints for LLM prompt.
 */
export function buildStyleHints(selected: SelectedPhrases): string {
  const engine = new JennyPhrasebankEngine();
  return engine.buildStyleHints(selected);
}

/**
 * Helper function to get linguistic fingerprint.
 */
export function getFingerprint(): LinguisticFingerprint {
  return JENNY_FINGERPRINT;
}
