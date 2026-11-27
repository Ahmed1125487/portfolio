import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import MagneticButton from './MagneticButton';
import CertificateFace from './CertificateFace';
import { getLenis } from '../hooks/useSmoothScroll';
import type { Certificate } from '../sections/Certificates';

interface CertificateModalProps {
  cert: Certificate;
  trigger: HTMLElement | null;
  onClose: () => void;
}

export default function CertificateModal({ cert, trigger, onClose }: CertificateModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const lenis = getLenis();
    const previousOverflow = document.body.style.overflow;
    lenis?.stop();
    document.body.style.overflow = 'hidden';

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((element) => element.getClientRects().length > 0);

      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      const target = trigger ?? previouslyFocused;
      window.requestAnimationFrame(() => target?.focus?.());
    };
  }, [onClose, trigger]);

  const openVerification = () => {
    if (cert.verifyUrl) {
      window.open(cert.verifyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6 lg:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
    >
      <motion.div
        className="absolute inset-0 bg-bg/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        data-lenis-prevent
        className="relative z-10 flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-y-auto border border-border bg-surface shadow-[0_40px_120px_rgba(0,0,0,0.65)] outline-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <p className="font-mono text-[10px] tracking-[0.22em] text-accent">CREDENTIAL // {cert.index}</p>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-accent sm:inline-flex">
              {cert.verifyUrl ? 'VERIFIED' : 'ISSUED'}
              {cert.verifyUrl && (
                <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_8px_rgba(200,255,61,0.55)]" />
              )}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close certificate dialog"
              className="flex h-9 w-9 items-center justify-center border border-border text-text-muted transition-colors duration-300 hover:border-accent/50 hover:text-accent"
              data-cursor-hover
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
          <div className="border-b border-border bg-bg p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <motion.div
              layoutId={reducedMotion ? undefined : 'certificate-face-' + cert.id}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[1778/1264] w-full overflow-hidden border border-border bg-bg"
            >
              <CertificateFace cert={cert} variant="modal" />
            </motion.div>
            <div className="mt-3 flex items-center justify-between gap-4 font-mono text-[9px] tracking-[0.2em] text-text-muted">
              <span>{cert.verifyUrl ? 'SCAN // AUTHENTIC' : 'SCAN // DOCUMENT'}</span>
              <span>{cert.date}</span>
            </div>
          </div>

          <div className="flex flex-col p-5 sm:p-6 lg:p-8">
            <p className="font-mono text-[10px] tracking-[0.22em] text-text-muted">ISSUED BY</p>
            <p className="mt-2 font-mono text-xs tracking-wider text-text">{cert.issuer}</p>

            <h2 id="certificate-modal-title" className="mt-5 font-display text-3xl italic leading-tight text-text lg:text-4xl">
              {cert.title}
            </h2>

            <dl className={`mt-6 grid gap-4 border-y border-border py-4 ${cert.credentialId ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {cert.credentialId && (
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.2em] text-text-muted">CREDENTIAL ID</dt>
                  <dd className="mt-1 font-mono text-xs text-text">{cert.credentialId}</dd>
                </div>
              )}
              <div>
                <dt className="font-mono text-[9px] tracking-[0.2em] text-text-muted">ISSUED</dt>
                <dd className="mt-1 font-mono text-xs text-text">{cert.date}</dd>
              </div>
            </dl>

            <div className="mt-5">
              <p className="font-mono text-[9px] tracking-[0.2em] text-text-muted">SKILLS COVERED</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {cert.skills.map((skill) => (
                  <li key={skill} className="border border-border px-3 py-1 font-mono text-xs text-text-muted">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 font-body text-sm leading-relaxed text-text-muted">
              {cert.verifyUrl
                ? `Issued by ${cert.issuer} and verified against its public record.`
                : `Issued by ${cert.issuer} in ${cert.date}.`}
            </p>

            {cert.verifyUrl && (
              <div className="mt-8">
                <MagneticButton onClick={openVerification} className="w-full sm:w-auto">
                  VERIFY ↗
                </MagneticButton>
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-4 font-mono text-[9px] tracking-[0.18em] text-text-muted">
              <span>PRESS ESC TO CLOSE</span>
              <span className="hidden sm:inline">ARCHIVE {cert.index}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
