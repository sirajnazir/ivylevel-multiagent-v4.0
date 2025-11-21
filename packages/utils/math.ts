/**
 * Math Utilities v4.0
 *
 * Common mathematical helper functions.
 */

/**
 * Clamp
 *
 * Restricts a value to be within a specified range.
 *
 * @param value - Value to clamp
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (default: 1)
 * @returns Clamped value
 */
export function clamp(value: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Lerp
 *
 * Linear interpolation between two values.
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t);
}

/**
 * Normalize
 *
 * Maps a value from one range to another (0-1).
 *
 * @param value - Value to normalize
 * @param min - Minimum of input range
 * @param max - Maximum of input range
 * @returns Normalized value (0-1)
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((value - min) / (max - min));
}

/**
 * Map Range
 *
 * Maps a value from one range to another range.
 *
 * @param value - Value to map
 * @param inMin - Minimum of input range
 * @param inMax - Maximum of input range
 * @param outMin - Minimum of output range
 * @param outMax - Maximum of output range
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const normalized = normalize(value, inMin, inMax);
  return lerp(outMin, outMax, normalized);
}

/**
 * Round To
 *
 * Rounds a number to specified decimal places.
 *
 * @param value - Value to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
