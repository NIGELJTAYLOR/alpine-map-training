"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import {
  AVAILABLE_LEVELS,
  getPages,
  getDiagramsForLevel,
  getAllTemplates,
  type Page,
} from "@/lib/content";
import { FLASHCARDS } from "@/data/flashcards.generated";
import { useProgress } from "@/lib/progress/provider";

const LEVEL_META: Record<number, { name: string; desc: string }> = {
  1: {
    name: "Map literacy",
    desc: "Scale, grid references, contour reading, symbol recognition. The fundamentals — finished here, the rest is craft.",
  },
  2: {
    name: "Terrain interpretation",
    desc: "Reading shape before steepness. Summit forms, ridges, gullies, aspect, slope angle, terrain traps.",
  },
  3: {
    name: "Navigation toolkit",
    desc: "Compass, altimeter, route cards, pacing, timing, attack points, and poor-vis techniques.",
  },
};

const TOTAL_PAGES_CONST = 66;

export function HomeView() {
  const { hydrated, store } = useProgress();

  // Pull every page once so per-level slices are cheap below.
  const allPages = useMemo(() => getPages(), []);
  const allDiagrams = useMemo(
    () => AVAILABLE_LEVELS.flatMap((l) => getDiagramsForLevel(l)),
    [],
  );
  const allTemplates = useMemo(() => getAllTemplates(), []);

  // Per-level progress: completed count, total count, percentage.
  const levelStats = useMemo(() => {
    return AVAILABLE_LEVELS.map((level) => {
      const pages = getPages(level);
      const total = pages.length;
      const completed = pages.filter(
        (p) => store.pages[p.id]?.status === "completed",
      ).length;
      const inProgress = pages.filter(
        (p) => store.pages[p.id]?.status === "in-progress",
      ).length;
      const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { level, pages, total, completed, inProgress, pct };
    });
  }, [store.pages]);

  // Active level: first level that isn't 100% complete and has at least one
  // page started; falls back to the first incomplete level, then to L1.
  const activeLevel = useMemo(() => {
    if (!hydrated) return AVAILABLE_LEVELS[0];
    const started = levelStats.find(
      (s) => s.completed + s.inProgress > 0 && s.pct < 100,
    );
    if (started) return started.level;
    const incomplete = levelStats.find((s) => s.pct < 100);
    return incomplete?.level ?? AVAILABLE_LEVELS[0];
  }, [hydrated, levelStats]);

  // Resume target: the most recently viewed in-progress page; if none, the
  // first page of the active level that isn't completed.
  const resumeTarget = useMemo(() => {
    if (!hydrated) return null;
    const inProgress: Array<{ page: Page; lastViewed: string }> = [];
    for (const page of allPages) {
      const prog = store.pages[page.id];
      if (prog?.status === "in-progress" && prog.lastViewed) {
        inProgress.push({ page, lastViewed: prog.lastViewed });
      }
    }
    if (inProgress.length > 0) {
      inProgress.sort(
        (a, b) =>
          new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime(),
      );
      return inProgress[0].page;
    }
    // Fall back to first non-completed page in the active level.
    const levelPages = getPages(activeLevel);
    const next = levelPages.find(
      (p) => store.pages[p.id]?.status !== "completed",
    );
    return next ?? levelPages[0] ?? null;
  }, [hydrated, allPages, store.pages, activeLevel]);

  // Pathway %: completed pages over the full 66-page workbook.
  const pathwayPct = useMemo(() => {
    if (!hydrated) return 0;
    const completed = Object.values(store.pages).filter(
      (p) => p.status === "completed",
    ).length;
    return Math.round((completed / TOTAL_PAGES_CONST) * 100);
  }, [hydrated, store.pages]);

  // Due-cards count: never-studied + past-due.
  const dueCount = useMemo(() => {
    if (!hydrated) return 0;
    const now = Date.now();
    let due = 0;
    for (const card of FLASHCARDS) {
      const sched = store.flashcards[card.id];
      if (!sched) {
        due += 1;
        continue;
      }
      if (new Date(sched.dueDate).getTime() <= now) due += 1;
    }
    return due;
  }, [hydrated, store.flashcards]);

  // Last-quiz score (most recent completed quiz) used in the desktop stripe.
  const lastQuizScore = useMemo(() => {
    if (!hydrated) return null;
    const completed = Object.values(store.quizzes).filter(
      (q) => q.completedAt && q.score != null && q.totalQuestions,
    );
    if (completed.length === 0) return null;
    completed.sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() -
        new Date(a.completedAt!).getTime(),
    );
    const last = completed[0];
    return Math.round(((last.score ?? 0) / (last.totalQuestions ?? 1)) * 100);
  }, [hydrated, store.quizzes]);

  const totalCompletedPages = useMemo(
    () =>
      Object.values(store.pages).filter((p) => p.status === "completed")
        .length,
    [store.pages],
  );

  const resumeHref = resumeTarget
    ? `/levels/${resumeTarget.level}/${resumeTarget.page}`
    : `/levels/${activeLevel}`;
  const resumeLabel = resumeTarget
    ? `Resume ${resumeTarget.page}`
    : `Open Level ${activeLevel}`;

  return (
    <>
      {/* =========================================================
          MOBILE — hero band (md:hidden hides on desktop)
          ========================================================= */}
      <section className="relative overflow-hidden border-b border-rule bg-paper md:hidden">
        <div className="grid-bg" />
        <div className="relative px-[22px] pb-6 pt-7">
          <div className="mt-2 flex items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full bg-red" />
            <span>BASI Alpine L4 · ISTD navigation · Glacier Lab</span>
          </div>
          <h1 className="mt-3 font-display text-[36px] font-extrabold leading-[1.04] tracking-[-0.028em]">
            Read the
            <br />
            mountain
            <br />
            before you <span className="text-red">ski</span> it.
          </h1>
          <p className="mt-3 max-w-[30ch] text-[14px] leading-[1.55] text-ink-2">
            The digital companion to your BASI Alpine Level 4 ISTD navigation
            workbook.
          </p>
          <div className="mt-[18px] flex flex-wrap gap-1.5">
            <span className="tag red">
              <span className="dot" />
              Level {activeLevel} active
            </span>
            <span className="tag">Offline</span>
          </div>
        </div>
      </section>

      {/* MOBILE — full-bleed hero photo strip */}
      <div
        className="photo-slot has-img md:hidden"
        style={{
          height: 180,
          backgroundImage: "url(/photos/skier-beanie-closeup.png)",
          backgroundPosition: "60% center",
        }}
      />

      {/* MOBILE — 3-cell stat stripe */}
      <div className="grid grid-cols-3 gap-px border-b border-rule bg-rule md:hidden">
        <StripeCell label="Pathway" value={`${pathwayPct}`} suffix="%" />
        <StripeCell label="Due" value={`${dueCount}`} suffix=" cards" />
        <StripeCell
          label="Pages"
          value={`${totalCompletedPages}`}
          suffix={`/${TOTAL_PAGES_CONST}`}
        />
      </div>

      {/* MOBILE — Pathway list */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between px-[22px] pb-3 pt-[22px]">
          <h2 className="font-display text-[18px] font-extrabold tracking-[-0.012em]">
            Pathway
          </h2>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            {AVAILABLE_LEVELS.length.toString().padStart(2, "0")} levels
          </span>
        </div>
        <div className="px-[22px] pb-2">
          {levelStats.map(({ level, pages, total, completed, pct }) => {
            const isActive = level === activeLevel;
            const meta = LEVEL_META[level];
            return (
              <Link
                key={level}
                href={`/levels/${level}`}
                className={
                  "mb-2 grid items-center gap-3.5 border border-rule bg-paper-3 p-4 text-ink no-underline " +
                  (isActive ? "border-l-[3px] border-l-red pl-[14px]" : "")
                }
                style={{ gridTemplateColumns: "48px 1fr 16px" }}
              >
                <span
                  className={
                    "flex h-12 w-12 items-center justify-center rounded-[2px] border font-display text-[22px] font-extrabold tracking-[-0.02em] " +
                    (isActive
                      ? "border-red bg-red text-paper-3"
                      : "border-rule bg-paper text-ink")
                  }
                >
                  {level.toString().padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="mb-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                    Level {numWord(level)} · {total} pages
                  </div>
                  <div className="mb-2 font-display text-[15px] font-bold leading-tight tracking-[-0.01em] text-ink">
                    {meta?.name ?? `Level ${level}`}
                  </div>
                  <div className="flex items-center gap-2.5 font-mono text-[10px] font-semibold tracking-[0.08em] text-ink-3">
                    <div className="pbar max-w-[100px] flex-1">
                      <i style={{ width: `${pct}%` }} />
                    </div>
                    <span>
                      {completed} / {total}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden />
              </Link>
            );
          })}
        </div>
        <div className="px-[22px] pb-6 pt-4">
          <Link href={resumeHref} className="btn red block">
            {resumeLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      {/* =========================================================
          DESKTOP — hero band + stripe + pathway grid
          (hidden until md)
          ========================================================= */}
      <section className="relative hidden overflow-hidden border-b border-rule bg-paper md:block">
        <div className="grid-bg" />
        <div className="relative grid grid-cols-[1.25fr_1fr] items-center gap-14 px-16 pb-12 pt-14">
          <div>
            <div className="mb-4 flex items-center gap-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              <span className="h-1.5 w-1.5 rounded-full bg-red" />
              <span>BASI Alpine L4 · ISTD navigation · Glacier Lab</span>
            </div>
            <h1 className="font-display text-[64px] font-extrabold leading-none tracking-[-0.028em]">
              Read the mountain
              <br />
              before you <span className="text-red">ski</span> it.
            </h1>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-[1.55] text-ink-2">
              The digital companion to your BASI Alpine Level 4 ISTD
              navigation workbook. {allPages.length} pages,{" "}
              {FLASHCARDS.length} cards, two graded quizzes — built for cold
              huts, lift queues and quiet evenings.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <Link href={resumeHref} className="btn red">
                {resumeLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <Link href="/progress" className="btn ghost">
                Open statistics
              </Link>
            </div>
          </div>
          <div
            className="photo-slot has-img"
            style={{
              height: 340,
              borderRadius: 4,
              backgroundImage: "url(/photos/lone-skier-navy.jpg)",
              backgroundPosition: "35% center",
            }}
          />
        </div>
      </section>

      {/* Desktop 4-cell stripe */}
      <div className="hidden grid-cols-4 gap-px border-b border-rule bg-rule md:grid">
        <StripeCell
          label="Pathway"
          value={`${pathwayPct}`}
          suffix="%"
          delta={hydrated ? `${totalCompletedPages} / ${TOTAL_PAGES_CONST} pages` : undefined}
        />
        <StripeCell
          label="Due today"
          value={`${dueCount}`}
          suffix=" cards"
          delta={dueCount > 0 ? "Review now" : "All clear"}
          deltaColor={dueCount > 0 ? "var(--red)" : "var(--moss)"}
          size="lg"
        />
        <StripeCell
          label="Diagrams"
          value={`${allDiagrams.length}`}
          suffix=" plates"
          size="lg"
        />
        <StripeCell
          label="Last quiz"
          value={lastQuizScore != null ? `${lastQuizScore}` : "—"}
          suffix={lastQuizScore != null ? " %" : ""}
          delta={lastQuizScore == null ? "Not taken yet" : undefined}
          size="lg"
        />
      </div>

      {/* Desktop pathway section */}
      <section className="hidden border-b border-rule px-16 py-12 md:block">
        <div className="mb-7 flex items-end justify-between gap-6">
          <h2 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.02em]">
            The pathway
          </h2>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            <span className="text-ink">{AVAILABLE_LEVELS.length.toString().padStart(2, "0")}</span> levels
            · <span className="text-ink">{allPages.length}</span> pages ·{" "}
            <span className="text-ink">{FLASHCARDS.length}</span> cards
          </span>
        </div>
        <div className="grid grid-cols-3 gap-px border border-rule bg-rule">
          {levelStats.map(({ level, total, completed, pct }) => {
            const isActive = level === activeLevel;
            const meta = LEVEL_META[level];
            return (
              <Link
                key={level}
                href={`/levels/${level}`}
                className={
                  "relative flex min-h-[260px] flex-col gap-3 bg-paper-3 p-6 text-ink no-underline transition-colors hover:bg-paper-4 " +
                  (isActive ? "outline outline-2 -outline-offset-2 outline-red" : "")
                }
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={
                      "flex h-14 w-14 items-center justify-center rounded-[4px] border font-display text-[26px] font-extrabold tracking-[-0.02em] " +
                      (isActive
                        ? "border-red bg-red text-paper-3"
                        : "border-rule bg-paper text-ink")
                    }
                  >
                    {level.toString().padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                      Level {numWord(level)} · {total} pages
                    </div>
                    <div className="mt-0.5 font-display text-[20px] font-extrabold leading-tight tracking-[-0.012em] text-ink">
                      {meta?.name ?? `Level ${level}`}
                    </div>
                  </div>
                </div>
                <p className="text-[13px] leading-[1.5] text-ink-2">
                  {meta?.desc ?? ""}
                </p>
                <div className="mt-auto flex items-center gap-3 font-mono text-[10px] font-semibold tracking-[0.08em] text-ink-3">
                  <div className={"pbar flex-1 " + (isActive ? "" : "ice")}>
                    <i style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-ink">
                    {pct}%
                  </span>
                </div>
                <span className="absolute right-5 top-5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                  {completed} / {total}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Desktop reference shelf */}
      <section className="hidden px-16 py-12 md:block">
        <div className="mb-7 flex items-end justify-between gap-6">
          <h2 className="font-display text-[32px] font-extrabold leading-none tracking-[-0.02em]">
            Reference shelf
          </h2>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Always at hand
          </span>
        </div>
        <div className="grid grid-cols-3 gap-px border border-rule bg-rule">
          <ReferenceCard
            href="/flashcards"
            title="Flashcards"
            sub={`${FLASHCARDS.length} cards · spaced repetition`}
            badge={hydrated && dueCount > 0 ? `${dueCount} due` : undefined}
          />
          <ReferenceCard
            href="/diagrams"
            title="Schematic diagrams"
            sub={`${allDiagrams.length} plates · contours, compass, slopes`}
          />
          <ReferenceCard
            href="/templates"
            title="Printable templates"
            sub={`${allTemplates.length} sheets · A4 print-ready`}
          />
        </div>
      </section>

      {/* Mobile reference shelf (compact 3-col grid) */}
      <section className="px-[22px] pb-8 pt-4 md:hidden">
        <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Reference
        </p>
        <div className="grid grid-cols-3 gap-2">
          <ReferenceTile
            href="/flashcards"
            title="Cards"
            count={`${FLASHCARDS.length}`}
            unit="cards"
          />
          <ReferenceTile
            href="/diagrams"
            title="Diagrams"
            count={`${allDiagrams.length}`}
            unit="plates"
          />
          <ReferenceTile
            href="/templates"
            title="Templates"
            count={`${allTemplates.length}`}
            unit="sheets"
          />
        </div>
      </section>
    </>
  );
}

/* ---------- subcomponents ---------- */

function StripeCell({
  label,
  value,
  suffix,
  delta,
  deltaColor,
  size = "md",
}: {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  deltaColor?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="bg-paper-3 px-4 py-[14px] md:px-6 md:py-[18px]">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-3">
        {label}
      </div>
      <div
        className={
          "mt-1.5 font-display font-extrabold leading-none tracking-[-0.018em] text-ink " +
          (size === "lg" ? "text-[28px]" : "text-[22px]")
        }
      >
        {value}
        {suffix ? (
          <small className="ml-0.5 text-[11px] font-semibold text-ink-3 md:text-[13px]">
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

function ReferenceCard({
  href,
  title,
  sub,
  badge,
}: {
  href: string;
  title: string;
  sub: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 bg-paper-3 p-6 text-ink no-underline transition-colors hover:bg-paper-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-[18px] font-extrabold leading-tight tracking-[-0.012em] text-ink">
          {title}
        </p>
        {badge ? <span className="tag red">{badge}</span> : null}
      </div>
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-ink-3">
        {sub}
      </p>
    </Link>
  );
}

function ReferenceTile({
  href,
  title,
  count,
  unit,
}: {
  href: string;
  title: string;
  count: string;
  unit: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[100px] flex-col gap-1.5 border border-rule bg-paper-3 px-3 py-3.5 text-ink no-underline"
    >
      <span className="font-display text-[13px] font-bold leading-tight tracking-[-0.01em] text-ink">
        {title}
      </span>
      <span className="mt-auto font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-3">
        {count} {unit}
      </span>
    </Link>
  );
}

function numWord(n: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six"][n] ?? String(n);
}
