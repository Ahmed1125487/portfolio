# QA + Front-End Performance Review

**Project:** `C:\Users\Ahmed\Desktop\portfolio`  
**Stack:** Vite 8 + React 19 + TypeScript + Tailwind 4 + GSAP/ScrollTrigger + Lenis + Framer Motion  
**Review type:** source review + real Chromium browser tests + measured performance  
**Deployment targets checked:** GitHub Pages base `/portfolio/` and Vercel/root base `/`  

## Verdict

**No Critical issues.** Two Major issues remain: incomplete/stale SEO metadata, and poor mobile lab load/blocking time. Five Minor issues remain: tablet project-card composition, idle rAF work, no JS code splitting, the `mailto:` button, and mobile-nav focus placement.

The layout defects found during the review were fixed and re-verified: the Projects sticky label overlapped project cards at 390px and on short desktop viewports, mobile Journey caused an 8px horizontal overflow, both focus traps could escape, and three headings had concatenated accessible names. See **Fixed during review** below for the diff and reruns.

**Lighthouse was not executed. No Lighthouse report exists.** Official TBT, axe-core, Firefox/WebKit, real-device, and live-deployment checks were not run; those rows are marked NOT RUN.

## Method and scope

- Browser: Playwright 1.65 driving the bundled Chromium 1254 build, headless.
- Functional viewports: desktop 1440x900 and mobile 390x844 (iPhone 12 emulation, touch).
- Overflow/screenshot widths: 320, 360, 390, 768, 1024, 1280, 1440, 1920.
- Production previews: `http://127.0.0.1:4173/portfolio/` and `http://127.0.0.1:4174/` (rebuilt with `VERCEL=1`). Dev server `http://127.0.0.1:5173/portfolio/` was also used during development.
- Performance: Playwright `PerformanceObserver` for FCP, LCP, layout-shift, long tasks; `PerformanceResourceTiming` for transfer; CDP `Emulation.setCPUThrottlingRate(4)` for the mobile CPU test. **No network throttling was applied.**
- Scroll pacing: programmatic rAF-driven scroll over 900px (Hero) and the full 3x900px Projects pin distance, sampling frame deltas.
- Screenshots were captured only after section entrance/mask timelines settled (1.2 s settle plus explicit project/certificate image waits). Initial captures caught mid-reveal frames; those were test artifacts, not product defects, and were discarded.
- Tests live only in `tests/qa/`; screenshots only in `screenshots/qa/`; Playwright output only in `test-results/`. No new dependencies. No commit or push was made.

## Results

