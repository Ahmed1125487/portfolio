import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from '../components/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!nameRef.current) return;

    const el = nameRef.current;
    const lines = el.querySelectorAll('.line');

    gsap.fromTo(lines,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.5,
      }
    );

    gsap.fromTo('.availability-badge',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, delay: 1.2 }
    );

    gsap.fromTo('.hero-cta',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 1.5, stagger: 0.1 }
    );
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-start px-6 lg:px-12 pt-20 overflow-hidden"
    >
      {/* Hero Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto w-full">
        <h1 ref={nameRef} className="font-display text-[12vw] md:text-[10rem] leading-[0.85] tracking-tight mb-8">
          <span className="line block italic text-text">Ahmed </span>
          <span className="line block text-accent">Atef</span>
        </h1>

        <p className="font-mono text-sm md:text-base text-text-muted tracking-widest uppercase mb-12 ml-2">
          Frontend & Full-Stack Developer
        </p>

        <div className="flex flex-wrap gap-4 mb-16 ml-2">
          <div className="availability-badge flex items-center gap-2 bg-surface border border-border px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs text-text-muted tracking-wider">AVAILABLE FOR WORK</span>
          </div>
        </div>

        <div className="hero-cta flex flex-wrap gap-4 ml-2">
          <MagneticButton onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}>
            VIEW PROJECTS
          </MagneticButton>
          <MagneticButton variant="secondary" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>
            GET IN TOUCH
          </MagneticButton>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-text-muted tracking-widest rotate-90 origin-center translate-y-8">
            SCROLL
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-accent to-transparent mt-8" />
        </div>
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden md:block absolute top-0 left-[20%] w-px h-full bg-border" />
        <div className="hidden md:block absolute top-0 left-[40%] w-px h-full bg-border" />
        <div className="hidden md:block absolute top-0 left-[60%] w-px h-full bg-border" />
        <div className="hidden md:block absolute top-0 left-[80%] w-px h-full bg-border" />
      </div>
    </section>
  );
}