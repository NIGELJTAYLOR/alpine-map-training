"use client";

import { useProgress } from "@/lib/progress/provider";

export function SettingsPanel() {
  const { hydrated, store, setTrainerMode } = useProgress();

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-muted-foreground">Loading settings…</p>
    );
  }

  const trainerOn = store.settings.trainerMode;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-semibold text-foreground">
              Trainer mode
            </h2>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              When on, every page auto-expands its answer key, the matching
              trainer-notes bundle is shown inline, and quiz / readiness
              widgets appear next to the relevant content.
            </p>
            <p className="mt-2 font-sans text-xs text-muted-foreground">
              Currently:{" "}
              <span
                className={
                  trainerOn ? "font-semibold text-success" : "font-medium"
                }
              >
                {trainerOn ? "ON" : "OFF"}
              </span>
            </p>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={trainerOn}
              onChange={(e) => setTrainerMode(e.target.checked)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={
                "h-6 w-11 rounded-full transition-colors " +
                (trainerOn ? "bg-primary" : "bg-muted")
              }
            />
            <span
              aria-hidden
              className={
                "absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white transition-transform " +
                (trainerOn ? "translate-x-5" : "translate-x-0")
              }
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Storage
        </h2>
        <p className="mt-1 font-serif text-sm text-muted-foreground">
          Progress, quiz responses, settings — all stored locally in this
          browser. Reset and export are on the{" "}
          <a href="/progress" className="text-primary underline underline-offset-2">
            progress dashboard
          </a>
          .
        </p>
        <p className="mt-3 font-sans text-xs text-muted-foreground">
          Last updated:{" "}
          {store.lastUpdated
            ? new Date(store.lastUpdated).toLocaleString()
            : "—"}
        </p>
      </section>
    </div>
  );
}
