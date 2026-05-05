"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/provider";
import { FLASHCARDS } from "@/data/flashcards.generated";
import { todayIso } from "@/lib/flashcards/sm2";

interface DashboardLevel {
  level: number;
  pages: { id: string; title: string; page: string }[];
}

interface QuizMeta {
  id: string;
  level: number;
  page: string;
  title: string;
  totalQuestions: number;
}

interface DashboardProps {
  levels: DashboardLevel[];
  quizMeta: QuizMeta[];
}

export function ProgressDashboard({ levels, quizMeta }: DashboardProps) {
  const { hydrated, store, getPage, reset } = useProgress();

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-ink-3">Loading your progress…</p>
    );
  }

  const totalPages = levels.reduce((acc, l) => acc + l.pages.length, 0);
  let totalCompleted = 0;
  let totalInProgress = 0;
  for (const l of levels) {
    for (const p of l.pages) {
      const s = getPage(p.id).status;
      if (s === "completed") totalCompleted += 1;
      else if (s === "in-progress") totalInProgress += 1;
    }
  }
  const overallPct = totalPages
    ? ((totalCompleted + totalInProgress * 0.5) / totalPages) * 100
    : 0;

  const lastUpdated = store.lastUpdated
    ? new Date(store.lastUpdated).toLocaleString()
    : "—";

  // Flashcard summary
  let flashDue = 0;
  let flashStudied = 0;
  for (const c of FLASHCARDS) {
    const sched = store.flashcards[c.id];
    if (sched) {
      flashStudied += 1;
      if (sched.dueDate <= todayIso()) flashDue += 1;
    } else {
      flashDue += 1;
    }
  }

  function confirmReset() {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Reset all progress? This clears completion, self-checks, quiz scores, confidence ratings and flashcard schedules stored on this device. Cannot be undone.",
      )
    ) {
      reset();
    }
  }

  return (
    <div className="space-y-12">
      {/* ===== Overall ===== */}
      <section className="surface-card p-6 sm:p-8">
        <p className="eyebrow eyebrow-contour">Overall</p>
        <p className="mt-3 font-display text-[64px] font-medium leading-none tracking-[-0.025em] text-ink sm:text-[88px]">
          {Math.round(overallPct)}
          <span className="text-ink-3">%</span>
        </p>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-2">
          {totalCompleted} of {totalPages} pages complete · {totalInProgress} in progress
        </p>
        <p className="mt-1 page-code">Last activity {lastUpdated}</p>
        <div className="carta-progress mt-5">
          <i style={{ width: `${overallPct}%` }} />
        </div>
      </section>

      {/* ===== By level ===== */}
      <section>
        <h3 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
          By level
        </h3>
        <ul className="mt-4 space-y-3">
          {levels.map((l) => {
            let completed = 0;
            let inProg = 0;
            for (const p of l.pages) {
              const s = getPage(p.id).status;
              if (s === "completed") completed += 1;
              else if (s === "in-progress") inProg += 1;
            }
            const pct = l.pages.length
              ? ((completed + inProg * 0.5) / l.pages.length) * 100
              : 0;
            return (
              <li key={l.level} className="grid grid-cols-[120px_1fr_64px] items-center gap-3 border-b border-rule pb-3 last:border-b-0">
                <Link
                  href={`/levels/${l.level}`}
                  className="font-display text-base font-medium text-ink hover:text-ink-2"
                >
                  Level {l.level}
                </Link>
                <span className="carta-progress">
                  <i style={{ width: `${pct}%` }} />
                </span>
                <span className="text-right font-mono text-[12px] text-ink-3">
                  {completed}/{l.pages.length}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ===== Quizzes ===== */}
      <section>
        <h3 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
          Quizzes
        </h3>
        <ul className="mt-4 space-y-2">
          {quizMeta.map((q) => {
            const attempt = store.quizzes[q.id];
            const isComplete = Boolean(attempt?.completedAt);
            const statusText = isComplete
              ? `${attempt!.score} / ${q.totalQuestions} · ${attempt!.timeMinutes ?? 0} min`
              : attempt
              ? `${Object.keys(attempt.responses).length} of ${q.totalQuestions} answered`
              : "Not started";
            return (
              <li
                key={q.id}
                className="rounded-md border border-rule bg-paper-3 transition-colors hover:border-ink"
              >
                <Link
                  href={`/levels/${q.level}/${q.page}/quiz`}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-display text-base font-medium text-ink">
                      {q.title}
                    </p>
                    <p className="page-code mt-0.5">{statusText}</p>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-contour">
                    {isComplete ? "Review →" : attempt ? "Continue →" : "Start →"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ===== Confidence ===== */}
      {Object.keys(store.confidenceScores).length > 0 ? (
        <section>
          <h3 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
            Confidence ratings
          </h3>
          <ul className="mt-4 divide-y divide-rule overflow-hidden rounded-md border border-rule bg-paper-3">
            {Object.entries(store.confidenceScores).map(([key, score]) => (
              <li
                key={key}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <span className="page-code">{key}</span>
                <span className="font-display text-base font-medium text-ink">
                  {score.value ?? "—"}<span className="text-ink-3">/5</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ===== Readiness ===== */}
      {Object.keys(store.readinessChecks).length > 0 ? (
        <section>
          <h3 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
            Readiness checks
          </h3>
          <ul className="mt-4 space-y-2">
            {Object.entries(store.readinessChecks).map(([key, check]) => (
              <li
                key={key}
                className="rounded-md border border-rule bg-paper-3 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="page-code">{key}</span>
                  <span
                    className={
                      check.status === "yes"
                        ? "pill pill-moss"
                        : check.status === "not-quite"
                        ? "pill pill-amber"
                        : "pill pill-crimson"
                    }
                  >
                    {check.status === "yes"
                      ? "Met"
                      : check.status === "not-quite"
                      ? "Not quite"
                      : "Not ready"}
                  </span>
                </div>
                {check.notes ? (
                  <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink-2">
                    {check.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ===== Flashcards ===== */}
      <section className="surface-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
            Flashcards
          </h3>
          <Link
            href="/flashcards"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-contour hover:text-ink"
          >
            Open →
          </Link>
        </div>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-2">
          <span className="font-display text-2xl font-medium text-ink">{flashDue}</span>{" "}
          due today · {flashStudied} ever studied · {FLASHCARDS.length} in deck
        </p>
      </section>

      {/* ===== Reset ===== */}
      <section className="border-t border-rule pt-8">
        <h3 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
          Reset
        </h3>
        <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink-2">
          Progress is stored only in this browser&rsquo;s localStorage. Clear
          it here if you want to start over or hand the device to someone else.
        </p>
        <button
          type="button"
          onClick={confirmReset}
          className="mt-4 inline-flex items-center justify-center rounded-[4px] border border-rule bg-transparent px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-crimson hover:text-crimson"
        >
          Reset all progress
        </button>
      </section>
    </div>
  );
}
