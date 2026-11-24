import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';

gsap.registerPlugin(ScrollTrigger);

export interface Certificate {
  id: string;
  index: string;
  title: string;
  issuer: string;
  date: string;
  credentialId: string;
  skills: string[];
  image?: string;
  verifyUrl?: string;
}

/*
 * TODO: replace these placeholder credentials with your own.
 *
 * Images live in /public/certificates/ (webp recommended, 1280×800).
 * Add `image: '/certificates/your-file.webp'` to an entry — when `image` is
 * omitted the generated credential face is rendered instead.
 */
const certificates: Certificate[] = [
  {
    id: 'meta-frontend',
    index: '(01)',
    title: 'Meta Front-End Developer Professional Certificate',
    issuer: 'Coursera',
    date: '2025',
    credentialId: '8F3A-2C19',
    skills: ['React', 'JavaScript', 'UI Engineering'],
    verifyUrl: 'https://www.coursera.org/account/accomplishments/professional-cert/8F3A2C19',
  },
  {
    id: 'advanced-react',
    index: '(02)',
    title: 'Advanced React & TypeScript',
    issuer: 'Frontend Masters',
    date: '2025',
    credentialId: 'C7D1-4B02',
    skills: ['React', 'TypeScript', 'Architecture'],
    verifyUrl: 'https://frontendmasters.com/certificates/c7d1-4b02/',
  },
  {
    id: 'jsnad',
    index: '(03)',
    title: 'Node.js Certified Developer (JSNAD)',
    issuer: 'OpenJS Foundation',
    date: '2024',
    credentialId: 'A2E8-91F4',
    skills: ['Node.js', 'REST APIs', 'Testing'],
    verifyUrl: 'https://openjsf.org/certification/',
  },
  {
    id: 'cs50x',
    index: '(04)',
    title: 'CS50x: Introduction to Computer Science',
    issuer: 'HarvardX',
    date: '2024',
    credentialId: 'D4B7-63E0',
    skills: ['C', 'Algorithms', 'Data Structures'],
    verifyUrl: 'https://cs50.harvard.edu/x/',
  },
  {
    id: 'problem-solving',
    index: '(05)',
    title: 'Problem Solving (Intermediate)',
    issuer: 'HackerRank',
    date: '2023',
    credentialId: 'E9C3-17A5',
    skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
    verifyUrl: 'https://www.hackerrank.com/certificates/e9c317a5',
  },
  {
    id: 'responsive-web',
    index: '(06)',
    title: 'Responsive Web Design',
    issuer: 'freeCodeCamp',
    date: '2023',
    credentialId: 'B5F0-2D68',
    skills: ['HTML5', 'CSS3', 'Accessibility'],
    verifyUrl: 'https://www.freecodecamp.org/certification/ahmed-atef/responsive-web-design',
  },
];

const LABEL = '(02) — CERTIFICATES';
const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>*#';

function scrambleText(finalText: string, progress: number) {
  const revealed = Math.floor(progress * finalText.length);
  let output = '';
  for (let i = 0; i < finalText.length; i++) {
    const character = finalText[i];
    output += i < revealed || character === ' '
      ? character
      : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
  }
  return output;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function CountUp({ value }: { value: number }) {
  const valueRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = valueRef.current;
    if (!element || prefersReducedMotion()) return;
    element.textContent = '00';

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      const startedAt = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(eased * value)).padStart(2, '0');
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={valueRef}>{String(value).padStart(2, '0')}</span>;
}

