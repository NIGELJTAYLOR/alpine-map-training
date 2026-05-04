"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress/provider";
import { Button } from "@/components/ui/button";

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
      <p className="font-sans text-sm text-muted-foreground">Loading your progress…</p>
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

  function confirmReset() {
    if (
      typeof window !== "undefined" &&
      window.confirm(
        "Reset all progress? This clears completion, self-checks, quiz scores and confidence ratings stored on this device. Cannot be undone.",
      )
    ) {
      reset();
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Overall
        </p>
        <h2 className="mt-1 font-sans text-3xl font-semibold text-foreground">
          {totalCompleted} / {totalPages} pages complete
        </h2>
        <p className="mt-1 font-serif text-sm text-muted-foreground">
          {totalInProgress} in progress · last activity {lastUpdated}
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </section>

      <section>
        <h3 className="font-sans text-xl font-semibold text-foreground">By level</h3>
        <ul className="mt-3 space-y-2">
          {levels.map((l) => {
            let completed = 0;
            let inProg = 0;
            for (const p of l.pages) {
              const s = getPage(p.id).status;
              if (s === "completed") completed += 1;
              else if (s === "in-progress") inProg += 1;
            }
            const pct = ((completed + inProg * 0.5) / l.pages.length) * 100;
            return (
              <li
                key={l.level}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/levels/${l.level}`}
                    className="font-sans text-sm font-medium text-foreground hover:text-primary"
                  >
                    Level {l.level}
                  </Link>
                  <span className="font-mono text-xs text-muted-foreground">
                    {completed} / {l.pages.length}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {Object.keys(store.confidenceScores).length > 0 ? (
        <section>
          <h3 className="font-sans text-xl font-semibold text-foreground">
            Confidence ratings
          </h3>
          <ul className="mt-3 space-y-1">
            {Object.entries(store.confidenceScores).map(([key, score]) => (
              <li
                key={key}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {key}
                </span>
                <span className="font-sans text-sm font-medium">
                  {score.value ?? "—"}/5
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {Object.keys(store.readinessChecks).length > 0 ? (
        <section>
          <h3 className="font-sans text-xl font-semibold text-foreground">
            Readiness checks
          </h3>
          <ul className="mt-3 space-y-2">
            {Object.entries(store.readinessChecks).map(([key, check]) => (
              <li
                key={key}
                className="rounded-md border border-border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {key}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 font-sans text-xs " +
                      (check.status === "yes"
                        ? "bg-success/15 text-success"
                        : check.status === "not-quite"
                        ? "bg-contour/15 text-contour"
                        : "bg-destructive/15 text-destructive")
                    }
                  >
                    {check.status === "yes"
                      ? "Ready"
                      : check.status === "not-quite"
                      ? "Not quite"
                      : "Not ready"}
                  </span>
                </div>
                {check.notes ? (
                  <p className="mt-2 font-serif text-sm text-muted-foreground">
                    {check.notes}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h3 className="font-sans text-xl font-semibold text-foreground">Quizzes</h3>
        <ul className="mt-3 space-y-2">
          {quizMeta.map((q) => {
            const attempt = store.quizzes[q.id];
            const status = attempt?.completedAt
              ? `Completed · score ${attempt.score} / ${q.totalQuestions} (${attempt.timeMinutes ?? 0} min)`
              : attempt
              ? `Started · ${Object.keys(attempt.responses).length} of ${q.totalQuestions} answered`
              : "Not started";
            return (
              <li key={q.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link
                      href={`/levels/${q.level}/${q.page}/quiz`}
                      className="font-sans text-sm font-medium text-foreground hover:text-primary"
                    >
                      {q.title}
                    </Link>
                    <p className="mt-1 font-sans text-xs text-muted-foreground">
                      {status}
                    </p>
                  </div>
                  <Link
                    href={`/levels/${q.level}/${q.page}/quiz`}
                    className="font-sans text-xs text-primary hover:underline"
                  >
                    {attempt?.completedAt ? "Review →" : attempt ? "Continue →" : "Start →"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h3 className="font-sans text-xl font-semibold text-foreground">Reset</h3>
        <p className="mt-2 font-serif text-sm text-muted-foreground">
          Progress is stored only in this browser&rsquo;s localStorage. Clear
          it here if you want to start over or hand the device to someone else.
        </p>
        <Button variant="outline" onClick={confirmReset} className="mt-3">
          Reset all progress
        </Button>
      </section>
    </div>
  );
}
