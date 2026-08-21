import { CSSProperties } from 'react';
import type { ResolvedLayerState } from '@/lib/motion/types';

/**
 * Converts a ResolvedLayerState into CSS transform and style properties.
 */
export function getLayerStyles(state: ResolvedLayerState, isGroup: boolean = false): CSSProperties {
  const {
    opacity,
    x,
    y,
    scaleX,
    scaleY,
    rotation,
    anchorX,
    anchorY,
    skewX,
    skewY,
    width,
    height,
  } = state;

  // We map anchor points (0..1) to transform-origin
  const transformOrigin = `${anchorX * 100}% ${anchorY * 100}%`;

  let transform = `translate3d(${x}px, ${y}px, 0)`;
  if (rotation !== 0) transform += ` rotate(${rotation}deg)`;
  if (scaleX !== 1 || scaleY !== 1) transform += ` scale(${scaleX}, ${scaleY})`;
  if (skewX !== 0 || skewY !== 0) transform += ` skew(${skewX}deg, ${skewY}deg)`;

  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${width}px`,
    height: `${height}px`,
    opacity,
    transform,
    transformOrigin,
    willChange: 'transform, opacity', // Hint for GPU acceleration
    // Ensure nested layers position correctly
    transformStyle: isGroup ? 'preserve-3d' : 'flat',
  };
}
