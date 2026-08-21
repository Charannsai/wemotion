/**
 * Timeline evaluator.
 *
 * Orchestrates keyframe tracks and motion primitives to compute the resolved
 * visual state of every visible layer at a given frame.
 */
import type { Layer, Scene } from '@/lib/scene-graph/schema';
import type { FrameContext, ResolvedLayerState, PropertyValue } from './types';
import { resolveAllTracks } from './keyframe';
import { parseMotionToken } from './tokens';
import { generateMotionTracks } from './primitives';

/**
 * Resolve a single layer's visual state at a given local frame within its scene.
 */
export function resolveLayerAtFrame(layer: Layer, localFrame: number): ResolvedLayerState {
  const relFrame = localFrame - layer.startFrame;

  // Layer is not yet visible or has ended
  if (relFrame < 0 || relFrame > layer.durationFrames) {
    return {
      opacity: 0,
      x: layer.transform.x,
      y: layer.transform.y,
      scaleX: layer.transform.scaleX,
      scaleY: layer.transform.scaleY,
      rotation: layer.transform.rotation,
      anchorX: layer.transform.anchorX,
      anchorY: layer.transform.anchorY,
      skewX: layer.transform.skewX,
      skewY: layer.transform.skewY,
      width: layer.width,
      height: layer.height,
      animated: {},
    };
  }

  // Start with the base (static) state
  const state: ResolvedLayerState = {
    opacity: layer.opacity,
    x: layer.transform.x,
    y: layer.transform.y,
    scaleX: layer.transform.scaleX,
    scaleY: layer.transform.scaleY,
    rotation: layer.transform.rotation,
    anchorX: layer.transform.anchorX,
    anchorY: layer.transform.anchorY,
    skewX: layer.transform.skewX,
    skewY: layer.transform.skewY,
    width: layer.width,
    height: layer.height,
    animated: {},
  };

  // Resolve explicit keyframe tracks
  const trackValues = resolveAllTracks(layer.tracks, relFrame);

  // Apply entry motion (if present and we're in the entry window)
  if (layer.entryMotion) {
    const entryDesc = parseMotionToken(layer.entryMotion);
    if (relFrame <= entryDesc.durationFrames) {
      const entryTracks = generateMotionTracks(entryDesc, false);
      const entryValues = resolveAllTracks(entryTracks, relFrame);
      Object.assign(trackValues, entryValues);
    }
  }

  // Apply exit motion (if present and we're in the exit window)
  if (layer.exitMotion) {
    const exitDesc = parseMotionToken(layer.exitMotion);
    const exitStart = layer.durationFrames - exitDesc.durationFrames;
    if (relFrame >= exitStart) {
      const exitFrame = relFrame - exitStart;
      const exitTracks = generateMotionTracks(exitDesc, true);
      const exitValues = resolveAllTracks(exitTracks, exitFrame);
      Object.assign(trackValues, exitValues);
    }
  }

  // Apply resolved values to state
  applyAnimatedValues(state, trackValues);

  return state;
}

/**
 * Apply animated property values to the resolved state.
 */
function applyAnimatedValues(state: ResolvedLayerState, values: Record<string, PropertyValue>): void {
  for (const [path, value] of Object.entries(values)) {
    switch (path) {
      case 'opacity':
        state.opacity = value as number;
        break;
      case 'transform.x':
        state.x = value as number;
        break;
      case 'transform.y':
        state.y = value as number;
        break;
      case 'transform.scaleX':
        state.scaleX = value as number;
        break;
      case 'transform.scaleY':
        state.scaleY = value as number;
        break;
      case 'transform.rotation':
        state.rotation = value as number;
        break;
      case 'transform.anchorX':
        state.anchorX = value as number;
        break;
      case 'transform.anchorY':
        state.anchorY = value as number;
        break;
      case 'transform.skewX':
        state.skewX = value as number;
        break;
      case 'transform.skewY':
        state.skewY = value as number;
        break;
      case 'width':
        state.width = value as number;
        break;
      case 'height':
        state.height = value as number;
        break;
      default:
        // Store in animated map for layer-specific rendering
        state.animated[path] = value;
        break;
    }
  }
}

/**
 * Resolve all visible layers in a scene at a given frame.
 * Returns layers sorted by order (back to front) with their resolved state.
 */
export function resolveSceneAtFrame(
  scene: Scene,
  localFrame: number,
): Array<{ layer: Layer; state: ResolvedLayerState }> {
  const results: Array<{ layer: Layer; state: ResolvedLayerState }> = [];

  const sorted = [...scene.layers].sort((a, b) => a.order - b.order);

  for (const layer of sorted) {
    if (!layer.visible) continue;

    const state = resolveLayerAtFrame(layer, localFrame);
    // Skip layers that are fully transparent
    if (state.opacity <= 0) continue;

    results.push({ layer, state });
  }

  return results;
}
