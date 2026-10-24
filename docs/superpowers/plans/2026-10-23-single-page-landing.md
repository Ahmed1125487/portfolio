# Single-Page Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing portfolio into a one-page landing with anchor sections (Hero, About, Projects, Skills, Contact), a sticky navbar with active-section highlight, a full-screen hero with the 3D scene behind the headline, marketing-style section headers with CTAs, and a closing CTA above a simple footer.

**Architecture:** Adjust the existing React + Vite + Tailwind components. Add three small shared pieces: `SectionHeader` (eyebrow, headline, supporting line), `SectionCallToAction` (end-of-section link to the next step), and `useActiveSection` (IntersectionObserver hook for navbar highlight). Lenis handles smooth anchor scrolling, and CSS `scroll-margin-top` covers native scrolling when reduced motion turns Lenis off.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS 3, Lenis 1.3, GSAP, Framer Motion, React Three Fiber.

**Spec:** Conversation request dated 2026-10-23 (single-page landing, hero, marketing sections, closing CTA; keep design system, dark theme, emerald accent, 3D hero, reduced motion, WebGL fallback, lighter mobile 3D; humanizer for all new copy).

## Global Constraints

- Keep the existing tokens: `canvas`, `card`, `emerald-*`, Plus Jakarta Sans, JetBrains Mono.
- No new dependencies.
- All new copy follows the humanizer rules: no em dashes, no "not X but Y" framing, no stacked closers, no invented numbers or claims.
- Download CV links to `/cv.pdf` (`personalInfo.cvUrl`).
- Sections keep `id` values `about`, `projects`, `skills`, `contact`; the hero section uses `id="hero"`.

## Review Focus

1. WebGL unavailable: the hero shows the CSS emerald radial glow with no console errors.
2. `prefers-reduced-motion: reduce`: no Lenis, no hero split-text animation, no marquee, no 3D auto-rotate; anchors still land under the navbar.
3. Mobile 360px: no horizontal scroll, drawer opens and closes, the 3D scene uses the lighter settings.
4. Hash load (`/#projects`) and anchor clicks land below the sticky navbar; the active link updates as sections scroll past.
5. "Download CV" opens or downloads `/cv.pdf`; "Hire me" scrolls to Contact.

Verification method: the project has no test runner and adding one is out of scope. Each task is verified by `npx tsc --noEmit` (type check) plus `npm run build`, and the final task checks the running dev server in a browser at 1440px and 375px wide.

---

### Task 1: Copy and data

**Files:**
- Modify: `src/data/portfolioData.ts`
- Modify: `src/components/hero/HeroFallback.tsx` (text uses `personalInfo.title`)

**Interfaces:**
- Produces: `personalInfo.title` = `'Frontend & Full-Stack Web Developer'`; `projects[i].description` short, outcome-focused copy (same `ProjectItem` shape).

- [ ] **Step 1: Update `personalInfo.title` and `personalInfo.tagline`**

Title becomes `Frontend & Full-Stack Web Developer`. Tagline becomes the employer value line: `I build fast, accessible React apps and keep the code clean enough for a team to pick up. I'm looking for an internship or junior role where I can ship real features.`

- [ ] **Step 2: Rewrite the four project `description` fields**

Each description is one or two sentences and states only what the existing copy already claims:
- E-Commerce Frontend: shoppers filter the catalog, add items to a cart that holds its state, and move through a short checkout.
- Banque Misr Website Redesign: simplified navigation and typographic hierarchy on core retail banking pages, with WCAG accessibility in mind.
- Team Graduation Project: led the client side of the HTI capstone (state handling, REST API integration, reusable components).
- Interactive Web Experiments: small experiments with Three.js, GSAP, and canvas, testing how far smooth motion can go without slowing the page.

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

Skipped: the project is not a git repository.

---

### Task 2: Shared section primitives

**Files:**
- Create: `src/components/layout/SectionHeader.tsx`
- Create: `src/components/layout/SectionCallToAction.tsx`
- Create: `src/hooks/useActiveSection.ts`

