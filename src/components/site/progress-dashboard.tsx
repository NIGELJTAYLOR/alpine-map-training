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
      <div className="px-[22px] py-8 md:px-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Loading your progress…
        </p>
      </div>
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

  const completedQuizzes = quizMeta.filter(
    (q) => store.quizzes[q.id]?.completedAt,
  ).length;

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
    <>
      {/* ===== Overall card ===== */}
      <section className="border-b border-rule bg-paper-3 px-[22px] py-5 md:px-14 md:py-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              Overall
            </p>
            <p className="mt-1 font-display text-[56px] font-extrabold leading-[0.9] tracking-[-0.028em] text-ink md:text-[80px]">
              {Math.round(overallPct)}
              <small className="font-display text-[22px] font-bold text-ink-3 md:text-[28px]">
                %
              </small>
            </p>
          </div>
          <p className="pb-1.5 text-right font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-moss">
            {totalCompleted} / {totalPages} pages
          </p>
        </div>
        <div className="pbar thick mt-3.5">
          <i style={{ width: `${overallPct}%` }} />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
          Last activity {lastUpdated}
          {totalInProgress > 0 ? ` · ${totalInProgress} in progress` : ""}
        </p>
      </section>

      {/* ===== Desktop 4-cell stripe ===== */}
      <section className="hidden grid-cols-4 gap-px border-b border-rule bg-rule md:grid">
        <StripeCell label="Pages complete" value={`${totalCompleted}`} suffix={` / ${totalPages}`} />
        <StripeCell label="In progress" value={`${totalInProgress}`} suffix=" pages" />
        <StripeCell
          label="Due today"
          value={`${flashDue}`}
          suffix=" cards"
          deltaColor={flashDue > 0 ? "var(--red)" : "var(--moss)"}
          delta={flashDue > 0 ? "Review now" : "All clear"}
        />
        <StripeCell
          label="Quizzes done"
          value={`${completedQuizzes}`}
          suffix={` / ${quizMeta.length}`}
        />
      </section>

      <div className="px-[22px] pb-12 pt-5 md:grid md:grid-cols-2 md:gap-6 md:px-14 md:pt-8">
        {/* ===== By level ===== */}
        <section className="mb-6 border-b border-rule bg-paper-3 px-4 py-5 md:mb-0 md:border md:border-rule md:px-6 md:py-6">
          <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            By level
          </h3>
          <ul className="space-y-0">
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
                <li
                  key={l.level}
                  className="grid items-center gap-2.5 border-t border-rule py-3 first:border-t-0 first:pt-0"
                  style={{ gridTemplateColumns: "1fr 70px 60px" }}
                >
                  <Link
                    href={`/levels/${l.level}`}
                    className="text-[14px] no-underline"
                  >
                    <span className="block font-display font-bold tracking-[-0.01em] text-ink">
                      Level {l.level}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                      {l.pages.length} pages
                    </span>
                  </Link>
                  <span className={"pbar " + (pct >= 100 ? "moss" : pct > 0 ? "ice" : "")}>
                    <i style={{ width: `${pct}%` }} />
                  </span>
                  <span className="text-right font-mono text-[12px] font-bold text-ink">
                    {Math.round(pct)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ===== Quizzes ===== */}
        <section className="mb-6 border-b border-rule bg-paper-3 px-4 py-5 md:mb-0 md:border md:border-rule md:px-6 md:py-6">
          <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Quizzes
          </h3>
          <ul className="space-y-0">
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
                  className="border-t border-rule py-3 first:border-t-0 first:pt-0"
                >
                  <Link
                    href={`/levels/${q.level}/${q.page}/quiz`}
                    className="flex items-center justify-between gap-3 no-underline"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-[14px] font-bold tracking-[-0.01em] text-ink">
                        {q.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
                        {statusText}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-red">
                      {isComplete ? "Review →" : attempt ? "Continue →" : "Start →"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ===== Flashcards summary ===== */}
        <section className="mb-6 border-b border-rule bg-paper-3 px-4 py-5 md:col-span-2 md:mb-0 md:border md:border-rule md:px-6 md:py-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              Flashcards
            </h3>
            <Link
              href="/flashcards"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-red no-underline"
            >
              Open →
            </Link>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span>
              <span className="font-display text-[32px] font-extrabold tracking-[-0.018em] text-ink">
                {flashDue}
              </span>
              <span className="ml-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                due
              </span>
            </span>
            <span>
              <span className="font-display text-[20px] font-extrabold tracking-[-0.01em] text-ink">
                {flashStudied}
              </span>
              <span className="ml-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                studied
              </span>
            </span>
            <span>
              <span className="font-display text-[20px] font-extrabold tracking-[-0.01em] text-ink">
                {FLASHCARDS.length}
              </span>
              <span className="ml-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                in deck
              </span>
            </span>
          </div>
        </section>

        {/* ===== Readiness checks (conditional) ===== */}
        {Object.keys(store.readinessChecks).length > 0 ? (
          <section className="mb-6 border-b border-rule bg-paper-3 px-4 py-5 md:col-span-2 md:mb-0 md:border md:border-rule md:px-6 md:py-6">
            <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              Readiness checks
            </h3>
            <ul className="space-y-0">
              {Object.entries(store.readinessChecks).map(([key, check]) => (
                <li
                  key={key}
                  className="flex items-start justify-between gap-3 border-t border-rule py-3 first:border-t-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                      {key}
                    </span>
                    {check.notes ? (
                      <p className="mt-1 text-[13px] leading-[1.5] text-ink-2">
                        {check.notes}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={
                      check.status === "yes"
                        ? "tag moss"
                        : check.status === "not-quite"
                        ? "tag amber"
                        : "tag crimson"
                    }
                  >
                    {check.status === "yes"
                      ? "Met"
                      : check.status === "not-quite"
                      ? "Not quite"
                      : "Not ready"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ===== Confidence (conditional) ===== */}
        {Object.keys(store.confidenceScores).length > 0 ? (
          <section className="mb-6 border-b border-rule bg-paper-3 px-4 py-5 md:col-span-2 md:mb-0 md:border md:border-rule md:px-6 md:py-6">
            <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              Confidence ratings
            </h3>
            <ul className="space-y-0">
              {Object.entries(store.confidenceScores).map(([key, score]) => (
                <li
                  key={key}
                  className="flex items-center justify-between border-t border-rule py-3 first:border-t-0 first:pt-0"
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                    {key}
                  </span>
                  <span className="font-display text-[18px] font-extrabold tracking-[-0.01em] text-ink">
                    {score.value ?? "—"}
                    <small className="ml-0.5 font-mono text-[11px] font-medium text-ink-3">
                      / 5
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ===== Reset ===== */}
        <section className="mt-2 border-t border-rule bg-paper px-4 py-6 md:col-span-2 md:mt-4 md:bg-transparent md:px-0 md:py-6">
          <h3 className="mb-1 font-display text-[16px] font-extrabold tracking-[-0.012em] text-ink">
            Reset
          </h3>
          <p className="mb-3 text-[13px] leading-[1.5] text-ink-2">
            Progress is stored only in this browser&rsquo;s localStorage. Clear
            it here if you want to start over or hand the device to someone else.
          </p>
          <button type="button" onClick={confirmReset} className="btn ghost sm">
            Reset all progress
          </button>
        </section>
      </div>
    </>
  );
}

function StripeCell({
  label,
  value,
  suffix,
  delta,
  deltaColor,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <div className="bg-paper-3 px-6 py-[18px]">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">
        {label}
      </div>
      <div className="mt-1.5 font-display text-[28px] font-extrabold leading-none tracking-[-0.018em] text-ink">
        {value}
        {suffix ? (
          <small className="ml-0.5 text-[13px] font-semibold text-ink-3">
            {suffix}
          </small>
        ) : null}
      </div>
      {delta ? (
        <div
          className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.08em]"
          style={{ color: deltaColor ?? "var(--moss)" }}
        >
          {delta}
        </div>
      ) : null}
    </div>
  );
}
