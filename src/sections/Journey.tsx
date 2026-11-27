import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TimelineItem {
  year: string;
  tag: string;
  title: string;
  description: string;
}

const timelineData: TimelineItem[] = [
  {
    year: "2023",
    tag: "EDUCATION",
    title: "Higher Technological Institute",
    description: "Enrolled in Computer Science program, focusing on software engineering fundamentals.",
  },
  {
    year: "2024",
    tag: "LEARNING",
    title: "Frontend Development",
    description: "Deep dive into React ecosystem, TypeScript, and modern CSS architectures.",
  },
  {
    year: "2024",
    tag: "LEARNING",
    title: "Full-Stack Expansion",
    description: "Learned Node.js, databases, and API design to build complete applications.",
  },
  {
    year: "2025",
    tag: "BUILD",
    title: "Advanced Projects",
    description: "Built complex projects including 3D web experiences and real-time collaboration apps.",
  },
  {
    year: "2027",
    tag: "EXPECTED",
    title: "Graduation",
    description: "Expected completion of Computer Science degree with honors.",
  },
];

const TOP_PAD = 150;
const STEP = 300;
const TRAIL_LENGTH = 64;

interface MissionNode {
  x: number;
  y: number;
  fraction: number;
}

interface MissionCardLayout {
  x: number;
  width: number;
  connectorX: number;
  connectorWidth: number;
  side: "left" | "right";
}

interface MissionGeometry {
  width: number;
  height: number;
  pathD: string;
  solidD: string;
  expectedD: string;
  totalLength: number;
  solidLength: number;
  solidFraction: number;
  nodes: MissionNode[];
  cards: MissionCardLayout[];
  isDesktop: boolean;
}

const pad2 = (value: number) => String(value).padStart(2, "0");

const buildSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
  const dy = to.y - from.y;
  return `C ${from.x} ${from.y + dy * 0.45}, ${to.x} ${to.y - dy * 0.45}, ${to.x} ${to.y}`;
};

const buildPath = (points: { x: number; y: number }[]) =>
  points
    .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : buildSegment(points[index - 1], point)))
    .join(" ");

const buildGeometry = (width: number, isDesktop: boolean): MissionGeometry => {
  const count = timelineData.length;
  const height = TOP_PAD * 2 + (count - 1) * STEP;
  const center = width / 2;
  const swing = Math.min(88, width * 0.075);
  const points = timelineData.map((_, index) => ({
    x: isDesktop ? center + (index % 2 === 0 ? swing : -swing) : 16,
    y: TOP_PAD + index * STEP,
  }));

  const pathD = buildPath(points);
  const solidD = buildPath(points.slice(0, -1));
  const expectedD = `M ${points[count - 2].x} ${points[count - 2].y} ${buildSegment(points[count - 2], points[count - 1])}`;

  const makePath = (d: string) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    return path;
  };

  const fullPath = makePath(pathD);
  const totalLength = fullPath.getTotalLength();
  const solidLength = makePath(solidD).getTotalLength();
  const nodes = points.map((_, index) => {
    const point = fullPath.getPointAtLength(totalLength * (index / (count - 1)));
    return { x: point.x, y: point.y, fraction: index / (count - 1) };
  });

  const cardWidth = isDesktop ? Math.min(400, Math.max(280, width * 0.34)) : Math.max(0, width - 48);
  const cards = nodes.map((node, index): MissionCardLayout => {
    const side = index % 2 === 0 ? "right" : "left";

    if (!isDesktop) {
      return {
        side: "right",
        x: 48,
        width: cardWidth,
        connectorX: 16,
        connectorWidth: 32,
      };
    }

    const x =
      side === "right"
        ? Math.min(width - cardWidth - 24, node.x + 56)
        : Math.max(24, node.x - 56 - cardWidth);
    const cardEdge = side === "right" ? x : x + cardWidth;

    return {
      side,
      x,
      width: cardWidth,
      connectorX: Math.min(node.x, cardEdge),
      connectorWidth: Math.abs(cardEdge - node.x),
    };
  });

  return {
    width,
    height,
    pathD,
    solidD,
    expectedD,
    totalLength,
    solidLength,
    solidFraction: (count - 2) / (count - 1),
    nodes,
    cards,
    isDesktop,
  };
};

