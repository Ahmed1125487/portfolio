import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export default function MagneticButton({
  children,
  onClick,
  className = '',
  variant = 'primary'
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const moveStrength = 0.3;
      gsap.to(btn, {
        x: deltaX * moveStrength,
        y: deltaY * moveStrength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const baseClasses = 'relative font-mono text-sm tracking-wider px-8 py-4 transition-all duration-300';
  const variantClasses = variant === 'primary'
    ? 'bg-accent text-bg hover:bg-accent/90'
    : 'border border-border text-text hover:border-accent hover:text-accent';

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      data-cursor-hover
    >
      {children}
    </button>
  );
}