"use client";

import { useProgress } from "@/lib/progress/provider";

export function SettingsPanel() {
  const { hydrated, store, setTrainerMode } = useProgress();

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-ink-3">Loading settings…</p>
    );
  }

  const trainerOn = store.settings.trainerMode;
  const totalKB = (() => {
    try {
      return (
        (window.localStorage.getItem("alpine-map-training:progress")?.length ?? 0) /
        1024
      ).toFixed(1);
    } catch {
      return "—";
    }
  })();

  return (
    <div className="space-y-10">
      {/* Mode */}
      <section>
        <p className="eyebrow eyebrow-contour">Mode</p>
        <div className="mt-3 surface-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-medium text-ink">
                Trainer mode
              </h2>
              <p className="mt-1 font-sans text-[14px] leading-relaxed text-ink-2">
                Auto-expands every page&rsquo;s answer key, surfaces the matching
                trainer-notes bundle inline, and shows a brown &ldquo;Trainer&rdquo;
                pill in the header so you can&rsquo;t forget you&rsquo;re in it.
              </p>
              <p className="mt-2 page-code">
                Currently <span className="text-ink">{trainerOn ? "ON" : "OFF"}</span>
              </p>
            </div>
            <ToggleSwitch
              checked={trainerOn}
              onChange={(v) => setTrainerMode(v)}
              label="Trainer mode"
            />
          </div>
        </div>
      </section>

      {/* Storage */}
      <section>
        <p className="eyebrow eyebrow-contour">Storage</p>
        <div className="mt-3 surface-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-medium text-ink">
            Local progress
          </h2>
          <p className="mt-1 font-sans text-[14px] leading-relaxed text-ink-2">
            All progress, quiz responses, settings, and flashcard schedules are
            stored only in this browser. Reset is on the{" "}
            <a href="/progress" className="text-contour underline underline-offset-4 hover:text-ink">
              progress dashboard
            </a>
            .
          </p>
          <p className="mt-3 page-code">
            ~{totalKB} KB used · last updated{" "}
            {store.lastUpdated ? new Date(store.lastUpdated).toLocaleString() : "—"}
          </p>
        </div>
      </section>

      {/* About */}
      <section>
        <p className="eyebrow eyebrow-contour">About</p>
        <div className="mt-3 grid gap-1 font-mono text-[12px] text-ink-3">
          <p>
            <span className="text-ink">Build</span>: Alpine Map Training v1.5 (Carta)
          </p>
          <p>
            <span className="text-ink">Workbook</span>: Editions 1-3 (BASI Alpine
            Level 4 ISTD)
          </p>
          <p>
            <span className="text-ink">Offline</span>: yes (PWA installable)
          </p>
          <p>
            <span className="text-ink">Built by</span>: PerformOS
          </p>
        </div>
      </section>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        aria-label={label}
      />
      <span
        aria-hidden
        className={
          "h-6 w-11 rounded-full transition-colors " +
          (checked ? "bg-ink" : "bg-paper-2 border border-rule")
        }
      />
      <span
        aria-hidden
        className={
          "absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform " +
          (checked ? "translate-x-5 bg-paper" : "translate-x-0 bg-paper-3 border border-rule")
        }
      />
    </label>
  );
}
