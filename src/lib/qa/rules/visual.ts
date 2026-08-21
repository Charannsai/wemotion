/**
 * Visual QA Rules
 *
 * Checks for aesthetics like legibility, contrast, and safe zones (crucial for TikTok/Reels).
 */
import type { QARule, QAViolation } from '../types';

export const tiktokSafeZoneRule: QARule = {
  id: 'visual/tiktok-safe-zone',
  name: 'TikTok Safe Zone',
  description: 'Important elements should avoid the edges of 9:16 canvases where UI overlays appear.',
  category: 'visual',
  evaluate: (doc, ctx) => {
    // Only applies if the canvas is 9:16 (mobile vertical) and targeting tiktok/reels
    if (doc.canvasWidth > doc.canvasHeight || ctx.constraints.targetPlatform !== 'tiktok') {
      return [];
    }

    const violations: QAViolation[] = [];
    // TikTok bottom safe zone roughly bottom 20% is UI
    const unsafeBottomY = doc.canvasHeight * 0.8;
    const unsafeRightX = doc.canvasWidth * 0.85;

    for (const scene of doc.scenes) {
      for (const layer of scene.layers) {
        if (!layer.visible || layer.kind === 'image' || layer.kind === 'video') continue;
        
        // We primarily care about text or actionable elements getting covered
        if (layer.kind === 'text') {
          const y = layer.transform.y;
          const x = layer.transform.x;
          
          if (y + layer.height > unsafeBottomY || x + layer.width > unsafeRightX) {
            violations.push({
              ruleId: 'visual/tiktok-safe-zone',
              severity: 'warning',
              message: `Text layer "${layer.name}" enters the TikTok UI overlay safe zone.`,
              context: { sceneId: scene.id, layerId: layer.id },
            });
          }
        }
      }
    }
    return violations;
  },
};

export const visualRules = [tiktokSafeZoneRule];
