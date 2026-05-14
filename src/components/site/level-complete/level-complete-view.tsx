"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useProgress } from "@/lib/progress/provider";

interface LevelQuiz {
  id: string;
  title: string;
  totalQuestions: number;
}

interface LevelCompleteViewProps {
  level: number;
  levelWord: string;
  levelName: string;
  levelTagline: string;
  pageIds: string[];
  quizzes: LevelQuiz[];
  nextLevel: number | null;
  nextLevelName: string | null;
}

const READINESS_LABELS: Record<string, string> = {
  yes: "Met",
  "not-quite": "Not quite",
  no: "Not yet",
};

/**
 * Glacier Lab Level Complete screen.
 *
 * Mobile: navy hero band with red-strikethrough numeral, summary, stat
 * stripe, readiness checks, next-level card.
 *
 * Desktop: same content laid out wider; the numeral grows to 220 px, the
 * stat stripe becomes 4 cells, and an "Up next" band sits beneath using
 * the trio-piste-signs hero photo.
 */
export function LevelCompleteView({
  level,
  levelWord,
  levelName,
  levelTagline,
  pageIds,
  quizzes,
  nextLevel,
  nextLevelName,
}: LevelCompleteViewProps) {
  const { hydrated, store, getPage } = useProgress();

  const { completed, total, pct } = useMemo(() => {
    if (!hydrated) {
      return { completed: 0, total: pageIds.length, pct: 0 };
    }
    let c = 0;
    for (const id of pageIds) {
      if (getPage(id).status === "completed") c += 1;
    }
    return {
      completed: c,
      total: pageIds.length,
      pct: pageIds.length === 0 ? 0 : Math.round((c / pageIds.length) * 100),
    };
  }, [hydrated, pageIds, getPage]);

  const bestQuiz = useMemo(() => {
    if (!hydrated || quizzes.length === 0) return null;
    let best: { id: string; title: string; pct: number } | null = null;
    for (const q of quizzes) {
      const attempt = store.quizzes[q.id];
      if (!attempt?.completedAt || attempt.score == null || !attempt.totalQuestions)
        continue;
      const p = Math.round((attempt.score / attempt.totalQuestions) * 100);
      if (best == null || p > best.pct) {
        best = { id: q.id, title: q.title, pct: p };
      }
    }
    return best;
  }, [hydrated, quizzes, store.quizzes]);

  const readinessEntries = useMemo(() => {
    if (!hydrated) return [];
    // Match scope-keys whose prefix is L{level}.
    const prefix = `L${level}`;
    return Object.entries(store.readinessChecks).filter(([k]) =>
      k.startsWith(prefix),
    );
  }, [hydrated, store.readinessChecks, level]);

  const numeral = level.toString().padStart(2, "0");

  return (
    <>
      {/* ===== HERO BAND ===== */}
      <section className="relative overflow-hidden bg-ink px-[22px] pb-7 pt-[30px] text-paper-3 md:px-14 md:pb-14 md:pt-16">
        {/* subtle grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <p className="flex items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-paper-3/60">
            <span className="h-[5px] w-[5px] rounded-full bg-red" />
            Level complete
          </p>

          <div className="mt-3 grid items-center gap-4 md:grid-cols-[auto_1fr] md:gap-12">
            <div className="relative inline-block font-display text-[110px] font-extrabold leading-[0.85] tracking-[-0.05em] md:text-[220px]">
              {numeral}
              <span
                aria-hidden
                className="absolute left-0 right-0 bg-red"
                style={{
                  height: 6,
                  bottom: 22,
                  transform: "rotate(-6deg)",
                }}
              />
            </div>
            <div>
              <small className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-3/60 md:text-[11px]">
                Level {levelWord}
              </small>
              <h1 className="mt-1.5 font-display text-[22px] font-extrabold leading-[1.1] tracking-[-0.018em] md:text-[40px]">
                {levelTagline}
                <br />
                <span className="text-paper-3/70">{levelName}</span>
              </h1>
              <span className="mt-3.5 inline-flex items-center gap-2 border border-red bg-[rgba(215,38,61,.18)] px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF8A95]">
                <Check className="h-3 w-3 text-red" aria-hidden />
                Earned · this device
              </span>
              <p className="mt-4 max-w-[34ch] text-[13px] leading-[1.55] text-paper-3/80 md:text-[15px]">
                {readyForNext(level)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STAT STRIPE ===== */}
      <section className="grid grid-cols-2 gap-px border-b border-rule bg-rule md:grid-cols-4">
        <Cell
          label="Pages completed"
          value={`${completed}`}
          suffix={` / ${total}`}
          delta={`${pct}%`}
        />
        <Cell
          label="Best quiz"
          value={bestQuiz ? `${bestQuiz.pct}` : "—"}
          suffix={bestQuiz ? " %" : ""}
          delta={bestQuiz ? "Auto + self-marked" : "Not taken"}
        />
        <Cell
          label="Readiness checks"
          value={`${readinessEntries.length}`}
          suffix=""
          delta={readinessEntries.length > 0 ? "Recorded" : "None yet"}
        />
        <Cell
          label="Level"
          value={`L${level}`}
          suffix=""
          delta="Cleared"
        />
      </section>

      {/* ===== READINESS CHECKS (if any) ===== */}
      {readinessEntries.length > 0 ? (
        <section className="border-b border-rule bg-paper-3 px-[22px] py-5 md:px-14 md:py-7">
          <h3 className="mb-3 font-display text-[16px] font-extrabold tracking-[-0.01em] text-ink md:text-[20px]">
            Readiness criteria
          </h3>
          <ul className="flex flex-col">
            {readinessEntries.map(([key, check]) => {
              const toneCls =
                check.status === "yes"
                  ? "bg-moss"
                  : check.status === "not-quite"
                  ? "bg-amber"
                  : "bg-crimson";
              return (
                <li
                  key={key}
                  className="grid items-center gap-3 border-t border-rule py-2.5 first:border-t-0 first:pt-0"
                  style={{ gridTemplateColumns: "18px 1fr auto" }}
                >
                  <span
                    className={
                      "flex h-[18px] w-[18px] items-center justify-center rounded-full text-paper-3 " +
                      toneCls
                    }
                  >
                    <Check className="h-[11px] w-[11px]" aria-hidden />
                  </span>
                  <span className="min-w-0 text-[13px] leading-[1.4] text-ink-2">
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                      {key}
                    </span>
                    {check.notes ? (
                      <span className="block">{check.notes}</span>
                    ) : null}
                  </span>
                  <span
                    className={
                      "font-mono text-[11px] font-bold uppercase tracking-[0.08em] " +
                      (check.status === "yes"
                        ? "text-moss"
                        : check.status === "not-quite"
                        ? "text-amber"
                        : "text-crimson")
                    }
                  >
                    {READINESS_LABELS[check.status] ?? check.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* ===== NEXT LEVEL CARD ===== */}
      <section className="px-[22px] pb-7 pt-5 md:px-14 md:pb-12 md:pt-7">
        <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          What&rsquo;s next
        </p>
        {nextLevel != null ? (
          <Link
            href={`/levels/${nextLevel}`}
            className="grid items-center gap-4 border border-rule border-l-[3px] border-l-ice bg-paper-3 px-4 py-4 text-ink no-underline transition-colors hover:bg-paper-4 md:px-6 md:py-5"
            style={{ gridTemplateColumns: "56px 1fr auto" }}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-[2px] border border-rule bg-paper font-display text-[22px] font-extrabold tracking-[-0.02em] text-ink">
              {nextLevel.toString().padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                Level {nextLevel}
              </span>
              <span className="mt-0.5 block font-display text-[16px] font-bold leading-tight tracking-[-0.01em] md:text-[18px]">
                {nextLevelName ?? `Level ${nextLevel}`}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-ink-3" aria-hidden />
          </Link>
        ) : (
          <div className="border border-rule bg-paper-3 px-4 py-5 md:px-6 md:py-6">
            <p className="font-display text-[16px] font-extrabold tracking-[-0.012em] text-ink md:text-[20px]">
              You&rsquo;ve cleared every level in this workbook.
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-2 md:text-[14px]">
              Cycle back through any section as a refresher, or sit the IMS /
              EMS exam with confidence.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {nextLevel != null ? (
            <Link href={`/levels/${nextLevel}`} className="btn red">
              Begin Level {nextLevel}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
          <Link href="/progress" className="btn ghost">
            Open progress
          </Link>
          <Link href={`/levels/${level}`} className="btn ghost">
            Revisit Level {level}
          </Link>
        </div>
      </section>

      {/* ===== "UP NEXT" PHOTO BAND (desktop) ===== */}
      {nextLevel != null ? (
        <section
          className="relative hidden h-[240px] overflow-hidden bg-ink md:block"
          aria-hidden
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url(/photos/trio-piste-signs.png)",
              backgroundPosition: "center 40%",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/0" />
          <div className="relative flex h-full items-center px-14">
            <div className="max-w-[40ch] text-paper-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-paper-3/60">
                Up next
              </p>
              <p className="mt-2 font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
                {nextLevelName ?? `Level ${nextLevel}`}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

/* ---------- subcomponents ---------- */

function Cell({
  label,
  value,
  suffix,
  delta,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
}) {
  return (
    <div className="bg-paper-3 px-4 py-[14px] md:px-6 md:py-[18px]">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-3">
        {label}
      </div>
      <div className="mt-1.5 font-display text-[24px] font-extrabold leading-none tracking-[-0.018em] text-ink md:text-[28px]">
        {value}
        {suffix ? (
          <small className="ml-0.5 text-[11px] font-semibold text-ink-3 md:text-[13px]">
            {suffix}
          </small>
        ) : null}
      </div>
      {delta ? (
        <div className="mt-1 font-mono text-[10px] font-semibold tracking-[0.06em] text-moss">
          {delta}
        </div>
      ) : null}
    </div>
  );
}

function readyForNext(level: number): string {
  if (level === 1)
    return "Map literacy in place. Terrain interpretation is where contour shapes turn into real-ground decisions.";
  if (level === 2)
    return "Terrain reading earned. The navigation toolkit puts compass, altimeter and the route card to work in poor visibility.";
  return "Three levels cleared. Walk into the IMS / EMS assessment with the workbook in muscle memory.";
}
