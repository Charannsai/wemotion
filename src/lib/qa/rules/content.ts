/**
 * Content QA Rules
 *
 * Checks text density, duration vs reading speed, and information overload.
 */
import type { QARule, QAViolation } from '../types';

export const textReadingTimeRule: QARule = {
  id: 'content/reading-time',
  name: 'Adequate Reading Time',
  description: 'Text layers should be on screen long enough to be read.',
  category: 'content',
  evaluate: (doc) => {
    const violations: QAViolation[] = [];
    const avgWordsPerSecond = 3.5; // average reading speed in short videos

    for (const scene of doc.scenes) {
      for (const layer of scene.layers) {
        if (!layer.visible || layer.kind !== 'text' || !layer.text) continue;

        const textContent = layer.text.content.trim();
        if (textContent.length === 0) continue;

        const words = textContent.split(/\s+/).length;
        const requiredSeconds = words / avgWordsPerSecond;
        
        // duration in seconds
        const durationSeconds = layer.durationFrames / doc.fps;

        if (durationSeconds < requiredSeconds) {
          // Calculate how many frames are actually needed
          const neededFrames = Math.ceil(requiredSeconds * doc.fps);
          violations.push({
            ruleId: 'content/reading-time',
            severity: 'warning',
            message: `Text "${textContent.substring(0, 15)}..." is too fast to read. Needs ~${requiredSeconds.toFixed(1)}s but is on screen for ${durationSeconds.toFixed(1)}s.`,
            context: { sceneId: scene.id, layerId: layer.id },
            fix: { type: 'extend-duration', payload: { neededFrames } }
          });
        }
      }
    }
    return violations;
  },
};

export const contentRules = [textReadingTimeRule];
