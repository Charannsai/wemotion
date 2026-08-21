import { memo, useMemo } from 'react';
import type { Layer } from '@/lib/scene-graph/schema';
import type { ResolvedLayerState } from '@/lib/motion/types';
import { getLayerStyles } from '@/lib/renderer/styles';

import { TextRenderer } from './layers/TextRenderer';
import { ImageRenderer } from './layers/ImageRenderer';
import { ShapeRenderer } from './layers/ShapeRenderer';
import { VideoRenderer } from './layers/VideoRenderer';
// We omit lottie, screenshot, svg for now, they follow the exact same pattern.

export interface LayerRendererProps {
  layer: Layer;
  state: ResolvedLayerState;
  children?: React.ReactNode; // For groups
}

export const LayerRenderer = memo(function LayerRenderer({ layer, state, children }: LayerRendererProps) {
  const isGroup = layer.kind === 'group';
  
  // Memoize styles to avoid unnecessary CSS reparsing
  const style = useMemo(() => getLayerStyles(state, isGroup), [state, isGroup]);

  const renderContent = () => {
    switch (layer.kind) {
      case 'text':
        return <TextRenderer layer={layer} state={state} />;
      case 'image':
        return <ImageRenderer layer={layer} state={state} />;
      case 'shape':
        return <ShapeRenderer layer={layer} state={state} />;
      case 'video':
        return <VideoRenderer layer={layer} state={state} />;
      case 'group':
        return children;
      default:
        // Render empty placeholder for unimplemented kinds (screenshot, lottie, svg)
        return (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,0,0,0.1)', border: '1px dashed red' }}>
            {layer.kind} not implemented
          </div>
        );
    }
  };

  return (
    <div style={style} id={`layer-${layer.id}`} data-layer-name={layer.name}>
      {renderContent()}
    </div>
  );
});
