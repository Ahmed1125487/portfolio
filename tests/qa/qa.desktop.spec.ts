import { test, expect, type Page } from '@playwright/test';
import { accessibleName, appTop, gotoSection, instantScroll, openApp, overflowState, sectionDocTop, sectionTop, watch } from './utils';

function issue(label: string, value: unknown) {
  console.log('[QA] ' + label + ': ' + JSON.stringify(value));
}

async function dialogFor(page: Page) {
  return page.locator('[role="dialog"][aria-modal="true"]').filter({ has: page.locator('#certificate-modal-title') });
}

async function pinInfo(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('#projects');
    if (!section) throw new Error('missing projects');
    const label = section.querySelector<HTMLElement>('.sticky');
    const spacer = section.querySelector<HTMLElement>('.pin-spacer');
    const pinTarget = spacer ?? (section.children[2] as HTMLElement);
    return {
      sectionTop: Math.round(section.getBoundingClientRect().top + window.scrollY),
      pinTop: Math.round(pinTarget.getBoundingClientRect().top + window.scrollY),
      pinHeight: Math.round(pinTarget.getBoundingClientRect().height),
      distance: (4 - 1) * window.innerHeight,
      labelHeight: label ? Math.round(label.getBoundingClientRect().height) : 0,
      sectionHeight: Math.round(section.getBoundingClientRect().height),
    };
  });
}

async function trackX(page: Page) {
  return page.evaluate(() => {
    const card = document.querySelector<HTMLElement>('.project-card');
    const track = card?.parentElement?.parentElement as HTMLElement;
    const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
    return Math.round(m.m41);
  });
}

async function setPinProgress(page: Page, p: number) {
  const info = await pinInfo(page);
  const target = info.pinTop + info.distance * p;
  await instantScroll(page, target);
  return info;
}

