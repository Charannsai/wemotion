/**
 * Capture Engine Types
 *
 * Defines configuration for Playwright-based screenshot and interactions.
 */

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
}

export interface CaptureTarget {
  url: string;
  selector?: string; // If omitted, captures full page
  waitForSelector?: string;
  waitForTimeoutMs?: number;
}

export interface InteractionStep {
  action: 'click' | 'hover' | 'type' | 'scroll';
  selector?: string;
  value?: string; // For typing
  x?: number; // For scrolling/clicking specific coords
  y?: number;
}

export interface CaptureResult {
  imageBuffer: Buffer;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
}
