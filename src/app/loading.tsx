import Image from "next/image";

/**
 * Branded splash / loading state. Next.js renders this from the
 * App Router whenever a route segment suspends or is being fetched.
 * Keeps the user inside the brand world rather than a blank screen.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-paper px-6"
      role="status"
      aria-live="polite"
      aria-label="Alpine Map Training — loading"
    >
      <Image
        src="/brand/amt-splash.png"
        alt="Alpine Map Training — By PerformOS"
        width={1024}
        height={682}
        priority
        className="h-auto w-full max-w-[420px] sm:max-w-[520px]"
      />
      <div
        className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-paper-2"
        aria-hidden
      >
        <div className="amt-splash-bar h-full w-1/3 rounded-full bg-contour" />
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
        Loading
      </p>
    </div>
  );
}
