import { useRef, useEffect, useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAws } from '@fortawesome/free-brands-svg-icons';
import {
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiThreedotjs,
  SiFramer,
  SiGsap,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiMongodb,
  SiGraphql,
  SiRedis,
  SiGit,
  SiDocker,
  SiFigma,
  SiJest,
  SiJenkins,
  SiHtml5,
  SiCss,
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';

const skills = {
  frontend: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Three.js', 'Framer Motion', 'GSAP'],
  backend: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST APIs', 'Redis'],
  tools: ['Git', 'Docker', 'Figma', 'VS Code', 'Jest', 'CI/CD', 'AWS'],
};

type IconEntry = { name: string; Comp: React.ComponentType<{ className?: string }> };

const iconEntries: IconEntry[] = [
  { name: 'React', Comp: SiReact },
  { name: 'TypeScript', Comp: SiTypescript },
  { name: 'Next.js', Comp: SiNextdotjs },
  { name: 'Tailwind CSS', Comp: SiTailwindcss },
  { name: 'Three.js', Comp: SiThreedotjs },
  { name: 'Framer Motion', Comp: SiFramer },
  { name: 'GSAP', Comp: SiGsap },
  { name: 'Node.js', Comp: SiNodedotjs },
  { name: 'Express', Comp: SiExpress },
  { name: 'PostgreSQL', Comp: SiPostgresql },
  { name: 'MongoDB', Comp: SiMongodb },
  { name: 'GraphQL', Comp: SiGraphql },
  { name: 'Redis', Comp: SiRedis },
  { name: 'Git', Comp: SiGit },
  { name: 'Docker', Comp: SiDocker },
  { name: 'Figma', Comp: SiFigma },
  { name: 'VS Code', Comp: VscVscode },
  { name: 'Jest', Comp: SiJest },
  { name: 'CI/CD', Comp: SiJenkins },
  { name: 'AWS', Comp: ({ className }) => <FontAwesomeIcon icon={faAws} className={className} style={{ width: 44, height: 'auto' }} /> },
  { name: 'HTML5', Comp: SiHtml5 },
  { name: 'CSS3', Comp: SiCss },
];

type SkillCategory = keyof typeof skills;

const PANEL_LABELS: Record<SkillCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  tools: 'Tools',
};

const pad2 = (value: number) => String(value).padStart(2, '0');

