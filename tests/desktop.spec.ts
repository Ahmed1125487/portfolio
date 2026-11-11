import { test, expect } from '@playwright/test';

test.describe('Desktop Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[class*="preloader-curtain"]', { state: 'hidden', timeout: 8000 });
    await page.waitForTimeout(500);
  });

  test('hero section', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/hero-desktop.png', fullPage: false });
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('h1').first()).toContainText('Ahmed');
    await expect(page.locator('h1').first()).toContainText('Atef');
  });

  test('about section', async ({ page }) => {
    await page.getByRole('link', { name: '(01) ABOUT' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/about-desktop.png', fullPage: false });
    await expect(page.locator('#about')).toBeVisible();
  });

  test('skills section with icon marquee', async ({ page }) => {
    await page.getByRole('link', { name: '(03) SKILLS' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/skills-desktop.png', fullPage: false });
    await expect(page.locator('#skills')).toBeVisible();
    await expect(page.locator('.marquee-item').first()).toBeVisible();
  });

  test('contact section', async ({ page }) => {
    await page.getByRole('link', { name: '(05) CONTACT' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/contact-desktop.png', fullPage: false });
    await expect(page.locator('#contact')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /COPY/i })).toBeVisible();
  });
});