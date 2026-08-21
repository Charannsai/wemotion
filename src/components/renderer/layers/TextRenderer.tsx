import { CSSProperties, memo } from 'react';
import type { Layer } from '@/lib/scene-graph/schema';
import type { ResolvedLayerState } from '@/lib/motion/types';

export interface BaseRendererProps {
  layer: Layer;
  state: ResolvedLayerState;
}

export const TextRenderer = memo(function TextRenderer({ layer, state }: BaseRendererProps) {
  if (layer.kind !== 'text' || !layer.text) return null;

  const { content, style } = layer.text;

  // Layer-specific animated overrides could go here if text styles were animatable.
  // For now, we take from the base style.
  const cssStyle: CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: `${style.letterSpacing}px`,
    color: style.color,
    textAlign: style.align,
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : 'none',
    textTransform: style.uppercase ? 'uppercase' : 'none',
    width: '100%',
    height: '100%',
    display: 'flex',
    // Vertical alignment is not fully modeled, assuming top by default but we could use justify-content/align-items
    flexDirection: 'column',
    wordBreak: 'break-word',
  };

  return (
    <div style={cssStyle}>
      {/* We split by newlines if content has them, though standard CSS handles it if whitespace is pre-wrap */}
      <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
    </div>
  );
});
