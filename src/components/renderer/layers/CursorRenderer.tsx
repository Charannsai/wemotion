import { memo } from 'react';
import type { BaseRendererProps } from './TextRenderer';

export const CursorRenderer = memo(function CursorRenderer({ layer, state }: BaseRendererProps) {
  if (layer.kind !== 'cursor' || !layer.cursor) return null;

  // Render a standard macOS style cursor
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          // Filter drop shadow for a clean SaaS look
          filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.4))',
        }}
      >
        <path
          d="M10.125 10.125L24 14.75L16.25 16.25L14.75 24L10.125 10.125Z"
          fill="black"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});