| Area | Check | Result | Details |
|---|---|---|---|
| Build | `npm run lint` + `npm run build` | PASS | oxlint clean; TypeScript and Vite build succeeded; 477 modules. |
| Bundle | GitHub Pages build | PASS | JS `714.22 kB` (`232.58 kB` gzip); CSS `51.51 kB` (`9.39 kB` gzip); total `dist` 3.11 MB. Vite emits the >500 kB chunk warning. |
| Bundle | Vercel/root build | PASS | JS `714.20 kB` (`232.58 kB` gzip); CSS `51.51 kB` (`9.39 kB` gzip); same 477 modules. |
| Base path | `/portfolio/` assets, HTML, CSS, JS, icon, both images | PASS | All 200; images decoded at 1778x1264 and 1896x978; no failed requests. |
| Base path | `/` assets, HTML, CSS, JS, icon, both images | PASS | All 200 under the root-base build; same image dimensions. |
| Cold load | Desktop console, failed requests, blank sections, images, canvas | PASS | 0 page errors, 0 console errors after filtering QA-induced canvas readback warning, no blank sections; both canvases render. |
| Desktop functional | Nav targets/labels/active state, hero lens/CTAs, certificate modal, Projects pin, Skills/Journey, links, overlays, full scroll | PASS | Every desktop interaction check passes; the only desktop-suite failure is SEO. |
| Mobile functional | Menu lock/trap/ESC/link close, project stack, certificate modal, touch overlays, section reachability | PASS | 5/5 pass. Menu has 6 links and wraps 6 Tabs; body scroll restored; dialog 366x768 fits 390x844. |
| Projects pin | Card fit at 1280x720, 1440x900, 1920x1080 | PASS | Label bottom 96/96/80; card top 96/162/252. No overlap, no clipped child; 1280 card 528px high after the fix. |
| Projects mobile | 4 stacked cards, no pin, no overflow | PASS | Cards 342px wide at x=24..366; first card top 136; label ends 112. |
| Overflow | 320 through 1920 | PASS | scrollWidth <= innerWidth at every width: 305/345/375/753/1009/1265/1425/1905 for 320/360/390/768/1024/1280/1440/1920. Body `overflow-x: clip`; no clipping candidates. |
| Screenshots | 390x844, 768x1024, 1440x900 per-section + full page | PASS | Captured in `screenshots/qa/`; all page sections represented; no horizontal clipping. |
| A11y structure | Headings, landmarks, names, lang, skip link, canvas hiding | PASS (custom checks) | 1 h1; headings ordered h1/h2/h3 with no skips; header/nav/main/footer each 1; 20 interactive, 0 unnamed; `lang=en`; skip target `main-content`; both canvases `aria-hidden=true`. |
| A11y contrast | 8 representative text/button samples | PASS | Lowest text ratio 3.20 for the 60px decorative '2027'; all body/meta/footer samples >=5.13; accent button 15.62. |
| Reduced motion | Pin/heavy motion disabled, content usable | PASS | Projects stack, Journey links remain reachable; no horizontal overflow. |
| Keyboard | Skip link, focus visibility, reachability, page-level trap | PASS | Skip focuses main; 20 focusables reachable; both dialogs trap and restore focus. Minor post-link focus caveat below. |
| SEO | Title, description, canonical, OG/Twitter, icon, JSON-LD, robots, sitemap | **FAIL** | Title/description/favicon present; canonical null; Twitter tags `[]`; apple-touch-icon null; JSON-LD `[]`; OG URL still `https://ahmedatef.dev`; no OG image; robots.txt and sitemap.xml return the SPA HTML with 200. |
| Desktop load | FCP / LCP / CLS | PASS | FCP `832 ms`; LCP `2156 ms`; CLS `0.0014`; LCP element is the hero name `SPAN.line block italic text-text`. |
| Mobile load | 4x CPU FCP / LCP / CLS | **FAIL** | Latest run FCP `6360 ms`, LCP `8744 ms`, CLS `0.0003`; previous run FCP `2840 ms`, LCP `5148 ms`, CLS `0.0002`. Consistent result is multi-second blocking and LCP after 5 s. |
| TBT (official) | Lighthouse/TBT definition | NOT RUN | No Lighthouse run. A post-FCP long-task excess proxy is `20-48 ms` desktop and `702-738 ms` mobile; this is not official TBT. |
| JS transfer | Script bytes over the wire | PASS (measured), warning | `230,933 B` script transfer; `463,204 B` total resources; 4 resource entries. |
| Scroll pacing | Programmatic Hero + Projects pin scroll | **FAIL (lab)** | Hero: 30 frames, avg `31 ms`, p95 `50 ms`, worst `50 ms`, 23 frames >25 ms, 1 >50 ms. Projects: 92 frames, avg `26 ms`, p95 `33 ms`, worst `67 ms`, 49 >25 ms, 2 >50 ms. Headless/no-GPU result; not a real-device verdict. |
| Canvas pausing | Visible pixels change; offscreen/hidden stable | PASS | Visible hashes differ; offscreen and hidden hashes stable. Both canvases are Canvas2D; WebGL false; zero `three` resources. |
| Idle rAF | Callback count while Hero offscreen | **FAIL** | `127` rAF callbacks in 500 ms at Contact, even though the Hero canvas is stopped. |
| Lighthouse | Any Lighthouse audit | NOT RUN | No Lighthouse invocation or report exists. Do not infer Lighthouse scores from this report. |
| Cross-browser / device | Firefox, WebKit, real iOS/Android, screen reader | NOT RUN | Chromium + synthetic viewports only. |
| Live deployment | GitHub Pages/Vercel URLs, caching, headers | NOT RUN | Local production builds only. |

**Suite totals:** 26 unique tests. Final desktop run: **20 passed, 1 failed (SEO)**. Mobile: **5 passed**. The root-base variant of the asset test also passed separately. Targeted reruns after the last test-only screenshot fix: 390/768/1440 screenshots **3/3 passed**.

## Measured performance (final run)

| Metric | Desktop 1440x900 | Mobile 390x844, 4x CPU |
|---|---:|---:|
| DOMContentLoaded | 284 ms | 1459 ms |
| Load | 288 ms | 1476 ms |
| FCP | 832 ms | 6360 ms |
| LCP | 2156 ms | 8744 ms |
| CLS | 0.0014 | 0.0003 |
| Long-task total | 660 ms | 6728 ms |
| Post-FCP blocking proxy | 20 ms | 738 ms |
| JS transfer | 230,933 B | 230,933 B |
| Total transfer | 463,204 B | 463,204 B |
| Requests | 4 | 4 |

