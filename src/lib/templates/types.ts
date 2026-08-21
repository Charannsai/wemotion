/**
 * Template Types
 *
 * Defines the structure of pre-built document templates and slots where
 * AI-generated content can be injected.
 */
import type { Document } from '@/lib/scene-graph/schema';

export interface TemplateSlot {
  id: string; // The ID of the layer in the template document
  role: 'title' | 'subtitle' | 'body' | 'background-image' | 'foreground-image' | 'b-roll';
  constraints?: {
    maxLength?: number; // for text
    preferredAspectRatio?: '16:9' | '9:16' | '1:1'; // for images/videos
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'marketing' | 'educational' | 'social' | 'corporate';
  format: 'horizontal' | 'vertical' | 'square';
  document: Document; // The base scene-graph
  slots: TemplateSlot[]; // Which layers in the document are meant to be filled by AI
}