test.describe('QA desktop functional', () => {
  test('cold load: no console errors, 404s, or blank sections; images and canvas render', async ({ page }) => {
    const d = watch(page);
    const started = Date.now();
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.preloader')).toBeAttached({ timeout: 10_000 });
    const preloaderAt = Date.now() - started;
    await page.locator('.preloader').waitFor({ state: 'detached', timeout: 20_000 });
    const readyAt = Date.now() - started;
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#hero h1')).toBeVisible();

    expect(d.pageErrors, 'page errors').toEqual([]);
    expect(d.console, 'console errors/warnings').toEqual([]);
    expect(d.failedRequests, 'failed requests').toEqual([]);
    expect(d.badResponses, 'HTTP 4xx/5xx').toEqual([]);
    await expect(page.locator('h1')).toHaveCount(1);

    const top = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      return {
        title: document.title,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        canvases: canvases.map((c) => {
          const ctx = c.getContext('2d');
          if (!ctx) return { width: c.width, height: c.height, nonBlank: false, pixels: 0 };
          const data = ctx.getImageData(0, 0, c.width, c.height).data;
          let pixels = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 0) pixels++;
          return { width: c.width, height: c.height, nonBlank: pixels > 100, pixels };
        }),
        images: Array.from(document.images).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, naturalWidth: i.naturalWidth })),
      };
    });
    issue('preloader timing (ms)', { preloaderAt, readyAt });
    issue('page/canvas', top);
    expect(top.canvases.length).toBe(2);
    expect(top.canvases.every((c) => c.nonBlank), 'both hero canvases draw pixels').toBeTruthy();
    expect(top.scrollWidth).toBeLessThanOrEqual(top.innerWidth);
    expect(preloaderAt).toBeLessThan(7_000);

    // Trigger lazy images by visiting the pinned end and the certificate.
    await gotoSection(page, '#certificates');
    await expect(page.locator('#certificates img').first()).toHaveJSProperty('complete', true);
    await gotoSection(page, '#projects');
    const info = await pinInfo(page);
    await instantScroll(page, info.pinTop + info.distance);
    await expect.poll(() => page.locator('#projects img').first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
    const imgs = await page.evaluate(() => Array.from(document.images).map((i) => ({ src: i.currentSrc, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })));
    issue('images after scroll', imgs);
    expect(imgs.every((i) => i.w > 0 && i.alt.length > 0)).toBeTruthy();
  });

  test('navbar labels, scroll targets, and active state', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    const labels = ['(01) ABOUT', '(02) CERTIFICATES', '(03) PROJECTS', '(04) SKILLS', '(05) JOURNEY', '(06) CONTACT'];
    const ids = ['#about', '#certificates', '#projects', '#skills', '#journey', '#contact'];
    for (let i = 0; i < labels.length; i++) {
      const link = page.getByRole('link', { name: labels[i], exact: true });
      await expect(link).toBeVisible();
      await link.click();
      await expect.poll(() => page.evaluate(() => location.hash)).toBe(ids[i]);
      await expect.poll(() => sectionTop(page, ids[i]), { timeout: 15_000 }).toBeLessThanOrEqual(4);
      await expect.poll(() => page.getByRole('link', { name: labels[i], exact: true }).getAttribute('aria-current')).toBe('location');
    }
    await page.getByRole('link', { name: 'Ahmed Atef — home' }).click();
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeLessThan(4);
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('hero canvas lens and CTA navigation', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    const overlay = page.locator('canvas').nth(1);
    issue('lens media', await page.evaluate(() => ({ hover: matchMedia('(hover: hover)').matches, fine: matchMedia('(pointer: fine)').matches })));
    const countPixels = () => overlay.evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext('2d')!;
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
      return n;
    });
    const before = await countPixels();
    const box = await page.locator('#hero').boundingBox();
    if (!box) throw new Error('hero missing');
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.45);
    await expect.poll(countPixels, { timeout: 5_000 }).toBeGreaterThan(before * 1.02);
    issue('lens pixels', { before, after: await countPixels() });

    await page.getByRole('button', { name: 'VIEW PROJECTS' }).click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#projects');
    await expect.poll(() => sectionTop(page, '#projects')).toBeLessThanOrEqual(4);
    // Reload instead of native scrollTo: Lenis keeps its own scroll target and
    // would pull the page back to Projects while the CTA animation is live.
    await openApp(page);
    await page.getByRole('button', { name: 'GET IN TOUCH' }).click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#contact');
    await expect.poll(() => sectionTop(page, '#contact'), { timeout: 15_000 }).toBeLessThanOrEqual(4);
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('certificate modal: real image, focus trap, scroll lock, all close paths', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    await gotoSection(page, '#certificates');
    const open = page.getByRole('button', { name: /Open certificate details: ReactJS Diploma/ });
    await expect(open).toBeVisible();
    const cardImg = page.locator('#certificates img').first();
    await expect.poll(() => cardImg.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    await open.click();
    let dialog = await dialogFor(page);
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'certificate-modal-title');
    const modalImg = dialog.locator('img');
    await expect.poll(() => modalImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
    expect(await dialog.locator('img').getAttribute('src')).toContain('certificates/react-diploma.webp');
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    const close = dialog.getByRole('button', { name: 'Close certificate dialog' });
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();

    const y = await page.evaluate(() => window.scrollY);
    await page.mouse.move(2, 2);
    await page.mouse.wheel(0, 700);
    await page.waitForFunction((start) => Math.abs(window.scrollY - start) < 2, y, { timeout: 2_000 }).catch(() => {});
    const y2 = await page.evaluate(() => window.scrollY);
    issue('modal scroll lock', { y, y2 });
    expect(Math.abs(y2 - y)).toBeLessThan(3);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    await expect(open).toBeFocused();

    await open.click();
    dialog = await dialogFor(page);
    await expect(dialog).toBeVisible();
    await page.mouse.click(4, 400);
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();

    await open.click();
    dialog = await dialogFor(page);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Close certificate dialog' }).click();
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('projects pin moves all cards, snaps, fits, resumes into Skills, and links are sound', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    const info = await pinInfo(page);
    issue('pin info', info);
    const trackWidth = await page.evaluate(() => {
      const card = document.querySelector<HTMLElement>('.project-card')!;
      const track = card.parentElement?.parentElement;
      return track ? track.scrollWidth : 0;
    });
    const expectedEnd = -(trackWidth - 1440);
    await setPinProgress(page, 0);
    await expect.poll(() => page.locator('.project-card').first().getAttribute('data-revealed')).toBe('true');
    const startX = await trackX(page);
    issue('pin start', { expectedEnd, startX, cards: await page.locator('.project-card').count() });
    expect(startX).toBe(0);

    const cards = page.locator('.project-card');
    for (const p of [0, 1 / 3, 2 / 3, 1]) {
      await setPinProgress(page, p);
      const x = await trackX(page);
      const active = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
        const visible = nodes.map((n) => n.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right, top: r.top, bottom: r.bottom }));
        return visible;
      });
      issue('pin progress ' + p, { x, expected: Math.round(expectedEnd * p), active });
      expect(Math.abs(x - expectedEnd * p)).toBeLessThan(12);
      expect(active.some((r) => r.left >= -2 && r.left < 1440 * 0.2 && r.right > 1440 * 0.7)).toBeTruthy();
    }

    // Each card's content stays within the card and one viewport.
    for (let i = 0; i < 4; i++) {
      await setPinProgress(page, i / 3);
      const overflow = await page.evaluate((idx) => {
        const card = document.querySelectorAll<HTMLElement>('.project-card')[idx];
        const cr = card.getBoundingClientRect();
        const bad = Array.from(card.querySelectorAll<HTMLElement>('h3, p, footer, a')).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.left < cr.left - 1 || r.right > cr.right + 1 || r.top < cr.top - 1 || r.bottom > cr.bottom + 1);
        }).map((el) => ({ tag: el.tagName, cls: el.className.slice(0, 60), r: el.getBoundingClientRect().toJSON() }));
        return { card: { top: cr.top, bottom: cr.bottom, left: cr.left, right: cr.right, w: cr.width, h: cr.height }, scrollHeight: card.scrollHeight, clientHeight: card.clientHeight, bad };
      }, i);
      issue('card fit ' + i, overflow);
      expect(overflow.card.top).toBeGreaterThanOrEqual(-1);
      expect(overflow.card.bottom).toBeLessThanOrEqual(901);
      expect(overflow.bad).toEqual([]);
      // scrollHeight includes a few px of border/rounding; children are checked against the card rect above.
      expect(overflow.scrollHeight).toBeLessThanOrEqual(overflow.clientHeight + 5);
    }

    // Last card: portfolio screenshot plus Vercel + GitHub; earlier cards only GitHub.
    await setPinProgress(page, 1);
    const last = cards.nth(3);
    await expect.poll(() => last.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBeTruthy();
    expect(await last.locator('img').getAttribute('src')).toContain('projects/portfolio.png');
    const links = await last.locator('a').evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href'), label: a.getAttribute('aria-label'), target: a.getAttribute('target'), rel: a.getAttribute('rel') })));
    issue('portfolio links', links);
    expect(links).toHaveLength(2);
    expect(links.every((l) => l.href && l.label && l.target === '_blank' && /noopener/.test(l.rel ?? '') && /noreferrer/.test(l.rel ?? ''))).toBeTruthy();
    const firstLinks = await cards.first().locator('a').count();
    expect(firstLinks).toBe(1);

    // Snap after a non-snap position.
    await setPinProgress(page, 0.18);
    await page.waitForFunction(() => {
      const card = document.querySelector<HTMLElement>('.project-card')!;
      const m = new DOMMatrixReadOnly(getComputedStyle(card.parentElement!.parentElement as HTMLElement).transform);
      return Math.abs(m.m41) > 10;
    }, null, { timeout: 4_000 }).catch(() => {});
    await expect.poll(async () => {
      const y = await page.evaluate(() => window.scrollY);
      const progress = (y - info.pinTop) / info.distance;
      const snap = Math.round(progress * 3) / 3;
      return Math.abs(progress - snap);
    }, { timeout: 5_000 }).toBeLessThan(0.05).catch(async () => {
      issue('snap state', await page.evaluate(() => ({ y: window.scrollY, hash: location.hash })));
      throw new Error('Projects pin did not snap to a card');
    });

    // After the pin, normal flow reaches Skills with no blank gap.
    await page.evaluate((y) => window.scrollTo(0, y), info.pinTop + info.distance + 20);
    await expect.poll(() => sectionTop(page, '#skills'), { timeout: 10_000 }).toBeLessThan(900);
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('projects pin layout at 1280x720, 1440x900 and 1920x1080', async ({ page }) => {
    await openApp(page);
    const results: any[] = [];
    for (const [width, height] of [[1280, 720], [1440, 900], [1920, 1080]] as const) {
      await page.setViewportSize({ width, height });
      await appTop(page);
      const info = await pinInfo(page);
      await page.evaluate((y) => window.scrollTo(0, y), info.pinTop);
      await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThanOrEqual(info.pinTop - 3);
      await expect.poll(() => page.locator('.project-card').first().getAttribute('data-revealed')).toBe('true');
      const result = await page.evaluate(() => {
        const card = document.querySelector<HTMLElement>('.project-card')!;
        const label = document.querySelector<HTMLElement>('#projects .sticky p')!;
        const c = card.getBoundingClientRect();
        const l = label.getBoundingClientRect();
        return {
          viewport: { w: innerWidth, h: innerHeight },
          card: { top: Math.round(c.top), bottom: Math.round(c.bottom), left: Math.round(c.left), right: Math.round(c.right) },
          label: { top: Math.round(l.top), bottom: Math.round(l.bottom) },
          overlap: !(l.bottom <= c.top || l.top >= c.bottom),
          fitsHeight: c.top >= 0 && c.bottom <= innerHeight,
        };
      });
      results.push(result);
      // Let the card's one-shot entrance timeline finish before capturing.
      await page.waitForTimeout(1_200);
      await page.screenshot({ path: 'screenshots/qa/projects-pin-' + width + 'x' + height + '.png' });
    }
    issue('pin layouts', results);
    for (const r of results) {
      expect(r.fitsHeight, 'card fits viewport at ' + r.viewport.w + 'x' + r.viewport.h).toBeTruthy();
      expect(r.overlap, 'section label overlaps card at ' + r.viewport.w + 'x' + r.viewport.h).toBeFalsy();
    }
  });

  test('skills and journey reveal content and journey progress updates', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    await gotoSection(page, '#skills');
    const panels = page.locator('.skill-panel');
    await expect(panels).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(panels.nth(i)).toHaveCSS('opacity', '1');
      await expect(panels.nth(i).locator('.skill-row')).not.toHaveCount(0);
    }
    await expect(page.locator('.marquee-item').first()).toBeVisible();
    await page.locator('.skill-panel').first().hover();
    await expect(page.locator('.marquee-item').first()).toBeVisible();

    await gotoSection(page, '#journey');
    const journeyTop = await sectionDocTop(page, '#journey');
    await page.evaluate((y) => window.scrollTo(0, y), journeyTop + 500);
    await expect.poll(() => page.locator('.journey-card').count()).toBe(5);
    const mid = await page.evaluate(() => ({
      reached: document.querySelectorAll('.journey-card.is-reached').length,
      reachedYears: Array.from(document.querySelectorAll('.journey-card.is-reached > div > div > div:nth-child(2)')).map((e) => e.textContent),
      opacity: Array.from(document.querySelectorAll('.journey-card')).map((e) => getComputedStyle(e).opacity),
      transforms: Array.from(document.querySelectorAll('.journey-card')).map((e) => getComputedStyle(e).transform),
    }));
    issue('journey mid', mid);
    expect(mid.opacity.every((o) => o === '1')).toBeTruthy();
    expect(mid.reached).toBeGreaterThanOrEqual(2);
    await page.evaluate((y) => window.scrollTo(0, y), journeyTop + 1600);
    await expect.poll(() => page.locator('.journey-card.is-reached').count()).toBeGreaterThanOrEqual(4);
    const end = await page.evaluate(() => ({
      reached: document.querySelectorAll('.journey-card.is-reached').length,
      expected: document.querySelectorAll('.journey-card.is-expected').length,
      years: Array.from(document.querySelectorAll('.journey-card.is-reached > div > div > div:nth-child(2)')).map((e) => e.textContent),
    }));
    issue('journey end', end);
    expect(end.reached).toBeGreaterThanOrEqual(mid.reached);
    expect(end.expected).toBe(1);
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('contact and footer links are correct and external links are hardened', async ({ page }) => {
    await openApp(page);
    await gotoSection(page, '#contact');
    const contact = page.locator('#contact');
    const links = await contact.locator('a').evaluateAll((as) => as.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel'), label: a.getAttribute('aria-label') })));
    issue('contact links', links);
    expect(links.find((l) => /github\.com/.test(l.href ?? ''))?.href).toBe('https://github.com/Ahmed1125487');
    expect(links.find((l) => /linkedin\.com/.test(l.href ?? ''))?.href).toContain('linkedin.com/in/ahmed-atef-a8461b402');
    expect(links.every((l) => l.target === '_blank' && /noopener/.test(l.rel ?? '') && /noreferrer/.test(l.rel ?? ''))).toBeTruthy();
    const emailButton = page.getByRole('button', { name: /Copy email address atofy3682@gmail.com/ });
    await expect(emailButton).toBeVisible();
    await expect(page.getByRole('button', { name: 'SEND MESSAGE' })).toBeVisible();
    const mailtoAnchors = await page.locator('a[href^="mailto:"]').count();
    issue('mailto anchors', mailtoAnchors);

    const footer = page.getByRole('contentinfo');
    await expect(footer).toContainText('Ahmed Atef');
    await expect(footer).toContainText(String(new Date().getFullYear()));
    await expect(footer.getByRole('button', { name: 'Back to top' })).toBeVisible();
  });

  test('cursor and grain overlays never intercept clicks', async ({ page }) => {
    await openApp(page);
    const overlays = await page.evaluate(() => Array.from(document.querySelectorAll<HTMLElement>('.cursor-dot, .cursor-ring, .grain-overlay')).map((e) => ({ cls: e.className, pointerEvents: getComputedStyle(e).pointerEvents, zIndex: getComputedStyle(e).zIndex, display: getComputedStyle(e).display })));
    issue('overlays', overlays);
    expect(overlays.length).toBe(3);
    expect(overlays.every((o) => o.pointerEvents === 'none')).toBeTruthy();
    await page.getByRole('button', { name: 'VIEW PROJECTS' }).click({ trial: true });
  });

  test('scrolling the whole page reveals every section', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    const targets = [
      ['#hero', '#hero h1', '1'],
      ['#about', '#about p.text-xl', '1'],
      ['#certificates', '#certificates h2', '1'],
      ['#projects', '.project-card h3', '1'],
      ['#skills', '.skill-panel', '1'],
      ['#journey', '.journey-card', '1'],
      ['#contact', '#contact h2', '1'],
      ['footer', 'footer[role="contentinfo"] p', '1'],
    ] as const;
    for (const [id, selector, opacity] of targets) {
      if (id === 'footer') {
        await instantScroll(page, await page.evaluate(() => document.documentElement.scrollHeight));
        await expect.poll(() => page.getByRole('contentinfo').evaluate((el) => Math.round(el.getBoundingClientRect().bottom))).toBeLessThanOrEqual(901);
      } else {
        const top = await sectionDocTop(page, id);
        if (top !== null) await instantScroll(page, top);
      }
      const loc = page.locator(selector).first();
      await expect(loc).toBeVisible();
      if (selector === '.skill-panel' || selector === '.journey-card' || selector === '#about p.text-xl') {
        await expect(loc).toHaveCSS('opacity', opacity);
      }
    }
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });

  test('keyboard: skip link, focus visibility, reachability and no page-level trap', async ({ page }) => {
    await openApp(page);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveCSS('position', 'fixed');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#main-content');
    const mainFocused = await page.evaluate(() => document.activeElement?.id === 'main-content');
    issue('main focused after skip', mainFocused);

    const focusableCount = await page.locator('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])').evaluateAll((els) => els.filter((e) => (e as HTMLElement).getClientRects().length > 0).length);
    issue('visible focusable count', focusableCount);
    const seen: string[] = [];
    for (let i = 0; i < Math.min(focusableCount + 3, 45); i++) {
      await page.keyboard.press('Tab');
      const a = await accessibleName(page);
      if (!a) continue;
      if (a.name) seen.push(a.tag + ':' + a.name);
      const hasRing = a.outline !== 'none' && (a.outline.includes('rgb') || a.outline.includes('2px'));
      if (a.rects > 0 && a.tag !== 'BODY') {
        expect(hasRing, 'visible focus ring on ' + a.tag + ' ' + a.name + ' outline=' + a.outline).toBeTruthy();
      }
    }
    issue('tab order sample', seen.slice(0, 20));
    expect(new Set(seen).size).toBeGreaterThan(10);
  });
});

