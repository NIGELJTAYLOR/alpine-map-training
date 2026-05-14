"use client";

import type { ExerciseGrade, GradeScore } from "@/lib/progress/types";

interface GradePanelProps {
  grade: ExerciseGrade;
  /** When true, the panel shows a "Answer changed since grading" notice. */
  stale?: boolean;
  /** Optional regrade callback; if absent the panel hides the regrade button. */
  onRegrade?: () => void;
  /** Optional clear callback; if absent the panel hides the clear button. */
  onClear?: () => void;
}

const SCORE_LABEL: Record<GradeScore, string> = {
  met: "Met",
  nearly: "Nearly",
  "not-yet": "Not yet",
};

const SCORE_TAG: Record<GradeScore, string> = {
  met: "tag moss",
  nearly: "tag amber",
  "not-yet": "tag crimson",
};

/**
 * Renders one AI grade beneath an exercise.
 *
 * Pure presentational. The host (`ExerciseField` rendered at the end of
 * each exercise) owns the grading lifecycle (button, in-flight state,
 * error handling) and passes a grade in when one is available.
 */
export function GradePanel({
  grade,
  stale = false,
  onRegrade,
  onClear,
}: GradePanelProps) {
  const when = (() => {
    const d = new Date(grade.gradedAt);
    if (Number.isNaN(d.getTime())) return grade.gradedAt;
    return d.toLocaleString();
  })();

  return (
    <div className="mt-3 border border-rule bg-paper-3 px-4 py-3 md:px-5 md:py-4">
      {/* Header — score + meta */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            AI feedback
          </span>
          <span className={SCORE_TAG[grade.score]}>
            <span className="dot" /> {SCORE_LABEL[grade.score]}
          </span>
          {stale ? (
            <span className="tag" style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}>
              Answer changed since grading
            </span>
          ) : null}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
          {grade.model} · {when}
        </span>
      </div>

      {/* Feedback paragraph */}
      <p className="text-[13px] leading-[1.55] text-ink md:text-[14px]">
        {grade.feedback}
      </p>

      {/* Strengths + improvements two-column */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {grade.strengths.length > 0 ? (
          <div>
            <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-moss">
              Strengths
            </p>
            <ul className="list-disc space-y-1 pl-5 text-[13px] leading-[1.5] text-ink-2 md:text-[13.5px]">
              {grade.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {grade.improvements.length > 0 ? (
          <div>
            <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-red">
              Improvements
            </p>
            <ul className="list-disc space-y-1 pl-5 text-[13px] leading-[1.5] text-ink-2 md:text-[13.5px]">
              {grade.improvements.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Footer — regrade / clear */}
      {(onRegrade || onClear) ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {onRegrade ? (
            <button
              type="button"
              onClick={onRegrade}
              className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-2 hover:border-ink hover:text-ink"
            >
              Re-grade
            </button>
          ) : null}
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3 hover:border-ink hover:text-ink"
            >
              Clear grade
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
