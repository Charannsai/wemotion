import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Document } from '@/lib/scene-graph/schema';
import { DocumentRenderer } from './DocumentRenderer';

export interface RemotionCompositionProps {
  document: Document;
  assetBaseUrl?: string;
}

/**
 * The core Remotion Composition wrapper.
 * This takes our Document schema and renders it within Remotion's timeline.
 */
export const RemotionComposition: React.FC<RemotionCompositionProps> = ({ 
  document,
  assetBaseUrl = ''
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Scale the document if the Remotion composition size doesn't match the document size exactly
  // (Usually they should match, but this allows responsive preview scaling if needed)
  const scaleX = width / document.canvasWidth;
  const scaleY = height / document.canvasHeight;
  const scale = Math.min(scaleX, scaleY);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', alignItems: 'center', justifyItems: 'center' }}>
      <DocumentRenderer
        document={document}
        globalFrame={frame}
        assetBaseUrl={assetBaseUrl}
        isExporting={true}
        scale={scale}
      />
    </AbsoluteFill>
  );
};
