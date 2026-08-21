/**
 * Pre-apply validation for operations.
 */
import type { Document } from '@/lib/scene-graph/schema';
import type { Operation, PayloadMap } from './types';
import { findLayer, findScene } from '@/lib/scene-graph/traverse';

export interface ValidationError {
  message: string;
  path?: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

/**
 * Validate an operation against the current document state.
 * Returns errors if the operation would leave the document in an invalid state.
 */
export function validateOperation(doc: Document, operation: Operation): ValidationResult {
  const errors: ValidationError[] = [];

  switch (operation.kind) {
    case 'addScene': {
      const p = operation.payload as PayloadMap['addScene'];
      if (!p.scene.id) errors.push({ message: 'Scene ID is required' });
      if (findScene(doc, p.scene.id)) errors.push({ message: `Scene ${p.scene.id} already exists` });
      break;
    }

    case 'removeScene': {
      const p = operation.payload as PayloadMap['removeScene'];
      if (!findScene(doc, p.sceneId)) errors.push({ message: `Scene ${p.sceneId} not found` });
      break;
    }

    case 'reorderScene': {
      const p = operation.payload as PayloadMap['reorderScene'];
      if (!findScene(doc, p.sceneId)) errors.push({ message: `Scene ${p.sceneId} not found` });
      if (p.newIndex < 0 || p.newIndex > doc.scenes.length) {
        errors.push({ message: `Index ${p.newIndex} out of range` });
      }
      break;
    }

    case 'updateScene': {
      const p = operation.payload as PayloadMap['updateScene'];
      if (!findScene(doc, p.sceneId)) errors.push({ message: `Scene ${p.sceneId} not found` });
      break;
    }

    case 'addLayer': {
      const p = operation.payload as PayloadMap['addLayer'];
      if (!findScene(doc, p.sceneId)) errors.push({ message: `Scene ${p.sceneId} not found` });
      if (!p.layer.id) errors.push({ message: 'Layer ID is required' });
      if (findLayer(doc, p.layer.id)) errors.push({ message: `Layer ${p.layer.id} already exists` });
      break;
    }

    case 'removeLayer': {
      const p = operation.payload as PayloadMap['removeLayer'];
      if (!findLayer(doc, p.layerId)) errors.push({ message: `Layer ${p.layerId} not found` });
      break;
    }

    case 'updateLayer':
    case 'updateProperty':
    case 'reorderLayer':
    case 'reparentLayer':
    case 'setMotion': {
      const p = operation.payload as { sceneId: string; layerId: string };
      if (!findScene(doc, p.sceneId)) errors.push({ message: `Scene ${p.sceneId} not found` });
      if (!findLayer(doc, p.layerId)) errors.push({ message: `Layer ${p.layerId} not found` });
      break;
    }

    case 'addKeyframe':
    case 'removeKeyframe':
    case 'updateKeyframe': {
      const p = operation.payload as { sceneId: string; layerId: string; property: string };
      if (!findLayer(doc, p.layerId)) errors.push({ message: `Layer ${p.layerId} not found` });
      if (!p.property) errors.push({ message: 'Property path is required' });
      break;
    }

    case 'updateDocument':
      // Document-level updates are always structurally valid
      break;

    default:
      errors.push({ message: `Unknown operation kind: ${operation.kind}` });
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
