import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  index: string;
  title: string;
  tech: string[];
  description: string;
  gradient: string;
  github?: string;
  progress: number;
  /** Path relative to public/, e.g. "projects/portfolio.png". */
  image?: string;
  liveUrl?: string;
}

const projects: Project[] = [
  {
    index: '(01)',
    title: 'E-commerce',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    description: 'Online store with product, brand, and category browsing, cart and wishlist management, account authentication, and card or cash-on-delivery checkout via an external commerce API.',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    github: 'https://github.com/Ahmed1125487/e-commerce',
    progress: 100,
  },
  {
    index: '(02)',
    title: 'Saraha App',
    tech: ['Node.js', 'Express', 'MongoDB'],
    description: 'Backend for anonymous messaging with JWT authentication, MongoDB storage, Redis caching, and identity-request-based private chats.',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
    github: 'https://github.com/Ahmed1125487/saraha-app',
    progress: 100,
  },
  {
    index: '(03)',
    title: 'Graduation Project',
    tech: ['React', 'Node.js', 'MongoDB'],
    description: 'Team-built full-stack application demonstrating real-time collaboration and data visualization.',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    github: 'https://github.com/Ahmed1125487/graduation-project',
    progress: 0,
  },
  {
    index: '(04)',
    title: 'This Portfolio',
    tech: ['React', 'TypeScript', 'GSAP', 'Vite'],
    description: 'Award-quality portfolio featuring a code-glyph canvas, scroll-driven motion, and editorial design.',
    gradient: 'linear-gradient(135deg, #0B0B0C 0%, #1a1a1a 100%)',
    github: 'https://github.com/Ahmed1125487/portfolio',
    progress: 100,
    image: 'projects/portfolio.png',
  },
];

