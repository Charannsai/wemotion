import { memo, useMemo } from 'react';
import type { Document, Layer } from '@/lib/scene-graph/schema';
import { evaluateFrame, type EvaluatedFrame } from '@/lib/motion/evaluator';
import { LayerRenderer } from './LayerRenderer';
import { RendererProvider } from './RendererContext';
import type { ResolvedLayerState } from '@/lib/motion/types';

export interface DocumentRendererProps {
  document: Document;
  globalFrame: number;
  assetBaseUrl?: string;
  isExporting?: boolean;
  scale?: number; // Used to scale the preview down to fit the editor canvas
}

/**
 * Builds a hierarchical tree from a flat list of layers.
 */
function buildLayerTree(layers: Array<{ layer: Layer; state: ResolvedLayerState }>) {
  const map = new Map<string, { layer: Layer; state: ResolvedLayerState; children: any[] }>();
  const roots: any[] = [];

  // Initialize map
  for (const item of layers) {
    map.set(item.layer.id, { ...item, children: [] });
  }

  // Build tree
  for (const item of layers) {
    const node = map.get(item.layer.id)!;
    if (item.layer.parentId && map.has(item.layer.parentId)) {
      map.get(item.layer.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/**
 * Renders an entire Document at a specific frame.
 * Used identically for live preview and final export rendering.
 */
export const DocumentRenderer = memo(function DocumentRenderer({
  document,
  globalFrame,
  assetBaseUrl = '',
  isExporting = false,
  scale = 1,
}: DocumentRendererProps) {
  // 1. Evaluate the motion engine deterministically
  const evaluated = useMemo<EvaluatedFrame | null>(() => {
    return evaluateFrame(document, globalFrame);
  }, [document, globalFrame]);

  if (!evaluated) return null;

  const { scene, layers, context } = evaluated;

  // 2. Build the hierarchical layer tree for rendering nested groups properly
  const layerTree = useMemo(() => buildLayerTree(layers), [layers]);

  // 3. Render recursive layer tree
  const renderNode = (node: any) => {
    return (
      <LayerRenderer key={node.layer.id} layer={node.layer} state={node.state}>
        {node.children.length > 0 && node.children.map(renderNode)}
      </LayerRenderer>
    );
  };

  return (
    <RendererProvider
      value={{
        globalFrame,
        canvasWidth: document.canvasWidth,
        canvasHeight: document.canvasHeight,
        assetBaseUrl,
        isExporting,
      }}
    >
      <div
        className="wemotion-canvas-root"
        style={{
          width: document.canvasWidth,
          height: document.canvasHeight,
          backgroundColor: scene.backgroundColor,
          overflow: 'hidden',
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          // Performance hints
          willChange: 'transform',
        }}
      >
        {/* Render background transition if any (omitted for brevity, handled at scene level) */}
        
        {/* Render all layer roots */}
        {layerTree.map(renderNode)}
      </div>
    </RendererProvider>
  );
});
