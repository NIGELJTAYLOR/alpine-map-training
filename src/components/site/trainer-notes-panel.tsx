"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress/provider";
import { AnswerKeyBody } from "./answer-key-body";

interface TrainerNoteData {
  id: string;
  title: string;
  body: string;
  sections: string[];
}

interface TrainerNotesPanelProps {
  notes: TrainerNoteData[];
}

/**
 * Shows trainer-notes bundles inline. Only renders when trainer mode is on.
 * Each bundle starts collapsed; the trainer can expand the one they need.
 */
export function TrainerNotesPanel({ notes }: TrainerNotesPanelProps) {
  const { hydrated, store } = useProgress();
  const trainerOn = hydrated && store.settings.trainerMode;
  const [open, setOpen] = useState<string | null>(notes[0]?.id ?? null);

  if (!trainerOn || notes.length === 0) return null;

  return (
    <section className="mt-10 rounded-xl border border-contour/40 bg-contour/5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Trainer notes
        </h2>
        <span className="rounded-full bg-contour/20 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-contour">
          Trainer
        </span>
      </div>
      <p className="mt-1 font-sans text-xs text-muted-foreground">
        {notes.length} bundle{notes.length === 1 ? "" : "s"} cover this page
      </p>
      <ul className="mt-3 space-y-2">
        {notes.map((n) => {
          const isOpen = open === n.id;
          return (
            <li
              key={n.id}
              className="rounded-lg border border-border bg-background"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : n.id)}
                className="flex w-full items-center justify-between gap-2 p-3 text-left"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="font-sans text-sm font-medium text-foreground">
                    {n.title}
                  </span>
                  {n.sections.length > 0 ? (
                    <span className="ml-2 font-sans text-xs text-muted-foreground">
                      ({n.sections.join(", ")})
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <div className="border-t border-border p-3 text-sm">
                  <AnswerKeyBody body={n.body} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
