import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

const timelineData: TimelineItem[] = [
  {
    year: '2023',
    title: 'Higher Technological Institute',
    description: 'Enrolled in Computer Science program, focusing on software engineering fundamentals.',
  },
  {
    year: '2024',
    title: 'Frontend Development',
    description: 'Deep dive into React ecosystem, TypeScript, and modern CSS architectures.',
  },
  {
    year: '2024',
    title: 'Full-Stack Expansion',
    description: 'Learned Node.js, databases, and API design to build complete applications.',
  },
  {
    year: '2025',
    title: 'Advanced Projects',
    description: 'Built complex projects including 3D web experiences and real-time collaboration apps.',
  },
  {
    year: '2027',
    title: 'Graduation',
    description: 'Expected completion of Computer Science degree with honors.',
  },
];

export default function Journey() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const timelineColumnRef = useRef<HTMLDivElement>(null);
  const yearRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [markerPositions, setMarkerPositions] = useState<number[]>([]);
  const [activeMarkers, setActiveMarkers] = useState<boolean[]>(() => timelineData.map(() => false));

  useEffect(() => {
    const timelineColumn = timelineColumnRef.current;
    if (!timelineColumn) return;

    const updateMarkerPositions = () => {
      const columnTop = timelineColumn.getBoundingClientRect().top;
      setMarkerPositions(yearRefs.current.map((year) => {
        if (!year) return 0;
        const rect = year.getBoundingClientRect();
        return rect.top - columnTop + rect.height / 2;
      }));
    };

    updateMarkerPositions();
    const resizeObserver = new ResizeObserver(updateMarkerPositions);
    resizeObserver.observe(timelineColumn);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!timelineRef.current || !lineRef.current) return;

    const syncMarkersToProgress = (progress: number) => {
      const timelineColumn = timelineColumnRef.current;
      if (!timelineColumn) return;

      const columnRect = timelineColumn.getBoundingClientRect();
      const lineHeight = columnRect.height;
      if (lineHeight <= 0) return;

      const next = yearRefs.current.map((year) => {
        if (!year) return false;
        const rect = year.getBoundingClientRect();
        const offset = rect.top - columnRect.top + rect.height / 2;
        return progress >= offset / lineHeight;
      });

      setActiveMarkers((current) =>
        current.every((active, index) => active === next[index]) ? current : next
      );
    };

    const ctx = gsap.context(() => {
      // Animate timeline items
      document.querySelectorAll('.timeline-item').forEach((item) => {
        const el = item as HTMLElement;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
        });
      });

      // Draw progress line
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
            onUpdate: (self) => syncMarkersToProgress(self.progress),
            onRefresh: (self) => syncMarkersToProgress(self.progress),
          },
        }
      );
    }, timelineRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" className="py-32 px-6 lg:px-12 relative" aria-label="Journey section">
      {/* Section Label */}
      <p className="font-mono text-xs tracking-widest text-accent mb-4">(04) — JOURNEY</p>

      <div ref={timelineRef} className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Education Card */}
          <div className="border border-border p-8 bg-surface">
            <h3 className="font-display text-2xl italic text-text mb-2">Education</h3>
            <p className="font-mono text-sm text-accent mb-4">2023 — 2027</p>
            <h4 className="font-display text-xl text-text mb-2">Higher Technological Institute</h4>
            <p className="font-mono text-xs text-text-muted mb-4">Computer Science</p>
            <p className="font-body text-sm text-text-muted leading-relaxed">
              Currently pursuing a Bachelor's degree in Computer Science with focus on software engineering
              and full-stack development.
            </p>
          </div>

          {/* Main Timeline */}
          <div ref={timelineColumnRef} className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border">
              <div
                ref={lineRef}
                className="w-full h-full bg-accent origin-top"
                style={{ transformOrigin: 'top' }}
              />
            </div>

            {timelineData.map((_, index) => (
              <div
                key={`marker-${index}`}
                aria-hidden="true"
                className={`absolute left-4 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:scale-100 motion-reduce:shadow-none ${
                  activeMarkers[index]
                    ? 'border-accent bg-accent scale-[1.3] shadow-[0_0_12px_rgba(200,255,61,0.55)]'
                    : 'border-border bg-bg scale-100'
                }`}
                style={{ top: markerPositions[index] ?? 0 }}
              />
            ))}

            <div className="space-y-12 pt-4">
              {timelineData.map((item, index) => (
                <div
                  key={index}
                  className="timeline-item"
                >
                  <div className="ml-14 pb-8 border-b border-border last:border-0">
                    <span
                      ref={(year) => {
                        yearRefs.current[index] = year;
                      }}
                      className="font-mono text-xs text-accent"
                    >
                      {item.year}
                    </span>
                    <h4 className="font-display text-lg italic text-text mt-1">{item.title}</h4>
                    <p className="font-body text-sm text-text-muted mt-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border hidden md:block" />
    </section>
  );
}