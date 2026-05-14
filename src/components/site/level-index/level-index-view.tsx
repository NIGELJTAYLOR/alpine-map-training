"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Page } from "@/lib/content";
import { useProgress } from "@/lib/progress/provider";
import { FLASHCARDS } from "@/data/flashcards.generated";

type FilterMode = "all" | "open" | "done";

interface LevelIndexViewProps {
  level: number;
  levelWord: string;
  levelName: string;
  levelTagline: string;
  pages: Page[];
  diagramCount: number;
}

export function LevelIndexView({
  level,
  levelWord,
  levelName,
  levelTagline,
  pages,
  diagramCount,
}: LevelIndexViewProps) {
  const { hydrated, store } = useProgress();
  const [filter, setFilter] = useState<FilterMode>("all");

  const total = pages.length;

  const { completed, inProgress, pct } = useMemo(() => {
    if (!hydrated) return { completed: 0, inProgress: 0, pct: 0 };
    let c = 0;
    let p = 0;
    for (const page of pages) {
      const status = store.pages[page.id]?.status;
      if (status === "completed") c += 1;
      else if (status === "in-progress") p += 1;
    }
    return {
      completed: c,
      inProgress: p,
      pct: total === 0 ? 0 : Math.round((c / total) * 100),
    };
  }, [hydrated, pages, store.pages, total]);

  // First non-completed page — flagged as the "next" row with a red left-bar.
  const nextPageId = useMemo(() => {
    if (!hydrated) return null;
    for (const page of pages) {
      if (store.pages[page.id]?.status !== "completed") return page.id;
    }
    return null;
  }, [hydrated, pages, store.pages]);

  // Level-scoped flashcard count: cards whose tags include "L{level}".
  const levelCardCount = useMemo(() => {
    const tag = `L${level}`;
    return FLASHCARDS.filter((c) => c.tags.includes(tag)).length;
  }, [level]);

  const visiblePages = useMemo(() => {
    if (filter === "all") return pages;
    return pages.filter((p) => {
      const status = store.pages[p.id]?.status ?? "not-started";
      if (filter === "open") return status !== "completed";
      return status === "completed";
    });
  }, [pages, filter, store.pages]);

  return (
    <>
      {/* =========================================================
          MOBILE — hero band, toolbar, page list
          ========================================================= */}
      <section className="relative overflow-hidden border-b border-rule bg-paper-3 md:hidden">
        <div className="grid-bg" />
        <div className="relative px-[22px] pb-5 pt-7">
          <Link
            href="/"
            className="mb-3.5 inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3 no-underline hover:text-ink"
          >
            <ArrowLeft className="h-2.5 w-2.5" aria-hidden />
            Workbook
            <span className="ml-1.5 text-ink">·</span>
            <b className="text-ink">Level {level}</b>
          </Link>
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <div className="font-display text-[96px] font-extrabold leading-[0.85] tracking-[-0.045em] text-ink">
                {level.toString().padStart(2, "0")}
              </div>
              <h2 className="mb-1.5 mt-2.5 font-display text-[24px] font-extrabold leading-tight tracking-[-0.02em]">
                {levelName}
              </h2>
              <p className="mb-4 max-w-[28ch] text-[14px] text-ink-2">
                {levelTagline}
              </p>
              <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-3">
                <div className="pbar thick flex-1">
                  <i style={{ width: `${pct}%` }} />
                </div>
                <span>
                  {completed} / {total} · {pct}%
                </span>
              </div>
            </div>
            <div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-[2px] border border-rule bg-paper">
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-red">
                Level
              </span>
              <span className="mt-1 font-display text-[32px] font-extrabold leading-none tracking-[-0.02em]">
                {level.toString().padStart(2, "0")}
              </span>
              <span className="mt-1.5 font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                {total} pp
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE — toolbar with filter chips */}
      <div className="flex items-center justify-between gap-2 border-b border-rule bg-paper px-[22px] py-3.5 md:hidden">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          {hydrated && filter !== "all"
            ? `${visiblePages.length} of ${total} pages`
            : `${total} pages`}
        </span>
        <FilterChips value={filter} onChange={setFilter} />
      </div>

      {/* MOBILE — page list */}
      <div className="md:hidden">
        {visiblePages.map((p) => {
          const status = store.pages[p.id]?.status ?? "not-started";
          const isNext = hydrated && p.id === nextPageId;
          const codeLabel = pageCodeLabel(p);
          return (
            <Link
              key={p.id}
              href={`/levels/${level}/${p.page}`}
              className={
                "grid items-center gap-3 border-b border-rule bg-paper-3 px-[22px] py-3.5 text-ink no-underline hover:bg-paper-4 " +
                (isNext ? "border-l-[3px] border-l-red pl-[19px]" : "")
              }
              style={{ gridTemplateColumns: "22px 56px 1fr auto 16px" }}
            >
              <StatusDot status={hydrated ? status : "loading"} />
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-3">
                {codeLabel}
              </span>
              <span className="font-display text-[14px] font-bold leading-tight tracking-[-0.01em]">
                {p.title}
              </span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-ink-3">
                {pageKindMeta(p)}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-ink-3" aria-hidden />
            </Link>
          );
        })}
        {visiblePages.length === 0 ? (
          <p className="border-b border-rule bg-paper-3 px-[22px] py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
            No pages match this filter.
          </p>
        ) : null}
      </div>

      {/* MOBILE — prev / next level footer */}
      <LevelFooter level={level} />

      {/* =========================================================
          DESKTOP — hero band + page list
          ========================================================= */}
      <section className="relative hidden overflow-hidden border-b border-rule bg-paper md:block">
        <div className="grid-bg" />
        <div className="relative px-16 pb-10 pt-14">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3 no-underline hover:text-ink"
          >
            <ArrowLeft className="h-2.5 w-2.5" aria-hidden />
            Workbook <span className="text-ink">·</span> <b className="text-ink">Level {levelWord}</b>
          </Link>
          <div className="grid grid-cols-[1fr_320px] items-end gap-14">
            <div>
              <div className="mb-4 font-display text-[160px] font-extrabold leading-[0.82] tracking-[-0.05em] text-ink">
                {level.toString().padStart(2, "0")}
              </div>
              <h2 className="mb-3.5 font-display text-[44px] font-extrabold leading-none tracking-[-0.025em]">
                {levelName}
              </h2>
              <p className="mb-5 max-w-[56ch] text-[16px] leading-[1.55] text-ink-2">
                {levelTagline}
              </p>
              <div className="flex items-center gap-2.5">
                {hydrated && pct >= 100 ? (
                  <Link
                    href={`/levels/${level}/complete`}
                    className="btn red"
                  >
                    View completion
                  </Link>
                ) : (
                  <Link
                    href={
                      nextPageId
                        ? `/levels/${level}/${pages.find((p) => p.id === nextPageId)!.page}`
                        : `/levels/${level}/${pages[0].page}`
                    }
                    className="btn red"
                  >
                    {nextPageId === pages[0]?.id || !nextPageId
                      ? "Begin Level"
                      : "Continue"}
                  </Link>
                )}
                <Link href="/progress" className="btn ghost">
                  Open progress
                </Link>
              </div>
            </div>
            <aside className="rounded-[4px] border border-rule bg-paper-3 p-5">
              <h4 className="mb-4 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3">
                Level overview
              </h4>
              <StatRow label="Pages" value={total} />
              <StatRow label="Completed" value={hydrated ? completed : "—"} />
              <StatRow label="In progress" value={hydrated ? inProgress : "—"} />
              <StatRow label="Cards" value={levelCardCount} />
              <StatRow label="Diagrams" value={diagramCount} />
              <div className="pbar thick mt-3">
                <i style={{ width: `${pct}%` }} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* DESKTOP — pages section heading + toolbar */}
      <div className="hidden items-baseline justify-between px-16 pb-3.5 pt-7 md:flex">
        <h3 className="font-display text-[24px] font-extrabold tracking-[-0.02em]">
          Pages
        </h3>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            {hydrated && filter !== "all"
              ? `${visiblePages.length} of ${total} shown`
              : `${total} pages`}
          </span>
          <FilterChips value={filter} onChange={setFilter} />
        </div>
      </div>

      {/* DESKTOP — page list */}
      <div className="hidden px-16 pb-14 md:block">
        {visiblePages.map((p, idx) => {
          const status = store.pages[p.id]?.status ?? "not-started";
          const isNext = hydrated && p.id === nextPageId;
          const codeLabel = pageCodeLabel(p);
          return (
            <Link
              key={p.id}
              href={`/levels/${level}/${p.page}`}
              className={
                "grid items-center gap-4 border border-rule bg-paper-3 px-5 py-4 text-ink no-underline hover:bg-paper-4 " +
                (idx === 0 ? "" : "border-t-0 ") +
                (isNext ? "border-l-[3px] border-l-red" : "")
              }
              style={{
                gridTemplateColumns: "22px 70px 1fr 110px 100px 16px",
              }}
            >
              <StatusDot status={hydrated ? status : "loading"} size={18} />
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-ink-3">
                {codeLabel}
              </span>
              <span className="font-display text-[16px] font-bold tracking-[-0.012em]">
                {p.title}
                {isNext ? (
                  <span className="ml-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-red">
                    · Next
                  </span>
                ) : null}
              </span>
              <span className="text-right font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
                {pageKindMeta(p)}
              </span>
              <span className="text-right font-mono text-[11px] font-semibold tracking-[0.06em] text-ink-3">
                {p.exerciseCount ? `${p.exerciseCount} exercises` : ""}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-ink-3" aria-hidden />
            </Link>
          );
        })}
        {visiblePages.length === 0 ? (
          <p className="border border-rule bg-paper-3 px-5 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
            No pages match this filter.
          </p>
        ) : null}
      </div>

      <div className="hidden px-16 pb-14 md:block">
        <LevelFooter level={level} desktop />
      </div>
    </>
  );
}

