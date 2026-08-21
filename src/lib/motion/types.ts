/**
 * Motion engine — shared types.
 */
import type { Easing } from '@/lib/scene-graph/schema';

/** A resolved property value at a specific frame. */
export type PropertyValue = number | string | boolean | number[];

/** A complete resolved style for a layer at a given frame. */
export interface ResolvedLayerState {
  opacity: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  anchorX: number;
  anchorY: number;
  skewX: number;
  skewY: number;
  width: number;
  height: number;
  /** Any animated property values keyed by dot-path. */
  animated: Record<string, PropertyValue>;
}

/** Context passed into the evaluator for a single frame. */
export interface FrameContext {
  /** The global frame in the document timeline. */
  globalFrame: number;
  /** The local frame within the current scene. */
  localFrame: number;
  /** The scene's duration in frames. */
  sceneDurationFrames: number;
  /** Document fps. */
  fps: number;
  /** Canvas dimensions. */
  canvasWidth: number;
  canvasHeight: number;
}

/** Easing function signature: takes progress 0..1, returns eased progress 0..1. */
export type EasingFn = (t: number) => number;

/** Resolved easing — either a function or a named/tuple reference. */
export type ResolvedEasing = EasingFn | Easing;
