import { useState } from 'react';

interface LogoProps {
  showWordmark?: boolean;
  size?: number;
}

// No static outline: a light beam with a long fading tail travels around the
// hexagon and "draws" it as it goes. All segments share the same leading edge.
const HEX = 'M32 6 54.5 19v26L32 58 9.5 45V19Z';
const TOP = 80; // longest segment = visible tail length (% of the perimeter)

// [length, opacity, strokeWidth] — tail → head (overlap builds the fade)
const BEAM: [number, number, number][] = [
  [80, 0.24, 2.4],
  [70, 0.24, 2.4],
  [60, 0.24, 2.5],
  [50, 0.24, 2.6],
  [40, 0.24, 2.7],
  [30, 0.24, 2.8],
  [20, 0.28, 3],
  [12, 0.34, 3.2],
  [5, 1, 3.6],
];

export default function Logo({ showWordmark = true, size = 34 }: LogoProps) {
  const [animate] = useState(
    () => typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  return (
    <span className="inline-flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="shrink-0">
        <rect x=".5" y=".5" width="63" height="63" rx="14" fill="#0B0B0C" stroke="#fff" strokeOpacity=".12" />
        <g>
          {BEAM.map(([len, opacity, width]) => {
            const from = TOP - len;
            return (
              <path
                key={len}
                d={HEX}
                pathLength={100}
                stroke="#C8FF3D"
                strokeOpacity={opacity}
                strokeWidth={width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${len} ${100 - len}`}
                strokeDashoffset={-from}
              >
                {animate && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from={-from}
                    to={-from - 100}
                    dur="3.4s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            );
          })}
        </g>
        <g transform="translate(32 32) scale(.5) translate(-32 -30.5)">
          <g
            transform="translate(3 0) skewX(-9)"
            fill="#C8FF3D"
            className="transition-colors duration-300 group-hover:fill-[#EDEAE3]"
          >
            <path d="M30.6 11h4.2L21 51h-5z" />
            <path d="M32.2 11h8.2l9.6 40h-9.2z" />
            <rect x="23" y="35" width="19" height="4" />
            <rect x="11" y="49" width="16" height="3.6" />
            <rect x="36" y="49" width="19" height="3.6" />
          </g>
        </g>
      </svg>

      {showWordmark && (
        <span className="font-display text-xl italic text-text transition-colors duration-300 group-hover:text-accent">
          AHMED
        </span>
      )}
    </span>
  );
}
