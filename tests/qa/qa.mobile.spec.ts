import { test, expect, type Page } from '@playwright/test';
import { accessibleName, gotoSection, instantScroll, openApp, overflowState, sectionDocTop, sectionTop, watch } from './utils';

function issue(label: string, value: unknown) {
  console.log('[QA] ' + label + ': ' + JSON.stringify(value));
}

async function dialogFor(page: Page) {
  return page.locator('[role="dialog"][aria-modal="true"]').filter({ has: page.locator('#certificate-modal-title') });
}

test.describe('QA mobile functional', () => {
  test('mobile menu: open, lock, trap, ESC, link close, focus release', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const menu = page.getByRole('dialog', { name: 'Mobile navigation' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    const links = menu.getByRole('link');
    await expect(links).toHaveCount(6);
    await expect(links.first()).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(links.last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(links.first()).toBeFocused();
    for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
    await expect(links.first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: '(01) ABOUT', exact: true }).click();
    await expect(menu).toBeHidden();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#about');
    await expect.poll(() => sectionTop(page, '#about')).toBeLessThanOrEqual(4);
    const focusAfterLink = await accessibleName(page);
    issue('focus after mobile link close', focusAfterLink);
    expect(await page.evaluate(() => !!document.activeElement?.closest('#mobile-navigation'))).toBeFalsy();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('mobile projects stack with no pin, readable widths and loaded screenshot', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    await gotoSection(page, '#projects');
    const before = await page.evaluate(() => {
      const card = document.querySelector<HTMLElement>('.project-card')!;
      const track = card.parentElement!.parentElement as HTMLElement;
      return {
        direction: getComputedStyle(track).flexDirection,
        pinSpacers: document.querySelectorAll('.pin-spacer').length,
        transform: getComputedStyle(track).transform,
        cards: document.querySelectorAll('.project-card').length,
        sectionHeight: Math.round(document.querySelector('#projects')!.getBoundingClientRect().height),
        viewport: innerHeight,
      };
    });
    issue('mobile projects state', before);
    expect(before.direction).toBe('column');
    expect(before.pinSpacers).toBe(0);
    expect(before.cards).toBe(4);
    expect(before.sectionHeight).toBeLessThan(before.viewport * 6);

    for (let i = 0; i < 4; i++) {
      const card = page.locator('.project-card').nth(i);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();
      const rect = await card.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, width: r.width, top: r.top, bottom: r.bottom };
      });
      issue('mobile card ' + i, rect);
      expect(rect.left).toBeGreaterThanOrEqual(-1);
      expect(rect.right).toBeLessThanOrEqual(391);
      const bad = await card.evaluate((el) => {
        const cr = el.getBoundingClientRect();
        return Array.from(el.querySelectorAll<HTMLElement>('h3, p, footer, a')).filter((child) => {
          const r = child.getBoundingClientRect();
          return r.width > 0 && (r.left < cr.left - 1 || r.right > cr.right + 1);
        }).map((child) => ({ tag: child.tagName, cls: child.className.slice(0, 50) }));
      });
      expect(bad).toEqual([]);
    }
    const last = page.locator('.project-card').nth(3);
    await expect.poll(() => last.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
    expect(await last.locator('img').getAttribute('src')).toContain('projects/portfolio.png');
    expect(await page.locator('.project-card').first().locator('a').count()).toBe(1);
    expect(await page.locator('.project-card').nth(3).locator('a').count()).toBe(2);
    expect((await overflowState(page)).scrollWidth).toBeLessThanOrEqual(390);
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('mobile certificate dialog is usable within the viewport', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    await gotoSection(page, '#certificates');
    const open = page.getByRole('button', { name: /Open certificate details/ });
    await open.click();
    const dialog = await dialogFor(page);
    await expect(dialog).toBeVisible();
    const panel = dialog.locator('[tabindex="-1"]');
    const box = await panel.boundingBox();
    issue('mobile modal box', box);
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(390);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    expect(box!.height).toBeLessThanOrEqual(844);
    await expect.poll(() => dialog.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
    await expect(dialog.getByRole('button', { name: 'Close certificate dialog' })).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('touch overlays do not intercept input and the custom cursor is hidden', async ({ page }) => {
    await openApp(page);
    const state = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('.cursor-dot, .cursor-ring, .grain-overlay')).map((e) => ({ cls: e.className, display: getComputedStyle(e).display, pointerEvents: getComputedStyle(e).pointerEvents })));
    issue('touch overlays', state);
    expect(state.length).toBe(3);
    expect(state.every((s) => s.pointerEvents === 'none')).toBeTruthy();
    expect(state.find((s) => s.cls.includes('cursor-dot'))?.display).toBe('none');
    expect(state.find((s) => s.cls.includes('cursor-ring'))?.display).toBe('none');
    await page.getByRole('button', { name: 'Open menu' }).click({ trial: true });
  });

  test('mobile page has no horizontal overflow and all sections are reachable', async ({ page }) => {
    await openApp(page);

    for (const id of ['#hero', '#about', '#certificates', '#projects', '#skills', '#journey', '#contact']) {
      const top = await sectionDocTop(page, id);
      await instantScroll(page, top ?? 0);
      await expect.poll(() => sectionTop(page, id)).toBeLessThanOrEqual(3);
      await expect.poll(() => sectionTop(page, id)).toBeGreaterThanOrEqual(-3);
      const o = await overflowState(page);
      expect(o.scrollWidth, id + ' horizontal overflow').toBeLessThanOrEqual(390);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
