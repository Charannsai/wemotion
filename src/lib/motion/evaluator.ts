/**
 * Document-level evaluator.
 *
 * The top-level entry point for the motion engine. Given a Document and a
 * global frame number, determines which scene is active and resolves all
 * layers in that scene to their visual state.
 */
import type { Document, Scene, Layer } from '@/lib/scene-graph/schema';
import type { FrameContext, ResolvedLayerState } from './types';
import { sceneAtFrame } from '@/lib/scene-graph/traverse';
import { resolveSceneAtFrame } from './timeline';

/** The complete result of evaluating the document at a single frame. */
export interface EvaluatedFrame {
  /** The scene that is active at this frame. */
  scene: Scene;
  /** The local frame within the active scene. */
  localFrame: number;
  /** The resolved layers, sorted back-to-front. */
  layers: Array<{ layer: Layer; state: ResolvedLayerState }>;
  /** Frame context metadata. */
  context: FrameContext;
}

/**
 * Evaluate the entire document at a given global frame.
 *
 * This is the function called by both the preview renderer and the export
 * renderer. The result is fully deterministic: the same document + frame
 * always produces the exact same output.
 */
export function evaluateFrame(doc: Document, globalFrame: number): EvaluatedFrame | null {
  const result = sceneAtFrame(doc, globalFrame);
  if (!result) return null;

  const { scene, localFrame } = result;

  const context: FrameContext = {
    globalFrame,
    localFrame,
    sceneDurationFrames: scene.durationFrames,
    fps: doc.fps,
    canvasWidth: doc.canvasWidth,
    canvasHeight: doc.canvasHeight,
  };

  const layers = resolveSceneAtFrame(scene, localFrame);

  return { scene, localFrame, layers, context };
}

/**
 * Evaluate all frames in the document.
 * Used for pre-rendering and export.
 */
export function* evaluateAllFrames(doc: Document): Generator<EvaluatedFrame> {
  const totalFrames = doc.scenes.reduce((sum, s) => sum + s.durationFrames, 0);

  for (let frame = 0; frame < totalFrames; frame++) {
    const result = evaluateFrame(doc, frame);
    if (result) yield result;
  }
}
