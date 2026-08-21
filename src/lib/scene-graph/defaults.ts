/**
 * Factory functions for creating default scene-graph nodes.
 */
import { newId, ID_PREFIXES } from '@/lib/ids';
import type { Document, Scene, Layer, LayerKind, Transform } from './schema';

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export function createDocument(overrides: Partial<Document> = {}): Document {
  return {
    version: 1,
    canvasWidth: 1920,
    canvasHeight: 1080,
    fps: 30,
    scenes: [],
    meta: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export function createScene(overrides: Partial<Scene> = {}): Scene {
  return {
    id: newId(ID_PREFIXES.scene),
    name: 'Scene',
    order: 0,
    durationFrames: 90,
    backgroundColor: '#ffffff',
    transition: {
      type: 'none',
      durationFrames: 15,
      easing: 'easeInOut',
      direction: 'left',
    },
    layers: [],
    notes: '',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

export function createTransform(overrides: Partial<Transform> = {}): Transform {
  return {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    anchorX: 0.5,
    anchorY: 0.5,
    skewX: 0,
    skewY: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Layers
// ---------------------------------------------------------------------------

function baseLayer(kind: LayerKind, overrides: Partial<Layer> = {}): Layer {
  return {
    id: newId(ID_PREFIXES.layer),
    name: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} Layer`,
    kind,
    parentId: null,
    order: 0,
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'normal',
    transform: createTransform(),
    width: 200,
    height: 100,
    startFrame: 0,
    durationFrames: 30,
    tracks: [],
    entryMotion: null,
    exitMotion: null,
    ...overrides,
  };
}

export function createTextLayer(overrides: Partial<Layer> = {}): Layer {
  return baseLayer('text', {
    name: 'Text Layer',
    width: 400,
    height: 60,
    text: {
      content: 'Hello World',
      style: {
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: 0,
        color: '#000000',
        align: 'center',
        italic: false,
        underline: false,
        uppercase: false,
      },
    },
    ...overrides,
  });
}

export function createImageLayer(overrides: Partial<Layer> = {}): Layer {
  return baseLayer('image', {
    name: 'Image Layer',
    width: 400,
    height: 300,
    image: { assetId: null, src: '', fit: 'cover' },
    ...overrides,
  });
}

export function createShapeLayer(overrides: Partial<Layer> = {}): Layer {
  return baseLayer('shape', {
    name: 'Shape Layer',
    width: 200,
    height: 200,
    fill: { color: '#7950f2', opacity: 1 },
    shape: { shapeType: 'rectangle', sides: 6 },
    ...overrides,
  });
}

export function createScreenshotLayer(overrides: Partial<Layer> = {}): Layer {
  return baseLayer('screenshot', {
    name: 'Screenshot',
    width: 800,
    height: 500,
    screenshot: { assetId: null, src: '', captureStateId: null, deviceFrame: 'browser', fit: 'contain' },
    ...overrides,
  });
}

export function createGroupLayer(overrides: Partial<Layer> = {}): Layer {
  return baseLayer('group', {
    name: 'Group',
    width: 400,
    height: 300,
    ...overrides,
  });
}

export function createVideoLayer(overrides: Partial<Layer> = {}): Layer {
  return baseLayer('video', {
    name: 'Video Layer',
    width: 640,
    height: 360,
    video: { assetId: null, src: '', startMs: 0, volume: 1, loop: false },
    ...overrides,
  });
}
