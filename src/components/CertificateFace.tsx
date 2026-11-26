import type { Certificate } from '../sections/Certificates';

interface CertificateFaceProps {
  cert: Certificate;
  variant?: 'card' | 'modal';
}

function monogramFor(issuer: string) {
  const words = issuer.replace(/[^A-Za-z ]/g, ' ').split(/\s+/).filter(Boolean);
  const letters = words.length > 1
    ? words.slice(0, 2).map((word) => word[0]).join('')
    : issuer.replace(/[^A-Za-z]/g, '').slice(0, 2);
  return (letters || 'C').toUpperCase();
}

/**
 * Renders the certificate scan when one exists, otherwise a generated
 * credential face so a card never looks broken.
 */
export default function CertificateFace({ cert, variant = 'card' }: CertificateFaceProps) {
  if (cert.image) {
    return (
      <img
        src={cert.image}
        alt={`${cert.title} certificate from ${cert.issuer}`}
        width={1778}
        height={1264}
        loading={variant === 'modal' ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-contain"
      />
    );
  }

  const monogram = monogramFor(cert.issuer);
  const mono = variant === 'modal' ? 'text-[10px]' : 'text-[9px]';
  const monogramSize = variant === 'modal'
    ? 'text-[clamp(4rem,9vw,7rem)]'
    : 'text-[clamp(3rem,9vw,5.5rem)]';

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#101012]">
      {/* Ambient tint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 15% 0%, rgba(200,255,61,0.07), transparent 55%), linear-gradient(135deg, #17171A 0%, #0C0C0E 100%)',
        }}
      />
      {/* Scan pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px)',
        }}
      />
      {/* Holographic sheen */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.045) 50%, transparent 58%)',
        }}
      />
      <div className="absolute inset-3 border border-white/[0.06] sm:inset-4" />

      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
        <div className={'flex items-center justify-between font-mono tracking-[0.22em] text-text-muted/80 ' + mono}>
          <span>{cert.index} / CREDENTIAL</span>
          <span className="flex items-end gap-[3px]" aria-hidden="true">
            {[9, 15, 11, 18, 7, 13, 17, 10].map((height, i) => (
              <span key={i} className="w-[2px] bg-text/25" style={{ height }} />
            ))}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <span className={'select-none font-display italic leading-none text-text/[0.09] ' + monogramSize}>
            {monogram}
          </span>
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-text-muted/70 sm:text-[9px]">
            {cert.issuer}
          </span>
          <span className="mt-1 h-px w-16 bg-accent/30" />
        </div>

        <div className={'flex items-end justify-between gap-4 font-mono uppercase tracking-[0.2em] text-text-muted/70 ' + mono}>
          <span>{cert.credentialId ? `ID ${cert.credentialId}` : `${cert.index} / ISSUED`}</span>
          <span className="flex items-center gap-2">
            {cert.date}
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/25">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M1.6 5.3 4 7.7 8.4 2.6"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent/60"
                />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