function SkillPanel({
  category,
  index,
  items,
}: {
  category: SkillCategory;
  index: number;
  items: string[];
}) {
  const panelRef = useRef<HTMLElement>(null);
  const [isIn, setIsIn] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsIn(true);
        observer.unobserve(panel);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const titleId = 'skill-panel-' + category;

  return (
    <article
      ref={panelRef}
      aria-labelledby={titleId}
      className={'skill-panel relative h-full overflow-hidden border border-border bg-surface/40 p-5 md:p-6' + (isIn ? ' is-in' : '')}
    >
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-0 opacity-[0.04]'
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <span aria-hidden='true' className='skill-corner skill-corner-tl pointer-events-none absolute left-3 top-3 z-20 h-3 w-3 border-l border-t border-accent/70' />
      <span aria-hidden='true' className='skill-corner skill-corner-tr pointer-events-none absolute right-3 top-3 z-20 h-3 w-3 border-r border-t border-accent/70' />
      <span aria-hidden='true' className='skill-corner skill-corner-bl pointer-events-none absolute bottom-3 left-3 z-20 h-3 w-3 border-b border-l border-accent/70' />
      <span aria-hidden='true' className='skill-corner skill-corner-br pointer-events-none absolute bottom-3 right-3 z-20 h-3 w-3 border-b border-r border-accent/70' />

      <div className='relative z-10'>
        <div className='flex items-start justify-between gap-4'>
          <span aria-hidden='true' className='font-mono text-xs tracking-widest text-accent'>
            {pad2(index + 1)}
          </span>
          <span className='font-mono text-[10px] tracking-[0.18em] text-text-muted'>
            <span aria-hidden='true'>{pad2(items.length)}</span>
            <span className='sr-only'>{items.length} technologies</span>
          </span>
        </div>

        <h3 id={titleId} className='mt-2 font-display text-3xl italic leading-none text-text'>
          {PANEL_LABELS[category]}
        </h3>

        <div aria-hidden='true' className='skill-divider relative mt-5 h-px w-full bg-border'>
          <span className='skill-divider-fill absolute left-0 top-0 h-px bg-accent' />
        </div>

        <ul className='skill-list mt-1'>
          {items.map((item, rowIndex) => (
            <li
              key={item}
              className='skill-row relative border-b border-border/60 last:border-b-0'
            >
              <div
                className='skill-row-motion relative'
                style={{ '--i': rowIndex } as React.CSSProperties}
              >
                <div className='grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 py-3'>
                  <span className='skill-row-number font-mono text-[11px] tracking-widest text-text-muted'>
                    {pad2(rowIndex + 1)}
                  </span>
                  <span className='skill-row-name min-w-0 font-mono text-sm text-text-muted'>
                    {item}
                  </span>
                  <span aria-hidden='true' className='skill-row-arrow font-mono text-sm text-accent'>
                    →
                  </span>
                </div>
                <span
                  aria-hidden='true'
                  className='skill-row-underline pointer-events-none absolute bottom-0 left-0 h-px w-full bg-accent'
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

// Smoothstep helper
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function Skills() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mobRef = useRef(false);
  const visibleRef = useRef(true);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const scrollXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const totalWidthRef = useRef(0);

  // Reduced-motion check
  const checkReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Single rAF loop
  const startLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track || checkReducedMotion()) return;

    mobRef.current = window.innerWidth < 640;
    let items: HTMLElement[] = [];
    const updateWidth = () => {
      totalWidthRef.current = track.scrollWidth / 2;
    };
    const collectItems = () => {
      mobRef.current = window.innerWidth < 640;
      items = Array.from(track.parentElement!.querySelectorAll<HTMLElement>('.marquee-item'));
      updateWidth();
    };
    collectItems();
    void document.fonts?.ready.then(updateWidth);
    window.addEventListener('resize', collectItems);

    const tick = (time: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (!visibleRef.current) return;

      // Marquee scroll: default 65px/s, optional ?marqueeSpeed= param
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;
      const speedPxPerSec = 65;
      scrollXRef.current -= speedPxPerSec * (delta / 1000);
      const tw = totalWidthRef.current;
      if (tw > 0 && scrollXRef.current <= -tw) scrollXRef.current %= tw;
      track.style.transform = `translateX(${scrollXRef.current}px)`;

      // Spotlight glow: read then write
      const containerRect = track.parentElement?.getBoundingClientRect();
      if (!containerRect) return;
      const center = containerRect.left + containerRect.width / 2;
      const ZONE = mobRef.current ? 200 : 140;
      const HW = ZONE * 0.4;

      // READ pass
      const centers = items.map(el => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      });

      // WRITE pass
      for (let i = 0; i < items.length; i++) {
        const dist = Math.abs(centers[i] - center);
        const raw = 1 - smoothstep(HW, ZONE, dist);
        items[i].style.setProperty('--glow', raw.toFixed(3));
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => window.removeEventListener('resize', collectItems);
  }, [checkReducedMotion]);

  useEffect(() => {
    const rm = checkReducedMotion();
    if (rm) {
      const track = trackRef.current;
      if (track) {
        totalWidthRef.current = track.scrollWidth / 2;
        track.querySelectorAll<HTMLElement>('.marquee-item').forEach(item => {
          item.style.setProperty('--glow', '1');
        });
        track.style.transform = 'translateX(0)';
      }
      return;
    }

    const cleanupResize = startLoop();

    // Initialize totalWidth after paint
    requestAnimationFrame(() => {
      const track = trackRef.current;
      if (track) totalWidthRef.current = track.scrollWidth / 2;
    });

    // Pause when strip leaves viewport
    const parent = trackRef.current?.parentElement;
    ioRef.current = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    if (parent) ioRef.current.observe(parent);

    const onVisChange = () => { visibleRef.current = !document.hidden; };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ioRef.current?.disconnect();
      document.removeEventListener('visibilitychange', onVisChange);
      cleanupResize?.();
    };
  }, [checkReducedMotion, startLoop]);

  return (
    <section id="skills" className="py-32 px-6 lg:px-12 relative" aria-label="Skills section">
      <h2 className="sr-only">Skills</h2>
      <p className="font-mono text-xs tracking-widest text-accent mb-4">(04) — SKILLS</p>

      <div className="max-w-[1440px] mx-auto mb-20">
        <style>{`
          .skill-panel {
            opacity: 0;
            transform: translateY(16px);
            transition:
              opacity 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
              transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
          }
          .skill-panel.is-in {
            opacity: 1;
            transform: translateY(0);
          }
          .skill-row-motion {
            opacity: 0;
            transform: translateX(-8px);
            transition:
              opacity 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
              transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
            transition-delay: calc(var(--i) * 40ms + 120ms);
          }
          .skill-panel.is-in .skill-row-motion {
            opacity: 1;
            transform: translateX(0);
          }
          .skill-divider-fill {
            width: 24px;
            transform: scaleX(0);
            transform-origin: left;
            transition:
              transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) 100ms,
              width 0.35s ease;
          }
          .skill-panel.is-in .skill-divider-fill {
            transform: scaleX(1);
          }
          .skill-panel:hover .skill-divider-fill {
            width: 40%;
          }
          .skill-corner {
            transition: transform 0.35s ease;
          }
          .skill-panel:hover .skill-corner-tl { transform: translate(-4px, -4px); }
          .skill-panel:hover .skill-corner-tr { transform: translate(4px, -4px); }
          .skill-panel:hover .skill-corner-bl { transform: translate(-4px, 4px); }
          .skill-panel:hover .skill-corner-br { transform: translate(4px, 4px); }
          .skill-row {
            transition: opacity 0.2s ease;
          }
          .skill-row-name,
          .skill-row-number,
          .skill-row-arrow {
            transition: color 0.25s ease, opacity 0.25s ease, transform 0.25s ease;
          }
          .skill-row-arrow {
            opacity: 0;
            transform: translateX(-4px);
          }
          .skill-row-underline {
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
          }
          .skill-row:hover .skill-row-name {
            color: var(--color-text);
            transform: translateX(6px);
          }
          .skill-row:hover .skill-row-number {
            color: var(--color-accent);
          }
          .skill-row:hover .skill-row-arrow {
            opacity: 1;
            transform: translateX(0);
          }
          .skill-row:hover .skill-row-underline {
            transform: scaleX(1);
          }
          @media (hover: hover) {
            .skill-list:has(.skill-row:hover) .skill-row:not(:hover) {
              opacity: 0.55;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .skill-panel,
            .skill-panel .skill-row-motion,
            .skill-panel .skill-divider-fill {
              opacity: 1 !important;
              transform: none !important;
              transition: none !important;
            }
            .skill-corner,
            .skill-row,
            .skill-row-name,
            .skill-row-number,
            .skill-row-arrow,
            .skill-row-underline {
              transition: none !important;
            }
          }
        `}</style>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(Object.keys(skills) as SkillCategory[]).map((category, index) => (
            <SkillPanel
              key={category}
              category={category}
              index={index}
              items={skills[category]}
            />
          ))}
        </div>
      </div>

      {/* Infinite Marquee — center spotlight */}
      <div
        className="overflow-hidden border-t border-b border-border py-8 mt-12 relative"
        role="img"
        aria-label="Technologies I work with"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent z-10" />

        <div
          ref={trackRef}
          className="marquee-track flex whitespace-nowrap will-change-transform"
          data-testid="marquee-track"
          style={{ transform: 'translateX(0)' }}
        >
          {[...iconEntries, ...iconEntries].map((entry, index) => (
            <div
              key={`${entry.name}-${index}`}
              className="marquee-item flex items-center gap-3 mx-10 cursor-default flex-shrink-0"
              style={{ '--glow': '0' } as React.CSSProperties }
            >
              <span
                className={`marquee-icon inline-flex items-center justify-center ${entry.name === 'AWS' ? 'w-[50px] h-[50px]' : 'w-8 h-8'}`}
                aria-hidden="true"
                style={{
                  color: `color-mix(in srgb, #2A2A2C calc(100% - var(--glow) * 70%), #C8FF3D calc(var(--glow) * 100%))`,
                  filter: `drop-shadow(0 0 calc(var(--glow) * 8px) rgba(200,255,61,calc(var(--glow) * 0.6)))`,
                  transform: `scale(calc(1 + var(--glow) * 0.12))`,
                }}
              >
                <entry.Comp className={entry.name === 'AWS' ? 'w-[44px] h-auto' : 'w-7 h-7'} />
              </span>
              <span
                className="font-mono text-xs tracking-widest uppercase select-none"
                style={{
                  color: `color-mix(in srgb, #2A2A2C calc(100% - var(--glow) * 60%), #C8FF3D calc(var(--glow) * 80%))`,
                }}
              >
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-border hidden md:block" />
    </section>
  );
}
