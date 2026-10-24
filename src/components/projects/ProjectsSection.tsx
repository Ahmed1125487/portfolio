import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FolderGit2 } from 'lucide-react';
import { projects } from '../../data/portfolioData';
import { ProjectCard } from './ProjectCard';
import { SectionHeader } from '../layout/SectionHeader';
import { SectionCallToAction } from '../layout/SectionCallToAction';
import { shouldReduceMotion, isMobileDevice } from '../../utils/motion';
import { Reveal, Stagger } from '../layout/Reveal';

gsap.registerPlugin(ScrollTrigger);

export const ProjectsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = shouldReduceMotion();
  const isMobile = isMobileDevice();

  useEffect(() => {
    if (reduceMotion || isMobile || !triggerRef.current) return;

    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current,
        pin: true,
        start: 'top top+=100',
        end: '+=1000',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      pinTl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reduceMotion, isMobile]);

  return (
    <section id="projects" ref={sectionRef} className="relative min-h-[80vh] border-t border-card-border bg-canvas py-20 md:py-32 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={FolderGit2}
          eyebrow="Selected work"
          title="Projects"
          description="A React shop, a banking redesign, a team capstone, and a lab for experiments."
        />

        <Stagger className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.1} className={index === 0 ? 'md:col-span-2' : ''}>
              <ProjectCard project={project} index={index} wide={index === 0} />
            </Reveal>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-8">
          <SectionCallToAction text="Like what you see? Let's talk." label="Contact me" href="#contact" />
        </Reveal>
      </div>
    </section>
  );
};
