import { CSSProperties, memo } from 'react';
import type { BaseRendererProps } from './TextRenderer';
import { useRendererContext } from '../RendererContext';

export const ImageRenderer = memo(function ImageRenderer({ layer }: BaseRendererProps) {
  const { assetBaseUrl } = useRendererContext();
  
  if (layer.kind !== 'image' || !layer.image) return null;

  const { src, fit } = layer.image;

  // Resolve absolute URL if it's a relative path/asset ID
  const resolvedSrc = src.startsWith('http') || src.startsWith('data:') 
    ? src 
    : `${assetBaseUrl}/${src}`;

  // Use standard CSS object-fit mappings
  const objectFit = fit === 'fill' ? 'fill' : fit === 'none' ? 'none' : fit;

  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    display: 'block',
  };

  // We could implement cropRect here using clip-path, but objectFit handles most standard cases.

  return (
    <img 
      src={resolvedSrc} 
      alt={layer.name} 
      style={style}
      draggable={false}
    />
  );
});