Mobile variability is large on this host: an earlier run of the same build measured FCP `2840 ms`, LCP `5148 ms`, long-task total `3387 ms`. Absolute mobile values are therefore lab-only, but every run showed LCP after 5 s and hundreds of ms of post-FCP blocking.

Canvas diagnostics: two Canvas2D canvases (1425x900 each on desktop, 390x844 each on mobile), `webgl: false`, `threeResources: []`. No Three.js is installed or loaded.

## Issues by severity

### Critical

None.

### Major

#### M1 - SEO and social metadata are incomplete or stale

**Repro**

```powershell
npx playwright test -c tests/qa/playwright.qa.config.ts --project=qa-desktop -g 'SEO and metadata'
```

**Observed**

- `canonical`: `null`.
- `twitter:*`: none.
- `apple-touch-icon`: none.
- JSON-LD blocks: none.
- `og:title`, `og:description`, `og:type`, `og:url` still point at the old `https://ahmedatef.dev` content; no `og:image`.
- `robots.txt` and `sitemap.xml` are served with status 200 and `text/html` because Vite falls back to `index.html`; neither is valid robots/sitemap content.

**Evidence:** final desktop test failure, first assertion `expect(meta.canonical).not.toBeNull()` at `tests/qa/qa.desktop.spec.ts:541`; files probed in the same test at lines 542-543.

**Source**

- `index.html:5` favicon only.
- `index.html:11-15` OG tags and title; stale URL/description and no image.
- `public/` contains only `favicon.svg`, `icons.svg`, `certificates/react-diploma.webp`, `projects/portfolio.png`; no `robots.txt` or `sitemap.xml`.

**Fix (not applied)**

Choose one canonical production origin (GitHub Pages and Vercel currently differ). Add canonical, matching `og:url`, a 1200x630 `og:image`, Twitter card tags, apple-touch-icon, Person/WebSite JSON-LD, and generated `robots.txt`/`sitemap.xml` containing that origin. Prefer a build-time `VITE_SITE_URL` so both deployments cannot drift. Not hardcoded because the canonical host is a product/deployment decision.

#### M2 - Mobile lab load and main-thread blocking are poor

**Repro**

```powershell
npx playwright test -c tests/qa/playwright.qa.config.ts --project=qa-desktop -g 'performance: cold load'
```

**Observed:** with 4x CPU throttling on a local preview, LCP was `5.15 s` in one run and `8.74 s` in another; FCP `2.84-6.36 s`; long-task totals `3.39-6.73 s`; post-FCP blocking proxy `702-738 ms`. Desktop LCP stayed `2.16-2.19 s` with CLS `<0.002`.

**Evidence:** performance logs above; JS transfer `230,933 B`; LCP element is the hero name. The app ships one `714 kB` chunk (232.58 kB gzip) and a 2.85 s preloader (`2000 ms` count + `850 ms` exit, `src/components/Preloader.tsx:15,40`).

**Likely contributors**

- One eager bundle; all sections import at startup (`src/App.tsx:2-14`); no dynamic import or manual chunking (`vite.config.ts:5-8`).
- Preloader covers the hero until ~2.85 s, delaying LCP even on desktop.
- Heavy GSAP/ScrollTrigger/Framer Motion setup and canvas work on the main thread.

**Fix (not applied):** split below-fold sections and animation code, load the hero immediately, reduce/skip the preloader (or make it non-blocking), and re-measure on a real mid-range phone with network throttling. Code splitting is safe in principle but touches routing/animation initialization and needs a full rerun; not a last-minute blind edit.

### Minor

#### m1 - Tablet project cards leave a large empty right half

At 768x1024 the project card is ~720px wide and 405px tall, but the screenshot preview is hidden between 768 and 1023 (`md:hidden lg:flex` at `src/sections/Projects.tsx:627`) while the card keeps `max-w-5xl` (`:374`). The left text column leaves roughly 250px blank. Evidence: `screenshots/qa/768-projects-start.png`.

**Fix (not applied):** cap the card at `md:max-w-2xl` with `lg:max-w-5xl`, or show a compact preview at tablet widths. This is a design decision and needs a content-fit check.

#### m2 - Skills marquee and custom cursor keep running offscreen

