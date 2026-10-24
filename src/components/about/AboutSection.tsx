import React from 'react';
import { Compass, Code, Terminal, Target } from 'lucide-react';
import { ProfileAvatarPlaceholder } from './ProfileAvatarPlaceholder';
import { EducationCard } from './EducationCard';
import { SectionHeader } from '../layout/SectionHeader';
import { SectionCallToAction } from '../layout/SectionCallToAction';
import { personalInfo } from '../../data/portfolioData';
import { Reveal, Stagger } from '../layout/Reveal';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative min-h-[80vh] border-t border-card-border bg-canvas-elevated py-20 md:py-32 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={Compass}
          eyebrow="About"
          title="Computer science, with a frontend focus"
          description="I'm finishing my degree at HTI. Most of my time goes to React and TypeScript, and my HCI coursework shapes how I think about layout and navigation."
        />

        <div className="mt-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <Reveal direction="left" className="lg:col-span-5">
            <ProfileAvatarPlaceholder />
          </Reveal>

          <div className="space-y-8 lg:col-span-7">
            <Reveal direction="right" className="space-y-6 rounded-3xl border border-card-border bg-card p-6 sm:p-8">
              <h3 className="flex items-center gap-2.5 text-xl font-bold text-gray-100">
                <Terminal className="text-emerald-400" size={22} />
                <span>My Journey & Vision</span>
              </h3>
              <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
                {personalInfo.bio}
              </p>
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="space-y-1 rounded-2xl border border-card-border bg-canvas p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <Code size={16} />
                    <span>Frontend Focus</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    React, TypeScript, Tailwind CSS, and accessible UI patterns.
                  </p>
                </div>
                <div className="space-y-1 rounded-2xl border border-card-border bg-canvas p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    <Target size={16} />
                    <span>Career Goal</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Seeking internships and junior roles in frontend development.
                  </p>
                </div>
              </div>
            </Reveal>

            <Stagger className="space-y-0">
              <Reveal delay={0.05} className="block">
                <EducationCard />
              </Reveal>
            </Stagger>
          </div>
        </div>

        <Reveal delay={0.1} className="mt-8">
          <SectionCallToAction text="Want to see the work?" label="View projects" href="#projects" />
        </Reveal>
      </div>
    </section>
  );
};
