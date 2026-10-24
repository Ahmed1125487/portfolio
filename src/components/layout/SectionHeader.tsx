import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Reveal } from './Reveal';

interface SectionHeaderProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  align = 'left',
}) => {
  const centered = align === 'center';

  return (
    <Reveal className={`max-w-3xl space-y-4 ${centered ? 'mx-auto text-center' : ''}`}>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
        <Icon size={14} />
        <span>{eyebrow}</span>
      </div>
      <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-100 tracking-tight">
        {title}
      </h2>
      <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
        {description}
      </p>
    </Reveal>
  );
};
