/**
 * Playwright Browser Manager
 *
 * Manages the headless browser instance for capture and rendering tasks.
 */
import { chromium, type Browser, type BrowserContext } from 'playwright';
import type { ViewportConfig } from './types';
import { config } from '@/lib/config';

const env = config();

let browserPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });
  }
  return browserPromise;
}

export async function createContext(viewport: ViewportConfig): Promise<BrowserContext> {
  const browser = await getBrowser();
  return browser.newContext({
    viewport: {
      width: viewport.width,
      height: viewport.height,
    },
    deviceScaleFactor: viewport.deviceScaleFactor,
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    // Helps with anti-bot measures when taking screenshots
    userAgent: env.INGEST_USER_AGENT,
  });
}

export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}
