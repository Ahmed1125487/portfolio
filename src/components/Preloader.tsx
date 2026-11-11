import { useRef, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const frameRef = useRef<number>(0);
  const doneRef = useRef(false);
  const startMs = useRef<number>(0);

  // Start counting immediately on mount
  if (startMs.current === 0) startMs.current = performance.now();

  // Animation loop
  const tick = () => {
    if (doneRef.current) return;
    const elapsed = performance.now() - startMs.current;
    const progress = Math.min(elapsed / 2000, 1);
    const nextCount = Math.floor(progress * 100);

    if (nextCount !== count) {
      setCount(nextCount);
    }

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(tick);
    } else {
      // Reached 100 — trigger exit
      doneRef.current = true;
      setCount(100);
      setIsExiting(true);
      setTimeout(() => onComplete(), 850); // wait for CSS transition
    }
  };

  // Start the loop once on mount
  frameRef.current = requestAnimationFrame(tick);

  return (
    <div className="preloader fixed inset-0 z-[100] bg-[#0B0B0C] overflow-hidden">
      <div
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
