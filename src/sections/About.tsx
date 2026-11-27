import { useRef, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface WordProps {
  word: string;
}

function Word({ word }: WordProps) {
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1';
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        // Keep the scrub effect while never fading copy below readable contrast.
        el.style.opacity = String(0.55 + self.progress * 0.45);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <span ref={wordRef} className="inline-block transition-opacity duration-100 mr-[0.25em]">
      {word}
    </span>
  );
}

export default function About() {
  const paragraph = `I'm Ahmed Atef, a full-stack developer based in Egypt with a passion for crafting exceptional digital experiences. I build complete web applications, from polished React and TypeScript interfaces to backend services with Java and Node.js, combining clean architecture with reliable, well-designed systems.`;

  const stats = [
    { label: 'Years Experience', value: 3 },
    { label: 'Projects Completed', value: 15 },
    { label: 'Technologies', value: 21 },
    { label: 'Open Source Contributions', value: 8 },
  ];

  return (
    <section id="about" className="py-32 px-6 lg:px-12 relative" aria-label="About section">
      <h2 className="sr-only">About</h2>
      {/* Section Label */}
      <p className="font-mono text-xs tracking-widest text-accent mb-4">(01) — ABOUT</p>

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Main Paragraph */}
          <div className="lg:col-span-8">
            <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-text">
              {paragraph.split(' ').map((word, i) => (
                <Word key={i} word={word} />
              ))}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <StatItem key={index} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border hidden md:block" />
    </section>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = countRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = value.toString();
      return;
    }

    let interval: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || interval !== undefined) return;
        observer.disconnect();

        let current = 0;
        const step = Math.ceil(value / 30);
        interval = window.setInterval(() => {
          current += step;
          if (current >= value) {
            current = value;
            window.clearInterval(interval);
            interval = undefined;
          }
          el.textContent = current.toString();
        }, 30);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [value]);

  return (
    <div className="border-l border-border pl-4">
      <span ref={countRef} className="font-display text-4xl italic text-text block mb-1">
        {value}
      </span>
      <p className="font-mono text-xs text-text-muted tracking-wider">{label}</p>
    </div>
  );
}