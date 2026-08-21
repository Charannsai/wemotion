/**
 * QA Fixer
 *
 * Automatically resolves common QA violations by generating the corresponding operations.
 */
import type { Document } from '@/lib/scene-graph/schema';
import type { QAViolation } from './types';
import { type Operation, op } from '@/lib/operations/types';

/**
 * Given a QA violation that has a fix payload, generates the operation
 * required to resolve it.
 */
export function generateFixOperation(doc: Document, violation: QAViolation): Operation | null {
  if (!violation.fix || !violation.context.sceneId || !violation.context.layerId) {
    return null;
  }

  const { sceneId, layerId } = violation.context;
  const fixType = violation.fix.type;
  const payload = violation.fix.payload as any;

  switch (fixType) {
    case 'center-layer': {
      // Find the layer
      const scene = doc.scenes.find(s => s.id === sceneId);
      const layer = scene?.layers.find(l => l.id === layerId);
      if (!layer) return null;

      // Center it on the canvas
      const cx = (doc.canvasWidth - layer.width) / 2;
      const cy = (doc.canvasHeight - layer.height) / 2;

      return op('updateLayer', {
        sceneId,
        layerId,
        updates: {
          transform: {
            ...layer.transform,
            x: cx,
            y: cy,
          },
        },
      });
    }

    case 'extend-duration': {
      // Find the layer
      const scene = doc.scenes.find(s => s.id === sceneId);
      const layer = scene?.layers.find(l => l.id === layerId);
      if (!scene || !layer) return null;

      const neededFrames = payload.neededFrames as number;
      
      // If the scene itself needs to be extended to accommodate the layer
      const minSceneDuration = layer.startFrame + neededFrames;
      
      return op('updateLayer', {
        sceneId,
        layerId,
        updates: {
          durationFrames: neededFrames,
        },
      });
      // A more robust fixer might return multiple operations (a batch) 
      // to extend the scene as well if minSceneDuration > scene.durationFrames
    }

    default:
      console.warn(`No fixer implemented for fix type: ${fixType}`);
      return null;
  }
}
