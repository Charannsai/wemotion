/**
 * Spring physics solver.
 *
 * Given a SpringConfig, solves the second-order ODE for a critically/under/over
 * damped harmonic oscillator and returns the position at any point in time.
 * Used for spring-based easing in the motion engine.
 */
import type { SpringConfig } from '@/lib/design/motion-tokens';
import type { EasingFn } from './types';

/**
 * Solve the spring ODE at time `t` (in seconds) from rest position 0 to 1.
 */
export function springPosition(config: SpringConfig, t: number): number {
  const { mass, stiffness, damping } = config;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    // Under-damped: oscillates
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const A = 1;
    const B = (zeta * w0) / wd;
    return 1 - Math.exp(-zeta * w0 * t) * (A * Math.cos(wd * t) + B * Math.sin(wd * t));
  }

  if (zeta === 1) {
    // Critically damped: fastest return without oscillation
    return 1 - (1 + w0 * t) * Math.exp(-w0 * t);
  }

  // Over-damped: slow return
  const s1 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
  const s2 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
  const A = s2 / (s2 - s1);
  const B = -s1 / (s2 - s1);
  return 1 - A * Math.exp(s1 * t) - B * Math.exp(s2 * t);
}

/**
 * Estimate the settling time of a spring (when it's within `precision` of 1.0).
 * Uses binary search on the spring position.
 */
export function springSettleTime(config: SpringConfig, maxTime = 10): number {
  const precision = config.precision ?? 0.01;
  let lo = 0;
  let hi = maxTime;

  // Check if spring settles at all within maxTime
  if (Math.abs(1 - springPosition(config, maxTime)) > precision) {
    return maxTime;
  }

  // Binary search for the settling point
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    // Check if the spring is settled for all t >= mid
    let settled = true;
    for (let check = mid; check <= hi; check += (hi - mid) / 10) {
      if (Math.abs(1 - springPosition(config, check)) > precision) {
        settled = false;
        break;
      }
    }
    if (settled) hi = mid;
    else lo = mid;
  }

  return hi;
}

/**
 * Create an easing function from a spring config.
 * Maps progress [0..1] to spring position [0..1].
 */
export function springEasing(config: SpringConfig): EasingFn {
  const settleTime = springSettleTime(config);
  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    const t = progress * settleTime;
    return springPosition(config, t);
  };
}