The Hero canvas correctly stops offscreen, but `127` rAF callbacks still ran in 500 ms at Contact. The Skills marquee loop (`src/sections/Skills.tsx:223,257`) and the cursor loop (`src/hooks/useCustomCursor.ts:55,61`) continue scheduling while their content is hidden or offscreen.

**Fix (not applied):** gate both loops on visibility/offscreen state, or stop scheduling when the section is outside the viewport or `document.hidden`. Needs care not to freeze the marquee on re-entry.

#### m3 - Single 714 kB JS chunk, no code splitting

Vite reports `714.22 kB` minified (`232.58 kB` gzip) and warns about chunks over 500 kB. All sections are statically imported and no `manualChunks`/lazy boundary exists. Not broken, but it contributes to M2.

**Fix (not applied):** route/section-level dynamic imports, especially below-fold Skills/Journey, plus a bundle budget in CI. This is a larger refactor than a safe drive-by edit.

#### m4 - `SEND MESSAGE` is a button that assigns `mailto:`, not a link

`src/sections/Contact.tsx:111-112` uses `window.location.href = mailto:...`; the page has `0` `<a href="mailto:">` anchors. The action works, but it cannot be copied, opened in a new tab, or exposed as a link by browser UI.

**Fix (not applied):** render an `<a href={"mailto:" + email}>` styled like the existing magnetic button, keeping the same visual treatment and click tracking.

#### m5 - Mobile nav link close drops focus to `<body>`

After selecting `(01) ABOUT`, the dialog closes and the page scrolls, but `document.activeElement` becomes `BODY` (test log: `focus after mobile link close: BODY`). Focus is released from the dialog, but it is not placed on the target section heading, so keyboard/screen-reader context is lost. Source: `src/components/Navbar.tsx:203-204`; scroll helper does not move focus (`src/hooks/useSmoothScroll.ts:16-35`).

**Fix (not applied):** after navigation, focus the destination heading with `tabIndex={-1}` (and a visible focus style), or return focus to the menu trigger. Deferred because it changes navigation focus behavior and needs a broader screen-reader pass.

## Fixed during review

These were clear defects with small, local fixes. All were rebuilt and re-tested.

### F1 - Projects label/card overlap (Major)

**Before:** at 390x844 the sticky label's 48px box ended at y=112 and the first card started at y=72; the label covered the `(01)` index. At 1280x720 the label ended at y=96 and the card started at y=72.

**Fix**

```diff
// src/sections/Projects.tsx
+ @media (min-width: 768px) and (min-height: 700px) {
+   .project-card { max-height: calc(100vh - 12rem); }
+ }
- className={isReduced ? 'relative' : 'md:relative md:h-screen'}
+ className={(isReduced ? 'relative' : 'md:relative md:h-screen') + ' max-md:pt-16'}
```

**After / verification:** 390 card top `136`, label bottom `112`; 1280x720 card `96..624`, label `80..96`, `scrollHeight 526 = clientHeight 526`; 1440 and 1920 unchanged. Full pin-layout test passes. Evidence: `390-projects.png`, `projects-pin-1280x720.png`, `projects-pin-1440x900.png`, `projects-pin-1920x1080.png`.

### F2 - Mobile horizontal overflow from Journey geometry (Major)

**Before:** 390 viewport produced `documentElement.scrollWidth 398`. **After:** `375` (the 15px scrollbar allowance), with no clipped candidates.

**Fix:** observe the Journey container width and rebuild only when it changes by more than 1px, covering post-mount scrollbar/font settling without a resize event.

```diff
// src/sections/Journey.tsx
+ const widthObserver = new ResizeObserver(() => {
+   if (Math.abs(container.clientWidth - lastWidth) <= 1) return;
+   refreshPendingRef.current = true;
+   rebuild();
+ });
+ widthObserver.observe(container);
+ // cleanup: widthObserver.disconnect();
```

### F3 - Focus traps could escape (Major a11y)

Both the mobile menu and certificate dialog trapped only at the first/last element and relied on the browser's next sequential step. A programmatic wrap could move focus behind the overlay. Both now compute the current index and handle every Tab/Shift+Tab explicitly.

```diff
- if (!panel.contains(document.activeElement)) first.focus();
- else if (event.shiftKey && document.activeElement === first) last.focus();
- else if (!event.shiftKey && document.activeElement === last) first.focus();
+ const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
+ if (currentIndex === -1) { first.focus(); return; }
+ event.preventDefault();
+ if (event.shiftKey) (currentIndex === 0 ? last : focusables[currentIndex - 1]).focus();
+ else (currentIndex === focusables.length - 1 ? first : focusables[currentIndex + 1]).focus();
```

