/**
 * Screenshot Capture
 *
 * Provides utilities for capturing full pages or specific elements.
 */
import type { CaptureTarget, CaptureResult, ViewportConfig } from './types';
import { createContext } from './browser';
import { config } from '@/lib/config';

const env = config();

const DEFAULT_VIEWPORT: ViewportConfig = {
  width: env.CAPTURE_VIEWPORT_WIDTH,
  height: env.CAPTURE_VIEWPORT_HEIGHT,
  deviceScaleFactor: env.CAPTURE_DEVICE_SCALE,
  isMobile: false,
  hasTouch: false,
};

export async function captureScreenshot(
  target: CaptureTarget,
  viewport: ViewportConfig = DEFAULT_VIEWPORT
): Promise<CaptureResult> {
  const context = await createContext(viewport);
  const page = await context.newPage();

  try {
    await page.goto(target.url, {
      waitUntil: 'networkidle',
      timeout: env.CAPTURE_TIMEOUT_MS,
    });

    if (target.waitForTimeoutMs) {
      await page.waitForTimeout(target.waitForTimeoutMs);
    }

    if (target.waitForSelector) {
      await page.waitForSelector(target.waitForSelector, { timeout: env.CAPTURE_TIMEOUT_MS });
    }

    let imageBuffer: Buffer;
    
    if (target.selector) {
      const element = await page.locator(target.selector).first();
      imageBuffer = await element.screenshot({ type: 'png' });
    } else {
      imageBuffer = await page.screenshot({ type: 'png', fullPage: true });
    }

    return {
      imageBuffer,
      width: viewport.width * viewport.deviceScaleFactor,
      height: viewport.height * viewport.deviceScaleFactor,
      format: 'png',
    };
  } finally {
    await page.close();
    await context.close();
  }
}
