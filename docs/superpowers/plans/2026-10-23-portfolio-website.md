# Personal Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal portfolio website for Ahmed Atef Khairy Mahmoud—a final-year Computer Science student at HTI (graduating 2027) seeking a frontend / full-stack web developer job or internship. Features a dark theme with emerald green accents, an interactive 3D WebGL hero scene, smooth scroll transitions (GSAP + Lenis), component animations (Framer Motion), and accessible, humanized copy.

**Architecture:** Single-Page Application (SPA) built with React (Vite) and TypeScript, styled using Tailwind CSS with custom design tokens. Heavy 3D libraries (`three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`) and particle systems are lazy-loaded with Suspense, WebGL capability detection, mobile optimizations, and `prefers-reduced-motion` compliance. All project data and biography copy are isolated in a single configuration file (`src/data/portfolioData.ts`) for zero-friction future edits.

**Tech Stack:**
- **Framework & Build:** React 18/19, Vite, TypeScript
- **Styling & Tokens:** Tailwind CSS, PostCSS, Lucide React (SVG icons)
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **Motion & Scroll:** GSAP, ScrollTrigger, `@studio-freight/lenis` (or `lenis`), Framer Motion
- **Background Effects:** Lightweight canvas-based particle / ambient emerald glow
- **Testing & Verification:** Vitest / React Testing Library, ESLint, Vite build

**Spec:** Defined by user requirements:
1. Personal: Ahmed Atef Khairy Mahmoud, final-year CS student graduating 2027 at HTI (Higher Technological Institute), 10th of Ramadan City, Egypt. Focused on frontend and full-stack JS/React. Goal: Job or internship. English only.
2. Links: GitHub (`github.com/Ahmed1125487`), LinkedIn (`linkedin.com/in/ahmed-atef-a8461b402`), CV (`/cv.pdf`).
3. Sections: Hero, About, Projects, Skills/Tech, Contact.
4. Projects: E-commerce frontend (React), Banque Misr website redesign (HCI course, HTML + CSS), Team graduation project (frontend role), Other projects placeholder.
5. Visuals & Themes: Dark mode (`#0B0F0E`, `#0F1715`, `#131F1C`), Emerald Green accent (`#10B981`, `#059669`, `#34D399`), glassmorphism cards with subtle emerald rim borders.
6. Accessibility & Performance: Strict `prefers-reduced-motion` toggle, WebGL fallback for low-power/unsupported hardware, mobile-friendly 3D scene scaling, bundle chunking.

---

## Global Constraints

- **Language:** English only throughout the entire UI.
- **Copy Tone:** Humanized, direct, natural, and free of AI marketing clichés ("passionate visionary", "digital craftsmanship", "rich tapestry", "delve").
- **Colors:** Deep dark canvas (`#080C0A` / `#0D1311`), Card surfaces (`#121B17` / `#16221D`), Primary Emerald Accent (`#10B981`), Glow Emerald (`#34D399`), Border (`#1F2F29`).
- **Responsive:** Fluid layout supporting screens from 360px mobile to 4K displays.
- **Accessibility:** WCAG AA contrast (≥ 4.5:1 for body copy), visible keyboard focus rings, semantic landmark tags (`<header>`, `<main>`, `<section>`, `<footer>`), `aria-label` attributes on icon-only links.
- **Placeholders:** Geometric/abstract avatar placeholder for profile photo; distinct generative/CSS dark emerald gradients for project cards until screenshots are added.

## Review Focus

1. **WebGL Unsupported or Crash:** If WebGL is unavailable or fails to initialize, the Hero section must cleanly render an elegant CSS/canvas emerald radial gradient fallback without runtime console errors.
2. **`prefers-reduced-motion: reduce`:** When user has reduced motion enabled in their OS, Three.js rotation, Lenis smooth scrolling, GSAP pins, and Framer Motion spring physics must immediately disable or fall back to static/instant rendering.
3. **Mobile 3D Performance:** On mobile devices (screen width < 768px or coarse pointer), the 3D scene must render lower polygon density, reduced DPR (1.0), and disable heavy post-processing passes to maintain 60fps.
4. **Project Data Replacement Ergonomics:** Replacing a project card placeholder with an actual image must require changing only the `image` field in `src/data/portfolioData.ts` without touching JSX.
5. **Form & Link Fallbacks:** The contact form must perform client-side validation and provide clear accessible feedback; the "Download CV" action must link cleanly to `/cv.pdf`.

---

