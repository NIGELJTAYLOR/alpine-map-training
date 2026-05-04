"use client";

import { useState, type ReactNode } from "react";

interface AnswerToggleProps {
  label?: string;
  children: ReactNode;
}

export function AnswerToggle({ label = "Show answer key", children }: AnswerToggleProps) {
  const [open, setOpen] = useState(false);
  return (
    <section className="my-6 rounded-lg border border-dashed border-border bg-muted/30 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-sans text-sm font-medium text-primary hover:underline"
        aria-expanded={open}
      >
        {open ? "Hide answer key" : label}
      </button>
      {open ? (
        <div className="mt-4 border-t border-border pt-4 [&_p]:my-2 [&_h2]:mt-4 [&_h2]:text-base">
          {children}
        </div>
      ) : null}
    </section>
  );
}
