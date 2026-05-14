import type { Metadata } from "next";
import { SettingsPanel } from "@/components/site/settings-panel";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Account
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          Settings
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          Local-first
        </p>
      </header>

      <SettingsPanel />
    </main>
  );
}
