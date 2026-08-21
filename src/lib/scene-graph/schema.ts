/**
 * Scene graph schema — the canonical shape of a WeMotion document.
 *
 * This is the single source of truth for every scene-graph node.  The database
 * column `ProjectDocument.docJson` is a serialised instance of `DocumentSchema`
 * and this module is what validates it on read and on write.
 *
 * Rules:
 *   1. Every property that can be animated lives inside a `PropertySet`.
 *   2. Keyframes are stored per-property-path and evaluated by the motion engine.
 *   3. Layer trees are represented as a flat list with `parentId` pointers.
 *   4. All identifiers use the prefix convention from `@/lib/ids`.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export const ColorSchema = z.string().regex(/^#[0-9a-fA-F]{6,8}$/).or(z.string().startsWith('rgba('));

export const Vec2Schema = z.object({ x: z.number(), y: z.number() });
export type Vec2 = z.infer<typeof Vec2Schema>;

export const SizeSchema = z.object({ w: z.number().nonnegative(), h: z.number().nonnegative() });
export type Size = z.infer<typeof SizeSchema>;

export const RectSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().nonnegative(),
  h: z.number().nonnegative(),
});
export type Rect = z.infer<typeof RectSchema>;

// ---------------------------------------------------------------------------
// Easing / keyframes
// ---------------------------------------------------------------------------

export const EasingSchema = z.union([
  z.literal('linear'),
  z.literal('easeIn'),
  z.literal('easeOut'),
  z.literal('easeInOut'),
  z.literal('snappy'),
  z.literal('overshoot'),
  z.literal('emphasizedDecelerate'),
  z.literal('emphasizedAccelerate'),
  z.literal('power2Out'),
  z.literal('power3InOut'),
  z.tuple([z.number(), z.number(), z.number(), z.number()]), // custom bezier
]);
export type Easing = z.infer<typeof EasingSchema>;

export const KeyframeSchema = z.object({
  /** Frame offset from the layer's start (0-based). */
  frame: z.number().int().nonnegative(),
  /** The value at this frame — type depends on the property. */
  value: z.unknown(),
  /** Easing *out* of this keyframe to the next. */
  easing: EasingSchema.default('easeInOut'),
});
export type Keyframe = z.infer<typeof KeyframeSchema>;

export const KeyframeTrackSchema = z.object({
  /** Dot-path of the property being animated, e.g. "transform.x" or "opacity". */
  property: z.string(),
  keyframes: z.array(KeyframeSchema).min(1),
});
export type KeyframeTrack = z.infer<typeof KeyframeTrackSchema>;

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

export const TransformSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  scaleX: z.number().default(1),
  scaleY: z.number().default(1),
  rotation: z.number().default(0),       // degrees
  anchorX: z.number().default(0.5),      // 0..1 ratio
  anchorY: z.number().default(0.5),
  skewX: z.number().default(0),
  skewY: z.number().default(0),
});
export type Transform = z.infer<typeof TransformSchema>;

// ---------------------------------------------------------------------------
// Style properties
// ---------------------------------------------------------------------------

export const FillSchema = z.object({
  color: ColorSchema.default('#000000'),
  opacity: z.number().min(0).max(1).default(1),
});

export const StrokeSchema = z.object({
  color: ColorSchema.default('#000000'),
  width: z.number().nonnegative().default(0),
  opacity: z.number().min(0).max(1).default(1),
  dashArray: z.array(z.number()).default([]),
});

export const ShadowSchema = z.object({
  color: ColorSchema.default('rgba(0,0,0,0.2)'),
  offsetX: z.number().default(0),
  offsetY: z.number().default(4),
  blur: z.number().nonnegative().default(8),
  spread: z.number().default(0),
});

export const BorderRadiusSchema = z.object({
  tl: z.number().nonnegative().default(0),
  tr: z.number().nonnegative().default(0),
  br: z.number().nonnegative().default(0),
  bl: z.number().nonnegative().default(0),
});
export type BorderRadius = z.infer<typeof BorderRadiusSchema>;

// ---------------------------------------------------------------------------
// Text properties
// ---------------------------------------------------------------------------

export const TextAlignSchema = z.enum(['left', 'center', 'right', 'justify']);

export const TextStyleSchema = z.object({
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().default(16),
  fontWeight: z.number().default(400),
  lineHeight: z.number().default(1.4),
  letterSpacing: z.number().default(0),
  color: ColorSchema.default('#000000'),
  align: TextAlignSchema.default('left'),
  italic: z.boolean().default(false),
  underline: z.boolean().default(false),
  uppercase: z.boolean().default(false),
});
export type TextStyle = z.infer<typeof TextStyleSchema>;

// ---------------------------------------------------------------------------
// Layer types
// ---------------------------------------------------------------------------

export const LayerKindSchema = z.enum([
  'text',
  'image',
  'shape',
  'screenshot',
  'group',
  'video',
  'lottie',
  'svg',
  'cursor',
  'browser',
]);
export type LayerKind = z.infer<typeof LayerKindSchema>;

export const ShapeTypeSchema = z.enum([
  'rectangle',
  'ellipse',
  'line',
  'polygon',
  'path',
]);

// ---------------------------------------------------------------------------
// Layer
// ---------------------------------------------------------------------------

