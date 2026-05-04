"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/lib/progress/provider";
import type { ReadinessStatus } from "@/lib/progress/types";

interface ReadinessCheckInputProps {
  scopeKey: string; // e.g. "L2.C7.2.readiness"
  prompt?: string;
  options?: { value: ReadinessStatus; label: string }[];
}

const DEFAULT_OPTIONS: { value: ReadinessStatus; label: string }[] = [
  { value: "yes", label: "Yes — I am ready" },
  { value: "not-quite", label: "Not quite — I have specific pages to revisit" },
  { value: "no", label: "No — I want to redo a substantial part first" },
];

export function ReadinessCheckInput({
  scopeKey,
  prompt = "Mark your readiness for the next level. Stored on this device.",
  options = DEFAULT_OPTIONS,
}: ReadinessCheckInputProps) {
  const { hydrated, store, setReadiness } = useProgress();
  const current = store.readinessChecks[scopeKey];
  const [notes, setNotes] = useState(current?.notes ?? "");

  useEffect(() => {
    setNotes(current?.notes ?? "");
  }, [current?.notes]);

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-muted-foreground">
        Loading readiness state…
      </p>
    );
  }

  function pick(value: ReadinessStatus) {
    setReadiness(scopeKey, value, notes || undefined);
  }

  return (
    <div className="space-y-3">
      <p className="font-sans text-sm text-muted-foreground">{prompt}</p>
      <ul className="space-y-2">
        {options.map((opt) => {
          const selected = current?.status === opt.value;
          return (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => pick(opt.value)}
                aria-pressed={selected}
                className={
                  "w-full rounded-md border px-3 py-2 text-left transition-colors " +
                  (selected
                    ? "border-primary bg-muted text-foreground"
                    : "border-border hover:border-primary")
                }
              >
                <span className="font-sans text-sm">{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <label className="block">
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Notes (optional)
        </span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (current?.status) setReadiness(scopeKey, current.status, notes || undefined);
          }}
          placeholder="e.g. revisit C2.3 and C4.2 before moving on"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-serif text-sm leading-relaxed focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </label>
      {current?.updatedAt ? (
        <p className="font-sans text-xs text-muted-foreground">
          Last set {new Date(current.updatedAt).toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
