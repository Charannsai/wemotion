/**
 * AI Planner Zod Schemas
 *
 * Used by Groq's structured outputs to guarantee the model returns valid
 * JSON that maps directly to our `AiDocumentPlan` type.
 */
import { z } from 'zod';

export const aiLayerSchema = z.object({
  id: z.string().describe('Unique identifier for this layer, e.g. "title_1"'),
  kind: z.enum(['text', 'image', 'video', 'shape', 'cursor', 'browser']).describe('Type of media layer'),
  name: z.string().describe('Human readable layer name in timeline'),
  startFrame: z.number().int().min(0).describe('Frame number where layer appears'),
  durationFrames: z.number().int().min(1).describe('How long the layer stays on screen in frames'),
  
  x: z.number().describe('X coordinate of top-left corner'),
  y: z.number().describe('Y coordinate of top-left corner'),
  width: z.number().min(1).describe('Width in pixels'),
  height: z.number().min(1).describe('Height in pixels'),
  
  textContent: z.string().optional().describe('Text to display if kind is text'),
  imageSrc: z.string().optional().describe('URL or reference ID to an image/video asset'),
  
  // Specific to cursor layer
  targetX: z.number().optional().describe('For cursor layers: the X coordinate it moves to'),
  targetY: z.number().optional().describe('For cursor layers: the Y coordinate it moves to'),
  
  // Specific to browser layer
  urlBarText: z.string().optional().describe('For browser layers: text in the address bar'),
  
  entryMotion: z.string().optional().default('springPop:30:energetic').describe('Entry animation preset, e.g. "popIn:30:energetic", "cursorClick:10:moderate", "springPop:20:energetic" or "none"'),
  exitMotion: z.string().optional().default('fadeOut:15:moderate').describe('Exit animation preset, e.g. "slideUp:15:moderate" or "none"'),
});

export const aiSceneSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationFrames: z.number().int().min(30),
  backgroundColor: z.string().describe('Hex color code or rgba string'),
  layers: z.array(aiLayerSchema),
  voiceoverScript: z.string().optional().describe('Script to be spoken during this scene'),
});

export const aiDocumentSchema = z.object({
  title: z.string(),
  fps: z.number().int().describe('Must be 30 or 60'),
  canvasWidth: z.number().int(),
  canvasHeight: z.number().int(),
  scenes: z.array(aiSceneSchema),
});

export type AiDocumentPlanSchema = z.infer<typeof aiDocumentSchema>;
