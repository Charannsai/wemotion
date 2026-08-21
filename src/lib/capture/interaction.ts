/**
 * Playwright Interactions
 *
 * Simulates user interactions for dynamic capture scenarios (e.g. opening dropdowns).
 */
import type { Page } from 'playwright';
import type { InteractionStep } from './types';

export async function performInteractions(page: Page, steps: InteractionStep[]): Promise<void> {
  for (const step of steps) {
    try {
      switch (step.action) {
        case 'click':
          if (step.selector) {
            await page.locator(step.selector).first().click();
          } else if (step.x !== undefined && step.y !== undefined) {
            await page.mouse.click(step.x, step.y);
          }
          break;
          
        case 'hover':
          if (step.selector) {
            await page.locator(step.selector).first().hover();
          } else if (step.x !== undefined && step.y !== undefined) {
            await page.mouse.move(step.x, step.y);
          }
          break;
          
        case 'type':
          if (step.selector && step.value) {
            await page.locator(step.selector).first().fill(step.value);
          }
          break;
          
        case 'scroll':
          if (step.y !== undefined) {
            await page.evaluate((y) => window.scrollTo(0, y), step.y);
          }
          break;
      }
      
      // Wait a moment after interactions to allow animations/renders to settle
      await page.waitForTimeout(300);
    } catch (err) {
      console.warn(`[Capture Interaction] Failed to perform ${step.action} on ${step.selector || 'coords'}:`, err);
    }
  }
}
