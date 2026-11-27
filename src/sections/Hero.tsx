import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import MagneticButton from '../components/MagneticButton';
import { scrollToSection } from '../hooks/useSmoothScroll';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const el = nameRef.current;
      if (!el) return;

      gsap.fromTo(el.querySelectorAll('.line'),
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 1.85,
        }
      );

      gsap.fromTo('.availability-badge',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.55, delay: 2.35 }
      );

      gsap.fromTo('.hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, delay: 2.6, stagger: 0.1 }
      );
    }, hero);

    return () => ctx.revert();
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
          <MagneticButton onClick={() => scrollToSection('#projects')}>
            VIEW PROJECTS
          </MagneticButton>
          <MagneticButton variant="secondary" onClick={() => scrollToSection('#contact')}>
            GET IN TOUCH
          </MagneticButton>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
        <span className="translate-y-8 rotate-90 font-mono text-xs tracking-widest text-text-muted">
          SCROLL
        </span>
        <div className="mt-8 h-16 w-px bg-gradient-to-b from-accent to-transparent" />
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