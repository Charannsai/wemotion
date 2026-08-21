/**
 * Structural QA Rules
 *
 * Checks for layout issues like elements extending completely outside the canvas,
 * empty scenes, or invalid nesting.
 */
import type { QARule, QAViolation } from '../types';

export const noEmptyScenesRule: QARule = {
  id: 'structural/no-empty-scenes',
  name: 'No Empty Scenes',
  description: 'Every scene must contain at least one visible layer.',
  category: 'structural',
  evaluate: (doc) => {
    const violations: QAViolation[] = [];
    for (const scene of doc.scenes) {
      const hasVisibleLayer = scene.layers.some((l) => l.visible);
      if (!hasVisibleLayer) {
        violations.push({
          ruleId: 'structural/no-empty-scenes',
          severity: 'error',
          message: `Scene "${scene.name}" has no visible layers.`,
          context: { sceneId: scene.id },
        });
      }
    }
    return violations;
  },
};

export const outOfBoundsRule: QARule = {
  id: 'structural/out-of-bounds',
  name: 'Elements Out of Bounds',
  description: 'Elements should not be positioned completely outside the canvas bounds.',
  category: 'structural',
  evaluate: (doc) => {
    const violations: QAViolation[] = [];
    for (const scene of doc.scenes) {
      for (const layer of scene.layers) {
        if (!layer.visible) continue;
        
        // Simplistic check using base static transform.
        // A true engine would evaluate at multiple frames to check animation bounds.
        const x = layer.transform.x;
        const y = layer.transform.y;
        const w = layer.width * layer.transform.scaleX;
        const h = layer.height * layer.transform.scaleY;

        // Check if completely outside
        if (
          x + w < 0 ||
          x > doc.canvasWidth ||
          y + h < 0 ||
          y > doc.canvasHeight
        ) {
          violations.push({
            ruleId: 'structural/out-of-bounds',
            severity: 'warning',
            message: `Layer "${layer.name}" is positioned completely outside the canvas.`,
            context: { sceneId: scene.id, layerId: layer.id },
            fix: { type: 'center-layer', payload: {} }
          });
        }
      }
    }
    return violations;
  },
};

export const structuralRules = [noEmptyScenesRule, outOfBoundsRule];
