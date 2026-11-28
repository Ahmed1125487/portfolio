import { test, expect } from '@playwright/test';
import { gotoSection, instantScroll, sectionDocTop, watch } from './utils';

function issue(label: string, value: unknown) {
  console.log('[QA] ' + label + ': ' + JSON.stringify(value));
}

test('both-base asset integrity: HTML, JS, CSS, icons, images resolve under configured base', async ({ page }) => {
  const basePath = process.env.QA_BASE_PATH ?? '/portfolio/';
  const d = watch(page);
  const response = await page.goto('./', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await page.locator('.preloader').waitFor({ state: 'detached', timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#hero h1')).toBeVisible();

  // Visit lazy image locations.
  await gotoSection(page, '#certificates');
  await expect.poll(() => page.locator('#certificates img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
  const projTop = await sectionDocTop(page, '#projects');
  await instantScroll(page, (projTop ?? 0) + 3 * 900);
  await expect.poll(() => page.locator('#projects img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();

  const state = await page.evaluate(() => ({
    url: location.href,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    icon: (document.querySelector('link[rel="icon"]') as HTMLLinkElement | null)?.href ?? null,
    css: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => (l as HTMLLinkElement).href),
    scripts: Array.from(document.querySelectorAll('script[src]')).map((s) => (s as HTMLScriptElement).src),
    images: Array.from(document.images).map((i) => ({ src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight, alt: i.alt })),
    resources: performance.getEntriesByType('resource').map((r) => r.name),
  }));
  issue('base asset state', { basePath, ...state });
  expect(state.bodyBg).toBe('rgb(11, 11, 12)');
  expect(state.icon).not.toBeNull();
  expect(new URL(state.icon!).pathname.startsWith(basePath)).toBeTruthy();
  expect(state.scripts.length).toBe(1);
  expect(state.css.some((href) => new URL(href).pathname.includes('/assets/'))).toBeTruthy();
  for (const img of state.images) {
    expect(img.w, 'image natural width: ' + img.src).toBeGreaterThan(0);
    expect(new URL(img.src).pathname.startsWith(basePath), 'image under base path: ' + img.src).toBeTruthy();
    expect(img.alt.length).toBeGreaterThan(0);
  }
  const assetUrls = [state.icon!, ...state.css, ...state.scripts, ...state.images.map((i) => i.src)];
  for (const url of assetUrls) {
    const r = await page.request.get(url);
    expect(r.status(), 'asset status ' + url).toBe(200);
    expect((await r.body()).byteLength, 'asset body ' + url).toBeGreaterThan(20);
  }
  expect(d.badResponses).toEqual([]);
  expect(d.failedRequests).toEqual([]);
  expect(d.pageErrors).toEqual([]);
  expect(d.console).toEqual([]);
});
