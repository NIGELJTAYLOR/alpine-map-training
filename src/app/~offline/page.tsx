import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-10 text-center focus:outline-none">
        <p className="eyebrow eyebrow-contour">Offline</p>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
          You&rsquo;re offline
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-ink-2">
          This page hasn&rsquo;t been cached yet. Pages you&rsquo;ve already
          visited remain available; head back to the level index or your
          progress dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center justify-center rounded-[4px] border border-rule bg-transparent px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-ink">
            Home
          </Link>
          <Link href="/levels/1" className="inline-flex items-center justify-center rounded-[4px] border border-rule bg-transparent px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-ink">
            Level 1
          </Link>
          <Link href="/progress" className="inline-flex items-center justify-center rounded-[4px] border border-rule bg-transparent px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-ink">
            Your progress
          </Link>
        </div>
      </main>
    </>
  );
}
