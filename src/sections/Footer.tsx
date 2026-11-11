import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToTop = () => {
    gsap.to(window, {
      scrollTo: '#hero',
      duration: 1,
      ease: 'power2.inOut',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="py-8 px-6 lg:px-12 border-t border-border" role="contentinfo">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-xs text-text-muted">
          © {new Date().getFullYear()} Ahmed Atef. All rights reserved.
        </p>

        <button
          onClick={scrollToTop}
          className="font-mono text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-2 px-2 py-4"
          aria-label="Back to top"
          style={{ display: showBackToTop ? 'flex' : 'none' }}
        >
          BACK TO TOP
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </footer>
  );
}