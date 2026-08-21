/**
 * Deterministic Fallback Planner
 *
 * Used when an AI API key is not configured. Provides a static, structural
 * transformation of a brief into a basic WeMotion document.
 */
import type { AiDocumentPlanSchema } from './schema';
import { newId, ID_PREFIXES } from '@/lib/ids';

export function generateDeterministicPlan(
  brief: string,
  targetFormat: 'horizontal' | 'vertical' | 'square'
): AiDocumentPlanSchema {
  
  let canvasWidth = 1920;
  let canvasHeight = 1080;
  if (targetFormat === 'vertical') {
    canvasWidth = 1080;
    canvasHeight = 1920;
  } else if (targetFormat === 'square') {
    canvasWidth = 1080;
    canvasHeight = 1080;
  }

  // A very dumb heuristic just to prove the pipeline works without LLM
  const title = brief.split('\n')[0]?.substring(0, 50) || 'Auto-generated Video';

  return {
    title,
    fps: 30,
    canvasWidth,
    canvasHeight,
    scenes: [
      {
        id: newId(ID_PREFIXES.scene),
        name: 'Title Scene',
        durationFrames: 90, // 3 seconds
        backgroundColor: '#0f172a',
        layers: [
          {
            id: newId(ID_PREFIXES.layer),
            kind: 'text',
            name: 'Main Title',
            startFrame: 0,
            durationFrames: 90,
            x: canvasWidth * 0.1,
            y: canvasHeight * 0.4,
            width: canvasWidth * 0.8,
            height: 200,
            textContent: title,
            entryMotion: 'popIn:30:energetic',
            exitMotion: 'none',
          }
        ]
      }
    ]
  };
}
