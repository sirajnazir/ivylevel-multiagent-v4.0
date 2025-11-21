/**
 * util.ts
 *
 * Utility functions for Persona Canonicalization Pipeline
 */

import fs from 'fs';
import path from 'path';

/**
 * Write JSON to file with pretty formatting
 */
export function writeJSON(dir: string, filename: string, data: any): void {
  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Read JSON from file
 */
export function readJSON(filepath: string): any {
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string): string {
  return `${prefix}.${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Clean text - remove extra whitespace
 */
export function cleanWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\n{3,}/g, '\n\n')       // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ')          // Collapse spaces
    .trim();
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('JSON parse failed, returning fallback');
    return fallback;
  }
}

/**
 * Extract JSON from text that might contain markdown fences
 */
export function extractJson(text: string): string {
  // Remove markdown code fences if present
  const match = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (match) {
    return match[1];
  }

  // Try to find JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text;
}

/**
 * Log with timestamp
 */
export function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🔹';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}
