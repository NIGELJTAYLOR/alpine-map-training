/**
 * Decorative contour-line backdrop. Drop into a `relative` container with
 * `overflow: hidden`. Pure decoration; never load-bearing for state.
 */
export function ContourBackground({
  className = "",
  opacity = 0.3,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 600 320"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 280 Q 120 200, 280 240 T 600 180"
        stroke="var(--contour)"
        strokeWidth="1"
        fill="none"
        opacity={opacity * 1.0}
      />
      <path
        d="M0 250 Q 120 170, 280 210 T 600 150"
        stroke="var(--contour)"
        strokeWidth="1"
        fill="none"
        opacity={opacity * 0.85}
      />
      <path
        d="M0 220 Q 120 140, 280 180 T 600 120"
        stroke="var(--contour)"
        strokeWidth="1"
        fill="none"
        opacity={opacity * 0.7}
      />
      <path
        d="M0 190 Q 120 110, 280 150 T 600 90"
        stroke="var(--contour)"
        strokeWidth="1"
        fill="none"
        opacity={opacity * 0.55}
      />
      <path
        d="M0 160 Q 120 80, 280 120 T 600 60"
        stroke="var(--contour)"
        strokeWidth="1"
        fill="none"
        opacity={opacity * 0.4}
      />
    </svg>
  );
}

/** Thin contour-curve divider used between Carta sections. */
export function ContourDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`block h-3 w-full ${className}`}
      viewBox="0 0 600 12"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 8 Q 100 2, 200 6 T 400 4 T 600 7"
        stroke="var(--contour)"
        strokeWidth="1"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

/** Small hero-art placeholder used at the right of the desktop home hero. */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 320"
      fill="none"
      aria-hidden
    >
      {/* Background contour rings */}
      <g opacity="0.7">
        <ellipse cx="170" cy="180" rx="120" ry="78" stroke="var(--contour)" strokeWidth="1" />
        <ellipse cx="170" cy="180" rx="92" ry="58" stroke="var(--contour)" strokeWidth="1" opacity="0.85" />
        <ellipse cx="170" cy="180" rx="64" ry="40" stroke="var(--contour)" strokeWidth="1" opacity="0.7" />
        <ellipse cx="170" cy="180" rx="38" ry="22" stroke="var(--contour)" strokeWidth="1" opacity="0.55" />
        <ellipse cx="170" cy="180" rx="14" ry="9" stroke="var(--contour)" strokeWidth="1.2" opacity="0.9" />
      </g>
      {/* Spot height */}
      <g>
        <polygon points="170,176 165,184 175,184" fill="var(--ink)" />
        <text
          x="180"
          y="186"
          fill="var(--ink-2)"
          fontSize="11"
          fontFamily="var(--font-mono)"
          letterSpacing="0.05em"
        >
          2,438m
        </text>
      </g>
      {/* Compass mark top-left */}
      <g transform="translate(40, 40)">
        <circle cx="22" cy="22" r="22" stroke="var(--ink-3)" strokeWidth="1" fill="none" />
        <text
          x="22"
          y="14"
          fill="var(--ink-3)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
        >
          N
        </text>
        <line x1="22" y1="18" x2="22" y2="30" stroke="var(--ink)" strokeWidth="1.4" />
        <polygon points="22,16 19,22 25,22" fill="var(--ink)" />
      </g>
      {/* Bearing label top-right */}
      <text
        x="290"
        y="48"
        fill="var(--ink-3)"
        fontSize="10"
        fontFamily="var(--font-mono)"
        textAnchor="end"
        letterSpacing="0.1em"
      >
        042° MAG
      </text>
    </svg>
  );
}
