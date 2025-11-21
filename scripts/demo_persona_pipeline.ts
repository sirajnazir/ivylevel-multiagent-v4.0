/**
 * demo_persona_pipeline.ts
 *
 * Demonstrates the full persona pipeline:
 * - Component 40: Persona Embedding Model
 * - Component 41: Canonicalization Pipeline
 * - Component 42: Drift Correction Tuner
 */

import { runPersonaTuner, getPersonaDriftStats } from './persona_weights';

async function demonstratePersonaPipeline() {
  console.log('=== COMPONENT 42 DEMO: Persona Drift Detection & Correction ===\n');

  // Test 1: Generic AI pattern (should trigger correction)
  console.log('Test 1: Generic AI Output');
  console.log('----------------------------');
  const genericText = "You should try harder and don't worry about it. Everything will be fine.";
  console.log('Original:', genericText);

  const corrected1 = await runPersonaTuner(genericText, undefined, {
    verbose: true,
    auto_correct_threshold: 'orange'
  });
  console.log('Corrected:', corrected1);
  console.log();

  // Test 2: On-brand text (should pass through)
  console.log('Test 2: On-Brand Jenny Voice');
  console.log('----------------------------');
  const onBrandText = "I'm noticing a pattern here. Your nervous system is doing its thing. Let's ground this with one clean move.";
  console.log('Original:', onBrandText);

  const corrected2 = await runPersonaTuner(onBrandText, undefined, {
    verbose: true,
    auto_correct_threshold: 'orange'
  });
  console.log('Corrected:', corrected2);
  console.log();

  // Test 3: Mixed quality
  console.log('Test 3: Mixed Quality Text');
  console.log('----------------------------');
  const mixedText = "You must focus on building better habits. Just relax and take it easy.";
  console.log('Original:', mixedText);

  const corrected3 = await runPersonaTuner(mixedText, undefined, {
    verbose: true,
    auto_correct_threshold: 'orange'
  });
  console.log('Corrected:', corrected3);
  console.log();

  // Show drift statistics
  console.log('=== Drift Statistics ===');
  const stats = getPersonaDriftStats();
  console.log('Total drift events:', stats.total_events);
  console.log('By level:', stats.by_level);
  console.log('Corrections applied:', stats.corrections_applied);
  console.log('Average similarity:', stats.avg_similarity.toFixed(3));
  console.log('Recent trend:', stats.recent_trend);
  console.log();

  console.log('✅ Demo complete! All three components working together:');
  console.log('  - Component 40: Embedding vectors for drift detection');
  console.log('  - Component 41: Canonical blocks for signature elements');
  console.log('  - Component 42: Real-time drift correction');
}

// Run demo
demonstratePersonaPipeline().catch(console.error);
