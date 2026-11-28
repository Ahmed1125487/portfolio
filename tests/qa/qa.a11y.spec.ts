import { test, expect } from '@playwright/test';
import { openApp } from './utils';

function issue(label: string, value: unknown) {
  console.log('[QA] ' + label + ': ' + JSON.stringify(value));
}

test('headings, landmarks, accessible names, and muted-text contrast', async ({ page }) => {
  test.setTimeout(90_000);
  await openApp(page);

  const a11y = await page.evaluate(() => {
    const visible = (el: Element) => {
      const style = getComputedStyle(el as HTMLElement);
      return style.display !== 'none' && style.visibility !== 'hidden' && (el as HTMLElement).getClientRects().length > 0;
    };
    const interactive = Array.from(document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(visible);
    const unnamed = interactive.filter((el) => {
      const label = (el.getAttribute('aria-label') || '').trim();
      const labelledby = el.getAttribute('aria-labelledby');
      const fromLabel = labelledby ? labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim() : '';
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      const title = (el.getAttribute('title') || '').trim();
      const imgAlt = el instanceof HTMLImageElement ? el.alt : '';
      return !(label || fromLabel || text || title || imgAlt);
    }).map((el) => ({ tag: el.tagName, cls: el.className.toString().slice(0, 100), html: el.outerHTML.slice(0, 160) }));

    const headings = Array.from(document.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6')).map((h) => ({ level: Number(h.tagName[1]), text: (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90) }));
    let previous = 0;
    const skipped: any[] = [];
    for (const h of headings) {
      if (previous && h.level > previous + 1) skipped.push({ from: previous, to: h.level, text: h.text });
      previous = h.level;
    }

    const pageLandmark = (tag: string) => Array.from(document.querySelectorAll(tag)).filter((el) => !el.closest('section, article, li, dialog')).length;
    const landmarks = {
      header: pageLandmark('header'),
      nav: pageLandmark('nav'),
      main: pageLandmark('main'),
      footer: pageLandmark('footer'),
    };

    const resolveColor = (raw: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d')!;
      const read = (base: string) => {
        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 1, 1);
        ctx.fillStyle = raw;
        ctx.fillRect(0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2]];
      };
      const black = read('#000');
      const white = read('#fff');
      const alpha = 1 - ((white[0] - black[0]) + (white[1] - black[1]) + (white[2] - black[2])) / (3 * 255);
      if (alpha <= 0.001) return { r: 0, g: 0, b: 0, a: 0 };
      return { r: black[0] / alpha, g: black[1] / alpha, b: black[2] / alpha, a: Math.min(1, alpha) };
    };
    const over = (fg: any, bg: any) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const luminance = (c: any) => {
      const channel = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
    };
    const contrast = (el: HTMLElement) => {
      const style = getComputedStyle(el);
      const stack: any[] = [];
      let node: HTMLElement | null = el;
      while (node) {
        const cs = getComputedStyle(node);
        const bg = resolveColor(cs.backgroundColor);
        if (bg.a > 0) stack.push(bg);
        if (bg.a >= 1) break;
        node = node.parentElement;
      }
      let bg = { r: 11, g: 11, b: 12, a: 1 };
      for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg);
      const fg = over(resolveColor(style.color), bg);
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const size = parseFloat(style.fontSize);
      const weight = Number(style.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      return { text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60), size, weight, color: style.color, bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')', ratio: Number(ratio.toFixed(2)), required: large ? 3 : 4.5, pass: ratio >= (large ? 3 : 4.5) };
    };

    const samples: HTMLElement[] = [];
    const add = (el: Element | null) => { if (el instanceof HTMLElement && visible(el)) samples.push(el); };
    add(document.querySelector('#about p.text-xl'));
    add(document.querySelector('.proj-desc'));
    add(document.querySelector('.proj-meta'));
    add(document.querySelectorAll('.journey-card')[4]?.querySelector('[class*="text-6xl"]') ?? null);
    add(document.querySelector('#contact p'));
    add(document.querySelector('.cert-card p'));
    add(document.querySelector('footer p'));
    add(document.querySelector('footer a'));
    const contrasts = samples.map(contrast);

    return {
      h1: document.querySelectorAll('h1').length,
      headings,
      skipped,
      landmarks,
      interactiveCount: interactive.length,
      unnamed,
      contrasts,
      lang: document.documentElement.lang,
      skip: document.querySelector('a[href="#main-content"]')?.textContent?.trim() ?? null,
      mainId: document.querySelector('main')?.id ?? null,
      canvas: Array.from(document.querySelectorAll('canvas')).map((c) => ({ ariaHidden: c.getAttribute('aria-hidden'), role: c.getAttribute('role') })),
    };
  });

  issue('a11y state', a11y);
  expect(a11y.lang).toBe('en');
  expect(a11y.h1).toBe(1);
  expect(a11y.skipped, 'no skipped heading levels').toEqual([]);
  expect(a11y.interactiveCount).toBeGreaterThan(10);
  expect(a11y.unnamed, 'interactive controls without an accessible name').toEqual([]);
  expect(a11y.landmarks.header, 'page-level banner landmark').toBeGreaterThan(0);
  expect(a11y.landmarks.nav).toBe(1);
  expect(a11y.landmarks.main).toBe(1);
  expect(a11y.landmarks.footer).toBe(1);
  expect(a11y.skip).toBe('Skip to main content');
  expect(a11y.mainId).toBe('main-content');
  for (const c of a11y.contrasts) expect(c.pass, JSON.stringify(c)).toBeTruthy();
});
