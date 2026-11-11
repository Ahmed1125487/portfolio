import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Project {
  index: string;
  title: string;
  tech: string[];
  description: string;
  gradient: string;
}

const projects: Project[] = [
  {
    index: '(01)',
    title: 'E-commerce Store',
    tech: ['React', 'TypeScript', 'Tailwind'],
    description: 'A full-featured online store with cart management, payment integration, and admin dashboard.',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  {
    index: '(02)',
    title: 'Bank Website Redesign',
    tech: ['HTML', 'CSS', 'HCI'],
    description: 'Complete redesign of a banking platform focusing on accessibility and user experience research.',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%)',
  },
  {
    index: '(03)',
    title: 'Graduation Project',
    tech: ['React', 'Node.js', 'MongoDB'],
    description: 'Team-built full-stack application demonstrating real-time collaboration and data visualization.',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  },
  {
    index: '(04)',
    title: 'This Portfolio',
    tech: ['React', 'Three.js', 'GSAP'],
    description: 'Award-quality portfolio featuring 3D interactions, smooth animations, and editorial design.',
    gradient: 'linear-gradient(135deg, #0B0B0C 0%, #1a1a1a 100%)',
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
              <ProjectCard key={index} project={project} total={projects.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, total }: { project: Project; total: number }) {
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
            {Math.round(((total - 1) / total) * 100)}% COMPLETE
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
          <div className="flex flex-wrap gap-2">
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