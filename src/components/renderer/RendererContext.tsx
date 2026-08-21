/**
 * Shared context for rendering layers.
 */
import { createContext, useContext } from 'react';

export interface RendererContextValue {
  /** Global frame being rendered. */
  globalFrame: number;
  /** Canvas width in pixels. */
  canvasWidth: number;
  /** Canvas height in pixels. */
  canvasHeight: number;
  /** Base URL for resolving assets. */
  assetBaseUrl: string;
  /** True if we are exporting (vs previewing). Controls quality/loading behavior. */
  isExporting: boolean;
  /** True if we are rendering a thumbnail. */
  isThumbnail?: boolean;
}

const RendererContext = createContext<RendererContextValue | null>(null);

export const RendererProvider = RendererContext.Provider;

export function useRendererContext() {
  const ctx = useContext(RendererContext);
  if (!ctx) {
    throw new Error('useRendererContext must be used within a RendererProvider');
  }
  return ctx;
}
