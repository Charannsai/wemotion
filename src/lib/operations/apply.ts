/**
 * Apply an operation to a document, returning a new (immutable) document.
 *
 * All mutations go through this function — neither the editor nor the AI
 * pipeline ever mutate the document directly.
 */
import type { Document, Scene, Layer } from '@/lib/scene-graph/schema';
import type { Operation, OperationKind, PayloadMap } from './types';

/**
 * Apply an operation to a document.
 * Returns a new document (the original is never mutated).
 */
export function applyOperation(doc: Document, operation: Operation): Document {
  switch (operation.kind) {
    case 'addScene':
      return applyAddScene(doc, operation.payload as PayloadMap['addScene']);
    case 'removeScene':
      return applyRemoveScene(doc, operation.payload as PayloadMap['removeScene']);
    case 'reorderScene':
      return applyReorderScene(doc, operation.payload as PayloadMap['reorderScene']);
    case 'updateScene':
      return applyUpdateScene(doc, operation.payload as PayloadMap['updateScene']);
    case 'addLayer':
      return applyAddLayer(doc, operation.payload as PayloadMap['addLayer']);
    case 'removeLayer':
      return applyRemoveLayer(doc, operation.payload as PayloadMap['removeLayer']);
    case 'reorderLayer':
      return applyReorderLayer(doc, operation.payload as PayloadMap['reorderLayer']);
    case 'updateLayer':
      return applyUpdateLayer(doc, operation.payload as PayloadMap['updateLayer']);
    case 'updateProperty':
      return applyUpdateProperty(doc, operation.payload as PayloadMap['updateProperty']);
    case 'reparentLayer':
      return applyReparentLayer(doc, operation.payload as PayloadMap['reparentLayer']);
    case 'addKeyframe':
      return applyAddKeyframe(doc, operation.payload as PayloadMap['addKeyframe']);
    case 'removeKeyframe':
      return applyRemoveKeyframe(doc, operation.payload as PayloadMap['removeKeyframe']);
    case 'updateKeyframe':
      return applyUpdateKeyframe(doc, operation.payload as PayloadMap['updateKeyframe']);
    case 'updateDocument':
      return applyUpdateDocument(doc, operation.payload as PayloadMap['updateDocument']);
    case 'setMotion':
      return applySetMotion(doc, operation.payload as PayloadMap['setMotion']);
    default:
      throw new Error(`Unknown operation kind: ${operation.kind}`);
  }
}

// ---------------------------------------------------------------------------
// Scene operations
// ---------------------------------------------------------------------------

function applyAddScene(doc: Document, p: PayloadMap['addScene']): Document {
  const scenes = [...doc.scenes];
  const index = p.atIndex ?? scenes.length;
  scenes.splice(index, 0, p.scene);
  // Re-index orders
  scenes.forEach((s, i) => (s = { ...s, order: i }));
  return { ...doc, scenes };
}

function applyRemoveScene(doc: Document, p: PayloadMap['removeScene']): Document {
  return { ...doc, scenes: doc.scenes.filter((s) => s.id !== p.sceneId) };
}

function applyReorderScene(doc: Document, p: PayloadMap['reorderScene']): Document {
  const scenes = doc.scenes.filter((s) => s.id !== p.sceneId);
  const scene = doc.scenes.find((s) => s.id === p.sceneId);
  if (!scene) return doc;
  scenes.splice(p.newIndex, 0, scene);
  return { ...doc, scenes: scenes.map((s, i) => ({ ...s, order: i })) };
}

function applyUpdateScene(doc: Document, p: PayloadMap['updateScene']): Document {
  return {
    ...doc,
    scenes: doc.scenes.map((s) =>
      s.id === p.sceneId ? { ...s, ...p.updates } : s,
    ),
  };
}

// ---------------------------------------------------------------------------
// Layer operations
// ---------------------------------------------------------------------------

function mapScene(doc: Document, sceneId: string, fn: (s: Scene) => Scene): Document {
  return { ...doc, scenes: doc.scenes.map((s) => (s.id === sceneId ? fn(s) : s)) };
}

function mapLayer(scene: Scene, layerId: string, fn: (l: Layer) => Layer): Scene {
  return { ...scene, layers: scene.layers.map((l) => (l.id === layerId ? fn(l) : l)) };
}