export const LayerSchema = z.object({
  id: z.string(),
  name: z.string().default('Layer'),
  kind: LayerKindSchema,
  parentId: z.string().nullable().default(null),
  /** Sort order among siblings. */
  order: z.number().int().default(0),

  /** When false the layer is invisible and not interactive. */
  visible: z.boolean().default(true),
  /** When true the layer is locked against edits. */
  locked: z.boolean().default(false),
  /** Global opacity 0..1. */
  opacity: z.number().min(0).max(1).default(1),
  /** CSS blend mode. */
  blendMode: z.string().default('normal'),

  // Geometry
  transform: TransformSchema.default({}),
  width: z.number().nonnegative().default(200),
  height: z.number().nonnegative().default(100),

  // Styling
  fill: FillSchema.optional(),
  stroke: StrokeSchema.optional(),
  shadow: ShadowSchema.optional(),
  borderRadius: BorderRadiusSchema.optional(),

  // Timing — frame offsets relative to the parent scene
  startFrame: z.number().int().nonnegative().default(0),
  durationFrames: z.number().int().nonnegative().default(30),

  // Keyframe animation tracks
  tracks: z.array(KeyframeTrackSchema).default([]),

  // Entry / exit motion presets
  entryMotion: z.string().nullable().default(null),
  exitMotion: z.string().nullable().default(null),

  // Kind-specific data (only the matching field is populated)
  text: z
    .object({
      content: z.string().default(''),
      style: TextStyleSchema.default({}),
    })
    .optional(),

  image: z
    .object({
      assetId: z.string().nullable().default(null),
      src: z.string().default(''),
      fit: z.enum(['cover', 'contain', 'fill', 'none']).default('cover'),
      cropRect: RectSchema.optional(),
    })
    .optional(),

  shape: z
    .object({
      shapeType: ShapeTypeSchema.default('rectangle'),
      /** SVG path data for `path` shape type. */
      pathData: z.string().optional(),
      /** Number of sides for `polygon`. */
      sides: z.number().int().min(3).default(6),
    })
    .optional(),

  screenshot: z
    .object({
      assetId: z.string().nullable().default(null),
      src: z.string().default(''),
      captureStateId: z.string().nullable().default(null),
      /** Decorative device frame to wrap the screenshot. */
      deviceFrame: z.enum(['none', 'browser', 'desktop', 'phone', 'tablet']).default('none'),
      fit: z.enum(['cover', 'contain', 'fill']).default('contain'),
    })
    .optional(),

  video: z
    .object({
      assetId: z.string().nullable().default(null),
      src: z.string().default(''),
      startMs: z.number().nonnegative().default(0),
      volume: z.number().min(0).max(1).default(1),
      loop: z.boolean().default(false),
    })
    .optional(),

  lottie: z
    .object({
      assetId: z.string().nullable().default(null),
      src: z.string().default(''),
      loop: z.boolean().default(false),
      speed: z.number().default(1),
    })
    .optional(),

  svg: z
    .object({
      assetId: z.string().nullable().default(null),
      src: z.string().default(''),
      svgContent: z.string().default(''),
    })
    .optional(),

  cursor: z
    .object({
      cursorStyle: z.enum(['default', 'pointer', 'text', 'grab']).default('default'),
      clickAnimation: z.boolean().default(false),
      targetX: z.number().optional(),
      targetY: z.number().optional(),
    })
    .optional(),

  browser: z
    .object({
      urlBarText: z.string().default('example.com'),
      theme: z.enum(['light', 'dark']).default('light'),
      contentHeight: z.number().optional(), // For scrolling effects
    })
    .optional(),
});

export type Layer = z.infer<typeof LayerSchema>;

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export const SceneSchema = z.object({
  id: z.string(),
  name: z.string().default('Scene'),
  /** Display order in the timeline. */
  order: z.number().int().default(0),
  /** Duration of this scene in frames. */
  durationFrames: z.number().int().nonnegative().default(90),
  /** Background color. */
  backgroundColor: ColorSchema.default('#ffffff'),
  /** Scene-level transition (applied *into* this scene from the previous). */
  transition: z
    .object({
      type: z.enum(['none', 'fade', 'slide', 'wipe', 'zoom', 'dissolve']).default('none'),
      durationFrames: z.number().int().nonnegative().default(15),
      easing: EasingSchema.default('easeInOut'),
      direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
    })
    .default({}),
  /** Flat list of layers belonging to this scene. */
  layers: z.array(LayerSchema).default([]),
  /** Narration / captions for this scene. */
  narration: z
    .object({
      text: z.string().default(''),
      voiceover: z.boolean().default(false),
    })
    .optional(),
  /** Free-form notes for the creative brief linkage. */
  notes: z.string().default(''),
});

export type Scene = z.infer<typeof SceneSchema>;

// ---------------------------------------------------------------------------
// Document (root)
// ---------------------------------------------------------------------------

export const DocumentSchema = z.object({
  /** Schema version for forward-compatibility migrations. */
  version: z.number().int().default(1),
  /** Canvas dimensions in pixels. */
  canvasWidth: z.number().int().positive().default(1920),
  canvasHeight: z.number().int().positive().default(1080),
  /** Playback frame rate. */
  fps: z.number().int().positive().default(30),
  /** Ordered list of scenes. */
  scenes: z.array(SceneSchema).default([]),
  /** Global audio track (background music). */
  audio: z
    .object({
      assetId: z.string().nullable().default(null),
      src: z.string().default(''),
      volume: z.number().min(0).max(1).default(0.3),
      fadeInFrames: z.number().int().nonnegative().default(15),
      fadeOutFrames: z.number().int().nonnegative().default(15),
    })
    .optional(),
  /** Metadata attached by the AI planner and brand system. */
  meta: z.record(z.unknown()).default({}),
});

export type Document = z.infer<typeof DocumentSchema>;
