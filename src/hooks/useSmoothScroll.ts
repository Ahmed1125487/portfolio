import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

// The live Lenis instance, exposed so overlays (e.g. the certificate modal) can
// pause the page's smooth scroll without tearing down the hook.
let lenisInstance: Lenis | null = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getLenis() {
  return lenisInstance;
}

export function scrollToSection(href: string, updateHistory = true) {
  let target: HTMLElement | null = null;
  try {
    target = document.querySelector<HTMLElement>(href);
  } catch {
    return;
  }
  if (!target) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target);
  } else {
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  if (updateHistory && window.location.hash !== href) {
    window.history.pushState(null, '', href);
  }
}

export function scrollToTop(updateHistory = true) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  if (updateHistory && window.location.hash) {
    window.history.pushState(null, '', window.location.pathname + window.location.search);
  }
}

export function useSmoothScroll() {
  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    if (prefersReducedMotion()) {
      return () => {
        window.history.scrollRestoration = previousScrollRestoration;
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenisInstance = lenis;
    let frame = 0;

    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      if (lenisInstance === lenis) lenisInstance = null;
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);
}
