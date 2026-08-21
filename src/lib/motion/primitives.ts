/**
 * Primitive motion registry.
 *
 * Each primitive is a factory that generates keyframe tracks for a layer
 * based on a MotionDescriptor. The registry maps primitive names to their
 * factory functions.
 */
import type { KeyframeTrack } from '@/lib/scene-graph/schema';
import type { MotionDescriptor } from './tokens';
import { intensityValues } from './tokens';

type PrimitiveFactory = (desc: MotionDescriptor, isExit: boolean) => KeyframeTrack[];

const registry = new Map<string, PrimitiveFactory>();

// ---------------------------------------------------------------------------
// Core primitives
// ---------------------------------------------------------------------------

function registerPrimitive(name: string, factory: PrimitiveFactory) {
  registry.set(name, factory);
}

// Fade
registerPrimitive('fadeIn', (desc, isExit) => {
  const dur = desc.durationFrames;
  return [
    {
      property: 'opacity',
      keyframes: isExit
        ? [
            { frame: 0, value: 1, easing: 'easeIn' },
            { frame: dur, value: 0, easing: 'easeIn' },
          ]
        : [
            { frame: 0, value: 0, easing: 'easeOut' },
            { frame: dur, value: 1, easing: 'easeOut' },
          ],
    },
  ];
});

// Slide (horizontal / vertical)
registerPrimitive('slideUp', (desc, isExit) => {
  const vals = intensityValues(desc.intensity);
  const dur = desc.durationFrames;
  const offset = vals.translatePx;
  return [
    {
      property: 'transform.y',
      keyframes: isExit
        ? [
            { frame: 0, value: 0, easing: 'easeIn' },
            { frame: dur, value: -offset, easing: 'easeIn' },
          ]
        : [
            { frame: 0, value: offset, easing: 'emphasizedDecelerate' },
            { frame: dur, value: 0, easing: 'emphasizedDecelerate' },
          ],
    },
    {
      property: 'opacity',
      keyframes: isExit
        ? [
            { frame: 0, value: 1, easing: 'easeIn' },
            { frame: dur, value: 0, easing: 'easeIn' },
          ]
        : [
            { frame: 0, value: 0, easing: 'easeOut' },
            { frame: Math.round(dur * 0.6), value: 1, easing: 'easeOut' },
          ],
    },
  ];
});

registerPrimitive('slideDown', (desc, isExit) => {
  const vals = intensityValues(desc.intensity);
  const dur = desc.durationFrames;
  const offset = vals.translatePx;
  return [
    {
      property: 'transform.y',
      keyframes: isExit
        ? [{ frame: 0, value: 0, easing: 'easeIn' }, { frame: dur, value: offset, easing: 'easeIn' }]
        : [{ frame: 0, value: -offset, easing: 'emphasizedDecelerate' }, { frame: dur, value: 0, easing: 'emphasizedDecelerate' }],
    },
    {
      property: 'opacity',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0, easing: 'easeIn' }]
        : [{ frame: 0, value: 0, easing: 'easeOut' }, { frame: Math.round(dur * 0.6), value: 1, easing: 'easeOut' }],
    },
  ];
});

registerPrimitive('slideLeft', (desc, isExit) => {
  const vals = intensityValues(desc.intensity);
  const dur = desc.durationFrames;
  const offset = vals.translatePx;
  return [
    {
      property: 'transform.x',
      keyframes: isExit
        ? [{ frame: 0, value: 0, easing: 'easeIn' }, { frame: dur, value: -offset, easing: 'easeIn' }]
        : [{ frame: 0, value: offset, easing: 'emphasizedDecelerate' }, { frame: dur, value: 0, easing: 'emphasizedDecelerate' }],
    },
    {
      property: 'opacity',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0, easing: 'easeIn' }]
        : [{ frame: 0, value: 0, easing: 'easeOut' }, { frame: Math.round(dur * 0.6), value: 1, easing: 'easeOut' }],
    },
  ];
});

registerPrimitive('slideRight', (desc, isExit) => {
  const vals = intensityValues(desc.intensity);
  const dur = desc.durationFrames;
  const offset = vals.translatePx;
  return [
    {
      property: 'transform.x',
      keyframes: isExit
        ? [{ frame: 0, value: 0, easing: 'easeIn' }, { frame: dur, value: offset, easing: 'easeIn' }]
        : [{ frame: 0, value: -offset, easing: 'emphasizedDecelerate' }, { frame: dur, value: 0, easing: 'emphasizedDecelerate' }],
    },
    {
      property: 'opacity',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0, easing: 'easeIn' }]
        : [{ frame: 0, value: 0, easing: 'easeOut' }, { frame: Math.round(dur * 0.6), value: 1, easing: 'easeOut' }],
    },
  ];
});

// Scale
registerPrimitive('scaleIn', (desc, isExit) => {
  const vals = intensityValues(desc.intensity);
  const dur = desc.durationFrames;
  const scaleDelta = vals.scaleDelta;
  return [
    {
      property: 'transform.scaleX',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 1 - scaleDelta, easing: 'easeIn' }]
        : [{ frame: 0, value: 1 - scaleDelta, easing: 'overshoot' }, { frame: dur, value: 1, easing: 'overshoot' }],
    },
    {
      property: 'transform.scaleY',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 1 - scaleDelta, easing: 'easeIn' }]
        : [{ frame: 0, value: 1 - scaleDelta, easing: 'overshoot' }, { frame: dur, value: 1, easing: 'overshoot' }],
    },
    {
      property: 'opacity',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0, easing: 'easeIn' }]
        : [{ frame: 0, value: 0, easing: 'easeOut' }, { frame: Math.round(dur * 0.5), value: 1, easing: 'easeOut' }],
    },
  ];
});

