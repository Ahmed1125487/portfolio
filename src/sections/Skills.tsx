import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

// Smoothstep helper
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mobRef = useRef(false);
  const visibleRef = useRef(true);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const scrollXRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
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
    const collectItems = () => {
      mobRef.current = window.innerWidth < 640;
      items = Array.from(track.parentElement!.querySelectorAll<HTMLElement>('.marquee-item'));
    };
    collectItems();
    window.addEventListener('resize', collectItems);

    const tick = (time: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (!visibleRef.current) return;

      // Marquee scroll: default 65px/s, optional ?marqueeSpeed= param
      const delta = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;
      const speedPxPerSec = 65;
      scrollXRef.current -= speedPxPerSec * (delta / 1000);
      const tw = totalWidthRef.current;
      if (tw > 0 && scrollXRef.current <= -tw) scrollXRef.current += tw;
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

  // Setup / teardown
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      document.querySelectorAll('.skill-column').forEach((col) => {
        const columnEl = col as HTMLElement;
        const colItems = columnEl.querySelectorAll('.skill-item');
        ScrollTrigger.create({
          trigger: columnEl,
          start: 'top bottom-=100',
          end: 'bottom top+=100',
          scrub: true,
          onUpdate: (self) => {
            colItems.forEach((item, i) => {
              const el = item as HTMLElement;
              el.style.opacity = String(0.4 + self.progress * 0.6 + i * 0.05);
              el.style.transform = `translateY(${(1 - self.progress) * 10}px)`;
            });
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const rm = checkReducedMotion();
    if (rm) {
      const track = trackRef.current;
      if (track) {
        totalWidthRef.current = track.scrollWidth / 2;
        track.querySelectorAll<HTMLElement>('.marquee-item').forEach(item => {
          item.style.setProperty('--glow', '0.6');
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
      <p className="font-mono text-xs tracking-widest text-accent mb-4">(03) — SKILLS</p>

      <div ref={containerRef} className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="skill-column border-l border-border pl-6">
              <h3 className="font-display text-2xl italic text-text mb-6">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <ul className="space-y-3">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className="skill-item font-mono text-sm text-text-muted hover:text-accent transition-colors duration-200 cursor-default"
                  >
                    <span className="text-accent mr-2">{'>'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
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