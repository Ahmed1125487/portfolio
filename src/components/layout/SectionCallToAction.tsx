import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SectionCallToActionProps {
  text: string;
  label: string;
  href: string;
}

export const SectionCallToAction: React.FC<SectionCallToActionProps> = ({ text, label, href }) => {
  return (
    <div className="mt-16 pt-8 border-t border-card-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <p className="text-base sm:text-lg text-gray-300">{text}</p>
      <a
        href={href}
        className="group inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500 text-canvas font-semibold hover:bg-emerald-400 transition-all shadow-emerald-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <span>{label}</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
};