// Pop
registerPrimitive('popIn', (desc, isExit) => {
  const dur = desc.durationFrames;
  return [
    {
      property: 'transform.scaleX',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0.5, easing: 'easeIn' }]
        : [{ frame: 0, value: 0.5, easing: 'overshoot' }, { frame: dur, value: 1, easing: 'overshoot' }],
    },
    {
      property: 'transform.scaleY',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0.5, easing: 'easeIn' }]
        : [{ frame: 0, value: 0.5, easing: 'overshoot' }, { frame: dur, value: 1, easing: 'overshoot' }],
    },
    {
      property: 'opacity',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0, easing: 'easeIn' }]
        : [{ frame: 0, value: 0, easing: 'easeOut' }, { frame: Math.round(dur * 0.4), value: 1, easing: 'easeOut' }],
    },
  ];
});

// Blur
registerPrimitive('blurIn', (desc, isExit) => {
  const dur = desc.durationFrames;
  return [
    {
      property: 'opacity',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0, easing: 'easeIn' }]
        : [{ frame: 0, value: 0, easing: 'easeOut' }, { frame: dur, value: 1, easing: 'easeOut' }],
    },
    {
      property: 'filter.blur',
      keyframes: isExit
        ? [{ frame: 0, value: 0, easing: 'easeIn' }, { frame: dur, value: 12, easing: 'easeIn' }]
        : [{ frame: 0, value: 12, easing: 'easeOut' }, { frame: dur, value: 0, easing: 'easeOut' }],
    },
  ];
});

// Spring Pop
registerPrimitive('springPop', (desc, isExit) => {
  const dur = desc.durationFrames;
  return [
    {
      property: 'transform.scaleX',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0.8, easing: 'easeIn' }]
        : [{ frame: 0, value: 0.8, easing: 'overshoot' }, { frame: dur, value: 1, easing: 'overshoot' }],
    },
    {
      property: 'transform.scaleY',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0.8, easing: 'easeIn' }]
        : [{ frame: 0, value: 0.8, easing: 'overshoot' }, { frame: dur, value: 1, easing: 'overshoot' }],
    },
    {
      property: 'transform.y',
      keyframes: isExit
        ? [{ frame: 0, value: 0, easing: 'easeIn' }, { frame: dur, value: 12, easing: 'easeIn' }]
        : [{ frame: 0, value: 12, easing: 'overshoot' }, { frame: dur, value: 0, easing: 'overshoot' }],
    },
    {
      property: 'opacity',
      keyframes: isExit
        ? [{ frame: 0, value: 1, easing: 'easeIn' }, { frame: dur, value: 0, easing: 'easeIn' }]
        : [{ frame: 0, value: 0, easing: 'easeOut' }, { frame: Math.round(dur * 0.3), value: 1, easing: 'easeOut' }],
    },
  ];
});

// Cursor Click (simulates a quick press)
registerPrimitive('cursorClick', (desc, isExit) => {
  const dur = desc.durationFrames; // Should be short, e.g. 10 frames
  if (isExit) return []; // Clicks are usually discrete events, not exits
  
  const downFrame = Math.max(2, Math.round(dur * 0.3));
  return [
    {
      property: 'transform.scaleX',
      keyframes: [
        { frame: 0, value: 1, easing: 'easeOut' },
        { frame: downFrame, value: 0.85, easing: 'easeIn' },
        { frame: dur, value: 1, easing: 'overshoot' }
      ],
    },
    {
      property: 'transform.scaleY',
      keyframes: [
        { frame: 0, value: 1, easing: 'easeOut' },
        { frame: downFrame, value: 0.85, easing: 'easeIn' },
        { frame: dur, value: 1, easing: 'overshoot' }
      ],
    },
  ];
});

// Typewriter
registerPrimitive('typewriterIn', (desc, isExit) => {
  const dur = desc.durationFrames;
  if (isExit) {
    return [
      {
        property: 'opacity',
        keyframes: [
          { frame: 0, value: 1, easing: 'linear' },
          { frame: dur, value: 0, easing: 'linear' }
        ]
      }
    ];
  }
  
  return [
    {
      property: 'textProgress', // Handled specially by TextRenderer
      keyframes: [
        { frame: 0, value: 0, easing: 'linear' },
        { frame: dur, value: 1, easing: 'linear' }
      ]
    }
  ];
});

// None (no motion)
registerPrimitive('none', () => []);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get a primitive factory by name. Falls back to fadeIn. */
export function getPrimitive(name: string): PrimitiveFactory {
  return registry.get(name) ?? registry.get('fadeIn')!;
}

/** Get all registered primitive names. */
export function listPrimitives(): string[] {
  return [...registry.keys()];
}

/** Generate keyframe tracks for a motion descriptor. */
export function generateMotionTracks(desc: MotionDescriptor, isExit: boolean): KeyframeTrack[] {
  const factory = getPrimitive(desc.primitive);
  return factory(desc, isExit);
}