### Task 1: Scaffolding Vite + React + TypeScript + Tailwind CSS & Design System

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `src/types/index.ts`, `src/utils/cn.ts`, `src/utils/webgl.ts`, `src/utils/motion.ts`
- Modify: `tailwind.config.js` (or Vite Tailwind plugin config)

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` for Tailwind class merging.
- Produces: `isWebGLAvailable(): boolean` to detect hardware acceleration.
- Produces: `shouldReduceMotion(): boolean` for OS accessibility motion preference.
- Produces: Design tokens in Tailwind for emerald themes (`brand-dark`, `brand-card`, `emerald-primary`, `emerald-glow`).

- [ ] **Step 1: Initialize Vite React TypeScript project and install core dependencies**

Initialize project structure with:
- `react`, `react-dom`, `@types/react`, `@types/react-dom`
- `tailwindcss`, `postcss`, `autoprefixer`
- `clsx`, `tailwind-merge`, `lucide-react`
- Animation & 3D packages: `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `gsap`, `lenis`, `framer-motion`, `split-type`

- [ ] **Step 2: Configure Tailwind with custom Emerald Dark Design Tokens**

Configure `tailwind.config.js` with:
- Background colors: `bg-canvas: #080C0A`, `bg-surface: #0E1613`, `bg-card: #131E1A`
- Border colors: `border-subtle: #1D2E27`, `border-emerald: #059669/30`
- Accent colors: `emerald-400: #34D399`, `emerald-500: #10B981`, `emerald-600: #059669`
- Text colors: `text-primary: #F3F4F6`, `text-secondary: #9CA3AF`, `text-muted: #6B7280`

- [ ] **Step 3: Implement WebGL and motion detection utilities**

In `src/utils/webgl.ts`:
- Check for WebGL 1/2 canvas context creation with fallback detection.
In `src/utils/motion.ts`:
- Query `window.matchMedia('(prefers-reduced-motion: reduce)')`.

- [ ] **Step 4: Verify initial build and dev server readiness**

Run `npm run build` and ensure bundle builds cleanly without errors.

---

### Task 2: Data Model & Natural Copywriting (Humanizer)

**Files:**
- Create: `src/data/portfolioData.ts`
- Create: `src/types/portfolio.ts`

**Interfaces:**
- Produces: `personalInfo: PersonalInfo`
- Produces: `projects: ProjectItem[]`
- Produces: `skills: SkillCategory[]`
- Produces: `socialLinks: SocialLink[]`

- [ ] **Step 1: Define TypeScript interfaces for portfolio data**

Include fields for projects:
```typescript
export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  role: string;
  techStack: string[];
  image: string | null; // null triggers custom CSS abstract emerald pattern
  patternId: 'mesh' | 'geometric' | 'circuit' | 'minimal';
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}
```

- [ ] **Step 2: Author humanized, authentic copy in `portfolioData.ts`**

Incorporate Ahmed Atef's specific background:
- HTI (Higher Technological Institute, 10th of Ramadan City, Egypt), Computer Science student, Graduating 2027.
- Career objective: Seeking frontend or full-stack software engineering internships and junior roles.
- All 4 projects:
  1. **E-commerce Frontend:** React-based shopping application with responsive product catalog, cart state management, and filtered search.
  2. **Banque Misr Website Redesign:** Human-Computer Interaction (HCI) coursework project, focused on accessible typography, clean information architecture, and structured banking workflows using semantic HTML and custom CSS.
  3. **Team Graduation Project (Frontend Role):** Collaborative senior capstone project leading the client architecture, UI state handling, and API integration.
  4. **More Projects Coming Soon:** Exploration lab highlighting ongoing experiments with web graphics and full-stack tools.
- Ensure copy is grounded, straightforward, and zero AI boilerplate.

- [ ] **Step 3: Unit test data validity**

Verify all required links (GitHub `github.com/Ahmed1125487`, LinkedIn `linkedin.com/in/ahmed-atef-a8461b402`, CV `/cv.pdf`) and 4 project definitions exist.

---