**Interfaces:**
- Produces: `SectionHeader: React.FC<{ icon: LucideIcon; eyebrow: string; title: string; description: string; align?: 'left' | 'center' }>`
- Produces: `SectionCallToAction: React.FC<{ text: string; label: string; href: string }>`
- Produces: `useActiveSection(ids: string[]): string | null` (returns the id of the section crossing the viewport's middle band, `null` at the top)

- [ ] **Step 1: Build `SectionHeader`**

Reuse the existing eyebrow pill markup from `AboutSection.tsx`. Headline `text-3xl sm:text-5xl font-extrabold tracking-tight`. `align="center"` adds `mx-auto text-center` and centers the max-width box.

- [ ] **Step 2: Build `SectionCallToAction`**

A row with the `text` line on the left and a primary emerald link on the right (ArrowRight icon, `group-hover:translate-x-1`). Stacks on mobile. Uses the same focus ring as the hero buttons.

- [ ] **Step 3: Build `useActiveSection`**

IntersectionObserver with `rootMargin: '-45% 0px -50% 0px'` observing `document.getElementById(id)` for each id. Keeps state in `useState<string | null>(null)`, disconnects on unmount.

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

---

### Task 3: Sticky navbar and smooth anchor scrolling

**Files:**
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/SmoothScrollProvider.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `useActiveSection(['about', 'projects', 'skills', 'contact'])` from Task 2.
- Consumes: `personalInfo.cvUrl` (not used in navbar after this task).

- [ ] **Step 1: Navbar links and active state**

Nav links: About (`#about`), Projects (`#projects`), Skills (`#skills`), Contact (`#contact`). Active link gets `text-emerald-400 bg-card-hover` plus `aria-current="location"`. Logo links to `#hero`.

- [ ] **Step 2: Primary "Hire me" button**

Replace the navbar's "Download CV" button with `Hire me` (`href="#contact"`), styled as the primary emerald button. Mobile drawer gets the same button and the same link list. Clicking a drawer link closes the drawer (existing behavior).

- [ ] **Step 3: Anchor offset**

Lenis: pass `anchors: { offset: -80 }` in `SmoothScrollProvider`. CSS in `index.css`: `section[id] { scroll-margin-top: 5rem; }` for the native path when Lenis is off.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

---

### Task 4: Hero

**Files:**
- Modify: `src/components/hero/HeroSection.tsx`
- Modify: `src/components/hero/Hero3DCanvas.tsx` (wrapper becomes absolute full-hero layer, no fixed height)
- Modify: `src/components/hero/HeroFallback.tsx` (radial emerald glow backdrop, no card)

**Interfaces:**
- Consumes: `personalInfo.name`, `personalInfo.title`, `personalInfo.tagline`, `socialLinks`, `personalInfo.cvUrl`.

- [ ] **Step 1: Layout**

Section `id="hero"`, `min-h-[100svh]`, flex column, centered content. The 3D layer (`Hero3DCanvas` or `HeroFallback`) is `absolute inset-0` behind the text, with a left-to-right scrim gradient so text stays readable. Content `relative z-10`, `max-w-3xl`.

- [ ] **Step 2: Headline and value line**

h1 = `personalInfo.name` at `text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.02]`, keeping the SplitType animation and the `reduceMotion` guard. Subtitle = `personalInfo.title` in emerald. Value line = `personalInfo.tagline` in `text-lg sm:text-xl text-gray-300`.

- [ ] **Step 3: Buttons**

Primary: `View my work`, `href="#projects"`. Secondary: `Download CV`, `href={personalInfo.cvUrl}` with `download`. Both have focus-visible rings and 44px+ height.

- [ ] **Step 4: Trust row**

Under the buttons: `Final-year CS student at HTI • Graduating 2027`, then GitHub and LinkedIn icon links (`aria-label`, `target="_blank"`, `rel="noopener noreferrer"`) from `socialLinks`. Remove the old status chip and stats grid.

- [ ] **Step 5: Scroll indicator**

Bottom-center link `href="#about"` with `aria-label="Scroll to About"`: a 1px x 40px emerald line with `motion-safe:animate-bounce` on a small chevron. Static under reduced motion.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

---

### Task 5: About, Projects, Skills, Contact headers and CTAs

**Files:**
- Modify: `src/components/about/AboutSection.tsx`
- Modify: `src/components/projects/ProjectsSection.tsx`
- Modify: `src/components/projects/ProjectCard.tsx`
- Modify: `src/components/skills/SkillsSection.tsx`
- Modify: `src/components/contact/ContactSection.tsx`

**Interfaces:**
- Consumes: `SectionHeader`, `SectionCallToAction` (Task 2).

- [ ] **Step 1: Switch all four sections to `SectionHeader`**

Copy (new, humanized):
- About: eyebrow `About`, title `Computer science, with a frontend focus`, description `I'm finishing my degree at HTI. Most of my time goes to React and TypeScript, and my HCI coursework shapes how I think about layout and navigation.`
- Projects: eyebrow `Selected work`, title `Projects`, description `A React shop, a banking redesign, a team capstone, and a lab for experiments.`
- Skills (`align="center"`): eyebrow `Toolkit`, title `Tools I use every day`, description `The frameworks, libraries, and foundations behind the projects above.`
- Contact: eyebrow `Contact`, title `Send a message`, description `Tell me about the role or project and I'll get back to you.`

Spacing: sections use `py-20 md:py-32`. Backgrounds alternate `bg-canvas` / `bg-canvas-elevated`. About stays left-aligned split; Skills centered.

- [ ] **Step 2: CTAs**

- About ends with `SectionCallToAction`: text `Want to see the work?`, label `View projects`, href `#projects`.
- Projects ends with: text `Like what you see? Let's talk.`, label `Contact me`, href `#contact`.
- Skills ends with: text `Seen the tools? See them in action.`, label `See it in action`, href `#projects`.
- Contact has no end CTA; the closing section (Task 6) follows it.

- [ ] **Step 3: Projects layout**

First project card spans both columns at `md:` and above, with the placeholder graphic on the left and text on the right (`md:flex-row`). The remaining three use the existing two-column grid. `ProjectCard` takes an optional `wide` prop from the index.

- [ ] **Step 4: Contact copy**

"Let's Connect" card body becomes: `I'm looking for internships and junior frontend roles. Email is the fastest way to reach me.`

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

---

### Task 6: Closing CTA and simple footer

**Files:**
- Create: `src/components/layout/ClosingCta.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/App.tsx` (render `ClosingCta` after `ContactSection`, before `Footer`)

**Interfaces:**
- Consumes: `personalInfo.cvUrl`.

- [ ] **Step 1: `ClosingCta`**

Large centered block: eyebrow `Next step`, headline `Open to internships and junior roles` (`text-4xl sm:text-6xl`), line `If you're hiring for a frontend or full-stack role, or want to talk through a project, send me a message.`. Primary `Hire me` (`href="#contact"`), secondary `Download CV` (`href={personalInfo.cvUrl}`, `download`).

- [ ] **Step 2: Simplify `Footer`**

One row on desktop, stacked on mobile: name plus `Frontend & Full-Stack Web Developer`, social icons (GitHub, LinkedIn, Email), `Download CV`, `Back to top` button, and the copyright line. Remove the two-column navigation block.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

---

### Task 7: Run and check the page

**Files:** none modified unless a check fails.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (background). Expected: Vite reports a local URL, typically `http://localhost:5173`.

- [ ] **Step 2: Browser checks at 1440px and 375px wide**

For each width: hero fills the first screen; navbar links scroll below the navbar; the active link changes as sections scroll; "Hire me" lands on Contact; no horizontal overflow (`document.documentElement.scrollWidth <= window.innerWidth`); no console errors.

- [ ] **Step 3: Report**

Report what passed and what was not verified (for example, WebGL output in headless mode).
