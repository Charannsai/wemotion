/**
 * Template Applicator
 *
 * Provides logic to take a base Template and a map of content, and
 * returns a new instantiated Document.
 */
import type { Template } from './types';
import type { Document, Layer } from '@/lib/scene-graph/schema';

export interface TemplateContentMap {
  [slotId: string]: string; // URL for image slots, text string for text slots
}

export function applyTemplate(template: Template, content: TemplateContentMap): Document {
  // Deep clone the document to prevent mutating the preset
  const doc: Document = JSON.parse(JSON.stringify(template.document));

  for (const scene of doc.scenes) {
    for (const layer of scene.layers) {
      const slot = template.slots.find(s => s.id === layer.id);
      if (slot && content[slot.id]) {
        applyContentToLayer(layer, slot.role, content[slot.id]!);
      }
    }
  }

  return doc;
}

function applyContentToLayer(layer: Layer, role: string, value: string) {
  if (layer.kind === 'text' && layer.text) {
    layer.text.content = value;
  } else if (layer.kind === 'image' && layer.image) {
    layer.image.src = value;
  } else if (layer.kind === 'video' && layer.video) {
    layer.video.src = value;
  }
}