const PLATE_BARS = [28, 52, 40, 68, 44, 80, 58, 36];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function projectTimeline(card: HTMLElement) {
  const select = gsap.utils.selector(card);
  const progress = Number(card.dataset.progress ?? 0);
  const valueEl = card.querySelector<HTMLElement>('.proj-progress-value');
  const fill = card.querySelector<HTMLElement>('.proj-progress-fill');
  const scan = card.querySelector<HTMLElement>('.proj-scan');

  gsap.set(select('.proj-index, .proj-pill, .proj-desc, .proj-meta'), { y: 12, opacity: 0 });
  gsap.set(select('.proj-title-inner'), { yPercent: 110 });
  gsap.set(select('.proj-chip'), { y: 8, opacity: 0 });
  gsap.set(select('.proj-preview'), { y: 10, opacity: 0 });
  if (fill) gsap.set(fill, { scaleX: 0 });
  if (valueEl) valueEl.textContent = '0%';

  const counter = { value: 0 };
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  timeline
    .to(select('.proj-index, .proj-pill'), { y: 0, opacity: 1, duration: 0.55, stagger: 0.06 }, 0)
    .to(select('.proj-title-inner'), { yPercent: 0, duration: 0.85, ease: 'power4.out' }, 0.08)
    .to(select('.proj-desc, .proj-meta'), { y: 0, opacity: 1, duration: 0.65, stagger: 0.05 }, 0.2)
    .to(select('.proj-chip'), { y: 0, opacity: 1, duration: 0.45, stagger: 0.04 }, 0.3)
    .to(select('.proj-preview'), { y: 0, opacity: 1, duration: 0.7 }, 0.18);

  if (fill) {
    timeline.to(fill, { scaleX: progress / 100, duration: 1.05, ease: 'power2.inOut' }, 0.42);
  }

  if (valueEl) {
    timeline.to(counter, {
      value: progress,
      duration: 1.05,
      ease: 'power2.inOut',
      onUpdate: () => {
        valueEl.textContent = Math.round(counter.value) + '%';
      },
    }, 0.42);
  }

  if (scan) {
    timeline
      .fromTo(scan, { y: 0, opacity: 0 }, {
        y: () => card.offsetHeight,
        opacity: 0.9,
        duration: 1,
        ease: 'power2.inOut',
      }, 0.12)
      .to(scan, { opacity: 0, duration: 0.2 }, '>-0.15');
  }

  return timeline;
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isReduced, setIsReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setIsReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (isReduced) return;
    const pinTarget = containerRef.current;
    const track = trackRef.current;
    if (!pinTarget || !track) return;

    const media = gsap.matchMedia();

    media.add('(min-width: 768px)', () => {
      let removeFocusReveal = () => {};

      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>('.project-card', track);
        const timelines = new Map<HTMLElement, gsap.core.Timeline>();

        cards.forEach((card) => {
          delete card.dataset.revealed;
          timelines.set(card, projectTimeline(card));
        });

        const reveal = (card: HTMLElement) => {
          if (card.dataset.revealed === 'true') return;
          card.dataset.revealed = 'true';
          timelines.get(card)?.play();
        };

        const onFocusIn = (event: FocusEvent) => {
          if (!(event.target instanceof HTMLElement)) return;
          const card = event.target.closest<HTMLElement>('.project-card');
          if (card) reveal(card);
        };
        track.addEventListener('focusin', onFocusIn);
        removeFocusReveal = () => track.removeEventListener('focusin', onFocusIn);

        ScrollTrigger.create({
          trigger: pinTarget,
          start: 'top top',
          end: `+=${(projects.length - 1) * 100}%`,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (projects.length - 1),
            duration: { min: 0.2, max: 0.5 },
            delay: 0.1,
          },
        });

        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: pinTarget,
            start: 'top top',
            end: `+=${(projects.length - 1) * 100}%`,
            scrub: true,
            onUpdate: () => {
              if (pinTarget.getBoundingClientRect().top > window.innerHeight * 0.4) return;
              const threshold = window.innerWidth * 0.7;
              cards.forEach((card) => {
                if (card.dataset.revealed === 'true') return;
                if (card.getBoundingClientRect().left <= threshold) reveal(card);
              });
            },
          },
        });

        if (cards[0]) {
          ScrollTrigger.create({
            trigger: pinTarget,
            start: 'top 85%',
            once: true,
            onEnter: () => reveal(cards[0]),
          });
        }
      }, pinTarget);

      return () => {
        removeFocusReveal();
        ctx.revert();
      };
    });

    media.add('(max-width: 767px)', () => {
      let removeFocusReveal = () => {};
      let revealFrame = 0;

      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>('.project-card', track);
        const timelines = new Map<HTMLElement, gsap.core.Timeline>();

        cards.forEach((card) => {
          delete card.dataset.revealed;
          timelines.set(card, projectTimeline(card));
        });

        const reveal = (card: HTMLElement) => {
          if (card.dataset.revealed === 'true') return;
          card.dataset.revealed = 'true';
          timelines.get(card)?.play();
        };

        const onFocusIn = (event: FocusEvent) => {
          if (!(event.target instanceof HTMLElement)) return;
          const card = event.target.closest<HTMLElement>('.project-card');
          if (card) reveal(card);
        };
        track.addEventListener('focusin', onFocusIn);
        removeFocusReveal = () => track.removeEventListener('focusin', onFocusIn);

        cards.forEach((card) => {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 88%',
            once: true,
            onEnter: () => reveal(card),
          });
        });

        revealFrame = requestAnimationFrame(() => {
          cards.forEach((card) => {
            if (card.getBoundingClientRect().top < window.innerHeight * 0.9) reveal(card);
          });
        });
      }, pinTarget);

      return () => {
        cancelAnimationFrame(revealFrame);
        removeFocusReveal();
        ctx.revert();
      };
    });

    return () => media.revert();
  }, [isReduced]);

  return (
    <section
      id="projects"
      className={`relative ${isReduced ? '' : 'md:mb-[clamp(-8rem,calc(19rem_-_50vh),0px)]'}`}
      aria-label="Projects section"
    >
      <h2 className="sr-only">Selected projects</h2>
      <style>{`
        @keyframes proj-plate-drift {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.7; }
          50% { transform: translate3d(0, -6px, 0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .proj-plate-drift { animation: none !important; }
          .proj-preview img { scale: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>

      {/* Section Label */}
      <div className="sticky top-16 z-10 px-6 lg:px-12 py-4 pointer-events-none">
        <p className="font-mono text-xs tracking-widest text-accent">(03) — PROJECTS</p>
      </div>

      <div ref={containerRef} className={isReduced ? 'relative' : 'md:relative md:h-screen'}>
        <div className={isReduced ? '' : 'md:absolute md:inset-x-0 md:top-0 md:h-screen md:overflow-hidden md:bg-bg'}>
          <div ref={trackRef} className={`flex flex-col ${isReduced ? '' : 'md:h-full md:flex-row md:items-center'}`}>
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} stacked={isReduced} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index, stacked = false }: { project: Project; index: number; stacked?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt + pointer-tracked glare (fine pointers only).
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tilts = {
      x: (_value: number) => {},
      y: (_value: number) => {},
    };

    const ctx = gsap.context(() => {
      gsap.set(card, { transformPerspective: 1000 });
      tilts.x = gsap.quickTo(card, 'rotationX', { duration: 0.55, ease: 'power3.out' });
      tilts.y = gsap.quickTo(card, 'rotationY', { duration: 0.55, ease: 'power3.out' });
    }, card);

    const handleMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      tilts.y((x - 0.5) * 6);
      tilts.x(-(y - 0.5) * 6);
      card.style.setProperty('--gx', (x * 100).toFixed(2) + '%');
      card.style.setProperty('--gy', (y * 100).toFixed(2) + '%');
    };

    const handleLeave = () => {
      tilts.x(0);
      tilts.y(0);
      card.style.setProperty('--gx', '50%');
      card.style.setProperty('--gy', '50%');
    };

    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', handleLeave);

    return () => {
      card.removeEventListener('pointermove', handleMove);
      card.removeEventListener('pointerleave', handleLeave);
      ctx.revert();
    };
  }, []);

  const isLive = Boolean(project.liveUrl);
  const status = isLive ? 'LIVE' : project.progress >= 100 ? 'COMPLETE' : 'IN PROGRESS';
  const stackCount = pad(project.tech.length);
  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const imageSrc = project.image
    ? `${import.meta.env.BASE_URL}${project.image.replace(/^\/+/, '')}`
    : null;

  return (
    <div className={`w-full flex-shrink-0 px-6 py-6 lg:px-12 flex items-center justify-center ${stacked ? '' : 'md:w-screen md:h-screen md:py-0'}`}>
      <div
        ref={cardRef}
        data-progress={project.progress}
        className="project-card group relative flex w-full max-w-5xl min-h-[400px] flex-col overflow-hidden border border-border bg-surface transition-[border-color] duration-300 hover:border-accent/40 focus-within:border-accent/40 md:min-h-0 md:aspect-video"
        data-cursor-hover
      >
        {/* Per-project gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
          style={{ background: project.gradient }}
        />

        {/* Inner grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Pointer glare */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(480px circle at var(--gx, 50%) var(--gy, 50%), rgba(200,255,61,0.10), transparent 62%)',
          }}
        />

        {/* HUD corner brackets */}
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 z-30 h-3 w-3 border-l border-t border-accent/70 transition-transform duration-300 ease-out group-hover:-translate-x-1.5 group-hover:-translate-y-1.5" />
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3 z-30 h-3 w-3 border-r border-t border-accent/70 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-1.5" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 z-30 h-3 w-3 border-b border-l border-accent/70 transition-transform duration-300 ease-out group-hover:-translate-x-1.5 group-hover:translate-y-1.5" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 z-30 h-3 w-3 border-b border-r border-accent/70 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:translate-y-1.5" />

        {/* Entrance scan */}
        <div
          aria-hidden="true"
          className="proj-scan pointer-events-none absolute inset-x-0 top-0 z-20 h-px opacity-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(200,255,61,0.9), transparent)',
            boxShadow: '0 0 12px rgba(200,255,61,0.55)',
          }}
        />

        <header className="relative z-[2] flex items-start justify-between gap-4 px-6 pt-5 lg:px-8 lg:pt-7">
          <span className="proj-index font-display text-4xl italic leading-none text-text/45 transition-colors duration-300 group-hover:text-accent/50 lg:text-5xl">
            {project.index}
          </span>
          <span
            className={
              'proj-pill mt-1 inline-flex shrink-0 items-center gap-2 border px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] ' +
              (isLive
                ? 'border-accent/25 bg-accent/[0.05] text-accent'
                : 'border-border bg-bg/40 text-text/70')
            }
          >
            <span
              aria-hidden="true"
              className={
                'h-1.5 w-1.5 rounded-full ' +
                (isLive
                  ? 'animate-pulse bg-accent shadow-[0_0_8px_rgba(200,255,61,0.55)]'
                  : 'bg-text-muted')
              }
            />
            {status}
          </span>
        </header>

        <div className="relative z-[2] flex min-h-0 flex-1 flex-col gap-4 px-6 pb-5 pt-3 lg:flex-row lg:items-stretch lg:gap-8 lg:px-8 lg:pb-5 lg:pt-1">
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h3 className="font-display text-4xl italic leading-[1.02] text-text transition-colors duration-300 group-hover:text-accent lg:text-5xl">
              <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <span className="proj-title-inner block">{project.title}</span>
              </span>
            </h3>

            <p className="proj-desc mt-2 max-w-md font-mono text-[12px] leading-relaxed text-text-muted md:text-[13px]">
              {project.description}
            </p>

            <p className="proj-meta mt-3 font-mono text-[9px] tracking-[0.18em] text-text-muted">
              STACK: {stackCount}
              <span aria-hidden="true" className="mx-1.5 text-text-muted/40">·</span>
              STATUS: <span className={isLive ? 'text-accent/80' : 'text-text/70'}>{status}</span>
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="proj-chip border border-border px-3 py-1 font-mono text-xs text-text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {imageSrc && (
            <ProjectImagePreview src={imageSrc} title={project.title} index={index} />
          )}

          {/* Abstract generated preview for projects without a screenshot */}
          <div aria-hidden="true" className={`proj-preview relative hidden min-h-0 shrink-0 overflow-hidden border border-border/80 bg-bg/50 ${imageSrc ? '' : 'lg:flex lg:w-[37%] lg:max-w-[360px] lg:flex-col'}`}>
            {!imageSrc && (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />

                <div className="proj-preview-parallax relative z-[1] flex h-full flex-col p-4 transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:translate-x-1">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2 font-mono text-[8px] tracking-[0.16em] text-text-muted">
                    <span className="flex items-center gap-1">
                      <span className="h-1 w-1 bg-accent/70" />
                      <span className="h-1 w-1 bg-text/20" />
                      <span className="h-1 w-1 bg-text/20" />
                    </span>
                    <span className="truncate px-2 text-text-muted">~/build/{slug}</span>
                    <span className="text-accent/80">{project.index}</span>
                  </div>

                  <div
                    aria-hidden="true"
                    className="proj-plate-drift relative mt-3 flex min-h-0 flex-1 flex-col"
                    style={{ animation: 'proj-plate-drift 16s ease-in-out infinite', animationDelay: '-' + index * 2.4 + 's' }}
                  >
                    <div className="relative flex-1 overflow-hidden border border-border/70 bg-bg/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="h-1 w-10 bg-accent/60" />
                        <span className="h-1 w-5 bg-text/20" />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="h-1 w-14 bg-text/15" />
                        <span className="h-1 w-8 bg-text/10" />
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-1.5">
                        <div className="col-span-2 h-16 border border-border/80 bg-text/[0.02] p-2">
                          <div className="h-1 w-8 bg-accent/50" />
                          <div className="mt-1 h-1 w-12 bg-text/10" />
                          <div className="mt-3 h-6 border border-border/60" />
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-5 border border-accent/25 bg-accent/[0.03]" />
                          <div className="h-4 border border-border/70" />
                          <div className="h-4 border border-border/70" />
                        </div>
                      </div>

                      <div className="mt-3 flex h-10 items-end gap-1">
                        {PLATE_BARS.map((height, barIndex) => (
                          <span
                            key={barIndex}
                            className={barIndex % 3 === 1 ? 'flex-1 bg-accent/30' : 'flex-1 bg-text/10'}
                            style={{ height: height + '%' }}
                          />
                        ))}
                      </div>
                      <span className="absolute bottom-2 right-2 font-mono text-[8px] tracking-[0.14em] text-accent/60">
                        {project.progress}%
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between font-mono text-[8px] tracking-[0.16em] text-text-muted">
                      <span>STACK {stackCount}</span>
                      <span className="flex items-center gap-1 text-accent/80">
                        <span aria-hidden="true" className="h-1 w-1 animate-pulse rounded-full bg-accent" />
                        RENDER OK
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="relative z-[2] flex items-end justify-between gap-4 px-6 pb-5 pt-1 lg:px-8 lg:pb-7">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4 font-mono text-[9px] tracking-[0.2em] text-text-muted">
              <span>PROGRESS</span>
              <span className="tabular-nums text-accent">
                <span className="proj-progress-value">{project.progress}%</span>
              </span>
            </div>
            <div className="mt-2 h-px w-full bg-border">
              <div
                className="proj-progress-fill h-px w-full origin-left bg-accent shadow-[0_0_10px_rgba(200,255,61,0.55)]"
                style={{ transform: 'scaleX(' + project.progress / 100 + ')' }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 pb-0.5">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live site (opens in a new tab)`}
                onClick={(event) => event.stopPropagation()}
                data-cursor-hover
                className="whitespace-nowrap font-mono text-[9px] tracking-[0.18em] text-accent underline-offset-4 transition-colors hover:underline focus-visible:outline-offset-4"
              >
                VIEW LIVE <span aria-hidden="true">↗</span>
              </a>
            )}

            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub (opens in a new tab)`}
                data-cursor-hover
                onClick={(event) => event.stopPropagation()}
                className="flex h-10 w-10 items-center justify-center text-accent drop-shadow-[0_0_6px_rgba(200,255,61,0.7)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 overflow-visible fill-current"
                >
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 2.6 3.38 1.92.1-.72.39-1.22.7-1.5-2.47-.28-5.06-1.24-5.06-5.5 0-1.22.44-2.21 1.15-2.99-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.22 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.27-2.6 5.21-5.08 5.49.4.35.75 1.02.75 2.06v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
              </a>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function ProjectImagePreview({ src, title, index }: { src: string; title: string; index: number }) {
  const alt = /portfolio/i.test(title)
    ? 'Screenshot of the portfolio website homepage'
    : `Screenshot of the ${title} project`;

  return (
    <div className="proj-preview order-first flex w-full shrink-0 flex-col overflow-hidden border border-border bg-surface transition-colors duration-300 group-hover:border-accent/40 md:hidden lg:order-last lg:flex lg:w-[37%] lg:max-w-[360px] lg:self-center">
      <div aria-hidden="true" className="relative flex h-7 shrink-0 items-center border-b border-border bg-bg/70 px-2.5">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-text-muted/50" />
        </span>
        <span className="pointer-events-none absolute left-1/2 max-w-[70%] -translate-x-1/2 truncate font-mono text-[10px] leading-none text-text-muted">
          ahmed1125487.github.io/portfolio
        </span>
      </div>

      <div className="relative aspect-[16/10] max-h-[60vh] w-full overflow-hidden bg-bg">
        <img
          src={src}
          alt={alt}
          width={1896}
          height={978}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover object-top transition-transform duration-[600ms] ease-out lg:group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent opacity-80 transition-opacity duration-300 lg:group-hover:opacity-60"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b border-r border-accent/60"
        />
      </div>
    </div>
  );
}
