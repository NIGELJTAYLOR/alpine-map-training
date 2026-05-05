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

/** Inline trainer-notes panel — only shown when trainer mode is on. */
export function TrainerNotesPanel({ notes }: TrainerNotesPanelProps) {
  const { hydrated, store } = useProgress();
  const trainerOn = hydrated && store.settings.trainerMode;
  const [open, setOpen] = useState<string | null>(notes[0]?.id ?? null);

  if (!trainerOn || notes.length === 0) return null;

  return (
    <section className="mt-10 rounded-md border border-contour/40 bg-contour/[.05] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-medium text-ink">
          Trainer notes
        </h2>
        <span className="pill pill-contour">Trainer</span>
      </div>
      <p className="page-code mt-1">
        {notes.length} bundle{notes.length === 1 ? "" : "s"} cover this page
      </p>
      <ul className="mt-4 space-y-2">
        {notes.map((n) => {
          const isOpen = open === n.id;
          return (
            <li
              key={n.id}
              className="rounded-md border border-rule bg-paper-3"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : n.id)}
                className="flex w-full items-center justify-between gap-2 p-3 text-left"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="font-display text-sm font-medium text-ink">
                    {n.title}
                  </span>
                  {n.sections.length > 0 ? (
                    <span className="page-code ml-2">
                      ({n.sections.join(", ")})
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-xs text-ink-3">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <div className="border-t border-rule p-3 text-sm">
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
