import Link from "next/link";

interface WordmarkProps {
  href?: string;
  showByline?: boolean;
  /** Override the emblem size in px (default 30, matches Glacier Lab spec). */
  emblemSize?: number;
  /**
   * Colour variant. "dark" (default) — dark text + dark byline mark for
   * light backgrounds. "light" — white text + white byline mark for
   * placement over dark imagery (e.g. the onboarding hero photo).
   */
  variant?: "dark" | "light";
}

/**
 * Glacier Lab wordmark.
 *
 *   - 30 px minimal emblem (navy square, white zigzag, alpine-red dot)
 *     rendered inline as SVG. The emblem is colour-neutral and works on
 *     both light and dark backgrounds.
 *   - "Alpine Map Training" set in Manrope 800.
 *   - The "By PerformOS" byline mark is the official brand SVG shipped
 *     in `/public/brand/by-performos-*.svg`. Dark variant on light bg,
 *     white variant on dark bg.
 */
export function Wordmark({
  href = "/",
  showByline = true,
  emblemSize = 30,
  variant = "dark",
}: WordmarkProps) {
  const isLight = variant === "light";
  const bylineSrc = isLight
    ? "/brand/by-performos-white-transparent.svg"
    : "/brand/by-performos-black-transparent.svg";
  // Byline mark height — roughly tracks the previous text byline so the
  // overall wordmark stays the same visual weight.
  const bylineHeight = Math.max(12, Math.round(emblemSize * 0.45));

  const inner = (
    <span className="wordmark">
      <span
        className="mark"
        style={{
          width: emblemSize,
          height: emblemSize,
          display: "block",
          flexShrink: 0,
        }}
        aria-hidden
      >
        <svg viewBox="0 0 30 30" width={emblemSize} height={emblemSize}>
          <rect width="30" height="30" fill="#0E1A2E" />
          <path
            d="M4 22 L11 12 L16 18 L21 10 L26 16"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="8" r="2.5" fill="#D7263D" />
        </svg>
      </span>
      <span>
        <span
          className="name block"
          style={isLight ? { color: "#ffffff" } : undefined}
        >
          Alpine Map Training
        </span>
        {showByline ? (
          <img
            src={bylineSrc}
            alt="By PerformOS"
            style={{
              height: bylineHeight,
              width: "auto",
              display: "block",
              marginTop: 2,
            }}
          />
        ) : null}
      </span>
    </span>
  );
  if (!href) return inner;
  return (
    <Link
      href={href}
      className="no-underline"
      aria-label="Alpine Map Training — home, By PerformOS"
    >
      {inner}
    </Link>
  );
}
