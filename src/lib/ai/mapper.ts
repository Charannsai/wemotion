import { newId } from '@/lib/ids';
import type { AiDocumentPlanSchema } from './schema';
import type { Document, Scene, Layer } from '@/lib/scene-graph/schema';

export function mapAiPlanToDocument(plan: AiDocumentPlanSchema): Document {
  return {
    version: 1,
    canvasWidth: plan.canvasWidth,
    canvasHeight: plan.canvasHeight,
    fps: plan.fps,
    scenes: plan.scenes.map((scenePlan, sIdx) => {
      const scene: Scene = {
        id: scenePlan.id || newId('scene'),
        name: scenePlan.name,
        order: sIdx,
        durationFrames: scenePlan.durationFrames,
        backgroundColor: scenePlan.backgroundColor || '#ffffff',
        transition: {
          type: 'none',
          durationFrames: 15,
          easing: 'easeInOut',
          direction: 'left',
        },
        layers: scenePlan.layers.map((layerPlan, lIdx) => {
          const layerId = layerPlan.id || newId('layer');
          
          const layer: Layer = {
            id: layerId,
            name: layerPlan.name,
            kind: layerPlan.kind,
            parentId: null,
            order: lIdx,
            visible: true,
            locked: false,
            opacity: 1,
            blendMode: 'normal',
            transform: {
              x: layerPlan.x || 0,
              y: layerPlan.y || 0,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              anchorX: 0.5,
              anchorY: 0.5,
              skewX: 0,
              skewY: 0,
            },
            width: layerPlan.width || 200,
            height: layerPlan.height || 100,
            startFrame: layerPlan.startFrame || 0,
            durationFrames: layerPlan.durationFrames || 90,
            tracks: [],
            entryMotion: layerPlan.entryMotion,
            exitMotion: layerPlan.exitMotion,
          };

          if (layerPlan.kind === 'text') {
            layer.text = {
              content: layerPlan.textContent || '',
              style: {
                fontFamily: 'Inter',
                fontSize: 60,
                fontWeight: 400,
                lineHeight: 1.4,
                letterSpacing: 0,
                color: scenePlan.backgroundColor === '#ffffff' ? '#000000' : '#ffffff',
                align: 'center',
                italic: false,
                underline: false,
                uppercase: false,
              }
            };
          } else if (layerPlan.kind === 'image' || layerPlan.kind === 'video') {
            layer.image = {
              assetId: null,
              src: layerPlan.imageSrc || '',
              fit: 'cover'
            };
          } else if (layerPlan.kind === 'shape') {
            layer.shape = {
              shapeType: 'rectangle',
              sides: 6
            };
            layer.fill = { color: scenePlan.backgroundColor === '#ffffff' ? '#18181b' : '#fafafa', opacity: 1 };
          } else if (layerPlan.kind === 'cursor') {
            layer.cursor = {
              cursorStyle: 'default',
              clickAnimation: false,
              targetX: layerPlan.targetX,
              targetY: layerPlan.targetY
            };
            
            // Auto-generate keyframe tracks to move the cursor from start (x,y) to target (targetX,targetY)
            if (layerPlan.targetX !== undefined && layerPlan.targetY !== undefined) {
              const moveDuration = Math.min(60, layerPlan.durationFrames - 10);
              layer.tracks.push({
                property: 'transform.x',
                keyframes: [
                  { frame: 0, value: layerPlan.x, easing: 'easeInOut' },
                  { frame: moveDuration, value: layerPlan.targetX, easing: 'easeInOut' }
                ]
              });
              layer.tracks.push({
                property: 'transform.y',
                keyframes: [
                  { frame: 0, value: layerPlan.y, easing: 'easeInOut' },
                  { frame: moveDuration, value: layerPlan.targetY, easing: 'easeInOut' }
                ]
              });
            }
          } else if (layerPlan.kind === 'browser') {
            layer.browser = {
              urlBarText: layerPlan.urlBarText || 'example.com',
              theme: scenePlan.backgroundColor === '#ffffff' ? 'light' : 'dark'
            };
          }

          return layer;
        }),
        narration: scenePlan.voiceoverScript ? {
          text: scenePlan.voiceoverScript,
          voiceover: true
        } : undefined,
        notes: ''
      };
      return scene;
    }),
    meta: {
      generatedByAi: true,
      title: plan.title
    }
  };
}
