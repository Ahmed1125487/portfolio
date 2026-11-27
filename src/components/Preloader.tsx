import { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 300 : 2000;
    const startedAt = performance.now();
    let frame = 0;
    let exitTimer = 0;
    let lastCount = -1;
    let completed = false;

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const nextCount = Math.floor(progress * 100);

      if (nextCount !== lastCount) {
        lastCount = nextCount;
        setCount(nextCount);
      }

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      if (completed) return;
      completed = true;
      setCount(100);
      setIsExiting(true);
      exitTimer = window.setTimeout(onComplete, reduced ? 50 : 850);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(exitTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete]);

  return (
    <div
      className={`preloader fixed inset-0 z-[100] overflow-hidden bg-[#0B0B0C] transition-opacity duration-700 ${isExiting ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading portfolio</span>
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-in-out ${
          isExiting ? '-translate-y-full' : ''
        }`}
      >
        <div className="text-center">
          <p className="font-mono text-xs tracking-widest text-text-muted mb-4">LOADING</p>
          <p className="font-display text-7xl italic text-accent">{count}</p>
          <p className="font-mono text-xs tracking-widest text-text-muted mt-4">%</p>
        </div>
      </div>
    </div>
  );
}
