import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion, useReducedMotion } from 'framer-motion';
import CertificateFace from './CertificateFace';
import type { Certificate } from '../sections/Certificates';

interface CertificateCardProps {
  cert: Certificate;
  featured?: boolean;
  isOpen: boolean;
  onOpen: (cert: Certificate, trigger: HTMLElement) => void;
}

export default function CertificateCard({ cert, featured = false, isOpen, onOpen }: CertificateCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const copyTimeout = useRef<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const credentialId = cert.credentialId;

  // 3D tilt + pointer-tracked specular glare (fine pointers only).
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(card, { transformPerspective: 1000, transformStyle: 'preserve-3d' });
    const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });

    const handleMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      rotateY((x - 0.5) * 8);
      rotateX(-(y - 0.5) * 8);
      const glare = glareRef.current;
      if (glare) {
        glare.style.setProperty('--gx', (x * 100).toFixed(2) + '%');
        glare.style.setProperty('--gy', (y * 100).toFixed(2) + '%');
      }
    };

    const handleLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', handleLeave);

    return () => {
      card.removeEventListener('pointermove', handleMove);
      card.removeEventListener('pointerleave', handleLeave);
      rotateX.tween.kill();
      rotateY.tween.kill();
      gsap.set(card, { rotationX: 0, rotationY: 0, clearProps: 'transformPerspective,transformStyle' });
    };
  }, []);

  useEffect(() => () => window.clearTimeout(copyTimeout.current), []);

  const handleCopy = async () => {
    if (!credentialId) return;
    try {
      await navigator.clipboard.writeText(credentialId);
      setCopied(true);
      window.clearTimeout(copyTimeout.current);
      copyTimeout.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied; the credential ID stays readable on the card.
    }
  };

  const mediaClasses = featured
    ? 'relative overflow-hidden border border-border bg-bg aspect-[1778/1264] lg:w-[58%] lg:shrink-0 lg:self-start'
    : 'relative overflow-hidden border border-border bg-bg aspect-[1778/1264]';

  return (
    <li>
      <article
        ref={cardRef}
        className="cert-card group relative flex h-full flex-col overflow-hidden border border-border bg-surface p-5 transition-[border-color,background-color] duration-300 hover:border-accent/40 focus-within:border-accent/40 lg:p-6"
        data-cursor-hover
      >
        {/* Inner grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Pointer glare */}
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(420px circle at var(--gx, 50%) var(--gy, 50%), rgba(200,255,61,0.12), transparent 65%)',
          }}
        />

        {/* HUD corner brackets */}
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 z-30 h-3 w-3 border-l border-t border-accent/70 transition-transform duration-300 ease-out group-hover:-translate-x-1.5 group-hover:-translate-y-1.5" />
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3 z-30 h-3 w-3 border-r border-t border-accent/70 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-1.5" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 z-30 h-3 w-3 border-b border-l border-accent/70 transition-transform duration-300 ease-out group-hover:-translate-x-1.5 group-hover:translate-y-1.5" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 z-30 h-3 w-3 border-b border-r border-accent/70 transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:translate-y-1.5" />

        {/* Index + status */}
        <header className="relative z-[2] flex items-start justify-between gap-4">
          <span className="font-display text-4xl italic leading-none text-text/25 transition-colors duration-300 group-hover:text-accent/40 lg:text-5xl">
            {cert.index}
          </span>
          <span className="mt-1 inline-flex shrink-0 items-center gap-2 border border-accent/20 bg-accent/[0.04] px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] text-accent">
            VERIFIED
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_8px_rgba(200,255,61,0.55)]" />
          </span>
        </header>

        <div className={featured ? 'relative z-[2] mt-5 flex flex-1 flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6' : 'relative z-[2] mt-5 flex flex-1 flex-col gap-5'}>
          {/* Certificate face */}
          <div className={mediaClasses}>
            <div className={cert.image ? 'absolute inset-0' : 'cert-parallax absolute inset-x-0 -bottom-[8%] -top-[8%]'}>
              <div className="cert-media-blur absolute inset-0 grayscale-[0.55] brightness-90 transition-[filter] duration-500 group-hover:grayscale-0 group-hover:brightness-100">
                <motion.div
                  layoutId={reducedMotion ? undefined : 'certificate-face-' + cert.id}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 overflow-hidden"
                >
                  <CertificateFace cert={cert} />
                </motion.div>
              </div>
            </div>

            {/* Default darkening, lifts on hover */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/25 to-bg/10 transition-opacity duration-500 group-hover:opacity-40"
            />

            {/* Hover affordance */}
            <div className="pointer-events-none absolute inset-0 z-[3] flex items-end justify-between gap-3 bg-gradient-to-t from-bg/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="font-mono text-[9px] tracking-[0.22em] text-accent">OPEN CREDENTIAL</span>
              <span aria-hidden="true" className="font-mono text-xs text-accent">↗</span>
            </div>

            {/* Entrance scan line */}
            <div
              aria-hidden="true"
              className="cert-scan pointer-events-none absolute inset-x-0 top-0 z-20 h-px opacity-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(200,255,61,0.9), transparent)',
                boxShadow: '0 0 12px rgba(200,255,61,0.55)',
              }}
            />
          </div>

          {/* Metadata */}
          <div className="flex flex-1 flex-col">
            <h3 className="font-display text-2xl italic leading-tight text-text transition-colors duration-300 group-hover:text-accent lg:text-3xl">
              {cert.title}
            </h3>
            <p className="mt-2 font-mono text-[11px] tracking-wider text-text-muted">
              {cert.issuer} · {cert.date}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {cert.skills.map((skill) => (
                <span key={skill} className="border border-border px-3 py-1 font-mono text-xs text-text-muted">
                  {skill}
                </span>
              ))}
            </div>

            {credentialId && (
              <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/70 pt-4 pr-16">
                <span className="font-mono text-[10px] tracking-[0.16em] text-text-muted">
                  ID: {credentialId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Whole-card open control */}
        <button
          type="button"
          onClick={(event) => onOpen(cert, event.currentTarget)}
          aria-label={'Open certificate details: ' + cert.title + ', ' + cert.issuer + ', ' + cert.date}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-offset-[-3px]"
        />

        {/* Copy credential ID */}
        {credentialId && (
          <button
            type="button"
            onClick={handleCopy}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label={'Copy credential ID ' + credentialId + ' for ' + cert.title}
            className="absolute bottom-5 right-5 z-20 font-mono text-[10px] tracking-[0.16em] text-text-muted transition-colors duration-300 hover:text-accent focus-visible:outline-offset-2 lg:bottom-6 lg:right-6"
            data-cursor-hover
          >
            <span aria-live="polite">{copied ? 'COPIED' : 'COPY'}</span>
          </button>
        )}
      </article>
    </li>
  );
}
