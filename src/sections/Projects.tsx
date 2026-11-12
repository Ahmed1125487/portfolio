import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Project {
  index: string;
  title: string;
  tech: string[];
  description: string;
  gradient: string;
  github?: string;
  progress: number;
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
    tech: ['React', 'Three.js', 'GSAP'],
    description: 'Award-quality portfolio featuring 3D interactions, smooth animations, and editorial design.',
    gradient: 'linear-gradient(135deg, #0B0B0C 0%, #1a1a1a 100%)',
    github: 'https://github.com/Ahmed1125487/portfolio',
    progress: 100,
  },
];

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pinTarget = containerRef.current;
    if (!pinTarget || !trackRef.current) return;

    const media = gsap.matchMedia();
    media.add('(min-width: 768px)', () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: pinTarget,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (projects.length - 1),
            duration: { min: 0.2, max: 0.5 },
            delay: 0.1,
          },
        });

        const trackEl = trackRef.current;
        if (trackEl) {
          gsap.to(trackEl, {
            x: () => -(trackEl.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
              trigger: pinTarget,
              start: 'top top',
              end: '+=300%',
              scrub: true,
            },
          });
        }
      }, containerRef);

      return () => ctx.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <section
      id="projects"
      className="relative md:mb-[clamp(-8rem,calc(19rem_-_50vh),0px)]"
      aria-label="Projects section"
    >
      {/* Section Label */}
      <div className="sticky top-16 z-10 px-6 lg:px-12 py-4 pointer-events-none">
        <p className="font-mono text-xs tracking-widest text-accent">(02) — PROJECTS</p>
      </div>

      <div ref={containerRef} className="md:relative md:h-screen">
        <div className="md:absolute md:inset-x-0 md:top-0 md:h-screen md:overflow-hidden md:bg-bg">
          <div ref={trackRef} className="flex flex-col md:h-full md:flex-row md:items-center">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="w-full flex-shrink-0 px-6 py-6 md:w-screen md:h-screen md:py-0 lg:px-12 flex items-center justify-center"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-5xl min-h-[400px] aspect-auto md:min-h-0 md:aspect-video border border-border bg-surface overflow-hidden group"
        data-cursor-hover
      >
        {/* Project Header */}
        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-10">
          <span className="font-display text-6xl italic text-text-muted opacity-50">{project.index}</span>
          <span className="font-mono text-xs text-text-muted tracking-widest">
            {project.progress}% COMPLETE
          </span>
        </div>

        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          style={{ background: project.gradient }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h3 className="font-display text-4xl md:text-5xl italic text-text mb-4 group-hover:text-accent transition-colors duration-300">
            {project.title}
          </h3>
          <p className="font-mono text-sm text-text-muted mb-4 max-w-md">{project.description}</p>
          <div className="flex flex-wrap gap-2 pr-14 md:pr-0">
            {project.tech.map((t, i) => (
              <span
                key={i}
                className="font-mono text-xs px-3 py-1 border border-border text-text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} on GitHub`}
            data-cursor-hover
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center pointer-events-auto text-accent drop-shadow-[0_0_6px_rgba(200,255,61,0.7)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-7 w-7 overflow-visible fill-current"
            >
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 2.6 3.38 1.92.1-.72.39-1.22.7-1.5-2.47-.28-5.06-1.24-5.06-5.5 0-1.22.44-2.21 1.15-2.99-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.22 2.68.11 2.96.72.78 1.15 1.77 1.15 2.99 0 4.27-2.6 5.21-5.08 5.49.4.35.75 1.02.75 2.06v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
          </a>
        )}

        {/* Hover Preview */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${hoverPos.x}px ${hoverPos.y}px, rgba(200, 255, 61, 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>
    </div>
  );
}