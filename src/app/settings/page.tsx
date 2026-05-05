import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SettingsPanel } from "@/components/site/settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-2xl px-4 py-10 sm:py-14 focus:outline-none">
        <header className="mb-10">
          <p className="eyebrow eyebrow-contour">Personal</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Settings
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            Local-first. Nothing leaves this device unless you export it.
          </p>
        </header>

        <SettingsPanel />
      </main>
    </>
  );
}
