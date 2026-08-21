/**
 * Operation types — the discriminated union of all scene-graph mutations.
 *
 * Every edit is expressed as an Operation that can be applied, inverted, and
 * persisted. This is the substrate for undo/redo, AI rollback, and the audit
 * trail.
 */
import { z } from 'zod';
import { LayerSchema, SceneSchema } from '@/lib/scene-graph/schema';

// ---------------------------------------------------------------------------
// Operation kinds
// ---------------------------------------------------------------------------

export const OPERATION_KINDS = [
  'addScene',
  'removeScene',
  'reorderScene',
  'updateScene',
  'addLayer',
  'removeLayer',
  'reorderLayer',
  'updateLayer',
  'updateProperty',
  'reparentLayer',
  'addKeyframe',
  'removeKeyframe',
  'updateKeyframe',
  'updateDocument',
  'setMotion',
] as const;

export type OperationKind = (typeof OPERATION_KINDS)[number];

// ---------------------------------------------------------------------------
// Payload schemas (each kind has its own payload shape)
// ---------------------------------------------------------------------------

export const AddScenePayload = z.object({
  scene: SceneSchema,
  atIndex: z.number().int().nonnegative().optional(),
});

export const RemoveScenePayload = z.object({
  sceneId: z.string(),
});

export const ReorderScenePayload = z.object({
  sceneId: z.string(),
  newIndex: z.number().int().nonnegative(),
});

export const UpdateScenePayload = z.object({
  sceneId: z.string(),
  updates: z.record(z.unknown()),
});

export const AddLayerPayload = z.object({
  sceneId: z.string(),
  layer: LayerSchema,
  atIndex: z.number().int().nonnegative().optional(),
});

export const RemoveLayerPayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
});

export const ReorderLayerPayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  newOrder: z.number().int(),
});

export const UpdateLayerPayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  updates: z.record(z.unknown()),
});

export const UpdatePropertyPayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  /** Dot-path to the property, e.g. "transform.x" or "text.style.fontSize". */
  path: z.string(),
  value: z.unknown(),
});

export const ReparentLayerPayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  newParentId: z.string().nullable(),
  newOrder: z.number().int(),
});

export const AddKeyframePayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  property: z.string(),
  frame: z.number().int().nonnegative(),
  value: z.unknown(),
  easing: z.string().or(z.tuple([z.number(), z.number(), z.number(), z.number()])).default('easeInOut'),
});

export const RemoveKeyframePayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  property: z.string(),
  frame: z.number().int().nonnegative(),
});

export const UpdateKeyframePayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  property: z.string(),
  frame: z.number().int().nonnegative(),
  value: z.unknown().optional(),
  easing: z.string().or(z.tuple([z.number(), z.number(), z.number(), z.number()])).optional(),
});

export const UpdateDocumentPayload = z.object({
  updates: z.record(z.unknown()),
});

export const SetMotionPayload = z.object({
  sceneId: z.string(),
  layerId: z.string(),
  type: z.enum(['entry', 'exit']),
  motion: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// Operation
// ---------------------------------------------------------------------------

export interface Operation<K extends OperationKind = OperationKind> {
  kind: K;
  payload: unknown;
}

/** Payload type mapping for type-safe access. */
export type PayloadMap = {
  addScene: z.infer<typeof AddScenePayload>;
  removeScene: z.infer<typeof RemoveScenePayload>;
  reorderScene: z.infer<typeof ReorderScenePayload>;
  updateScene: z.infer<typeof UpdateScenePayload>;
  addLayer: z.infer<typeof AddLayerPayload>;
  removeLayer: z.infer<typeof RemoveLayerPayload>;
  reorderLayer: z.infer<typeof ReorderLayerPayload>;
  updateLayer: z.infer<typeof UpdateLayerPayload>;
  updateProperty: z.infer<typeof UpdatePropertyPayload>;
  reparentLayer: z.infer<typeof ReparentLayerPayload>;
  addKeyframe: z.infer<typeof AddKeyframePayload>;
  removeKeyframe: z.infer<typeof RemoveKeyframePayload>;
  updateKeyframe: z.infer<typeof UpdateKeyframePayload>;
  updateDocument: z.infer<typeof UpdateDocumentPayload>;
  setMotion: z.infer<typeof SetMotionPayload>;
};

/** Type-safe operation constructor. */
export function op<K extends OperationKind>(kind: K, payload: PayloadMap[K]): Operation<K> {
  return { kind, payload };
}
