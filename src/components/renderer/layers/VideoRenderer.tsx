import { memo, CSSProperties } from 'react';
import type { BaseRendererProps } from './TextRenderer';

export const VideoRenderer = memo(function VideoRenderer({ layer }: BaseRendererProps) {
  // In a full Remotion implementation, we would use Remotion's <Video> component
  // to ensure frame-perfect syncing. For this base architecture, we use a standard
  // HTML5 video tag, which is sufficient for preview but would need upgrading for export.
  
  if (layer.kind !== 'video' || !layer.video) return null;

  const { src, volume, loop, startMs } = layer.video;

  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // standard fallback
    display: 'block',
  };

  return (
    <video
      src={src}
      style={style}
      muted={volume === 0}
      loop={loop}
      autoPlay={false} // Managed by playback controller usually
      playsInline
      // A hack to start at the right time if playing natively
      // data-start-time={startMs}
    />
  );
});