export default function Journey() {
  const containerRef = useRef<HTMLDivElement>(null);
  const basePathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const travelerRef = useRef<SVGGElement>(null);
  const geometryRef = useRef<MissionGeometry | null>(null);
  const progressRef = useRef(0);
  const reachedRef = useRef(1);
  const refreshPendingRef = useRef(false);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const [geometry, setGeometry] = useState<MissionGeometry | null>(null);
  const [reachedCount, setReachedCount] = useState(1);
  const [isReduced, setIsReduced] = useState(false);

  const applyProgress = useCallback((progress: number) => {
    const current = geometryRef.current;
    const basePath = basePathRef.current;
    if (!current || !basePath) return;

    const nextProgress = Math.min(1, Math.max(0, progress));
    progressRef.current = nextProgress;

    const solidProgress = Math.min(1, nextProgress / current.solidFraction);
    progressPathRef.current?.setAttribute(
      "stroke-dashoffset",
      String(current.solidLength * (1 - solidProgress)),
    );

    const point = basePath.getPointAtLength(current.totalLength * nextProgress);
    travelerRef.current?.setAttribute("transform", `translate(${point.x} ${point.y})`);
    trailRef.current?.setAttribute(
      "stroke-dashoffset",
      String(TRAIL_LENGTH - current.totalLength * nextProgress),
    );

    let reached = 1;
    for (let index = 0; index < timelineData.length - 1; index += 1) {
      if (nextProgress + 0.0005 >= index / (timelineData.length - 1)) reached = index + 1;
    }

    if (reached !== reachedRef.current) {
      reachedRef.current = reached;
      setReachedCount(reached);
    }
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimer: number | undefined;

    const rebuild = () => {
      const width = container.clientWidth;
      if (!width) return;

      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nextGeometry = buildGeometry(width, desktop);

      geometryRef.current = nextGeometry;
      setIsReduced(reduced);
      setGeometry(nextGeometry);

      if (reduced) {
        reachedRef.current = timelineData.length - 1;
        setReachedCount(timelineData.length - 1);
      }
    };

    rebuild();

    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        refreshPendingRef.current = true;
        rebuild();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (!geometry) return;
    applyProgress(progressRef.current);
  }, [geometry, applyProgress]);

  useLayoutEffect(() => {
    if (!geometry || !refreshPendingRef.current) return;
    refreshPendingRef.current = false;
    if (triggerRef.current) ScrollTrigger.refresh();
  }, [geometry]);

  const hasGeometry = geometry !== null;

  useLayoutEffect(() => {
    if (!hasGeometry) return;
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      applyProgress(1);
      return;
    }

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: container,
        start: "top 60%",
        end: "bottom 60%",
        scrub: 0.5,
        onUpdate: (self) => applyProgress(self.progress),
      });

      triggerRef.current = trigger;
      applyProgress(trigger.progress);
    }, container);

    return () => {
      triggerRef.current = null;
      ctx.revert();
    };
  }, [hasGeometry, applyProgress]);

  const count = timelineData.length;

  return (
    <section id="journey" className="py-32 px-6 lg:px-12 relative" aria-label="Journey section">
      <h2 className="sr-only">Journey and experience</h2>
      <p className="font-mono text-xs tracking-widest text-accent mb-4">(05) — JOURNEY</p>

      <style>{`
        .journey-card-grid {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 22px 22px;
        }
        .journey-card {
          transform: translateY(16px);
          transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .journey-card.is-reached,
        .journey-card.is-expected {
          transform: translateY(0);
        }
        .waypoint-pulse {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
        }
        .journey-waypoint.is-reached .waypoint-pulse {
          animation: waypoint-pulse 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) 1;
        }
        @keyframes waypoint-pulse {
          0% {
            opacity: 0.45;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2.1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .journey-card {
            transition: none !important;
          }
          .journey-waypoint.is-reached .waypoint-pulse {
            animation: none !important;
            display: none;
          }
        }
      `}</style>

      <div className="mx-auto mt-12 max-w-[1200px] lg:mt-16">
        <div
          ref={containerRef}
          className="relative"
          style={{ height: geometry?.height ?? TOP_PAD * 2 + (count - 1) * STEP }}
          role="list"
          aria-label="Journey milestones"
        >
          {geometry && (
            <>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                viewBox={`0 0 ${geometry.width} ${geometry.height}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <filter id="journey-route-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#C8FF3D" floodOpacity="0.55" />
                  </filter>
                </defs>

                <path
                  ref={basePathRef}
                  d={geometry.pathD}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />

                <path
                  d={geometry.expectedD}
                  fill="none"
                  stroke="#C8FF3D"
                  strokeOpacity="0.38"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />

                <path
                  ref={progressPathRef}
                  d={geometry.solidD}
                  fill="none"
                  stroke="#C8FF3D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${geometry.solidLength} ${geometry.solidLength}`}
                  filter="url(#journey-route-glow)"
                />

                {!isReduced && (
                  <path
                    ref={trailRef}
                    d={geometry.pathD}
                    fill="none"
                    stroke="#C8FF3D"
                    strokeOpacity="0.3"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${TRAIL_LENGTH} ${geometry.totalLength}`}
                  />
                )}

                {geometry.nodes.map((node, index) => {
                  const isReached = index < reachedCount;
                  const isExpected = index === count - 1;

                  return (
                    <g
                      key={`waypoint-${timelineData[index].year}-${index}`}
                      transform={`translate(${node.x} ${node.y})`}
                      className={`journey-waypoint${isReached ? " is-reached" : ""}${isExpected ? " is-expected" : ""}`}
                    >
                      {!isExpected && <circle className="waypoint-pulse" r="10" fill="none" stroke="#C8FF3D" strokeWidth="1.5" />}
                      <circle
                        r="10"
                        fill={isReached ? "#C8FF3D" : "#0B0B0C"}
                        stroke={isExpected ? "#C8FF3D" : isReached ? "#C8FF3D" : "rgba(255, 255, 255, 0.24)"}
                        strokeWidth="1.5"
                        strokeDasharray={isExpected ? "3 4" : undefined}
                      />
                      <g stroke={isReached ? "#C8FF3D" : "rgba(255, 255, 255, 0.35)"} strokeWidth="1">
                        <line x1="-16" y1="0" x2="-12" y2="0" />
                        <line x1="12" y1="0" x2="16" y2="0" />
                        <line x1="0" y1="-16" x2="0" y2="-12" />
                        <line x1="0" y1="12" x2="0" y2="16" />
                      </g>
                    </g>
                  );
                })}

                {!isReduced && (
                  <g ref={travelerRef} aria-hidden="true">
                    <circle r="9" fill="#C8FF3D" opacity="0.12" />
                    <circle r="5" fill="#C8FF3D" />
                  </g>
                )}
              </svg>

              {geometry.cards.map((card, index) => {
                const item = timelineData[index];
                const isReached = index < reachedCount;

                return (
                  <div
                    key={`connector-${item.year}-${index}`}
                    aria-hidden="true"
                    className={`absolute z-0 h-px ${isReached ? "bg-accent/45" : "bg-border"}`}
                    style={{
                      left: card.connectorX,
                      top: geometry.nodes[index].y,
                      width: card.connectorWidth,
                    }}
                  />
                );
              })}

              {geometry.cards.map((card, index) => {
                const item = timelineData[index];
                const node = geometry.nodes[index];
                const isReached = index < reachedCount;

                return (
                  <div
                    key={`${item.year}-${item.title}`}
                    role="listitem"
                    className="absolute z-10"
                    style={{
                      left: card.x,
                      top: node.y,
                      width: card.width,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <div
                      className={`journey-card journey-card-grid relative border border-border bg-surface/60 p-5 lg:p-6${isReached ? " is-reached" : ""}${index === count - 1 ? " is-expected" : ""}`}
                    >
                      <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-accent/80" />
                      <span aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r border-t border-accent/80" />
                      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-accent/80" />
                      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-accent/80" />

                      <div className="relative z-10">
                        <p className="font-mono text-[10px] tracking-[0.18em] text-text-muted">
                          WP-{pad2(index + 1)} · {item.tag}
                        </p>

                        <div
                          className={`mt-4 font-display text-6xl italic leading-none ${isReached ? "text-accent" : "text-text-muted/70"}`}
                        >
                          {item.year}
                        </div>

                        <h3 className="mt-4 font-display text-2xl italic leading-tight text-text">
                          {item.title}
                        </h3>
                        <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-text-muted">
                          {item.description}
                        </p>

                        {index === 0 && (
                          <p className="mt-3 font-mono text-[9px] tracking-[0.14em] text-text-muted">
                            Computer Science · 2023 — 2027
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-border hidden md:block" />
    </section>
  );
}
