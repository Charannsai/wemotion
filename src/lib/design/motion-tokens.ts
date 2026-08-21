/**
 * Motion design tokens — timing and easing constants for UI transitions
 * and the video motion engine.
 *
 * These are purposely separate from the visual design tokens because they
 * are also consumed by the motion evaluator at render time.
 */

// ---------------------------------------------------------------------------
// Durations (milliseconds)
// ---------------------------------------------------------------------------

export const durations = {
  /** Micro-interactions: checkbox ticks, icon swaps */
  instant: 80,
  /** Fast feedback: button presses, toggles */
  fast: 150,
  /** Standard transitions: panels, cards */
  normal: 250,
  /** Deliberate emphasis: page transitions, modals */
  slow: 400,
  /** Dramatic reveals: splash screens, hero entries */
  slower: 600,
  /** Scene-level default for the motion engine */
  sceneDefault: 800,
  /** Long cinematic transitions */
  cinematic: 1200,
} as const;

// ---------------------------------------------------------------------------
// Cubic-bezier easing presets
// ---------------------------------------------------------------------------

/** [x1, y1, x2, y2] tuples for cubic-bezier(). */
export type CubicBezierTuple = readonly [number, number, number, number];

export const easings = {
  /** Starts slow, ends fast — iOS-style entry. */
  easeIn: [0.42, 0, 1, 1] as CubicBezierTuple,
  /** Starts fast, ends slow — natural deceleration. */
  easeOut: [0, 0, 0.58, 1] as CubicBezierTuple,
  /** Smooth start and end — the UI default. */
  easeInOut: [0.42, 0, 0.58, 1] as CubicBezierTuple,
  /** Linear — for progress bars, continuous rotation. */
  linear: [0, 0, 1, 1] as CubicBezierTuple,
  /** Snappy — Apple-inspired quick settle. */
  snappy: [0.2, 0, 0, 1] as CubicBezierTuple,
  /** Expressive overshoot — playful UI elements. */
  overshoot: [0.175, 0.885, 0.32, 1.275] as CubicBezierTuple,
  /** Emphasized ease-out — hero text reveals. */
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1] as CubicBezierTuple,
  /** Emphasized ease-in — exit animations. */
  emphasizedAccelerate: [0.3, 0, 0.8, 0.15] as CubicBezierTuple,
  /** Smooth power curve for charts and counting animations. */
  power2Out: [0.0, 0.0, 0.35, 1.0] as CubicBezierTuple,
  /** Dramatic swoop — large panel transitions. */
  power3InOut: [0.65, 0, 0.35, 1] as CubicBezierTuple,
} as const;

export type EasingName = keyof typeof easings;

/** Convert an easing name or tuple to a CSS `cubic-bezier()` string. */
export function easingToCss(easing: EasingName | CubicBezierTuple): string {
  const tuple = Array.isArray(easing) ? easing : easings[easing];
  return `cubic-bezier(${tuple[0]},${tuple[1]},${tuple[2]},${tuple[3]})`;
}

// ---------------------------------------------------------------------------
// Spring physics presets (used by the motion evaluator)
// ---------------------------------------------------------------------------

export interface SpringConfig {
  /** Mass of the object. */
  mass: number;
  /** Stiffness of the spring. */
  stiffness: number;
  /** Damping coefficient. */
  damping: number;
  /** Resting velocity threshold. */
  precision?: number;
}

export const springs: Record<string, SpringConfig> = {
  /** Gentle — tooltips, badges. */
  gentle: { mass: 1, stiffness: 120, damping: 14, precision: 0.01 },
  /** Default — most UI animations. */
  default: { mass: 1, stiffness: 170, damping: 26, precision: 0.01 },
  /** Wobbly — playful bounces. */
  wobbly: { mass: 1, stiffness: 180, damping: 12, precision: 0.01 },
  /** Stiff — snappy interactions. */
  stiff: { mass: 1, stiffness: 300, damping: 30, precision: 0.01 },
  /** Slow — cinematic reveals. */
  slow: { mass: 1, stiffness: 100, damping: 20, precision: 0.01 },
  /** Molasses — dramatic slow-motion. */
  molasses: { mass: 1, stiffness: 60, damping: 24, precision: 0.01 },
} as const;

// ---------------------------------------------------------------------------
// Motion intensity levels (for AI-directed scenes)
// ---------------------------------------------------------------------------

/**
 * The motion engine picks one of these when an AI treatment specifies
 * "intensity": a semantic handle that maps to concrete transform magnitudes.
 */
export const motionIntensity = {
  /** Subtle — small translations, gentle fades. */
  subtle: { translatePx: 8, scaleDelta: 0.02, rotateDeg: 1 },
  /** Moderate — visible but professional. */
  moderate: { translatePx: 24, scaleDelta: 0.06, rotateDeg: 3 },
  /** Energetic — punchy product demos. */
  energetic: { translatePx: 48, scaleDelta: 0.1, rotateDeg: 6 },
  /** Dramatic — hero reveals, cinematic intros. */
  dramatic: { translatePx: 80, scaleDelta: 0.15, rotateDeg: 10 },
} as const;

export type MotionIntensityLevel = keyof typeof motionIntensity;
