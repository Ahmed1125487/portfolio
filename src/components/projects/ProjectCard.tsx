import React from 'react';
import { Github, ArrowUpRight } from 'lucide-react';
import { ProjectItem } from '../../types/portfolio';
import { ProjectPlaceholderGraphic } from './ProjectPlaceholderGraphic';

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  wide?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, wide = false }) => {
  return (
    <article
      className={`group overflow-hidden rounded-3xl border border-card-border bg-card shadow-xl transition-all duration-300 hover:border-emerald-500/50 ${
        wide ? 'md:col-span-2' : ''
      }`}
    >
      <div className={`${wide ? 'md:flex md:flex-row' : 'flex flex-col'} h-full`}>
        <div className={`${wide ? 'md:w-1/2' : ''} relative overflow-hidden`}>
          <ProjectPlaceholderGraphic project={project} />
          <div className="absolute right-4 top-4 rounded-full border border-card-border bg-canvas/80 px-3 py-1 font-mono text-xs text-emerald-400 backdrop-blur-md">
            0{index + 1}
          </div>
        </div>

        <div className={`${wide ? 'md:w-1/2' : ''} flex flex-col justify-between`}>
          <div className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {project.role}
              </span>
              {project.featured && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-100 transition-colors group-hover:text-emerald-300 sm:text-2xl">
              {project.title}
            </h3>

            <p className="text-sm leading-relaxed text-gray-400">{project.description}</p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-card-border bg-canvas px-2.5 py-1 font-mono text-xs text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-card-border/60 bg-canvas-elevated/40 px-6 pb-6 pt-3">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-gray-300 transition-colors hover:text-emerald-400 sm:text-sm"
              >
                <Github size={16} />
                <span>Source Code</span>
              </a>
            ) : (
              <span className="text-xs text-gray-500">Private Repository</span>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-canvas sm:text-sm"
              >
                <span>Live Demo</span>
                <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
