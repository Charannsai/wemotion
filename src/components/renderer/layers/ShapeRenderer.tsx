import { memo, CSSProperties } from 'react';
import type { BaseRendererProps } from './TextRenderer';

export const ShapeRenderer = memo(function ShapeRenderer({ layer, state }: BaseRendererProps) {
  if (layer.kind !== 'shape' || !layer.shape) return null;

  const { shapeType } = layer.shape;
  const { width, height } = state; // We use the resolved animated width/height

  // Compute common styles like fill, stroke based on the layer properties
  const fill = layer.fill ? `rgba(${parseColorToRGBA(layer.fill.color)}, ${layer.fill.opacity})` : 'transparent';
  
  let stroke = 'none';
  let strokeWidth = 0;
  let strokeDasharray = undefined;

  if (layer.stroke) {
    stroke = `rgba(${parseColorToRGBA(layer.stroke.color)}, ${layer.stroke.opacity})`;
    strokeWidth = layer.stroke.width;
    if (layer.stroke.dashArray.length > 0) {
      strokeDasharray = layer.stroke.dashArray.join(', ');
    }
  }

  // To cleanly render shapes without getting clipped by their own stroke,
  // we often need the SVG viewport to be slightly larger or use `overflow: visible`.
  // For simplicity, we match exactly the width/height.
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'visible',
    display: 'block',
  };

  const renderShape = () => {
    switch (shapeType) {
      case 'rectangle':
        return (
          <rect 
            x={0} 
            y={0} 
            width={width} 
            height={height} 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            rx={layer.borderRadius?.tl ?? 0} // Simplification: using uniform rx based on top-left
          />
        );
      case 'ellipse':
        return (
          <ellipse 
            cx={width / 2} 
            cy={height / 2} 
            rx={width / 2} 
            ry={height / 2} 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
      case 'line':
        return (
          <line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke={stroke !== 'none' ? stroke : fill} // Lines often use fill as fallback for color if stroke is unset
            strokeWidth={strokeWidth || height}
            strokeDasharray={strokeDasharray}
          />
        );
      case 'polygon':
        // Generate points for a regular polygon
        const sides = layer.shape.sides || 6;
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) / 2;
        const points = [];
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
          points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
        }
        return (
          <polygon
            points={points.join(' ')}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
      case 'path':
        if (!layer.shape.pathData) return null;
        return (
          <path
            d={layer.shape.pathData}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
        );
      default:
        return null;
    }
  };

  return (
    <svg style={style} viewBox={`0 0 ${width} ${height}`}>
      {renderShape()}
    </svg>
  );
});

// Helper to convert hex/rgba to standard rgb comma separated for rgba() wrapper
function parseColorToRGBA(color: string): string {
  // Very simplistic parsing, production should use the robust one from motion engine
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  const match = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (match) {
    return `${match[1]}, ${match[2]}, ${match[3]}`;
  }
  return '0, 0, 0';
}
