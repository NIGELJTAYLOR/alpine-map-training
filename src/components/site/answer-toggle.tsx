"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/progress/provider";

interface AnswerToggleProps {
  label?: string;
  children: ReactNode;
}

export function AnswerToggle({ label = "Show answer key", children }: AnswerToggleProps) {
  const { hydrated, store } = useProgress();
  const trainerOn = hydrated && store.settings.trainerMode;
  const [open, setOpen] = useState(false);

  // Trainer mode forces the answer key open; toggling it off in trainer mode
  // is a no-op on this card (use Settings to leave trainer mode).
  useEffect(() => {
    if (trainerOn) setOpen(true);
  }, [trainerOn]);

  return (
    <section
      className={
        "my-6 rounded-lg border p-4 " +
        (trainerOn
          ? "border-contour/40 bg-contour/5"
          : "border-dashed border-border bg-muted/30")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (trainerOn ? null : setOpen((v) => !v))}
          className="font-sans text-sm font-medium text-primary hover:underline disabled:opacity-50"
          disabled={trainerOn}
          aria-expanded={open}
        >
          {trainerOn
            ? "Answer key (always shown in trainer mode)"
            : open
            ? "Hide answer key"
            : label}
        </button>
        {trainerOn ? (
          <span className="rounded-full bg-contour/20 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-contour">
            Trainer
          </span>
        ) : null}
      </div>
      {open ? (
        <div className="mt-4 border-t border-border pt-4 [&_p]:my-2 [&_h2]:mt-4 [&_h2]:text-base">
          {children}
        </div>
      ) : null}
    </section>
  );
}
