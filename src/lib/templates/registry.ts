/**
 * Template Registry
 *
 * Central registry of all available document templates.
 */
import type { Template } from './types';
import { marketingVertical } from './presets/marketing';
import { educationalHorizontal } from './presets/educational';

export const TEMPLATES: Record<string, Template> = {
  [marketingVertical.id]: marketingVertical,
  [educationalHorizontal.id]: educationalHorizontal,
};

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES[id];
}

export function getAllTemplates(): Template[] {
  return Object.values(TEMPLATES);
}
