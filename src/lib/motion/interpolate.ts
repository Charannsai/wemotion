/**
 * Value interpolation for the motion engine.
 *
 * Handles numbers, colors, and multi-value properties (e.g. transform arrays).
 */
import type { PropertyValue } from './types';
import { lerpColor, parseColor } from './color';

/** Linear interpolation between two numbers. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Round to N decimal places. */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Check if a string looks like a color value. */
function isColor(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return value.startsWith('#') || value.startsWith('rgb');
}

/**
 * Interpolate between two property values.
 * Handles numbers, colors, and number arrays.
 */
export function interpolateValue(from: PropertyValue, to: PropertyValue, progress: number): PropertyValue {
  // Numbers
  if (typeof from === 'number' && typeof to === 'number') {
    return roundTo(lerp(from, to, progress), 4);
  }

  // Colors
  if (isColor(from) && isColor(to)) {
    return lerpColor(from as string, to as string, progress);
  }

  // Number arrays (e.g. dashArray, custom tuples)
  if (Array.isArray(from) && Array.isArray(to) && from.length === to.length) {
    return from.map((v, i) => roundTo(lerp(v as number, to[i] as number, progress), 4));
  }

  // Booleans — snap at 50%
  if (typeof from === 'boolean' && typeof to === 'boolean') {
    return progress < 0.5 ? from : to;
  }

  // Strings — snap at 50%
  return progress < 0.5 ? from : to;
}