**Verification:** menu 6 Tabs wrap to first; Shift+Tab wraps to last; ESC restores the toggle; dialog Tab/Shift+Tab stays on Close; all close paths restore focus.

### F4 - Missing page header landmark and concatenated heading names (Minor a11y)

- Wrapped the fixed nav in `<header aria-label="Site header">` (`src/components/Navbar.tsx:209`) so the page exposes a banner landmark; a11y test now sees header/nav/main/footer = 1/1/1/1.
- Restored real spaces between animated words and heading lines: `About.tsx:36-40`, `Certificates.tsx:333`, `Contact.tsx:54`. Accessible names are now `Credentials that prove it` and `Let's work together` instead of concatenated strings.

### F5 - QA/docs were being scanned into the production CSS (Minor build hygiene)

Tailwind's automatic source detection includes untracked files. With this report present, the production CSS grew from `51.51 kB` to `51.62 kB` because class examples such as `md:max-w-2xl` and `lg:max-w-5xl` were extracted from `tests/qa/REPORT.md`. The build is supposed to depend only on application source, not QA artifacts.

```diff
// src/index.css
 @import "tailwindcss";
+/* QA/docs are not application source: do not let their code samples add utilities. */
+@source not "../tests";
```

**After:** `npm run build` is back to the exact pre-report asset hash `index-UP4k7GpY.css`, `51.51 kB`, `9.39 kB` gzip. The directive only removes utilities that no app file uses.

**Diff stat:** 8 source files changed, 49 insertions, 20 deletions. No source changes were made for SEO or the remaining minor items.

## Evidence and artifacts

- Main report: `tests/qa/REPORT.md` (this file).
- Tests: `tests/qa/qa.desktop.spec.ts`, `qa.mobile.spec.ts`, `qa.visual.spec.ts`, `qa.perf.spec.ts`, `qa.a11y.spec.ts`, `qa.base.spec.ts`, plus `utils.ts` and `playwright.qa.config.ts`.
- Screenshots: `screenshots/qa/390-*.png`, `768-*.png`, `1440-*.png`, `full-390.png`, `full-768.png`, `full-1440.png`, `perf-390.png`, `perf-1440.png`.
- Project layout evidence: `projects-pin-1280x720.png`, `projects-pin-1440x900.png`, `projects-pin-1920x1080.png`.
- The 390 Projects screenshot was recaptured after the fix; the earlier 768 screenshot that showed a blank right side is retained as evidence for m1, not as a claim that the page is clipped.

## Deliberate non-fixes and NOT RUN

- **Canonical/robots/sitemap/OG image:** blocked on choosing the production origin; hardcoding either GitHub Pages or Vercel would make the other deployment wrong.
- **Code splitting, preloader, rAF visibility:** performance work with cross-cutting behavior; not safe as drive-by edits and needs a full browser/device rerun.
- **Tablet card reflow:** a design choice; capping width or showing a preview changes the visual composition.
- **Focus after mobile link:** deferred for a screen-reader pass; the current behavior does release focus from the dialog.
- **`SEND MESSAGE` anchor:** functional as a button; converting it touches the styled magnetic-button wrapper.
- **Lighthouse, axe-core, Firefox/WebKit, real iOS/Android, real screen reader, network throttling, live hosting:** NOT RUN. No results are claimed for them.

## Commands used (representative)

```powershell
npm run lint
npm run build
$env:VERCEL='1'; npx vite build
npx playwright test -c tests/qa/playwright.qa.config.ts --project=qa-desktop --workers=1 --reporter=list
npx playwright test -c tests/qa/playwright.qa.config.ts --project=qa-mobile --workers=1 --reporter=list
$env:QA_BASE_URL='http://127.0.0.1:4173/portfolio/'; $env:QA_BASE_PATH='/portfolio/'; npx playwright test -c tests/qa/playwright.qa.config.ts --project=qa-desktop -g 'both-base'
$env:QA_BASE_URL='http://127.0.0.1:4174/'; $env:QA_BASE_PATH='/'; npx playwright test -c tests/qa/playwright.qa.config.ts --project=qa-desktop -g 'both-base'
```

All browser launches used Chromium at `C:\Users\Ahmed\AppData\Local\ms-playwright\chromium-1254\chrome-win64\chrome.exe` under a full-access sandbox because Playwright's runner spawn is blocked by the default confined sandbox (`spawn EPERM`).

**Not committed. Not pushed.**
