import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Offline
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          You&rsquo;re offline
        </h1>
        <p className="mt-4 font-serif text-base leading-relaxed text-muted-foreground">
          This page hasn&rsquo;t been cached yet. Pages you&rsquo;ve already
          visited remain available; head back to the level index or your
          progress dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md border border-border px-4 py-2 font-sans text-sm hover:border-primary"
          >
            Home
          </Link>
          <Link
            href="/levels/1"
            className="rounded-md border border-border px-4 py-2 font-sans text-sm hover:border-primary"
          >
            Level 1
          </Link>
          <Link
            href="/progress"
            className="rounded-md border border-border px-4 py-2 font-sans text-sm hover:border-primary"
          >
            Your progress
          </Link>
        </div>
      </main>
    </>
  );
}
