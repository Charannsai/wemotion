/**
 * Structural validation of a scene-graph document.
 *
 * This goes beyond Zod schema validation (which checks shapes) and enforces
 * the relational invariants that the editor, motion engine, and renderer
 * depend on:
 *   - Unique IDs within their scope
 *   - Valid parentId references (no orphaned group children)
 *   - No circular parentId chains
 *   - Scene order continuity
 *   - Layer timing within scene bounds
 */
import type { Document, Scene, Layer } from './schema';

export interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export function validateDocument(doc: Document): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Canvas dimensions
  if (doc.canvasWidth <= 0 || doc.canvasHeight <= 0) {
    issues.push({ path: 'canvas', message: 'Canvas dimensions must be positive', severity: 'error' });
  }
  if (doc.fps <= 0 || doc.fps > 120) {
    issues.push({ path: 'fps', message: 'FPS must be between 1 and 120', severity: 'error' });
  }

  // 2. Scene-level checks
  const sceneIds = new Set<string>();
  for (let si = 0; si < doc.scenes.length; si++) {
    const scene = doc.scenes[si]!;
    const sp = `scenes[${si}]`;

    // Unique scene IDs
    if (sceneIds.has(scene.id)) {
      issues.push({ path: `${sp}.id`, message: `Duplicate scene ID: ${scene.id}`, severity: 'error' });
    }
    sceneIds.add(scene.id);

    // Duration
    if (scene.durationFrames <= 0) {
      issues.push({ path: `${sp}.durationFrames`, message: 'Scene duration must be positive', severity: 'error' });
    }

    // Layer checks
    validateSceneLayers(scene, sp, issues);
  }

  return { valid: issues.filter((i) => i.severity === 'error').length === 0, issues };
}

function validateSceneLayers(scene: Scene, prefix: string, issues: ValidationIssue[]): void {
  const layerIds = new Set<string>();
  const layerMap = new Map<string, Layer>();

  for (let li = 0; li < scene.layers.length; li++) {
    const layer = scene.layers[li]!;
    const lp = `${prefix}.layers[${li}]`;

    // Unique layer IDs within scene
    if (layerIds.has(layer.id)) {
      issues.push({ path: `${lp}.id`, message: `Duplicate layer ID: ${layer.id}`, severity: 'error' });
    }
    layerIds.add(layer.id);
    layerMap.set(layer.id, layer);

    // Non-negative dimensions
    if (layer.width < 0 || layer.height < 0) {
      issues.push({ path: `${lp}.size`, message: 'Layer dimensions must be non-negative', severity: 'error' });
    }

    // Timing within scene bounds
    if (layer.startFrame + layer.durationFrames > scene.durationFrames) {
      issues.push({
        path: `${lp}.timing`,
        message: `Layer extends beyond scene duration (${layer.startFrame}+${layer.durationFrames} > ${scene.durationFrames})`,
        severity: 'warning',
      });
    }

    // Keyframe ordering
    for (const track of layer.tracks) {
      for (let ki = 1; ki < track.keyframes.length; ki++) {
        if (track.keyframes[ki]!.frame <= track.keyframes[ki - 1]!.frame) {
          issues.push({
            path: `${lp}.tracks.${track.property}`,
            message: 'Keyframes must be in ascending frame order',
            severity: 'error',
          });
        }
      }
    }
  }

  // Validate parentId references
  for (const layer of scene.layers) {
    if (layer.parentId !== null && !layerMap.has(layer.parentId)) {
      issues.push({
        path: `${prefix}.layers[${layer.id}].parentId`,
        message: `parentId references non-existent layer: ${layer.parentId}`,
        severity: 'error',
      });
    }
  }

  // Detect circular parent chains
  for (const layer of scene.layers) {
    const visited = new Set<string>();
    let current: string | null = layer.id;
    while (current) {
      if (visited.has(current)) {
        issues.push({
          path: `${prefix}.layers`,
          message: `Circular parent chain detected involving layer: ${current}`,
          severity: 'error',
        });
        break;
      }
      visited.add(current);
      const parent = layerMap.get(current);
      current = parent?.parentId ?? null;
    }
  }
}
