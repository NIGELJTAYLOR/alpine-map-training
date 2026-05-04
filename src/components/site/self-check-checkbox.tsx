"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress/provider";
import { useSelfCheckContext } from "./self-check-context";

interface SelfCheckCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Index assigned by the SelfCheckProvider counter. */
  _idx?: number;
}

/**
 * MDX renders task-list items (`- [ ]`) as a checkbox. We override the
 * <input type="checkbox"> element so it reads/writes from the progress store.
 *
 * The checkbox's index within the page is assigned in render order via
 * the SelfCheckProvider counter; this is fragile to source-content changes
 * but matches the brief's `selfCheck: [bool, ...]` array shape.
 */
export function SelfCheckCheckbox(props: SelfCheckCheckboxProps) {
  const ctx = useSelfCheckContext();
  const progress = useProgress();
  const [idx] = useState(() => (ctx ? ctx.nextIndex() : -1));

  // Track the running total so toggle knows the array length to pad to.
  useEffect(() => {
    if (ctx) ctx.totalRef.current = Math.max(ctx.totalRef.current, idx + 1);
  });

  // Outside the SelfCheckProvider, render an inert disabled checkbox.
  if (!ctx || idx < 0) {
    return (
      <input
        {...props}
        type="checkbox"
        disabled
        readOnly
        className="me-2 align-middle accent-primary"
      />
    );
  }

  const page = progress.getPage(ctx.pageId);
  const checked = page.selfCheck[idx] ?? false;

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() =>
        progress.toggleSelfCheck(ctx.pageId, idx, ctx.totalRef.current)
      }
      className="me-2 align-middle h-4 w-4 cursor-pointer accent-primary"
      aria-label={`Self-check item ${idx + 1}`}
    />
  );
}
