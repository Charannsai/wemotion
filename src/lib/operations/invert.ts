/**
 * Operation inversion — compute the inverse of an operation so it can be undone.
 *
 * Given a document and an operation that was (or will be) applied, returns
 * the inverse operation that, when applied, restores the document to its
 * previous state.
 */
import type { Document } from '@/lib/scene-graph/schema';
import type { Operation, PayloadMap } from './types';
import { findLayer, findScene } from '@/lib/scene-graph/traverse';

/**
 * Compute the inverse of an operation against the current document state.
 * Must be called BEFORE applying the operation.
 */
export function invertOperation(doc: Document, operation: Operation): Operation {
  switch (operation.kind) {
    case 'addScene': {
      const p = operation.payload as PayloadMap['addScene'];
      return { kind: 'removeScene', payload: { sceneId: p.scene.id } };
    }

    case 'removeScene': {
      const p = operation.payload as PayloadMap['removeScene'];
      const scene = findScene(doc, p.sceneId);
      const index = doc.scenes.findIndex((s) => s.id === p.sceneId);
      if (!scene) throw new Error(`Cannot invert removeScene: scene ${p.sceneId} not found`);
      return { kind: 'addScene', payload: { scene, atIndex: index } };
    }

    case 'reorderScene': {
      const p = operation.payload as PayloadMap['reorderScene'];
      const oldIndex = doc.scenes.findIndex((s) => s.id === p.sceneId);
      return { kind: 'reorderScene', payload: { sceneId: p.sceneId, newIndex: oldIndex } };
    }

    case 'updateScene': {
      const p = operation.payload as PayloadMap['updateScene'];
      const scene = findScene(doc, p.sceneId);
      if (!scene) throw new Error(`Cannot invert updateScene: scene ${p.sceneId} not found`);
      const oldValues: Record<string, unknown> = {};
      for (const key of Object.keys(p.updates)) {
        oldValues[key] = (scene as any)[key];
      }
      return { kind: 'updateScene', payload: { sceneId: p.sceneId, updates: oldValues } };
    }

    case 'addLayer': {
      const p = operation.payload as PayloadMap['addLayer'];
      return { kind: 'removeLayer', payload: { sceneId: p.sceneId, layerId: p.layer.id } };
    }

    case 'removeLayer': {
      const p = operation.payload as PayloadMap['removeLayer'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert removeLayer: layer ${p.layerId} not found`);
      const index = result.scene.layers.findIndex((l) => l.id === p.layerId);
      return { kind: 'addLayer', payload: { sceneId: p.sceneId, layer: result.layer, atIndex: index } };
    }

    case 'reorderLayer': {
      const p = operation.payload as PayloadMap['reorderLayer'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert reorderLayer: layer ${p.layerId} not found`);
      return { kind: 'reorderLayer', payload: { sceneId: p.sceneId, layerId: p.layerId, newOrder: result.layer.order } };
    }

    case 'updateLayer': {
      const p = operation.payload as PayloadMap['updateLayer'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert updateLayer: layer ${p.layerId} not found`);
      const oldValues: Record<string, unknown> = {};
      for (const key of Object.keys(p.updates)) {
        oldValues[key] = (result.layer as any)[key];
      }
      return { kind: 'updateLayer', payload: { sceneId: p.sceneId, layerId: p.layerId, updates: oldValues } };
    }

    case 'updateProperty': {
      const p = operation.payload as PayloadMap['updateProperty'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert updateProperty: layer ${p.layerId} not found`);
      const oldValue = getNestedValue(result.layer, p.path);
      return { kind: 'updateProperty', payload: { sceneId: p.sceneId, layerId: p.layerId, path: p.path, value: oldValue } };
    }

    case 'reparentLayer': {
      const p = operation.payload as PayloadMap['reparentLayer'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert reparentLayer: layer ${p.layerId} not found`);
      return {
        kind: 'reparentLayer',
        payload: { sceneId: p.sceneId, layerId: p.layerId, newParentId: result.layer.parentId, newOrder: result.layer.order },
      };
    }

    case 'addKeyframe': {
      const p = operation.payload as PayloadMap['addKeyframe'];
      return { kind: 'removeKeyframe', payload: { sceneId: p.sceneId, layerId: p.layerId, property: p.property, frame: p.frame } };
    }

    case 'removeKeyframe': {
      const p = operation.payload as PayloadMap['removeKeyframe'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert removeKeyframe: layer ${p.layerId} not found`);
      const track = result.layer.tracks.find((t) => t.property === p.property);
      const kf = track?.keyframes.find((k) => k.frame === p.frame);
      if (!kf) throw new Error(`Cannot invert removeKeyframe: keyframe not found`);
      return { kind: 'addKeyframe', payload: { sceneId: p.sceneId, layerId: p.layerId, property: p.property, frame: kf.frame, value: kf.value, easing: kf.easing } };
    }

    case 'updateKeyframe': {
      const p = operation.payload as PayloadMap['updateKeyframe'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert updateKeyframe: layer ${p.layerId} not found`);
      const track = result.layer.tracks.find((t) => t.property === p.property);
      const kf = track?.keyframes.find((k) => k.frame === p.frame);
      if (!kf) throw new Error(`Cannot invert updateKeyframe: keyframe not found`);
      return { kind: 'updateKeyframe', payload: { sceneId: p.sceneId, layerId: p.layerId, property: p.property, frame: p.frame, value: kf.value, easing: kf.easing } };
    }

    case 'updateDocument': {
      const p = operation.payload as PayloadMap['updateDocument'];
      const oldValues: Record<string, unknown> = {};
      for (const key of Object.keys(p.updates)) {
        oldValues[key] = (doc as any)[key];
      }
      return { kind: 'updateDocument', payload: { updates: oldValues } };
    }

    case 'setMotion': {
      const p = operation.payload as PayloadMap['setMotion'];
      const result = findLayer(doc, p.layerId);
      if (!result) throw new Error(`Cannot invert setMotion: layer ${p.layerId} not found`);
      const oldMotion = p.type === 'entry' ? result.layer.entryMotion : result.layer.exitMotion;
      return { kind: 'setMotion', payload: { sceneId: p.sceneId, layerId: p.layerId, type: p.type, motion: oldMotion } };
    }

    default:
      throw new Error(`Cannot invert unknown operation kind: ${operation.kind}`);
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function getNestedValue(obj: Record<string, any>, path: string): unknown {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}