/* ---------- subcomponents ---------- */

function FilterChips({
  value,
  onChange,
}: {
  value: FilterMode;
  onChange: (v: FilterMode) => void;
}) {
  const opts: Array<{ value: FilterMode; label: string }> = [
    { value: "all", label: "All" },
    { value: "open", label: "Open" },
    { value: "done", label: "Done" },
  ];
  return (
    <div className="flex gap-1">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            "rounded-[2px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] no-underline transition-colors " +
            (value === o.value
              ? "border-ink bg-ink text-paper-3"
              : "border-rule bg-paper-3 text-ink-2 hover:border-rule-2")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StatusDot({
  status,
  size = 18,
}: {
  status: "loading" | "not-started" | "in-progress" | "completed";
  size?: number;
}) {
  if (status === "loading") {
    return <span className="inline-block" style={{ width: size, height: size }} aria-hidden />;
  }
  if (status === "completed") {
    return (
      <span
        title="Completed"
        className="relative inline-block shrink-0 rounded-full border-[1.5px] border-moss bg-moss"
        style={{ width: size, height: size }}
      >
        <span
          className="absolute rounded-full bg-paper-3"
          style={{ inset: 4 }}
        />
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span
        title="In progress"
        className="inline-block shrink-0 overflow-hidden rounded-full border-[1.5px] border-amber bg-amber"
        style={{ width: size, height: size }}
      >
        <span
          className="block h-full"
          style={{
            width: "50%",
            background: "var(--paper-3)",
          }}
        />
      </span>
    );
  }
  return (
    <span
      title="Not started"
      className="inline-block shrink-0 rounded-full border-[1.5px] border-rule-2 bg-paper-3"
      style={{ width: size, height: size }}
    />
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-rule py-2 text-[13px] text-ink-2 first:border-t-0">
      <span>{label}</span>
      <span className="font-display text-[17px] font-extrabold tracking-[-0.01em] text-ink">
        {value}
      </span>
    </div>
  );
}

function LevelFooter({ level, desktop = false }: { level: number; desktop?: boolean }) {
  const prev = level > 1 ? level - 1 : null;
  const next = level < 3 ? level + 1 : null;
  return (
    <div
      className={
        desktop
          ? "flex items-center justify-between gap-3 border-t border-rule bg-paper-3 px-5 py-4"
          : "flex items-center justify-between gap-3 border-t border-rule bg-paper-3 px-[22px] py-4 md:hidden"
      }
    >
      {prev ? (
        <Link href={`/levels/${prev}`} className="btn ghost sm">
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Level {prev}
        </Link>
      ) : (
        <Link href="/" className="btn ghost sm">
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Home
        </Link>
      )}
      {next ? (
        <Link href={`/levels/${next}`} className="btn sm">
          Level {next}
          <ChevronRight className="h-3 w-3" aria-hidden />
        </Link>
      ) : (
        <Link href="/progress" className="btn sm">
          Statistics
          <ChevronRight className="h-3 w-3" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function pageCodeLabel(p: Page): string {
  return p.page;
}

function pageKindMeta(p: Page): string {
  if (p.kind === "contents") return "Intro";
  if (p.kind === "reflection") return "End";
  if (p.kind === "quiz") return "Quiz";
  return "";
}