function applyAddLayer(doc: Document, p: PayloadMap['addLayer']): Document {
  return mapScene(doc, p.sceneId, (s) => {
    const layers = [...s.layers];
    const index = p.atIndex ?? layers.length;
    layers.splice(index, 0, p.layer);
    return { ...s, layers };
  });
}

function applyRemoveLayer(doc: Document, p: PayloadMap['removeLayer']): Document {
  return mapScene(doc, p.sceneId, (s) => ({
    ...s,
    layers: s.layers.filter((l) => l.id !== p.layerId && l.parentId !== p.layerId),
  }));
}

function applyReorderLayer(doc: Document, p: PayloadMap['reorderLayer']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) => ({ ...l, order: p.newOrder })),
  );
}

function applyUpdateLayer(doc: Document, p: PayloadMap['updateLayer']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) => ({ ...l, ...p.updates })),
  );
}

function applyUpdateProperty(doc: Document, p: PayloadMap['updateProperty']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) => setNestedValue(l, p.path, p.value)),
  );
}

function applyReparentLayer(doc: Document, p: PayloadMap['reparentLayer']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) => ({
      ...l,
      parentId: p.newParentId,
      order: p.newOrder,
    })),
  );
}

function applySetMotion(doc: Document, p: PayloadMap['setMotion']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) =>
      p.type === 'entry'
        ? { ...l, entryMotion: p.motion }
        : { ...l, exitMotion: p.motion },
    ),
  );
}

// ---------------------------------------------------------------------------
// Keyframe operations
// ---------------------------------------------------------------------------

function applyAddKeyframe(doc: Document, p: PayloadMap['addKeyframe']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) => {
      const tracks = [...l.tracks];
      let trackIdx = tracks.findIndex((t) => t.property === p.property);
      if (trackIdx < 0) {
        tracks.push({ property: p.property, keyframes: [] });
        trackIdx = tracks.length - 1;
      }
      const track = { ...tracks[trackIdx]!, keyframes: [...tracks[trackIdx]!.keyframes] };
      track.keyframes.push({ frame: p.frame, value: p.value, easing: p.easing as any });
      track.keyframes.sort((a, b) => a.frame - b.frame);
      tracks[trackIdx] = track;
      return { ...l, tracks };
    }),
  );
}

function applyRemoveKeyframe(doc: Document, p: PayloadMap['removeKeyframe']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) => {
      const tracks = l.tracks.map((t) => {
        if (t.property !== p.property) return t;
        return { ...t, keyframes: t.keyframes.filter((kf) => kf.frame !== p.frame) };
      }).filter((t) => t.keyframes.length > 0);
      return { ...l, tracks };
    }),
  );
}

function applyUpdateKeyframe(doc: Document, p: PayloadMap['updateKeyframe']): Document {
  return mapScene(doc, p.sceneId, (s) =>
    mapLayer(s, p.layerId, (l) => {
      const tracks = l.tracks.map((t) => {
        if (t.property !== p.property) return t;
        return {
          ...t,
          keyframes: t.keyframes.map((kf) => {
            if (kf.frame !== p.frame) return kf;
            return {
              ...kf,
              ...(p.value !== undefined ? { value: p.value } : {}),
              ...(p.easing !== undefined ? { easing: p.easing as any } : {}),
            };
          }),
        };
      });
      return { ...l, tracks };
    }),
  );
}

// ---------------------------------------------------------------------------
// Document-level operations
// ---------------------------------------------------------------------------

function applyUpdateDocument(doc: Document, p: PayloadMap['updateDocument']): Document {
  return { ...doc, ...p.updates };
}

// ---------------------------------------------------------------------------
// Utility: set a nested value by dot-path
// ---------------------------------------------------------------------------

function setNestedValue<T extends Record<string, any>>(obj: T, path: string, value: unknown): T {
  const parts = path.split('.');
  if (parts.length === 1) {
    return { ...obj, [parts[0]!]: value };
  }

  const [head, ...rest] = parts;
  const child = obj[head!];
  if (child && typeof child === 'object') {
    return { ...obj, [head!]: setNestedValue(child, rest.join('.'), value) };
  }
  return obj;
}
