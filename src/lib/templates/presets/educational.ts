/**
 * Educational Preset
 *
 * A horizontal template tailored for YouTube-style explainer videos.
 */
import type { Template } from '../types';
import { createDocument, createScene, createTextLayer } from '@/lib/scene-graph/defaults';
import { newId, ID_PREFIXES } from '@/lib/ids';

const titleId = newId(ID_PREFIXES.layer);
const bodyId = newId(ID_PREFIXES.layer);

export const educationalHorizontal: Template = {
  id: 'tmpl_edu_horiz_01',
  name: 'Educational Explainer',
  description: 'Clean, structured layout with space for body text and a title.',
  category: 'educational',
  format: 'horizontal',
  document: createDocument({
    canvasWidth: 1920,
    canvasHeight: 1080,
    fps: 30,
    scenes: [
      createScene({
        durationFrames: 150, // 5 seconds
        backgroundColor: '#F8FAFC', // Slate 50
        layers: [
          createTextLayer({
            id: titleId,
            text: {
              content: 'Topic Title',
              style: {
                fontFamily: 'Inter',
                fontSize: 80,
                fontWeight: 700,
                color: '#0F172A',
                align: 'left',
                lineHeight: 1.1,
                letterSpacing: -1,
                italic: false,
                underline: false,
                uppercase: false,
              }
            },
            width: 1720,
            height: 200,
            transform: { x: 100, y: 100, scaleX: 1, scaleY: 1 },
            entryMotion: 'slideUp:20:smooth',
          }),
          createTextLayer({
            id: bodyId,
            text: {
              content: 'Educational body content explaining the concept goes here. This text is meant to be read while a voiceover plays.',
              style: {
                fontFamily: 'Inter',
                fontSize: 48,
                fontWeight: 400,
                color: '#334155',
                align: 'left',
                lineHeight: 1.5,
                letterSpacing: 0,
                italic: false,
                underline: false,
                uppercase: false,
              }
            },
            width: 1720,
            height: 600,
            transform: { x: 100, y: 350, scaleX: 1, scaleY: 1 },
            startFrame: 15,
            entryMotion: 'fadeIn:20:smooth',
          })
        ]
      })
    ]
  }),
  slots: [
    { id: titleId, role: 'title', constraints: { maxLength: 60 } },
    { id: bodyId, role: 'body', constraints: { maxLength: 300 } },
  ]
};
