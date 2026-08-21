/**
 * Marketing Preset
 *
 * A high-energy vertical template tailored for TikTok/Reels product marketing.
 */
import type { Template } from '../types';
import { createDocument, createScene, createTextLayer, createShapeLayer } from '@/lib/scene-graph/defaults';
import { newId, ID_PREFIXES } from '@/lib/ids';

const titleId = newId(ID_PREFIXES.layer);
const bgId = newId(ID_PREFIXES.layer);
const subtitleId = newId(ID_PREFIXES.layer);

export const marketingVertical: Template = {
  id: 'tmpl_marketing_vert_01',
  name: 'High Impact Vertical',
  description: 'Punchy text over a solid brand color. Great for TikTok ads.',
  category: 'marketing',
  format: 'vertical',
  document: createDocument({
    canvasWidth: 1080,
    canvasHeight: 1920,
    fps: 30,
    scenes: [
      createScene({
        durationFrames: 90,
        backgroundColor: '#111111',
        layers: [
          createShapeLayer({
            id: bgId,
            shape: { shapeType: 'rectangle' },
            fill: { color: '#FF3366', opacity: 1 },
            transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
            width: 1080,
            height: 1920,
            entryMotion: 'fadeIn:15:smooth',
          }),
          createTextLayer({
            id: titleId,
            text: {
              content: 'YOUR BIG HOOK',
              style: {
                fontFamily: 'Inter',
                fontSize: 120,
                fontWeight: 900,
                color: '#FFFFFF',
                align: 'center',
                lineHeight: 1.1,
                letterSpacing: -2,
                italic: false,
                underline: false,
                uppercase: true,
              }
            },
            width: 900,
            height: 400,
            transform: { x: 90, y: 500, scaleX: 1, scaleY: 1 },
            entryMotion: 'popIn:20:energetic',
          }),
          createTextLayer({
            id: subtitleId,
            text: {
              content: 'Subtext goes here',
              style: {
                fontFamily: 'Inter',
                fontSize: 60,
                fontWeight: 500,
                color: '#FFFFFF',
                align: 'center',
                lineHeight: 1.2,
                letterSpacing: 0,
                italic: false,
                underline: false,
                uppercase: false,
              }
            },
            width: 900,
            height: 200,
            transform: { x: 90, y: 900, scaleX: 1, scaleY: 1 },
            startFrame: 15,
            entryMotion: 'slideUp:15:smooth',
          })
        ]
      })
    ]
  }),
  slots: [
    { id: titleId, role: 'title', constraints: { maxLength: 30 } },
    { id: subtitleId, role: 'subtitle', constraints: { maxLength: 80 } },
  ]
};
