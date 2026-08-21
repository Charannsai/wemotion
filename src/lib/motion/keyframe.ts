/**
 * Keyframe resolution.
 *
 * Given a set of keyframes and a frame number, resolves the interpolated value.
 */
import type { KeyframeTrack, Keyframe } from '@/lib/scene-graph/schema';
import type { PropertyValue } from './types';
import { resolveEasing } from './easing';
import { interpolateValue } from './interpolate';

/**
 * Resolve a keyframe track at a given frame.
 * Returns the interpolated value, or undefined if the track is empty.
 */
export function resolveKeyframeTrack(
  track: KeyframeTrack,
  frame: number,
): PropertyValue | undefined {
  const { keyframes } = track;
  if (keyframes.length === 0) return undefined;

  // Before the first keyframe — hold
  if (frame <= keyframes[0]!.frame) {
    return keyframes[0]!.value as PropertyValue;
  }

  // After the last keyframe — hold
  if (frame >= keyframes[keyframes.length - 1]!.frame) {
    return keyframes[keyframes.length - 1]!.value as PropertyValue;
  }

  // Find the bounding pair
  let left: Keyframe = keyframes[0]!;
  let right: Keyframe = keyframes[keyframes.length - 1]!;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (frame >= keyframes[i]!.frame && frame <= keyframes[i + 1]!.frame) {
      left = keyframes[i]!;
      right = keyframes[i + 1]!;
      break;
    }
  }

  // Calculate linear progress between the two keyframes
  const span = right.frame - left.frame;
  if (span === 0) return left.value as PropertyValue;

  const linearProgress = (frame - left.frame) / span;

  // Apply easing (from left keyframe)
  const easingFn = resolveEasing(left.easing);
  const easedProgress = easingFn(linearProgress);

  // Interpolate
  return interpolateValue(
    left.value as PropertyValue,
    right.value as PropertyValue,
    easedProgress,
  );
}

/**
 * Resolve all keyframe tracks for a layer at a given frame.
 * Returns a map of property paths to their resolved values.
 */
export function resolveAllTracks(
  tracks: KeyframeTrack[],
  frame: number,
): Record<string, PropertyValue> {
  const result: Record<string, PropertyValue> = {};

  for (const track of tracks) {
    const value = resolveKeyframeTrack(track, frame);
    if (value !== undefined) {
      result[track.property] = value;
    }
  }

  return result;
}
