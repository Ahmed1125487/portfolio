import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useCairoTime } from '../hooks/useTime';
import { getLenis, scrollToSection, scrollToTop } from '../hooks/useSmoothScroll';
import Logo from './Logo';

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const navLinks = [
  { label: '(01) ABOUT', href: '#about' },
  { label: '(02) CERTIFICATES', href: '#certificates' },
  { label: '(03) PROJECTS', href: '#projects' },
  { label: '(04) SKILLS', href: '#skills' },
  { label: '(05) JOURNEY', href: '#journey' },
  { label: '(06) CONTACT', href: '#contact' },
];

export default function Navbar({ isMenuOpen, setIsMenuOpen }: NavbarProps) {
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const skipFocusRestore = useRef(false);
  const [isScrolled, setIsScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 50);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const currentTime = useCairoTime();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let previousScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let lastDirection = 0;
    let stopTimeout: number | undefined;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - previousScrollY;
      previousScrollY = currentScrollY;

      setIsScrolled(currentScrollY > 50);

      let nextActiveSection: string | null = null;
      const activationLine = window.innerHeight * 0.35;
      for (const link of navLinks) {
        const section = document.querySelector<HTMLElement>(link.href);
        if (section && section.getBoundingClientRect().top <= activationLine) {
          nextActiveSection = link.href;
        }
      }
      setActiveSection((current) => current === nextActiveSection ? current : nextActiveSection);

      if (prefersReducedMotion) {
        setIsNavHidden(false);
        return;
      }

      if (currentScrollY <= 50) {
        setIsNavHidden(false);
        accumulatedDelta = 0;
        lastDirection = 0;
      } else if (delta !== 0) {
        const direction = Math.sign(delta);
        if (direction !== lastDirection) {
          lastDirection = direction;
          accumulatedDelta = delta;
        } else {
          accumulatedDelta += delta;
        }

        if (Math.abs(accumulatedDelta) >= 10) {
          setIsNavHidden(direction > 0);
          accumulatedDelta = 0;
        }
      }

      window.clearTimeout(stopTimeout);
      stopTimeout = window.setTimeout(() => setIsNavHidden(false), 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(stopTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const menu = mobileMenuRef.current;
    const menuButton = menuButtonRef.current;
    if (!menu) return;

    skipFocusRestore.current = false;
    menu.scrollTop = 0;
    const lenis = getLenis();
    const previousOverflow = document.body.style.overflow;
    lenis?.stop();
    document.body.style.overflow = 'hidden';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(menu, { opacity: 1, y: 0 });
    } else {
      gsap.fromTo(menu,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }

    const focusTimer = window.setTimeout(() => {
      menu.querySelector<HTMLElement>('a[href]')?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusables: HTMLElement[] = [];
      focusables.push(...menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);

      // Handle every Tab inside the dialog. Relying on the browser's default
      // move after a programmatic wrap can use a stale sequential-focus start
      // point and let focus escape behind the open menu.
      event.preventDefault();
      if (event.shiftKey) {
        (currentIndex <= 0 ? last : focusables[currentIndex - 1]).focus();
      } else {
        (currentIndex === -1 || currentIndex === focusables.length - 1 ? first : focusables[currentIndex + 1]).focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      if (!skipFocusRestore.current) menuButton?.focus();
    };
  }, [isMenuOpen, setIsMenuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const handleViewportChange = () => {
      if (desktop.matches) setIsMenuOpen(false);
    };

    desktop.addEventListener('change', handleViewportChange);
    return () => desktop.removeEventListener('change', handleViewportChange);
  }, [setIsMenuOpen]);

  useEffect(() => {
    const syncToLocation = () => {
      const hash = window.location.hash;
      let hasTarget = false;
      if (hash) {
        try {
          hasTarget = Boolean(document.querySelector(hash));
        } catch {
          hasTarget = false;
        }
      }
      // Wait for the browser's popstate work (and any history scroll
      // restoration) to finish before asking Lenis to animate.
      window.requestAnimationFrame(() => {
        if (hasTarget) {
          scrollToSection(hash, false);
        } else {
          scrollToTop(false);
        }
      });
    };

    const initialScroll = window.location.hash ? window.setTimeout(syncToLocation, 0) : 0;
    window.addEventListener('popstate', syncToLocation);
    window.addEventListener('hashchange', syncToLocation);

    return () => {
      window.clearTimeout(initialScroll);
      window.removeEventListener('popstate', syncToLocation);
      window.removeEventListener('hashchange', syncToLocation);
    };
  }, []);

  const handleNavClick = (href: string) => {
    skipFocusRestore.current = true;
    getLenis()?.start();
    setIsMenuOpen(false);
    scrollToSection(href);
  };

  return (
    <>
      <header aria-label="Site header">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 motion-reduce:transition-none ${
          isScrolled ? 'bg-bg/90 backdrop-blur-sm' : ''
        }`}
        style={{ transform: isNavHidden && !isMenuOpen ? 'translateY(-100%)' : 'translateY(0)' }}
        role="navigation"
        aria-label="Main navigation"
        onFocusCapture={() => { if (isNavHidden) setIsNavHidden(false); }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between border-b border-border">
          <a href="#hero" onClick={(e) => { e.preventDefault(); handleNavClick('#hero'); }} className="group flex items-center py-2" aria-label="Ahmed Atef — home"><Logo /></a>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  aria-current={activeSection === link.href ? 'location' : undefined}
                  className={`font-mono text-xs ${activeSection === link.href ? 'text-accent' : 'text-text-muted hover:text-accent'} transition-colors tracking-wider`}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="ml-4 font-mono text-xs text-text-muted">
              <span className="sr-only">Current time in Cairo: </span>
              {currentTime}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            className="lg:hidden flex flex-col gap-1.5 px-3 py-4"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
          >
            <span className={`block w-6 h-0.5 bg-text transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-text transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-text transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        id="mobile-navigation"
        className="fixed inset-0 z-40 overflow-y-auto bg-bg lg:hidden"
        style={{ display: isMenuOpen ? 'block' : 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex min-h-full flex-col justify-center gap-6 px-6 pb-10 pt-24">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
              aria-current={activeSection === link.href ? 'location' : undefined}
              className={`font-display text-3xl italic ${activeSection === link.href ? 'text-accent' : 'text-text hover:text-accent'} transition-colors py-1`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {link.label}
            </a>
          ))}
          <p className="mt-8 font-mono text-xs text-text-muted">
            {currentTime} • Cairo, Egypt
          </p>
        </div>
      </div>
    </>
  );
}