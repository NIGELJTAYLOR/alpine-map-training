import Link from "next/link";
import Image from "next/image";

interface WordmarkProps {
  href?: string;
  showByline?: boolean;
  /** Override the emblem display height in px (default 48). Useful in heroes / splash. */
  emblemSize?: number;
}

/**
 * Carta wordmark: Alpine Map Training emblem (compass + crossed skis on a
 * map background) + "Alpine Map Training" + the PerformOS byline image.
 * Defaults to linking to home; pass href="" to render without a link.
 */
export function Wordmark({ href = "/", showByline = true, emblemSize = 48 }: WordmarkProps) {
  const inner = (
    <span className="wordmark">
      <Image
        src="/brand/amt-emblem.png"
        alt=""
        width={320}
        height={213}
        priority
        className="glyph"
        style={{ width: emblemSize * (320 / 213), height: emblemSize }}
      />
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
              className="mt-1.5 h-[24px] w-auto"
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
