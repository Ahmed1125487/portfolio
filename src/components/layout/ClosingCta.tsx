import React from 'react';
import { ArrowRight } from 'lucide-react';
import { personalInfo } from '../../data/portfolioData';
import { Reveal } from './Reveal';

export const ClosingCta: React.FC = () => {
  return (
    <section className="relative border-t border-card-border bg-canvas-elevated py-20 md:py-28 overflow-x-hidden">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal direction="up" delay={0.05} className="block">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Next step
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.1} className="block">
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-100 sm:text-6xl">
            Open to internships and junior roles
          </h2>
        </Reveal>

        <Reveal direction="up" delay={0.15} className="block">
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-300 sm:text-lg">
            If you're hiring for a frontend or full-stack role, or want to talk through a project, send me a message.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.2} className="mt-8 block">
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-canvas shadow-emerald-glow transition-all hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <span>Hire me</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={personalInfo.cvUrl}
              download
              className="inline-flex items-center justify-center rounded-xl border border-card-border bg-card px-6 py-3.5 font-semibold text-gray-200 transition-all hover:border-emerald-500/40 hover:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              Download CV
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