### Task 3: Smooth Navigation & Scroll Architecture (Lenis + GSAP ScrollTrigger)

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/SmoothScrollProvider.tsx`

**Interfaces:**
- Consumes: `personalInfo`, `socialLinks` from `src/data/portfolioData.ts`
- Produces: `SmoothScrollProvider` wrapper syncing Lenis with GSAP ScrollTrigger.
- Produces: Fixed accessible navigation with mobile menu drawer and "Download CV" CTA.

- [ ] **Step 1: Build `SmoothScrollProvider.tsx`**

- Initialize `Lenis` with smooth dampening (e.g. `lerp: 0.1`).
- Sync `lenis.on('scroll', ScrollTrigger.update)`.
- Connect `gsap.ticker.add((time) => lenis.raf(time * 1000))`.
- Disable Lenis when `shouldReduceMotion()` is true.

- [ ] **Step 2: Build responsive `Navbar.tsx`**

- Brand badge: "Ahmed Atef" with emerald pulse dot.
- Desktop links: About, Projects, Skills, Contact.
- CTA: "Download CV" button linking to `/cv.pdf` with download attribute.
- Mobile hamburger menu with smooth Framer Motion spring slide-in and backdrop blur.
- Keyboard accessibility: Tab traversal and Skip-to-content anchor.

- [ ] **Step 3: Build `Footer.tsx`**

- Minimalist emerald-accented footer with copyright, GitHub and LinkedIn links, and scroll-to-top button.

---

### Task 4: Interactive 3D Hero Scene with R3F & WebGL Fallback

**Files:**
- Create: `src/components/hero/Hero3DCanvas.tsx`
- Create: `src/components/hero/EmeraldGeometricMesh.tsx`
- Create: `src/components/hero/HeroFallback.tsx`
- Create: `src/components/hero/HeroSection.tsx`

**Interfaces:**
- Produces: `HeroSection` combining 3D WebGL hero, animated headlines, badges, and CTAs.
- Consumes: `isWebGLAvailable`, `shouldReduceMotion`.

- [ ] **Step 1: Create `EmeraldGeometricMesh.tsx`**

- Floating, interactive abstract 3D emerald shape (e.g., an icosahedron or torus knot with subtle distorted wireframe / transmission material).
- Mouse parallax / pointer attraction with damped spring rotation (`useFrame`).
- Mobile-specific LOD: simplified geometry segments and throttled pointer updates.

- [ ] **Step 2: Create `Hero3DCanvas.tsx` with Post-processing and Lazy Loading**

- R3F Canvas configured with antialiasing and device pixel ratio clamped to `[1, 2]`.
- Subtle Bloom effect via `@react-three/postprocessing` (disabled on mobile or low-spec devices).
- Suspense wrapper with a smooth spinner / glowing emerald ring placeholder.

- [ ] **Step 3: Create `HeroFallback.tsx`**

- CSS / SVG emerald mesh gradient with animated radial glow and subtle floating geometric cards for environments without WebGL or when `prefers-reduced-motion` is active.

- [ ] **Step 4: Build `HeroSection.tsx` with Split-Type Text Reveals**

- Use `split-type` to split the primary name heading ("Ahmed Atef Khairy Mahmoud") into characters/words.
- Animate split characters with GSAP (`gsap.from(split.chars, { opacity: 0, y: 35, rotateX: -45, stagger: 0.02, duration: 1.1, ease: 'power4.out' })`) on mount, with full `split.revert()` cleanup on unmount.
- Tagline: "Frontend & Full-Stack Developer | Final-Year CS Student at HTI".
- Status chip: "Available for internships & entry-level roles (Graduating 2027)" with pulsing emerald indicator.
- CTAs: "Explore Projects" (scroll to #projects), "Get in Touch" (scroll to #contact), "Download CV" (`/cv.pdf`).

---

### Task 5: About Section with Profile Placeholder & Education Timeline

**Files:**
- Create: `src/components/about/AboutSection.tsx`
- Create: `src/components/about/ProfileAvatarPlaceholder.tsx`
- Create: `src/components/about/EducationCard.tsx`

**Interfaces:**
- Consumes: `personalInfo` from `src/data/portfolioData.ts`.
- Produces: `AboutSection` with HTI Computer Science details, core focus, and high-end geometric monogram avatar placeholder.

- [ ] **Step 1: Create `ProfileAvatarPlaceholder.tsx`**

- Sophisticated modern SVG / CSS emerald monogram ("AA") with glowing ambient rim, emerald particle ring, and clean "Photo placeholder" overlay that seamlessly switches to an `<img />` once a photo URL is added.

- [ ] **Step 2: Build `EducationCard.tsx`**

- Highlights Higher Technological Institute (HTI), 10th of Ramadan City, Egypt.
- B.Sc. in Computer Science (Expected graduation: 2027).
- Key coursework: Data Structures, Algorithms, Software Engineering, Human-Computer Interaction, Web Development.

- [ ] **Step 3: Implement `AboutSection.tsx` with Scroll Reveals**

- Framer Motion / ScrollTrigger fade-up animations.
- Clear statement of purpose: Building responsive web apps, mastering React and modern JavaScript architectures.

---

### Task 6: Projects Section with Distinct Emerald Card Backgrounds

**Files:**
- Create: `src/components/projects/ProjectsSection.tsx`
- Create: `src/components/projects/ProjectCard.tsx`
- Create: `src/components/projects/ProjectPlaceholderGraphic.tsx`

**Interfaces:**
- Consumes: `projects` from `src/data/portfolioData.ts`.
- Produces: `ProjectsSection` rendering all 4 projects with hover effects and direct links.

- [ ] **Step 1: Implement `ProjectPlaceholderGraphic.tsx`**

- Four distinct CSS/SVG generative abstract dark emerald backgrounds:
  1. *E-commerce:* Emerald matrix grid with shopping cart geometric vectors.
  2. *Banque Misr:* Architectural banking lattice with emerald wave lines.
  3. *Graduation Project:* Connected node network graph representing team collaboration.
  4. *More Projects:* Minimalist dark emerald gradient mesh with floating wireframe plus icons.
- If `project.image` is provided in data, automatically renders the screenshot image instead.

- [ ] **Step 2: Build `ProjectCard.tsx`**

- Card structure: Preview graphic/image, Project Title, Role badge ("Frontend Developer"), Concise description, Tech stack badges (React, TypeScript, CSS3, etc.), GitHub & Live Demo action buttons with accessible icons.
- Hover state: 3D card tilt / subtle emerald border glow (`box-shadow: 0 0 25px rgba(16, 185, 129, 0.15)`).

- [ ] **Step 3: Build `ProjectsSection.tsx` with GSAP Pinned Showcase**

- Implement a GSAP ScrollTrigger pinned section (`pin: true`, with `scrub: 1` or responsive pin behavior on desktop screens ≥1024px):
  - Left panel / headline pinned in place with live active project counter ("01 / 04", "02 / 04", etc.) and section overview.
  - Right area scrolls/transitions smoothly through the 4 project cards, snapping or scrubbing with the pinned left context.
  - On mobile/tablet (<1024px) or if `prefers-reduced-motion` is active: falls back gracefully to a fluid vertical stack with clear spacing and touch-optimized layout.

---

### Task 7: Skills & Technologies Section with Emerald Ambient Effects

**Files:**
- Create: `src/components/skills/SkillsSection.tsx`
- Create: `src/components/skills/SkillBadge.tsx`
- Create: `src/components/skills/ParticleBackground.tsx`

**Interfaces:**
- Consumes: `skills` from `src/data/portfolioData.ts`.
- Produces: `SkillsSection` with categorized tech stack and lightweight particle ambient layer.

- [ ] **Step 1: Implement lightweight `ParticleBackground.tsx`**

- Lightweight HTML5 Canvas particle network (emerald nodes connecting when close to cursor).
- Pauses when scrolled out of view (`IntersectionObserver`).
- Turns off completely when `shouldReduceMotion()` is true.

- [ ] **Step 2: Implement `SkillBadge.tsx` & Category Groups**

- Group 1: Frontend (React, TypeScript, JavaScript, Tailwind CSS, HTML5/CSS3).
- Group 2: Full-Stack & Tooling (Node.js, Git, GitHub, REST APIs, Vite, Postman).
- Group 3: Core CS & Practices (Data Structures, Algorithms, HCI, Responsive UI).
- Interactive hover effects with emerald glow.

- [ ] **Step 3: Build `SkillsSection.tsx`**

- Clean, structured Bento-style or categorized card layout.

---

### Task 8: Contact Section & Social Connectivity

**Files:**
- Create: `src/components/contact/ContactSection.tsx`
- Create: `src/components/contact/ContactForm.tsx`

**Interfaces:**
- Consumes: `personalInfo`, `socialLinks`.
- Produces: `ContactSection` with form validation, GitHub & LinkedIn direct cards, and email link.

- [ ] **Step 1: Build `ContactForm.tsx`**

- Fields: Name, Email, Subject, Message.
- Form validation: Required check, email format regex, character length checks.
- Accessible error states: `aria-invalid`, `aria-describedby` linking to error messages.
- Clean submission state simulation: Loading spinner on submit button, followed by an emerald checkmark success toast/banner.

- [ ] **Step 2: Build `ContactSection.tsx`**

- Direct action cards for GitHub (`github.com/Ahmed1125487`) and LinkedIn (`linkedin.com/in/ahmed-atef-a8461b402`).
- Direct mailto link and Egypt timezone indicator (UTC+2 / Cairo).

---

### Task 9: Final Integration, Performance Optimization & Verification

**Files:**
- Modify: `src/App.tsx`, `index.html`
- Create: `public/cv.pdf` (clean placeholder PDF)

**Interfaces:**
- Produces: Complete production build with split chunks and zero console warnings.

- [ ] **Step 1: Assemble full SPA in `src/App.tsx`**

- Wire all sections together in logical sequence: Navbar -> Hero -> About -> Projects -> Skills -> Contact -> Footer.
- Wrap inside `SmoothScrollProvider`.

- [ ] **Step 2: Add placeholder `cv.pdf` and metadata in `index.html`**

- Provide a valid placeholder file at `public/cv.pdf`.
- Add SEO meta tags: title "Ahmed Atef | Frontend & Full-Stack Developer", description, open graph tags.

- [ ] **Step 3: Verification & Cross-browser / Motion Check**

- Test build with `npm run build`.
- Verify bundle size and chunking (ensure Three.js is separated into vendor chunk).
- Verify `prefers-reduced-motion` behavior.
- Verify mobile responsiveness down to 360px.
