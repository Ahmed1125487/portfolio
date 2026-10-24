import React from 'react';
import { Cpu } from 'lucide-react';
import { row1Techs, row2Techs, TechLogo } from '../../data/skillsMarqueeData';
import { shouldReduceMotion } from '../../utils/motion';
import { SectionHeader } from '../layout/SectionHeader';
import { SectionCallToAction } from '../layout/SectionCallToAction';
import { Reveal, Stagger } from '../layout/Reveal';

export const SkillsSection: React.FC = () => {
  const reduceMotion = shouldReduceMotion();

  const renderTechCard = (tech: TechLogo, index: number) => {
    const IconComponent = tech.icon;
    const staggerDelay = `${(index % 7) * 0.5}s`;

    return (
      <div
        key={`${tech.name}-${index}`}
        className="group/card relative mx-3 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-card-border bg-card/90 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-emerald-500/60 sm:mx-4 sm:h-20 sm:w-20"
        aria-label={tech.name}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-15 transition-opacity duration-300 group-hover/card:opacity-30 blur-xl"
          style={{ backgroundColor: tech.color }}
        />

        <div
          className={`relative z-10 flex items-center justify-center ${!reduceMotion ? 'animate-glow-pulse' : ''}`}
          style={{
            '--glow-color': `${tech.color}99`,
            animationDelay: staggerDelay,
          } as React.CSSProperties}
        >
          <IconComponent
            size={36}
            style={{ color: tech.color }}
            className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover/card:scale-110"
          />
        </div>

        <div className="pointer-events-none absolute -top-10 z-20 whitespace-nowrap rounded-lg border border-card-border bg-canvas-elevated px-3 py-1 text-xs font-semibold text-gray-200 opacity-0 shadow-xl transition-opacity duration-200 group-hover/card:opacity-100">
          {tech.name}
        </div>
      </div>
    );
  };

  const techs = [...row1Techs, ...row2Techs];

  return (
    <section id="skills" className="relative min-h-[80vh] overflow-hidden border-t border-card-border bg-canvas-elevated py-20 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={Cpu}
          eyebrow="Toolkit"
          title="Tools I use every day"
          description="The frameworks, libraries, and foundations behind the projects above."
          align="center"
        />

        {reduceMotion ? (
          <div className="grid grid-cols-4 gap-4 pt-4 sm:grid-cols-6 lg:grid-cols-8">
            {techs.map((tech, i) => renderTechCard(tech, i))}
          </div>
        ) : (
          <Stagger className="marquee-container relative w-full space-y-6 overflow-hidden py-6 marquee-mask" delay={0.06}>
            <div className="flex w-max">
              <div className="animate-marquee-right flex">
                {row1Techs.map((tech, i) => renderTechCard(tech, i))}
              </div>
              <div className="animate-marquee-right flex" aria-hidden="true">
                {row1Techs.map((tech, i) => renderTechCard(tech, i))}
              </div>
            </div>

            <div className="flex w-max">
              <div className="animate-marquee-left flex">
                {row2Techs.map((tech, i) => renderTechCard(tech, i))}
              </div>
              <div className="animate-marquee-left flex" aria-hidden="true">
                {row2Techs.map((tech, i) => renderTechCard(tech, i))}
              </div>
            </div>
          </Stagger>
        )}

        <Reveal delay={0.1}>
          <SectionCallToAction text="Seen the tools? See them in action." label="See it in action" href="#projects" />
        </Reveal>
      </div>
    </section>
  );
};
