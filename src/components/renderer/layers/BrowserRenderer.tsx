import { memo } from 'react';
import type { BaseRendererProps } from './TextRenderer';

export const BrowserRenderer = memo(function BrowserRenderer({ layer, state }: BaseRendererProps) {
  if (layer.kind !== 'browser' || !layer.browser) return null;

  const { urlBarText, theme } = layer.browser;
  
  const isDark = theme === 'dark';
  const bg = isDark ? '#1C1C1E' : '#FFFFFF';
  const headerBg = isDark ? '#2D2D2D' : '#F5F5F5';
  const fg = isDark ? '#FFFFFF' : '#000000';
  const border = isDark ? '#3D3D3D' : '#E5E5E5';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: bg,
        borderRadius: '12px',
        border: `1px solid ${border}`,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          height: '40px',
          backgroundColor: headerBg,
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27C93F' }} />
        </div>
        
        {/* URL Bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
              color: isDark ? '#888' : '#666',
              borderRadius: '6px',
              padding: '4px 64px',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              border: `1px solid ${isDark ? '#444' : '#E0E0E0'}`,
            }}
          >
            {urlBarText}
          </div>
        </div>
      </div>
      
      {/* Content area (empty placeholder, could wrap children in future if group) */}
      <div style={{ flex: 1, backgroundColor: bg }}>
        {/* If the AI puts screenshot layers behind this layer or on top of this layer, it creates the illusion. 
            Ideally, this would be a group that renders children inside here. */}
      </div>
    </div>
  );
});
