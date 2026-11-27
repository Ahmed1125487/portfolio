import { useEffect, useRef } from 'react';
import MagneticButton from '../components/MagneticButton';
import gsap from 'gsap';

export default function Contact() {
  const email = 'atofy3682@gmail.com';
  const feedbackRef = useRef<HTMLSpanElement>(null);
  const feedbackTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(feedbackTimer.current), []);

  const showFeedback = (message: string) => {
    const feedback = feedbackRef.current;
    if (!feedback) return;
    feedback.textContent = message;
    gsap.killTweensOf(feedback);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(feedback, { opacity: 1, y: 0 });
    } else {
      gsap.to(feedback, { opacity: 1, y: 0, duration: 0.3 });
    }
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => {
      if (feedbackRef.current) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          gsap.set(feedbackRef.current, { opacity: 0, y: -10 });
        } else {
          gsap.to(feedbackRef.current, { opacity: 0, y: -10, duration: 0.3 });
        }
      }
    }, 2000);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      showFeedback('Copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showFeedback('Copy failed — select the address manually.');
    }
  };

  return (
    <section id="contact" className="py-32 px-6 lg:px-12 min-h-screen flex flex-col justify-center relative" aria-label="Contact section">
      {/* Section Label */}
      <p className="font-mono text-xs tracking-widest text-accent mb-4">(06) — CONTACT</p>

      <div className="max-w-[1440px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Main Heading */}
          <div>
            <h2 className="font-display text-[8vw] md:text-[6rem] italic leading-[0.9] text-text mb-8">
              Let&apos;s work<br /><span className="text-accent">together</span>
            </h2>
            <p className="font-body text-lg text-text-muted max-w-md">
              Have a project in mind or want to discuss potential collaborations? I&apos;m always open to new opportunities and interesting conversations.
            </p>
          </div>

          {/* Contact Info & Buttons */}
          <div className="flex flex-col justify-end space-y-8">
            {/* Email Copy Button */}
            <div className="relative group">
              <button
                type="button"
                onClick={copyEmail}
                className="w-full border border-border p-6 flex items-center justify-between hover:border-accent transition-colors duration-300"
                data-cursor-hover
                aria-label={`Copy email address ${email}`}
              >
                <span className="font-mono text-sm text-text-muted group-hover:text-accent transition-colors">
                  {email}
                </span>
                <span className="font-mono text-xs text-text-muted group-hover:text-accent transition-colors">
                  COPY
                </span>
              </button>
              <span
                ref={feedbackRef}
                role="status"
                aria-live="polite"
                className="copy-feedback pointer-events-none absolute top-full left-0 mt-2 font-mono text-xs text-accent opacity-0 -translate-y-2"
              />
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://github.com/Ahmed1125487"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-border p-4 text-center hover:border-accent hover:text-accent transition-colors duration-300 font-mono text-sm"
                data-cursor-hover
                aria-label="GitHub profile (opens in a new tab)"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/ahmed-atef-a8461b402"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 border border-border p-4 text-center hover:border-accent hover:text-accent transition-colors duration-300 font-mono text-sm"
                data-cursor-hover
                aria-label="LinkedIn profile (opens in a new tab)"
              >
                LinkedIn
              </a>
            </div>

            <MagneticButton onClick={() => window.location.href = `mailto:${email}`}>
              SEND MESSAGE
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Grid Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border hidden md:block" />
    </section>
  );
}