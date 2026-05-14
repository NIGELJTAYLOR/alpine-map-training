import Link from "next/link";

interface WordmarkProps {
  href?: string;
  showByline?: boolean;
  /** Override the mark size in px (default 30, matches Glacier Lab spec). */
  emblemSize?: number;
}

/**
 * Glacier Lab wordmark: a 30 px minimal mark (navy square, white contour
 * line zigzag, alpine-red summit dot) paired with the "Alpine Map Training"
 * name in Manrope 800 and the "By PerformOS" byline in IBM Plex Mono mono
 * caps.
 *
 * Per the design handoff, the mark is intentionally minimal during the
 * re-skin. A polished bespoke mark can replace the inline SVG later; the
 * layout and surrounding type are locked.
 */
export function Wordmark({ href = "/", showByline = true, emblemSize = 30 }: WordmarkProps) {
  const inner = (
    <span className="wordmark">
      <span
        className="mark"
        style={{ width: emblemSize, height: emblemSize, display: "block", flexShrink: 0 }}
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
        <span className="name block">Alpine Map Training</span>
        {showByline ? <span className="by block">By PerformOS</span> : null}
      </span>
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="no-underline" aria-label="Alpine Map Training — home, By PerformOS">
      {inner}
    </Link>
  );
}
