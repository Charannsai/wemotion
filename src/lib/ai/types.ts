/**
 * AI Planner Types
 *
 * Defines the structured output we expect from the LLM when generating
 * a video from a brief and ingested knowledge.
 */

export interface AiLayerPlan {
  id: string; // Generated ID by the LLM (e.g., 'layer_title_1')
  kind: 'text' | 'image' | 'video' | 'shape';
  name: string;
  startFrame: number;
  durationFrames: number;
  
  // Visuals
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Optional content overrides
  textContent?: string;
  imageSrc?: string;
  
  // Motion
  entryMotion: string; // e.g. 'popIn:30:energetic'
  exitMotion: string;
}

export interface AiScenePlan {
  id: string;
  name: string;
  durationFrames: number;
  backgroundColor: string;
  layers: AiLayerPlan[];
  voiceoverScript?: string;
}

export interface AiDocumentPlan {
  title: string;
  fps: number;
  canvasWidth: number;
  canvasHeight: number;
  scenes: AiScenePlan[];
}
