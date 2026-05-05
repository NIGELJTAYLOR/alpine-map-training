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

  // Trainer mode forces the answer key open.
  useEffect(() => {
    if (trainerOn) setOpen(true);
  }, [trainerOn]);

  return (
    <section
      className={
        "my-8 rounded-md border p-5 " +
        (trainerOn
          ? "border-contour/40 bg-contour/[.06]"
          : "border-dashed border-rule bg-paper-3")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (trainerOn ? null : setOpen((v) => !v))}
          className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-ink hover:text-ink-2 disabled:opacity-60"
          disabled={trainerOn}
          aria-expanded={open}
        >
          <span aria-hidden>{open ? "▾" : "▸"}</span>
          {trainerOn
            ? "Answer key (trainer mode)"
            : open
            ? "Hide answer key"
            : label}
        </button>
        {trainerOn ? (
          <span className="pill pill-contour">Trainer</span>
        ) : null}
      </div>
      {open ? (
        <div className="mt-5 border-t border-rule pt-5 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-lg [&_p]:my-2">
          {children}
        </div>
      ) : null}
    </section>
  );
}