function AmbientStream({ ids }: { ids: string[] }) {
  const sequence = ids.map((id) => 'CRED // ' + id).join('   ·   ') + '   ·   ';
  const half = Array.from({ length: 5 }, () => sequence).join(' ');
  const rows = [
    { duration: 95, reverse: false },
    { duration: 135, reverse: true },
    { duration: 115, reverse: false },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)',
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-center gap-10 opacity-[0.04] sm:gap-14">
        {rows.map((row, index) => (
          <div
            key={index}
            className="cert-stream flex w-max select-none whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.35em] text-text"
            style={{
              animation: 'cert-drift ' + row.duration + 's linear infinite',
              animationDirection: row.reverse ? 'reverse' : 'normal',
            }}
          >
            <span className="pr-16">{half}</span>
            <span className="pr-16">{half}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Certificates() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<{ cert: Certificate; trigger: HTMLElement | null } | null>(null);

  const handleOpen = useCallback((cert: Certificate, trigger: HTMLElement) => {
    setActive({ cert, trigger });
  }, []);
  const handleClose = useCallback(() => setActive(null), []);

  const certificateCount = certificates.length;
  const issuerCount = new Set(certificates.map((cert) => cert.issuer)).size;
  const years = certificates.map((cert) => Number.parseInt(cert.date, 10));
  const yearStart = Math.min(...years);
  const yearEnd = Math.max(...years);

  // Intro: label decrypts, headline masks up, rule draws.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const label = labelRef.current;
      const lines = gsap.utils.toArray<HTMLElement>('.cert-line', section);
      const rule = section.querySelector<HTMLElement>('.cert-rule');

      if (label) label.textContent = scrambleText(LABEL, 0);
      gsap.set(lines, { yPercent: 130 });
      if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' });

      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
        defaults: { ease: 'power3.out' },
      });

      if (label) {
        const scramble = { progress: 0 };
        timeline.to(scramble, {
          progress: 1,
          duration: 0.8,
          ease: 'none',
          onUpdate: () => {
            label.textContent = scrambleText(LABEL, scramble.progress);
          },
          onComplete: () => {
            label.textContent = LABEL;
          },
        }, 0);
      }

      timeline.to(lines, { yPercent: 0, duration: 1.05, stagger: 0.1 }, 0.08);
      if (rule) timeline.to(rule, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, 0.4);
    }, section);

    return () => ctx.revert();
  }, []);

  // Cards: clip-path reveal + one-shot scan + image de-blur.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.cert-card', section);
      gsap.set(cards, { clipPath: 'inset(100% 0% 0% 0%)', y: 60, opacity: 0 });

      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            clipPath: 'inset(0% 0% 0% 0%)',
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'power3.out',
            stagger: 0.12,
            overwrite: true,
          });

          (batch as HTMLElement[]).forEach((card) => {
            const scan = card.querySelector<HTMLElement>('.cert-scan');
            if (scan) {
              gsap.fromTo(scan, { y: 0, opacity: 0 }, {
                y: card.offsetHeight,
                opacity: 1,
                duration: 1,
                ease: 'power2.inOut',
                delay: 0.15,
                onComplete: () => {
                  gsap.to(scan, { opacity: 0, duration: 0.25, overwrite: true });
                },
              });
            }

            const media = card.querySelector<HTMLElement>('.cert-media-blur');
            if (media) {
              gsap.fromTo(media,
                { filter: 'blur(8px) grayscale(1) brightness(0.7)' },
                {
                  filter: 'blur(0px) grayscale(0.55) brightness(0.9)',
                  duration: 1.3,
                  ease: 'power2.out',
                  delay: 0.1,
                  onComplete: () => gsap.set(media, { clearProps: 'filter' }),
                }
              );
            }
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Parallax: certificate faces drift against their slabs.
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.cert-parallax', section).forEach((layer) => {
        const card = layer.closest('.cert-card');
        if (!card) return;
        gsap.fromTo(layer, { y: -20 }, {
          y: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Keep Projects' pinned scene calibrated once this section settles.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 160);
    };

    const images = Array.from(section.querySelectorAll('img'));
    images.forEach((image) => {
      if (!image.complete) image.addEventListener('load', refresh, { once: true });
    });

    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    if (document.fonts?.ready) void document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
      images.forEach((image) => image.removeEventListener('load', refresh));
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certificates"
      aria-label="Certificates section"
      className="relative overflow-hidden py-32 px-6 lg:px-12"
    >
      <style>{`@keyframes cert-drift { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(-50%, 0, 0); } } @media (prefers-reduced-motion: reduce) { .cert-stream { animation: none !important; } }`}</style>

      <AmbientStream ids={certificates.map((cert) => cert.credentialId)} />

      <div className="relative z-[1] max-w-[1440px] mx-auto">
        <p className="mb-4 min-h-[1.125rem] font-mono text-xs tracking-widest text-accent">
          <span ref={labelRef} aria-hidden="true">{LABEL}</span>
          <span className="sr-only">{LABEL}</span>
        </p>

        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <h2 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] tracking-tight text-text">
              <span className="block overflow-hidden pb-[0.12em]">
                <span className="cert-line block">Credentials</span>
              </span>
              <span className="block overflow-hidden pb-[0.12em]">
                <span className="cert-line block">that <em className="italic text-accent">prove</em> it</span>
              </span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:pb-4">
            <p className="max-w-sm font-body text-sm leading-relaxed text-text-muted">
              A verified archive of frontend, backend and computer-science credentials — issued, signed and checkable.
            </p>
          </div>
        </div>

        <div className="cert-rule mt-8 h-px w-full origin-left bg-accent/60" />

        <div
          className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] tracking-[0.18em] text-text-muted sm:text-xs"
          aria-label={`${certificateCount} certificates, ${issuerCount} issuers, ${yearStart} to ${yearEnd}`}
        >
          <span aria-hidden="true" className="flex items-baseline gap-2">
            <span className="text-accent"><CountUp value={certificateCount} /></span> CERTIFICATES
          </span>
          <span aria-hidden="true" className="text-text-muted/40">·</span>
          <span aria-hidden="true" className="flex items-baseline gap-2">
            <span className="text-accent"><CountUp value={issuerCount} /></span> ISSUERS
          </span>
          <span aria-hidden="true" className="text-text-muted/40">·</span>
          <span aria-hidden="true" className="tabular-nums text-accent">{yearStart}—{yearEnd}</span>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8" aria-label="Verified certificates">
          {certificates.map((cert, index) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              featured={index === 0}
              isOpen={active?.cert.id === cert.id}
              onOpen={handleOpen}
            />
          ))}
        </ul>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-border hidden md:block" />

      <AnimatePresence>
        {active && (
          <CertificateModal
            key={active.cert.id}
            cert={active.cert}
            trigger={active.trigger}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
