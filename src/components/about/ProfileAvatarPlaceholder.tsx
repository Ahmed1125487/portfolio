import React from 'react';
import { Sparkles, GraduationCap } from 'lucide-react';
import { personalInfo } from '../../data/portfolioData';

export const ProfileAvatarPlaceholder: React.FC = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square rounded-3xl bg-card border border-card-border p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-center group">
      {/* Background ambient gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-900/20 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500" />

      {/* Floating geometric monogram badge */}
      <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-canvas-elevated border-2 border-emerald-500/40 flex items-center justify-center shadow-emerald-glow mb-6 group-hover:scale-105 transition-transform duration-300">
        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-400">
          AA
        </span>
        <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-emerald-500 text-canvas font-bold text-xs uppercase tracking-wider shadow-md">
          CS '27
        </div>
      </div>

      {/* Details */}
      <div className="relative z-10 text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-100">{personalInfo.name}</h3>
        <p className="text-sm text-emerald-400 font-medium flex items-center justify-center gap-1.5">
          <GraduationCap size={16} />
          <span>{personalInfo.university}</span>
        </p>
        <p className="text-xs text-gray-400 max-w-xs mx-auto pt-1">
          {personalInfo.location} • Available for internships & junior roles.
        </p>
      </div>

      {/* Decorative badge pill */}
      <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas/60 border border-card-border text-[11px] text-gray-300 backdrop-blur-md">
        <Sparkles size={12} className="text-emerald-400" />
        <span>Profile Placeholder</span>
      </div>
    </div>
  );
};
