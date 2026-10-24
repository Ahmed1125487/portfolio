import React from 'react';
import { Mail, Github, Linkedin, MapPin, Clock, MessageSquare } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { personalInfo } from '../../data/portfolioData';
import { SectionHeader } from '../layout/SectionHeader';
import { Reveal } from '../layout/Reveal';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="relative min-h-[80vh] border-t border-card-border bg-canvas py-20 md:py-32 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={MessageSquare}
          eyebrow="Contact"
          title="Send a message"
          description="Tell me about the role or project and I'll get back to you."
        />

        <div className="mt-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <Reveal direction="left" className="lg:col-span-5">
            <div className="space-y-6 rounded-3xl border border-card-border bg-card p-6 shadow-xl sm:p-8">
              <h3 className="text-xl font-bold text-gray-100">Let's Connect</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                I'm looking for internships and junior frontend roles. Email is the fastest way to reach me.
              </p>

              <div className="space-y-4 pt-2">
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-card-border bg-canvas p-4 transition-all hover:border-emerald-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Email Me</div>
                    <div className="text-sm font-semibold text-gray-200 transition-colors group-hover:text-emerald-400">
                      {personalInfo.email}
                    </div>
                  </div>
                </a>

                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-card-border bg-canvas p-4 transition-all hover:border-emerald-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                    <Github size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">GitHub Profile</div>
                    <div className="text-sm font-semibold text-gray-200 transition-colors group-hover:text-emerald-400">
                      github.com/Ahmed1125487
                    </div>
                  </div>
                </a>

                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-card-border bg-canvas p-4 transition-all hover:border-emerald-500/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-transform group-hover:scale-110">
                    <Linkedin size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">LinkedIn Network</div>
                    <div className="text-sm font-semibold text-gray-200 transition-colors group-hover:text-emerald-400">
                      linkedin.com/in/ahmed-atef-a8461b402
                    </div>
                  </div>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-card-border pt-4">
                <div className="flex items-center gap-2.5 text-xs text-gray-400">
                  <MapPin size={16} className="text-emerald-400" />
                  <span>{personalInfo.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-400">
                  <Clock size={16} className="text-emerald-400" />
                  <span>GMT+2 (Cairo Time)</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.08} className="lg:col-span-7">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
};
