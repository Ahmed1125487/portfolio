import { test, expect } from '@playwright/test';

test.describe('Mobile Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Mobile takes longer to load
    await page.waitForTimeout(6000);
    await page.waitForSelector('[class*="preloader-curtain"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(500);
  });

  test('hero loads on mobile', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/hero-mobile.png', fullPage: false });
    await expect(page.locator('#hero')).toBeVisible();
  });

  test('nav toggle button visible on mobile', async ({ page }) => {
    await expect(page.locator('button[aria-label="Toggle menu"]')).toBeVisible();
  });

  test('footer renders on mobile', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/footer-mobile.png', fullPage: false });
    await expect(page.locator('footer')).toBeVisible();
  });
});