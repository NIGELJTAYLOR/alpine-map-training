"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { useProgress } from "@/lib/progress/provider";

interface AnswerToggleProps {
  label?: string;
  children: ReactNode;
}

/**
 * Glacier Lab answer-key disclosure.
 *
 * Renders as a tight border-on-paper-3 frame with a mono-caps summary row
 * acting as the toggle. When trainer mode is on, the panel is forced open
 * and the trainer tag is shown.
 */
export function AnswerToggle({
  label = "Show answer key",
  children,
}: AnswerToggleProps) {
  const { hydrated, store } = useProgress();
  const trainerOn = hydrated && store.settings.trainerMode;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (trainerOn) setOpen(true);
  }, [trainerOn]);

  const isOpen = trainerOn || open;

  return (
    <section
      className={
        "my-7 overflow-hidden border " +
        (trainerOn
          ? "border-red bg-paper-3"
          : "border-rule bg-paper-3")
      }
    >
      <button
        type="button"
        onClick={() => (trainerOn ? null : setOpen((v) => !v))}
        disabled={trainerOn}
        aria-expanded={isOpen}
        className={
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.14em] " +
          (trainerOn
            ? "text-ink"
            : "text-ink-2 hover:bg-paper-4")
        }
      >
        <span className="inline-flex items-center gap-2">
          <ChevronRight
            className={"h-3 w-3 shrink-0 transition-transform " + (isOpen ? "rotate-90" : "")}
            aria-hidden
          />
          {trainerOn
            ? "Answer key · trainer mode"
            : isOpen
            ? "Hide answer key"
            : label}
        </span>
        {trainerOn ? <span className="tag red">Trainer</span> : null}
      </button>
      {isOpen ? (
        <div className="border-t border-rule bg-paper px-4 py-4 [&_h2]:mt-3 [&_h2]:font-display [&_h2]:text-[16px] [&_h2]:font-bold [&_p]:my-2 [&_p]:text-[13px] [&_p]:text-ink-2">
          {children}
        </div>
      ) : null}
    </section>
  );
}
