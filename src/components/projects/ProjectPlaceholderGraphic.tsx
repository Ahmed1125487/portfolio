import React from 'react';
import { ShoppingCart, Building2, Users, Layers } from 'lucide-react';
import { ProjectItem } from '../../types/portfolio';

interface ProjectPlaceholderGraphicProps {
  project: ProjectItem;
}

export const ProjectPlaceholderGraphic: React.FC<ProjectPlaceholderGraphicProps> = ({ project }) => {
  // If actual image is provided, render image
  if (project.image) {
    return (
      <div className="w-full h-56 sm:h-64 relative overflow-hidden bg-canvas">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    );
  }

  // Otherwise render distinct generative dark emerald abstract pattern
  const renderPatternContent = () => {
    switch (project.patternId) {
      case 'ecommerce':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900/40 to-canvas p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-mono tracking-widest uppercase">E-Commerce React App</span>
              <ShoppingCart size={24} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-2 my-auto">
              <div className="w-3/4 h-3 bg-emerald-500/20 rounded-full" />
              <div className="w-1/2 h-3 bg-emerald-500/15 rounded-full" />
              <div className="w-5/6 h-3 bg-emerald-500/10 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono">Catalog UI</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono">Cart State</span>
            </div>
          </div>
        );
      case 'banking':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-emerald-900/30 to-canvas p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute -left-10 -top-10 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl" />
            <div className="flex items-center justify-between text-teal-400">
              <span className="text-xs font-mono tracking-widest uppercase">HCI Case Study</span>
              <Building2 size={24} className="text-teal-400" />
            </div>
            <div className="space-y-3 my-auto">
              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 text-xs font-bold">Secure</div>
                <div className="h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 text-xs font-bold">Fast</div>
                <div className="h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 text-xs font-bold">Accessible</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 text-xs font-mono">Banque Misr Redesign</span>
            </div>
          </div>
        );
      case 'graduation':
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-950/40 to-canvas p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute right-0 top-0 w-56 h-56 bg-green-500/15 rounded-full blur-3xl" />
            <div className="flex items-center justify-between text-green-400">
              <span className="text-xs font-mono tracking-widest uppercase">HTI Capstone Project</span>
              <Users size={24} className="text-green-400" />
            </div>
            <div className="space-y-2 my-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-300 text-xs font-bold">FE</div>
                <div className="flex-1 h-2 bg-green-500/20 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-xs font-bold">API</div>
                <div className="flex-1 h-2 bg-emerald-500/20 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-green-500/20 text-green-300 text-xs font-mono">Team Frontend Lead</span>
            </div>
          </div>
        );
      case 'lab':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/30 to-canvas p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-mono tracking-widest uppercase">Experimental Lab</span>
              <Layers size={24} className="text-emerald-400" />
            </div>
            <div className="space-y-2 my-auto">
              <div className="w-full h-1 bg-emerald-500/30 rounded-full" />
              <div className="w-3/4 h-1 bg-emerald-500/20 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-mono">WebGL & Three.js</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-56 sm:h-64 relative overflow-hidden bg-card border-b border-card-border">
      {renderPatternContent()}
    </div>
  );
};
