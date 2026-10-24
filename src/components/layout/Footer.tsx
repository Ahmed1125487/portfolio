import React from 'react';
import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import { personalInfo, socialLinks } from '../../data/portfolioData';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-card-border bg-canvas-elevated py-10 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-card font-bold text-emerald-400">
              AA
            </div>
            <div>
              <div className="text-base font-bold text-gray-100">{personalInfo.name}</div>
              <div className="text-sm text-gray-400">Frontend & Full-Stack Web Developer</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {socialLinks.map((s) => {
              const IconComponent =
                s.platform === 'GitHub' ? Github : s.platform === 'LinkedIn' ? Linkedin : Mail;

              return (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="rounded-xl border border-card-border bg-card p-2.5 text-gray-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400"
                >
                  <IconComponent size={18} />
                </a>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href={personalInfo.cvUrl} download className="hover:text-emerald-400 transition-colors">
              Download CV
            </a>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-gray-300 transition-all hover:border-emerald-500/40 hover:text-emerald-400"
            >
              <span>Back to top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-card-border pt-6 text-center text-xs text-gray-500 sm:text-left">
          © {new Date().getFullYear()} {personalInfo.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
