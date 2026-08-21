/**
 * Scene-graph tree traversal utilities.
 */
import type { Document, Scene, Layer } from './schema';

// ---------------------------------------------------------------------------
// Scene helpers
// ---------------------------------------------------------------------------

/** Get all scenes in display order. */
export function orderedScenes(doc: Document): Scene[] {
  return [...doc.scenes].sort((a, b) => a.order - b.order);
}

/** Find a scene by id. */
export function findScene(doc: Document, sceneId: string): Scene | undefined {
  return doc.scenes.find((s) => s.id === sceneId);
}

/** Calculate total duration of the document in frames. */
export function totalFrames(doc: Document): number {
  return doc.scenes.reduce((sum, s) => sum + s.durationFrames, 0);
}

/** Calculate total duration in milliseconds. */
export function totalDurationMs(doc: Document): number {
  return Math.round((totalFrames(doc) / doc.fps) * 1000);
}

/** Get the absolute start frame of a scene within the document timeline. */
export function sceneStartFrame(doc: Document, sceneId: string): number {
  const scenes = orderedScenes(doc);
  let frame = 0;
  for (const s of scenes) {
    if (s.id === sceneId) return frame;
    frame += s.durationFrames;
  }
  return frame;
}

// ---------------------------------------------------------------------------
// Layer helpers
// ---------------------------------------------------------------------------

/** Find a layer by id across all scenes. */
export function findLayer(doc: Document, layerId: string): { scene: Scene; layer: Layer } | undefined {
  for (const scene of doc.scenes) {
    const layer = scene.layers.find((l) => l.id === layerId);
    if (layer) return { scene, layer };
  }
  return undefined;
}

/** Get all layers in a scene in display order. */
export function orderedLayers(scene: Scene): Layer[] {
  return [...scene.layers].sort((a, b) => a.order - b.order);
}

/** Get the top-level (root) layers of a scene. */
export function rootLayers(scene: Scene): Layer[] {
  return orderedLayers(scene).filter((l) => l.parentId === null);
}

/** Get the children of a layer. */
export function childLayers(scene: Scene, parentId: string): Layer[] {
  return orderedLayers(scene).filter((l) => l.parentId === parentId);
}

/** Walk all layers in a scene depth-first. */
export function walkLayers(
  scene: Scene,
  visitor: (layer: Layer, depth: number) => void | false,
  parentId: string | null = null,
  depth = 0,
): void {
  const children = scene.layers
    .filter((l) => l.parentId === (parentId ?? null))
    .sort((a, b) => a.order - b.order);

  for (const child of children) {
    const result = visitor(child, depth);
    if (result === false) return;
    walkLayers(scene, visitor, child.id, depth + 1);
  }
}

/** Collect all descendant layer IDs of a parent. */
export function descendantIds(scene: Scene, parentId: string): string[] {
  const ids: string[] = [];
  walkLayers(scene, (layer) => { ids.push(layer.id); }, parentId);
  return ids;
}

/** Find all layers matching a predicate across all scenes. */
export function filterLayers(doc: Document, predicate: (layer: Layer, scene: Scene) => boolean): { scene: Scene; layer: Layer }[] {
  const results: { scene: Scene; layer: Layer }[] = [];
  for (const scene of doc.scenes) {
    for (const layer of scene.layers) {
      if (predicate(layer, scene)) results.push({ scene, layer });
    }
  }
  return results;
}

/** Count all layers in the document. */
export function layerCount(doc: Document): number {
  return doc.scenes.reduce((sum, s) => sum + s.layers.length, 0);
}

// ---------------------------------------------------------------------------
// Scene at a given frame
// ---------------------------------------------------------------------------

/** Determine which scene is active at a given global frame. */
export function sceneAtFrame(doc: Document, frame: number): { scene: Scene; localFrame: number } | undefined {
  const scenes = orderedScenes(doc);
  let offset = 0;
  for (const scene of scenes) {
    if (frame < offset + scene.durationFrames) {
      return { scene, localFrame: frame - offset };
    }
    offset += scene.durationFrames;
  }
  // Past the end — return last scene
  const last = scenes[scenes.length - 1];
  if (last) return { scene: last, localFrame: last.durationFrames };
  return undefined;
}