test.describe('QA reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('reduced motion disables pin/heavy motion but keeps all content visible and usable', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    const state = await page.evaluate(() => ({
      heroLine: Array.from(document.querySelectorAll('#hero h1 .line')).map((e) => ({ opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform })),
      projectDirection: getComputedStyle(document.querySelector('.project-card')!.parentElement!.parentElement as HTMLElement).flexDirection,
      pinSpacer: document.querySelectorAll('.pin-spacer').length,
      projectCards: document.querySelectorAll('.project-card').length,
      grain: getComputedStyle(document.querySelector('.grain-overlay')!).display,
      cursor: getComputedStyle(document.querySelector('.cursor-dot')!).display,
      skillPanels: Array.from(document.querySelectorAll('.skill-panel')).map((e) => getComputedStyle(e).opacity),
      journey: Array.from(document.querySelectorAll('.journey-card')).map((e) => ({ opacity: getComputedStyle(e).opacity, cls: e.className })),
    }));
    issue('reduced motion state', state);
    expect(state.projectCards).toBe(4);
    expect(state.projectDirection).toBe('column');
    expect(state.pinSpacer).toBe(0);
    expect(state.grain).toBe('none');
    expect(state.cursor).toBe('none');
    expect(state.heroLine.every((l) => l.opacity === '1')).toBeTruthy();
    expect(state.skillPanels.every((o) => o === '1')).toBeTruthy();
    expect(state.journey.every((j) => j.opacity === '1')).toBeTruthy();
    expect((await overflowState(page)).scrollWidth).toBeLessThanOrEqual(1440);
    await expect(page.getByRole('button', { name: 'VIEW PROJECTS' })).toBeVisible();
    await gotoSection(page, '#certificates');
    const open = page.getByRole('button', { name: /Open certificate details/ });
    await open.click();
    const dialog = await dialogFor(page);
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
    expect(d.pageErrors).toEqual([]);
    expect(d.console).toEqual([]);
  });
});

