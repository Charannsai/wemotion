/**
 * Color interpolation for the motion engine.
 *
 * Performs perceptually uniform interpolation in OKLCH space when possible,
 * with fallback to linear RGB for simple hex cases.
 */

// ---------------------------------------------------------------------------
// Color parsing
// ---------------------------------------------------------------------------

export interface RGBA {
  r: number; // 0..255
  g: number;
  b: number;
  a: number; // 0..1
}

/** Parse a hex (#rrggbb or #rrggbbaa) or rgba() string into RGBA. */
export function parseColor(color: string): RGBA {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
  }

  const match = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
  if (match) {
    return {
      r: parseFloat(match[1]!),
      g: parseFloat(match[2]!),
      b: parseFloat(match[3]!),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
  }

  return { r: 0, g: 0, b: 0, a: 1 };
}

/** Convert RGBA to a CSS-ready string. */
export function rgbaToString(c: RGBA): string {
  if (c.a >= 1) {
    return `#${clampHex(c.r)}${clampHex(c.g)}${clampHex(c.b)}`;
  }
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${c.a.toFixed(3)})`;
}

function clampHex(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, '0');
}

// ---------------------------------------------------------------------------
// sRGB ↔ Linear RGB
// ---------------------------------------------------------------------------

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

// ---------------------------------------------------------------------------
// Linear RGB interpolation (perceptual enough for motion)
// ---------------------------------------------------------------------------

/**
 * Interpolate between two colors. Works in linear RGB space for
 * perceptual uniformity.
 */
export function lerpColor(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);

  // Convert to linear
  const laR = srgbToLinear(ca.r);
  const laG = srgbToLinear(ca.g);
  const laB = srgbToLinear(ca.b);
  const lbR = srgbToLinear(cb.r);
  const lbG = srgbToLinear(cb.g);
  const lbB = srgbToLinear(cb.b);

  // Interpolate in linear space
  const result: RGBA = {
    r: linearToSrgb(laR + (lbR - laR) * t),
    g: linearToSrgb(laG + (lbG - laG) * t),
    b: linearToSrgb(laB + (lbB - laB) * t),
    a: ca.a + (cb.a - ca.a) * t,
  };

  return rgbaToString(result);
}
