import { test, expect, type Browser } from '@playwright/test';
import { instantScroll, openApp, sectionDocTop, watch } from './utils';

function issue(label: string, value: unknown) {
  console.log('[QA] ' + label + ': ' + JSON.stringify(value));
}

async function installPerf(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const qa = { lcp: 0, lcpElement: '', lcpTime: 0, cls: 0, shifts: [] as any[], longtasks: [] as any[], rafCount: 0 };
    (window as any).__qa = qa;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (entry.startTime >= qa.lcp) {
          qa.lcp = entry.startTime;
          qa.lcpTime = entry.startTime;
          qa.lcpElement = entry.element ? entry.element.tagName + (entry.element.className ? '.' + String(entry.element.className).slice(0, 40) : '') : '';
        }
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true } as any);
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          qa.cls += entry.value;
          qa.shifts.push({ value: entry.value, start: entry.startTime, sources: (entry.sources ?? []).map((s: any) => s.node?.tagName ?? '') });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true } as any);
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) qa.longtasks.push({ start: Math.round(entry.startTime), duration: Math.round(entry.duration) });
    }).observe({ type: 'longtask', buffered: true } as any);
    const orig = window.requestAnimationFrame.bind(window);
    (window as any).__origRaf = orig;
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      qa.rafCount++;
      return orig(cb);
    };
  });
}

async function metrics(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = res.filter((r) => r.initiatorType === 'script');
    const js = scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const total = res.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const qa = (window as any).__qa;
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0),
      lcp: Math.round(qa.lcp),
      lcpElement: qa.lcpElement,
      cls: Number(qa.cls.toFixed(4)),
      shifts: qa.shifts,
      longTasks: qa.longtasks,
      longTaskTotal: Math.round(qa.longtasks.reduce((s: number, t: any) => s + t.duration, 0)),
      requests: res.length,
      scripts: scripts.map((r) => ({ name: r.name.split('/').pop(), transferSize: r.transferSize, duration: Math.round(r.duration) })),
      jsTransfer: js,
      totalTransfer: total,
      canvases: Array.from(document.querySelectorAll('canvas')).map((c) => ({ width: c.width, height: c.height, twoD: !!c.getContext('2d'), webgl: !!c.getContext('webgl') })),
      threeResources: res.filter((r) => /three/i.test(r.name)).map((r) => r.name),
    };
  });
}

