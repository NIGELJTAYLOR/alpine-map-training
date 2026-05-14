"use client";

import type { ChangeEvent } from "react";
import { useProgress } from "@/lib/progress/provider";
import { usePageContext } from "@/components/site/page-context";

interface AnswerSlotProps {
  /** Exercise number, e.g. "3" — passed as a string from the remark plugin. */
  ex: string | number;
  /** Slot index within the exercise (1-based), e.g. "2". */
  q: string | number;
  /**
   * "long" → multi-line auto-growing textarea (default).
   * "short" → single-line input. The plugin sets this for slots inside
   * table cells and for inline underscore runs under 20 chars.
   */
  size?: "long" | "short";
}

/**
 * One typeable answer field, rendered inline wherever the original MDX had
 * an `____` answer-slot marker. Each slot is independently keyed by
 * `inputs["ex-{ex}-q{q}"]` in the progress store.
 *
 * The matching <ExerciseField> (Grade with AI button) at the end of the
 * exercise gathers values from every `ex-{ex}-q*` key when grading.
 *
 * The component is content-agnostic: any future customer's workbook that
 * uses `____` for answer slots gets typeable, persisted fields for free.
 */
export function AnswerSlot({ ex, q, size = "long" }: AnswerSlotProps) {
  const exNum = typeof ex === "number" ? ex : parseInt(String(ex), 10);
  const qNum = typeof q === "number" ? q : parseInt(String(q), 10);
  const { pageId } = usePageContext();
  const { hydrated, getPage, setInput } = useProgress();

  if (!Number.isFinite(exNum) || !Number.isFinite(qNum)) return null;

  const key = `ex-${exNum}-q${qNum}`;
  const value = hydrated ? getPage(pageId)?.inputs?.[key] ?? "" : "";

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setInput(pageId, key, e.target.value);
  }

  // The hydration guard intentionally controls the `value` (empty during
  // server render, filled once localStorage has loaded) and `disabled`
  // state. The placeholder stays constant so the user never sees a
  // misleading "Loading…" message — especially noticeable on mobile where
  // first-paint to hydration can take a beat.
  if (size === "short") {
    return (
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={!hydrated}
        placeholder="Type here"
        aria-label={`Exercise ${exNum} answer ${qNum}`}
        className="answer-slot answer-slot-short inline-block min-w-[140px] max-w-full rounded-[2px] border border-rule bg-paper px-2 py-1 align-middle font-sans text-[13px] text-ink outline-none placeholder:text-ink-4 focus:border-ink"
      />
    );
  }

  // Long: multi-line auto-growing textarea
  const lines = Math.max(2, Math.min(8, value.split("\n").length + 1));
  return (
    <textarea
      value={value}
      onChange={onChange}
      disabled={!hydrated}
      rows={lines}
      placeholder="Type your answer here…"
      aria-label={`Exercise ${exNum} answer ${qNum}`}
      className="answer-slot answer-slot-long my-2 block w-full resize-y rounded-[2px] border border-rule bg-paper px-3 py-2 font-sans text-[14px] leading-[1.5] text-ink-2 outline-none placeholder:text-ink-4 focus:border-ink focus:text-ink"
    />
  );
}