test.describe('SEO and metadata', () => {
  test('reports real title, description, social, icons, robots, sitemap and JSON-LD', async ({ page }) => {
    const d = watch(page);
    await openApp(page);
    const meta = await page.evaluate(() => {
      const get = (sel: string, attr: string) => document.querySelector(sel)?.getAttribute(attr) ?? null;
      return {
        title: document.title,
        lang: document.documentElement.lang,
        description: get('meta[name="description"]', 'content'),
        canonical: get('link[rel="canonical"]', 'href'),
        og: Array.from(document.querySelectorAll('meta[property^="og:"]')).map((m) => ({ property: m.getAttribute('property'), content: m.getAttribute('content') })),
        twitter: Array.from(document.querySelectorAll('meta[name^="twitter:"]')).map((m) => ({ name: m.getAttribute('name'), content: m.getAttribute('content') })),
        icons: Array.from(document.querySelectorAll('link[rel*="icon"]')).map((l) => ({ rel: l.getAttribute('rel'), href: (l as HTMLLinkElement).href })),
        apple: get('link[rel="apple-touch-icon"]', 'href'),
        jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => s.textContent),
        h1: document.querySelectorAll('h1').length,
        h2: Array.from(document.querySelectorAll('h2')).map((h) => h.textContent?.trim()),
        landmarks: {
          header: document.querySelectorAll('header').length,
          nav: document.querySelectorAll('nav').length,
          main: document.querySelectorAll('main').length,
          footer: document.querySelectorAll('footer').length,
        },
      };
    });
    const files: Record<string, { status: number; type: string | null; valid: boolean; sample: string }> = {};
    for (const path of ['favicon.svg', 'robots.txt', 'sitemap.xml']) {
      const r = await page.request.get(new URL(path, page.url()).toString());
      const body = await r.text();
      const valid = path === 'robots.txt'
        ? /user-agent\s*:/i.test(body) && !/<html/i.test(body)
        : path === 'sitemap.xml'
          ? /<urlset[\s>]/i.test(body) && !/<html/i.test(body)
          : /<svg[\s>]/i.test(body);
      files[path] = { status: r.status(), type: r.headers()['content-type'] ?? null, valid, sample: body.slice(0, 80).replace(/\s+/g, ' ') };
    }
    issue('seo meta', meta);
    issue('seo files', files);
    expect(meta.title.length).toBeGreaterThan(0);
    expect(meta.lang).toBe('en');
    expect(meta.description?.length ?? 0).toBeGreaterThan(30);
    expect(meta.h1).toBe(1);
    expect(meta.canonical, 'canonical link').not.toBeNull();
    expect(files['robots.txt'].valid, 'robots.txt is real robots text, not SPA HTML').toBeTruthy();
    expect(files['sitemap.xml'].valid, 'sitemap.xml is a real urlset, not SPA HTML').toBeTruthy();
    for (const raw of meta.jsonLd) {
      if (raw) expect(() => JSON.parse(raw)).not.toThrow();
    }
    expect(d.pageErrors).toEqual([]);
  });
});
