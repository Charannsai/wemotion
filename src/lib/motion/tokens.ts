/**
 * Motion tokens — semantic motion descriptions from the AI planner.
 *
 * The motion engine translates these tokens into concrete keyframe tracks.
 */
import { motionIntensity, type MotionIntensityLevel } from '@/lib/design/motion-tokens';

/** Direction from which a motion enters or exits. */
export type MotionDirection = 'left' | 'right' | 'up' | 'down' | 'center';

/** Descriptor for an entry or exit motion. */
export interface MotionDescriptor {
  /** Primitive name (e.g. 'fadeIn', 'slideUp'). */
  primitive: string;
  /** Duration in frames. */
  durationFrames: number;
  /** Intensity level. */
  intensity: MotionIntensityLevel;
  /** Direction (for slide, wipe, etc.). */
  direction?: MotionDirection;
  /** Optional delay in frames before the motion starts. */
  delayFrames?: number;
  /** Optional stagger offset for grouped elements. */
  staggerOffsetFrames?: number;
}

/**
 * Parse a motion token string into a MotionDescriptor.
 * Format: "primitive:durationFrames:intensity:direction"
 * Example: "fadeIn:15:moderate" or "slideUp:20:energetic:up"
 */
export function parseMotionToken(token: string): MotionDescriptor {
  const parts = token.split(':');
  return {
    primitive: parts[0] || 'fadeIn',
    durationFrames: parts[1] ? parseInt(parts[1], 10) : 15,
    intensity: (parts[2] as MotionIntensityLevel) || 'moderate',
    direction: (parts[3] as MotionDirection) || undefined,
  };
}

/**
 * Get the concrete translate/scale/rotate magnitudes for an intensity level.
 */
export function intensityValues(level: MotionIntensityLevel) {
  return motionIntensity[level] ?? motionIntensity.moderate;
}
