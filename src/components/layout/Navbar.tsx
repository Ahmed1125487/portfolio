import React, { useState, useEffect } from 'react';
import { Menu, X, Github, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socialLinks } from '../../data/portfolioData';
import { useActiveSection } from '../../hooks/useActiveSection';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeSection = useActiveSection(['about', 'projects', 'skills', 'contact']);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-emerald-500 text-canvas px-4 py-2 rounded-lg font-medium"
      >
        Skip to content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-canvas/80 backdrop-blur-md border-b border-card-border py-3 shadow-lg shadow-black/20'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="#hero"
            className="group flex items-center gap-3 rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-card font-bold text-emerald-400 transition-colors group-hover:border-emerald-500">
              AA
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-gray-100 sm:text-base group-hover:text-emerald-400 transition-colors">
                Ahmed Atef
              </span>
              <span className="hidden text-xs text-gray-400 sm:inline-block">Frontend & Full-Stack</span>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-card-border bg-card/60 px-3 py-1.5 shadow-inner backdrop-blur-md md:flex">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  aria-current={isActive ? 'location' : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-card-hover text-emerald-400'
                      : 'text-gray-300 hover:bg-card-hover hover:text-emerald-400'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="mr-2 flex items-center gap-2">
              {socialLinks.map((s) => {
                if (s.platform === 'Email') return null;
                const IconComponent = s.platform === 'GitHub' ? Github : Linkedin;
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="rounded-lg border border-transparent p-2 text-gray-400 transition-all hover:border-card-border hover:bg-card hover:text-emerald-400"
                  >
                    <IconComponent size={18} />
                  </a>
                );
              })}
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-canvas shadow-emerald-subtle transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-canvas"
            >
              Hire me
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            className="rounded-xl border border-card-border bg-card p-2.5 text-gray-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-card-border bg-card/95 p-6 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace('#', '');
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all ${
                      isActive
                        ? 'bg-card-hover text-emerald-400'
                        : 'text-gray-200 hover:bg-card-hover hover:text-emerald-400'
                    }`}
                  >
                    <span>{link.name}</span>
                  </a>
                );
              })}

              <div className="mt-2 flex items-center justify-between border-t border-card-border pt-4">
                <div className="flex items-center gap-3">
                  {socialLinks.map((s) => {
                    if (s.platform === 'Email') return null;
                    const IconComponent = s.platform === 'GitHub' ? Github : Linkedin;
                    return (
                      <a
                        key={s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.platform}
                        className="rounded-xl border border-card-border bg-canvas p-2.5 text-gray-300 hover:text-emerald-400"
                      >
                        <IconComponent size={20} />
                      </a>
                    );
                  })}
                </div>

                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-canvas hover:bg-emerald-400"
                >
                  Hire me
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
