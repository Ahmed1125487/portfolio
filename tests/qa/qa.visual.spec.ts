import { test, expect, type Page } from '@playwright/test';
import { appTop, instantScroll, openApp, overflowState, sectionDocTop, sectionTop } from './utils';

function issue(label: string, value: unknown) {
  console.log('[QA] ' + label + ': ' + JSON.stringify(value));
}

const sections = [
  ['hero', '#hero'],
  ['about', '#about'],
  ['certificates', '#certificates'],
  ['projects', '#projects'],
  ['skills', '#skills'],
  ['journey', '#journey'],
  ['contact', '#contact'],
  ['footer', 'footer'],
] as const;

async function waitForNav(page: Page) {
  await expect.poll(async () => page.locator('nav').first().evaluate((nav) => Math.round(nav.getBoundingClientRect().top)), { timeout: 5_000 }).toBeGreaterThan(-30);
  await expect.poll(async () => page.locator('nav').first().evaluate((nav) => getComputedStyle(nav).opacity), { timeout: 5_000 }).toBe('1');
}

async function pinStart(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('#projects')!;
    const spacer = section.querySelector<HTMLElement>('.pin-spacer');
    return Math.round((spacer ?? section).getBoundingClientRect().top + window.scrollY);
  });
}

test.describe('responsive overflow', () => {
  test('no horizontal document overflow at 320 through 1920', async ({ page }) => {
    test.setTimeout(90_000);
    await openApp(page);
    const widths: [number, number][] = [[320, 800], [360, 800], [390, 844], [768, 1024], [1024, 768], [1280, 900], [1440, 900], [1920, 1080]];
    const overflow: any[] = [];
    for (const [width, height] of widths) {
      await page.setViewportSize({ width, height });
      await appTop(page);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      overflow.push({ width, height, ...(await overflowState(page)) });
    }
    const clipped = await page.evaluate(() => {
      const selectors = 'p,h1,h2,h3,h4,span,a,button,li';
      return Array.from(document.querySelectorAll<HTMLElement>(selectors)).filter((el) => {
        if (el.closest('[aria-hidden="true"], .sr-only')) return false;
        if (getComputedStyle(el).position === 'absolute') return false;
        if (el.getClientRects().length === 0) return false;
        const style = getComputedStyle(el);
        return style.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 2 && (el.textContent ?? '').trim().length > 0;
      }).slice(0, 10).map((el) => ({ tag: el.tagName, cls: el.className.slice(0, 80), text: (el.textContent ?? '').trim().slice(0, 80), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    });
    issue('overflow matrix', overflow);
    issue('text clipping candidates', clipped);
    for (const o of overflow) expect(o.scrollWidth, o.width + 'px horizontal overflow').toBeLessThanOrEqual(o.innerWidth);
  });
});

for (const [width, height] of [[390, 844], [768, 1024], [1440, 900]] as const) {
  test.describe('layout ' + width, () => {
    test('full-page and per-section screenshots', async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height });
      await openApp(page);

      for (const [name, sel] of sections) {
        if (name === 'footer') {
          await instantScroll(page, await page.evaluate(() => document.documentElement.scrollHeight));
          await expect.poll(() => page.getByRole('contentinfo').evaluate((el) => Math.round(el.getBoundingClientRect().bottom))).toBeLessThanOrEqual(height + 2);
          await waitForNav(page);
          await page.screenshot({ path: 'screenshots/qa/' + width + '-footer.png' });
          continue;
        }
        if (name === 'projects' && width >= 768) {
          const pin = await pinStart(page);
          const distance = 3 * height;
          for (const [label, p] of [['start', 0], ['mid', 0.5], ['end', 1]] as const) {
            await instantScroll(page, pin + distance * p);
            await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThanOrEqual(pin - 4);
            const active = await page.evaluate(() => {
              const cards = Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
              const center = window.innerWidth / 2;
              let best = -1;
              let bestDistance = Infinity;
              cards.forEach((c, i) => {
                const r = c.getBoundingClientRect();
                const d = Math.abs((r.left + r.right) / 2 - center);
                if (d < bestDistance) { best = i; bestDistance = d; }
              });
              return best;
            });
            if (active >= 0) {
              const activeCard = page.locator('.project-card').nth(active);
              await expect(activeCard).toHaveAttribute('data-revealed', 'true');
              await expect.poll(() => activeCard.evaluate((el) => getComputedStyle(el).opacity), { timeout: 5_000 }).toBe('1');
              await expect.poll(() => activeCard.evaluate((el) => Array.from(el.querySelectorAll('.proj-index, .proj-pill, .proj-desc, .proj-meta, .proj-chip, .proj-preview')).every((child) => getComputedStyle(child).opacity === '1')), { timeout: 5_000 }).toBeTruthy();
              const preview = activeCard.locator('img');
              // Tablet cards intentionally hide the screenshot preview; a hidden
              // lazy image never loads, so only wait when it is actually visible.
              if (await preview.count() && await preview.first().isVisible()) {
                await expect.poll(() => preview.first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { timeout: 5_000 }).toBeTruthy();
              }
            }
            await waitForNav(page);
            await page.screenshot({ path: 'screenshots/qa/' + width + '-projects-' + label + '.png' });
          }
          continue;
        }
        const top = await sectionDocTop(page, sel);
        if (top === null) throw new Error('missing ' + sel);
        await instantScroll(page, top);
        await expect.poll(() => sectionTop(page, sel)).toBeLessThanOrEqual(3);
        await expect.poll(() => sectionTop(page, sel)).toBeGreaterThanOrEqual(-3);
        if (name === 'projects') {
          await expect(page.locator('.project-card').first()).toHaveAttribute('data-revealed', 'true', { timeout: 5_000 });
        }
        if (name === 'skills') {
          await expect.poll(() => page.locator('.skill-panel').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
        }
        if (name === 'certificates') {
          await expect.poll(() => page.locator('#certificates img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), { timeout: 10_000 }).toBeTruthy();
        }
        if (name === 'journey') {
          await expect.poll(() => page.locator('.journey-card').first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
        }
        // Let one-shot entrance/mask timelines finish so screenshots are not
        // captured mid-reveal (notably the certificate headline and cards).
        await page.waitForTimeout(1_200);
        await waitForNav(page);
        await page.screenshot({ path: 'screenshots/qa/' + width + '-' + name + '.png' });
      }

      await page.screenshot({ path: 'screenshots/qa/full-' + width + '.png', fullPage: true });
    });
  });
}
