"use client";

import { useId } from "react";
import { useProgress } from "@/lib/progress/provider";
import { useSelfCheckContext } from "./self-check-context";

type SelfCheckCheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * MDX renders task-list items (`- [ ]`) as a checkbox. We override the
 * `<input type="checkbox">` element so each checkbox reads/writes from
 * the progress store under a stable per-checkbox key.
 *
 * The key is `React.useId()`, which gives the same string on the server
 * render and the client hydration pass, so the checkbox's identity is
 * stable across SSR / CSR. This replaces the earlier render-time index
 * counter, which caused a hydration mismatch warning.
 */
export function SelfCheckCheckbox(_props: SelfCheckCheckboxProps) {
  const ctx = useSelfCheckContext();
  const progress = useProgress();
  const key = useId();

  // Outside the SelfCheckProvider, render an inert disabled checkbox so the
  // MDX render still produces a valid DOM but the control is non-interactive.
  if (!ctx) {
    return (
      <input
        type="checkbox"
        disabled
        readOnly
        className="me-2 align-middle accent-primary"
      />
    );
  }

  const page = progress.getPage(ctx.pageId);
  const checked = page.selfCheck[key] ?? false;

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => progress.toggleSelfCheck(ctx.pageId, key)}
      className="me-2 align-middle h-4 w-4 cursor-pointer accent-primary"
      aria-label="Self-check item"
    />
  );
}
