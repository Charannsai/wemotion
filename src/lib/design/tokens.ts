/**
 * Design tokens — the single source of truth for every visual constant.
 *
 * All values are platform-agnostic primitives (strings / numbers) consumed by
 * both the CSS custom-property layer (globals.css) and the motion/render
 * engines at runtime.  If you need a CSS variable, reference the `--wm-*`
 * custom properties emitted in globals.css which mirror these tokens.
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

/** Neutral ramp — used for text, backgrounds, borders, and surfaces. */
export const neutral = {
  0: '#ffffff',
  50: '#f8f9fa',
  100: '#f1f3f5',
  150: '#e9ecef',
  200: '#dee2e6',
  300: '#ced4da',
  400: '#adb5bd',
  500: '#868e96',
  600: '#6c757d',
  700: '#495057',
  800: '#343a40',
  850: '#2b2f33',
  900: '#212529',
  925: '#1a1d21',
  950: '#121416',
  1000: '#000000',
} as const;

/** Brand accent — a vivid violet for primary actions and active states. */
export const brand = {
  50: '#f3f0ff',
  100: '#e5dbff',
  200: '#d0bfff',
  300: '#b197fc',
  400: '#9775fa',
  500: '#845ef7',
  600: '#7950f2',
  700: '#7048e8',
  800: '#6741d9',
  900: '#5f3dc4',
} as const;

/** Success — greens for positive states, completion, and confirmations. */
export const success = {
  50: '#ebfbee',
  100: '#d3f9d8',
  200: '#b2f2bb',
  300: '#8ce99a',
  400: '#69db7c',
  500: '#51cf66',
  600: '#40c057',
  700: '#37b24d',
  800: '#2f9e44',
  900: '#2b8a3e',
} as const;

/** Warning — ambers for caution states. */
export const warning = {
  50: '#fff9db',
  100: '#fff3bf',
  200: '#ffec99',
  300: '#ffe066',
  400: '#ffd43b',
  500: '#fcc419',
  600: '#fab005',
  700: '#f59f00',
  800: '#f08c00',
  900: '#e67700',
} as const;

/** Danger — reds for destructive actions and error states. */
export const danger = {
  50: '#fff5f5',
  100: '#ffe3e3',
  200: '#ffc9c9',
  300: '#ffa8a8',
  400: '#ff8787',
  500: '#ff6b6b',
  600: '#fa5252',
  700: '#f03e3e',
  800: '#e03131',
  900: '#c92a2a',
} as const;

/** Info — blues for informational banners and links. */
export const info = {
  50: '#e7f5ff',
  100: '#d0ebff',
  200: '#a5d8ff',
  300: '#74c0fc',
  400: '#4dabf7',
  500: '#339af0',
  600: '#228be6',
  700: '#1c7ed6',
  800: '#1971c2',
  900: '#1864ab',
} as const;

// ---------------------------------------------------------------------------
// Spacing (4px grid)
// ---------------------------------------------------------------------------

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
} as const;

// ---------------------------------------------------------------------------
// Border radii
// ---------------------------------------------------------------------------

export const radii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0,0,0,.05)',
  sm: '0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1)',
  md: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)',
  '2xl': '0 25px 50px -12px rgba(0,0,0,.25)',
  inner: 'inset 0 2px 4px 0 rgba(0,0,0,.06)',
  /** For elevated floating panels: popovers, dropdowns, dialogs. */
  float: '0 8px 30px rgba(0,0,0,.12)',
  /** Glow behind the primary accent for focused inputs and buttons. */
  glow: `0 0 0 3px ${brand[200]}`,
} as const;

// ---------------------------------------------------------------------------
// Z-index layers
// ---------------------------------------------------------------------------

export const zIndex = {
  behind: -1,
  base: 0,
  /** Sticky headers, toolbars */
  sticky: 100,
  /** Dropdown menus, popovers */
  dropdown: 200,
  /** Overlays (backdrop behind dialogs) */
  overlay: 300,
  /** Modal dialogs */
  modal: 400,
  /** Toast notifications */
  toast: 500,
  /** Tooltips */
  tooltip: 600,
  /** Full-screen command palette / spotlight */
  spotlight: 700,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const fontFamily = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
} as const;

export const fontSize = {
  '2xs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px
  xs: ['0.75rem', { lineHeight: '1rem' }],            // 12px
  sm: ['0.8125rem', { lineHeight: '1.25rem' }],       // 13px
  base: ['0.875rem', { lineHeight: '1.375rem' }],     // 14px
  md: ['0.9375rem', { lineHeight: '1.5rem' }],        // 15px
  lg: ['1.0625rem', { lineHeight: '1.625rem' }],      // 17px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],         // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],          // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],     // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],       // 36px
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export const borderWidth = {
  DEFAULT: '1px',
  0: '0px',
  2: '2px',
} as const;

/** Default transition for interactive elements (buttons, inputs, cards). */
export const transition = {
  fast: '120ms cubic-bezier(.4,0,.2,1)',
  base: '200ms cubic-bezier(.4,0,.2,1)',
  slow: '350ms cubic-bezier(.4,0,.2,1)',
  spring: '500ms cubic-bezier(.175,.885,.32,1.275)',
} as const;
