import React, { useEffect, useRef } from 'react';
import { ArrowRight, FileText, Github, Linkedin, ChevronDown, Terminal } from 'lucide-react';
import SplitType from 'split-type';
import gsap from 'gsap';
import { HeroFallback } from './HeroFallback';
import { shouldReduceMotion } from '../../utils/motion';
import { personalInfo, socialLinks } from '../../data/portfolioData';

export const HeroSection: React.FC = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = shouldReduceMotion();

  useEffect(() => {
    if (!headingRef.current || reduceMotion) return;

    const split = new SplitType(headingRef.current, { types: 'chars,words' });

    gsap.from(split.chars, {
      opacity: 0,
      y: 40,
      rotateX: -45,
      stagger: 0.02,
      duration: 1.0,
      ease: 'power4.out',
      delay: 0.2,
    });

    return () => {
      split.revert();
    };
  }, [reduceMotion]);

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-canvas pt-28 pb-20">
      <div className="absolute inset-0">
        <HeroFallback />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070A09] via-[#070A09]/70 to-[#070A09]/10" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-gray-300 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Final-year CS student at HTI • Graduating 2027</span>
            </div>

            <div className="space-y-3">
              <h1
                ref={headingRef}
                className="text-5xl font-extrabold tracking-tight text-gray-100 leading-[1.02] sm:text-7xl lg:text-8xl"
              >
                {personalInfo.name}
              </h1>
              <p className="text-lg font-medium text-emerald-400 sm:text-xl">
                {personalInfo.title}
              </p>
            </div>

            <p className="max-w-xl text-lg text-gray-300 sm:text-xl">
              {personalInfo.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#projects"
                className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-canvas shadow-emerald-glow transition-all hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                <span>View my work</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href={personalInfo.cvUrl}
                download
                className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card/60 px-5 py-3.5 font-semibold text-gray-200 transition-all hover:border-emerald-500/40 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                <FileText size={16} />
                <span>Download CV</span>
              </a>
            </div>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
              <div className="text-sm text-gray-300">Final-year CS student at HTI • Graduating 2027</div>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.platform === 'GitHub' ? Github : social.platform === 'LinkedIn' ? Linkedin : null;
                  if (!Icon) return null;

                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="rounded-full border border-card-border bg-card/50 p-2.5 text-gray-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-8 top-[26%] hidden w-[360px] rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 shadow-[0_0_30px_rgba(16,185,129,0.12)] backdrop-blur-sm lg:block">
        <div className="animate-[float_7s_ease-in-out_infinite] rounded-xl border border-emerald-500/20 bg-[#07110f]/80 p-3">
          <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>dev</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <Terminal size={18} />
            </div>
            <div className="w-full">
              <div className="text-lg font-semibold text-white">{personalInfo.name}</div>
              <div className="text-sm text-emerald-300">{personalInfo.title}</div>
              <div className="mt-2 rounded-lg border border-emerald-500/15 bg-[#0b1715]/80 p-2 font-mono text-[11px] leading-5 text-gray-300">
                <div>&lt;Developer /&gt;</div>
                <div>const role = 'Frontend';</div>
                <div>const stack = ['React', 'TypeScript'];</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-emerald-400 transition-opacity hover:opacity-80"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-emerald-500/60 bg-emerald-500/5">
          <ChevronDown size={20} className={reduceMotion ? '' : 'motion-safe:animate-bounce'} />
        </div>
      </a>
    </section>
  );
};
