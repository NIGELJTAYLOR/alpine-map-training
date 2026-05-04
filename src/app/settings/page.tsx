import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SettingsPanel } from "@/components/site/settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-2xl px-4 py-8 sm:py-10 focus:outline-none">
        <header className="mb-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Personal
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
            Stored on this device only. Trainer mode toggles a richer view —
            answer keys auto-expand, trainer notes appear inline, and the
            progress dashboard surfaces extra detail.
          </p>
        </header>

        <SettingsPanel />
      </main>
    </>
  );
}
