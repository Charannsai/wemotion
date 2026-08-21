/**
 * Easing functions for the motion engine.
 *
 * Converts easing names and cubic-bezier tuples into callable functions
 * that map progress [0..1] → eased progress [0..1].
 */
import type { Easing } from '@/lib/scene-graph/schema';
import { easings, type CubicBezierTuple } from '@/lib/design/motion-tokens';
import type { EasingFn } from './types';

// ---------------------------------------------------------------------------
// Cubic bezier solver (de Casteljau / Newton-Raphson hybrid)
// ---------------------------------------------------------------------------

function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFn {
  // Pre-computed constants for the parametric cubic
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  function sampleCurveX(t: number) {
    return ((ax * t + bx) * t + cx) * t;
  }

  function sampleCurveY(t: number) {
    return ((ay * t + by) * t + cy) * t;
  }

  function sampleCurveDerivX(t: number) {
    return (3 * ax * t + 2 * bx) * t + cx;
  }

  // Given an x, find parameter t using Newton-Raphson then bisection fallback.
  function solveCurveX(x: number): number {
    let t = x;
    // Newton-Raphson: fast convergence for most cases.
    for (let i = 0; i < 8; i++) {
      const xEstimate = sampleCurveX(t) - x;
      if (Math.abs(xEstimate) < 1e-7) return t;
      const d = sampleCurveDerivX(t);
      if (Math.abs(d) < 1e-7) break;
      t -= xEstimate / d;
    }
    // Bisection fallback.
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const xEstimate = sampleCurveX(t);
      if (Math.abs(xEstimate - x) < 1e-7) return t;
      if (x > xEstimate) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  }

  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    return sampleCurveY(solveCurveX(progress));
  };
}

// ---------------------------------------------------------------------------
// Step easing
// ---------------------------------------------------------------------------

export function stepEasing(steps: number, jumpTerm: 'start' | 'end' = 'end'): EasingFn {
  return (t: number) => {
    if (jumpTerm === 'start') return Math.ceil(t * steps) / steps;
    return Math.floor(t * steps) / steps;
  };
}

// ---------------------------------------------------------------------------
// Named easing resolution
// ---------------------------------------------------------------------------

const easingCache = new Map<string, EasingFn>();

/**
 * Resolve an Easing (name or tuple) to a callable function.
 */
export function resolveEasing(easing: Easing): EasingFn {
  // Tuple
  if (Array.isArray(easing)) {
    const key = easing.join(',');
    if (!easingCache.has(key)) {
      easingCache.set(key, cubicBezier(easing[0], easing[1], easing[2], easing[3]));
    }
    return easingCache.get(key)!;
  }

  // Named
  if (easingCache.has(easing)) return easingCache.get(easing)!;

  const tuple = easings[easing as keyof typeof easings];
  if (!tuple) {
    // Fallback to linear
    const linear: EasingFn = (t) => t;
    easingCache.set(easing, linear);
    return linear;
  }

  const fn = cubicBezier(tuple[0], tuple[1], tuple[2], tuple[3]);
  easingCache.set(easing, fn);
  return fn;
}

/**
 * Convenience: evaluate an easing at a given progress.
 */
export function ease(easing: Easing, progress: number): number {
  return resolveEasing(easing)(progress);
}
