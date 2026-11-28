import { expect, type Page } from '@playwright/test';

export type Diagnostics = {
  console: { type: string; text: string }[];
  pageErrors: string[];
  failedRequests: string[];
  badResponses: string[];
};

export function watch(page: Page): Diagnostics {
  const d: Diagnostics = { console: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on('console', (m) => {
    // Chrome emits this only because the QA test repeatedly calls getImageData
    // to verify the hero canvas; it is test instrumentation, not app output.
    if (m.text().includes('willReadFrequently')) return;
    if (m.type() === 'error' || m.type() === 'warning') d.console.push({ type: m.type(), text: m.text() });
  });
  page.on('pageerror', (e) => d.pageErrors.push(e.message));
  page.on('requestfailed', (r) => d.failedRequests.push(r.url() + ' ' + (r.failure()?.errorText ?? '')));
  page.on('response', (r) => {
    if (r.status() >= 400) d.badResponses.push(r.status() + ' ' + r.url());
  });
  return d;
}

export async function openApp(page: Page) {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const preloader = page.locator('.preloader');
  await expect(preloader).toBeAttached({ timeout: 10_000 }).catch(() => {});
  await preloader.waitFor({ state: 'detached', timeout: 20_000 });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#hero h1')).toBeVisible();
}

/** Immediate, verified scroll. CSS scroll-behavior is smooth, so tests must opt out and wait for the exact target. */
export async function instantScroll(page: Page, y: number) {
  const expected = await page.evaluate((top) => {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const target = Math.min(max, Math.max(0, Math.round(top)));
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, target);
    html.style.scrollBehavior = previous;
    return target;
  }, y);
  await expect.poll(async () => Math.abs(await page.evaluate(() => Math.round(window.scrollY)) - expected), { timeout: 5_000 }).toBeLessThan(2);
}

export async function appTop(page: Page) {
  await instantScroll(page, 0);
}

export async function scrollToast(page: Page, y: number) {
  await instantScroll(page, y);
}

export async function sectionTop(page: Page, id: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? Math.round(el.getBoundingClientRect().top) : null;
  }, id);
}

export async function sectionDocTop(page: Page, id: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return Math.round(el.getBoundingClientRect().top + window.scrollY);
  }, id);
}

export async function gotoSection(page: Page, id: string) {
  const top = await sectionDocTop(page, id);
  if (top === null) throw new Error('Missing section ' + id);
  await instantScroll(page, top);
  await expect.poll(() => sectionTop(page, id), { timeout: 5_000 }).toBeLessThanOrEqual(3);
  await expect.poll(() => sectionTop(page, id), { timeout: 5_000 }).toBeGreaterThanOrEqual(-3);
}

export async function overflowState(page: Page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
  }));
}

export async function accessibleName(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return null;
    return {
      tag: el.tagName,
      name: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      outline: getComputedStyle(el).outline,
      rects: el.getClientRects().length,
    };
  });
}