async function coldLoad(browser: Browser, opts: { viewport: { width: number; height: number }; mobile?: boolean; cpu?: number }) {
  const context = await browser.newContext({
    viewport: opts.viewport,
    isMobile: opts.mobile ?? false,
    hasTouch: opts.mobile ?? false,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await installPerf(page);
  const d = watch(page);
  let throttled = false;
  if (opts.cpu) {
    try {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: opts.cpu });
      throttled = true;
    } catch (e) {
      issue('CPU throttle failed', String(e));
    }
  }
  await page.goto('./', { waitUntil: 'load' });
  await page.locator('.preloader').waitFor({ state: 'detached', timeout: 25_000 });
  await expect(page.locator('#hero h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  // Allow the post-preloader LCP/CLS window to close, without a fixed sleep.
  await page.waitForFunction(() => performance.now() > 4500, null, { timeout: 10_000 });
  const m = await metrics(page);
  issue('cold load metrics ' + opts.viewport.width + (opts.cpu ? ' throttled ' + opts.cpu + 'x' : ''), { throttled, ...m });
  await page.screenshot({ path: 'screenshots/qa/perf-' + opts.viewport.width + '.png' });
  await context.close();
  return { throttled, ...m, diagnostics: d };
}

test('performance: cold load desktop and 4x CPU mobile', async ({ browser }) => {
  const desktop = await coldLoad(browser, { viewport: { width: 1440, height: 900 } });
  const mobile = await coldLoad(browser, { viewport: { width: 390, height: 844 }, mobile: true, cpu: 4 });
  expect(desktop.lcp).toBeGreaterThan(0);
  expect(mobile.lcp).toBeGreaterThan(0);
  expect(desktop.threeResources).toEqual([]);
  expect(mobile.threeResources).toEqual([]);
  expect(desktop.canvases.every((c) => c.twoD && !c.webgl)).toBeTruthy();
  expect(desktop.diagnostics.pageErrors).toEqual([]);
  expect(mobile.diagnostics.pageErrors).toEqual([]);
});

async function sampleScroll(page: import('@playwright/test').Page, from: number, to: number, duration: number) {
  return page.evaluate(async ({ from, to, duration }) => {
    const deltas: number[] = [];
    await new Promise<void>((resolve) => {
      const start = performance.now();
      let last = start;
      const step = (now: number) => {
        deltas.push(now - last);
        last = now;
        const p = Math.min(1, (now - start) / duration);
        window.scrollTo(0, from + (to - from) * p);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    const sorted = [...deltas].sort((a, b) => a - b);
    return {
      frames: deltas.length,
      worst: Math.round(Math.max(...deltas)),
      over25ms: deltas.filter((d) => d > 25).length,
      over50ms: deltas.filter((d) => d > 50).length,
      p95: Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
      average: Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length),
    };
  }, { from, to, duration });
}

async function canvasHash(page: import('@playwright/test').Page) {
  return page.locator('canvas').nth(1).evaluate((c: HTMLCanvasElement) => {
    const ctx = c.getContext('2d')!;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let h = 2166136261;
    for (let i = 0; i < data.length; i += 97) h = Math.imul(h ^ data[i], 16777619);
    return h >>> 0;
  });
}

test('scroll smoothness, canvas pausing, and rAF activity', async ({ page }) => {
  const d = watch(page);
  await installPerf(page);
  await openApp(page);
  await instantScroll(page, 0);
  const visible1 = await canvasHash(page);
  await page.waitForFunction((h) => {
    const c = document.querySelectorAll<HTMLCanvasElement>('canvas')[1];
    const ctx = c.getContext('2d')!;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let hh = 2166136261;
    for (let i = 0; i < data.length; i += 97) hh = Math.imul(hh ^ data[i], 16777619);
    return (hh >>> 0) !== h;
  }, visible1, { timeout: 2_000 }).catch(() => {});
  const visible2 = await canvasHash(page);
  issue('hero canvas visible hashes', { visible1, visible2 });
  expect(visible1).not.toBe(visible2);

  const heroScroll = await sampleScroll(page, 0, 900, 900);
  issue('hero programmatic scroll frames', heroScroll);

  const projectsTop = await sectionDocTop(page, '#projects');
  const pinTop = await page.evaluate((top) => top + (document.querySelector<HTMLElement>('#projects .sticky')?.getBoundingClientRect().height ?? 0), projectsTop);
  const distance = 3 * 900;
  const pinScroll = await sampleScroll(page, pinTop, pinTop + distance, 2400);
  issue('projects pin programmatic scroll frames', pinScroll);
  const longTasks = await page.evaluate(() => (window as any).__qa.longtasks);
  issue('long tasks during scrolls', longTasks);

  const contactTop = await sectionDocTop(page, '#contact');
  await page.evaluate((y) => window.scrollTo(0, y), contactTop);
  const off1 = await canvasHash(page);
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
  const off2 = await canvasHash(page);
  issue('hero canvas offscreen hashes', { off1, off2 });
  expect(off1).toBe(off2);

  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
  const hidden = await canvasHash(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  issue('hero canvas hidden vs offscreen hash', { off2, hidden });
  expect(hidden).toBe(off2);

  const rafBefore = await page.evaluate(() => (window as any).__qa.rafCount);
  await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));
  const rafAfter = await page.evaluate(() => (window as any).__qa.rafCount);
  issue('rAF callbacks in 500ms while offscreen', rafAfter - rafBefore);
  expect(d.pageErrors).toEqual([]);
  expect(d.console).toEqual([]);
});
