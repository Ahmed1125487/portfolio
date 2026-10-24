import React from 'react';
import { GraduationCap, Calendar, MapPin, BookOpen } from 'lucide-react';
import { personalInfo } from '../../data/portfolioData';

export const EducationCard: React.FC = () => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-card border border-card-border hover:border-emerald-500/40 transition-all shadow-lg space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <GraduationCap size={24} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <Calendar size={12} />
          <span>Expected Graduation: {personalInfo.graduationYear}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xl font-bold text-gray-100">{personalInfo.degree}</h4>
        <p className="text-emerald-400 font-medium text-sm sm:text-base">{personalInfo.university}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
          <MapPin size={14} className="text-gray-500" />
          <span>{personalInfo.location}</span>
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">
        Currently in my final year of Computer Science. My coursework and self-directed projects emphasize data structures, algorithms, modern JavaScript frameworks, and human-computer interaction principles.
      </p>

      <div className="pt-4 border-t border-card-border">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
          <BookOpen size={14} className="text-emerald-400" />
          <span>Core Academic Focus</span>
        </h5>
        <div className="flex flex-wrap gap-2">
          {['Data Structures & Algorithms', 'Software Engineering', 'Human-Computer Interaction', 'Web Development', 'Database Systems'].map((item) => (
            <span
              key={item}
              className="px-3 py-1 rounded-lg bg-canvas border border-card-border text-xs text-gray-300"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
