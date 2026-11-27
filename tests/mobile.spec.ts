import { test, expect } from '@playwright/test';

test.describe('Mobile Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.preloader', { state: 'detached', timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('hero loads on mobile', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/hero-mobile.png', fullPage: false });
    await expect(page.locator('#hero')).toBeVisible();
  });

  test('nav toggle button visible on mobile', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();
  });

  test('mobile menu traps keyboard focus and restores it on close', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.focus();
    await page.keyboard.press('Enter');

    const menu = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(menu.getByRole('link').last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });

  test('footer renders on mobile', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/footer-mobile.png', fullPage: false });
    await expect(footer).toBeVisible();
  });
});