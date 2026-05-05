import Link from "next/link";
import Image from "next/image";

interface WordmarkProps {
  href?: string;
  showByline?: boolean;
}

/**
 * Carta wordmark: three stacked contour curves (in --contour) +
 * "Alpine Map Training" + the PerformOS byline image.
 * Defaults to linking to home; pass href="" to render without a link.
 */
export function Wordmark({ href = "/", showByline = true }: WordmarkProps) {
  const inner = (
    <span className="wordmark">
      <svg
        className="glyph"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 22 Q 7 8, 14 14 T 26 6"
          stroke="var(--contour)"
          strokeWidth="1.4"
        />
        <path
          d="M2 26 Q 7 12, 14 18 T 26 10"
          stroke="var(--contour)"
          strokeWidth="1.4"
          opacity="0.7"
        />
        <path
          d="M2 18 Q 7 4, 14 10 T 26 2"
          stroke="var(--contour)"
          strokeWidth="1.4"
          opacity="0.4"
        />
      </svg>
      <span>
        <span className="name block">Alpine Map Training</span>
        {showByline ? (
          <span className="block leading-none">
            <Image
              src="/brand/by-performos-black-transparent.svg"
              alt="By PerformOS"
              width={638}
              height={127}
              priority
              unoptimized
              className="mt-1 h-[14px] w-auto"
            />
          </span>
        ) : null}
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
