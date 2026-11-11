import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useCairoTime } from '../hooks/useTime';

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const navLinks = [
  { label: '(01) ABOUT', href: '#about' },
  { label: '(02) PROJECTS', href: '#projects' },
  { label: '(03) SKILLS', href: '#skills' },
  { label: '(04) JOURNEY', href: '#journey' },
  { label: '(05) CONTACT', href: '#contact' },
];

export default function Navbar({ isMenuOpen, setIsMenuOpen }: NavbarProps) {
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const currentTime = useCairoTime();

  useEffect(() => {
    let previousScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let lastDirection = 0;
    let stopTimeout: number | undefined;

    setIsScrolled(previousScrollY > 50);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - previousScrollY;
      previousScrollY = currentScrollY;

      setIsScrolled(currentScrollY > 50);

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

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(stopTimeout);
    };
  }, []);

  useEffect(() => {
    const menu = mobileMenuRef.current;
    if (!menu) return;

    if (isMenuOpen) {
      gsap.fromTo(menu,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      gsap.to(menu, { opacity: 0, y: -20, duration: 0.2 });
    }
  }, [isMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 motion-reduce:transition-none ${
          isScrolled ? 'bg-bg/90 backdrop-blur-sm' : ''
        }`}
        style={{ transform: isNavHidden && !isMenuOpen ? 'translateY(-100%)' : 'translateY(0)' }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between border-b border-border">
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); handleNavClick('#hero'); }}
            className="font-display text-xl italic text-text hover:text-accent transition-colors py-2"
          >
            AHMED.
          </a>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                  className="font-mono text-xs text-text-muted hover:text-accent transition-colors tracking-wider"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="ml-4 font-mono text-xs text-text-muted">
              {currentTime}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex flex-col gap-1.5 px-3 py-4"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className={`block w-6 h-0.5 bg-text transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-text transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-text transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-0 z-40 bg-bg pt-20 px-6 lg:hidden ${
          isMenuOpen ? 'flex flex-col justify-center gap-6' : ''
        }`}
        style={{ display: isMenuOpen ? 'flex' : 'none' }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {navLinks.map((link, index) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
            className="font-display text-3xl italic text-text hover:text-accent transition-colors py-1"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {link.label}
          </a>
        ))}
        <p className="font-mono text-xs text-text-muted mt-8">
          {currentTime} • Cairo, Egypt
        </p>
      </div>
    </>
  );
}