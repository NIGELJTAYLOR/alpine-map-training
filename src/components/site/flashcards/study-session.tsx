"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Flashcard } from "@/data/flashcards.generated";
import { useProgress } from "@/lib/progress/provider";
import { applyRating, isDue, type Rating } from "@/lib/flashcards/sm2";
import { MarkdownString } from "@/components/site/quiz/markdown";

interface StudySessionProps {
  deckId: string;
  pseudo: boolean;
  cards: Flashcard[];
}

const RATINGS: Array<{
  rating: Rating;
  label: string;
  key: string;
  cls: string;
}> = [
  { rating: "again", label: "Again", key: "1", cls: "text-crimson border-[rgba(163,59,42,.4)] hover:bg-crimson/[.06]" },
  { rating: "hard", label: "Hard", key: "2", cls: "text-amber border-[rgba(197,139,44,.4)] hover:bg-amber/[.06]" },
  { rating: "good", label: "Good", key: "3", cls: "text-moss border-[rgba(46,125,91,.4)] hover:bg-moss/[.06]" },
  { rating: "easy", label: "Easy", key: "4", cls: "text-ice border-[rgba(36,128,181,.4)] hover:bg-ice/[.06]" },
];

export function StudySession({ deckId, pseudo, cards }: StudySessionProps) {
  const { hydrated, store, getFlashcardSchedule, setFlashcardSchedule } =
    useProgress();

  const queue = useMemo(() => {
    if (!hydrated) return [];
    if (pseudo && deckId === "review") {
      return cards.filter((c) => isDue(store.flashcards[c.id]));
    }
    return cards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, deckId, pseudo, cards.length]);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (hydrated && queue.length === 0) setDone(true);
  }, [hydrated, queue.length]);

  // Keyboard shortcuts: Space to flip, 1-4 to rate.
  useEffect(() => {
    if (!hydrated || done) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setRevealed((v) => !v);
        return;
      }
      if (!revealed) return;
      const num = ["1", "2", "3", "4"].indexOf(e.key);
      if (num >= 0) rate(RATINGS[num].rating);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, done, revealed, idx]);

  if (!hydrated) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
        Loading your schedule…
      </p>
    );
  }

  if (done || queue.length === 0) {
    return <SessionComplete deckId={deckId} completed={completed} />;
  }

  const card = queue[Math.min(idx, queue.length - 1)];
  const sched = getFlashcardSchedule(card.id);
  const progressPct = ((idx + (revealed ? 0.5 : 0)) / queue.length) * 100;

  function rate(rating: Rating) {
    const next = applyRating(sched, rating);
    setFlashcardSchedule(card.id, next);
    setCompleted((n) => n + 1);
    if (idx < queue.length - 1) {
      setIdx(idx + 1);
      setRevealed(false);
    } else {
      setDone(true);
    }
  }

  return (
    <div>
      {/* Meta row + progress */}
      <div className="mb-[14px] flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        <span className="text-ink">
          Card {String(idx + 1).padStart(2, "0")} / {queue.length}
        </span>
        <span className="flex items-center gap-2">
          <span className="pbar w-[80px] md:w-[200px]">
            <i style={{ width: `${progressPct}%` }} />
          </span>
          <span>SM-2 · {sched ? `ease ${sched.easiness.toFixed(2)}` : "new"}</span>
        </span>
      </div>

      {/* Card */}
      <article className="relative flex min-h-[420px] flex-col gap-[18px] overflow-hidden border border-rule bg-paper-3 px-[22px] py-7 md:min-h-[380px] md:px-14 md:py-12">
        <span
          className="absolute inset-x-0 top-0 h-[3px] bg-red"
          aria-hidden
        />
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-red">
          Question · {card.id}
        </p>
        <div className="[&_p]:font-display [&_p]:text-[24px] [&_p]:font-extrabold [&_p]:leading-[1.25] [&_p]:tracking-[-0.02em] [&_p]:text-ink md:[&_p]:text-[38px] md:[&_p]:leading-[1.15]">
          <MarkdownString text={card.front} />
        </div>

        {revealed ? (
          <>
            <p className="border-t border-rule pt-[14px] font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-3">
              Answer
            </p>
            <div className="text-[15px] leading-[1.55] text-ink-2 md:text-[17px] [&_strong]:font-bold [&_strong]:text-ink">
              <MarkdownString text={card.back} />
            </div>
          </>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-rule pt-[14px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
          <span>{card.tags.join(" · ") || "Untagged"}</span>
          <span className="text-ink-3">{card.title}</span>
        </div>
      </article>

      {/* Reveal / rate row */}
      {!revealed ? (
        <div className="px-[22px] pt-4 md:px-0">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="btn block"
          >
            Show answer
            <span className="ml-2 font-mono text-[9px] font-normal text-paper-3/70 normal-case tracking-[0.1em]">
              SPACE
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5 px-[22px] pb-2 pt-4 md:px-0">
          {RATINGS.map(({ rating, label, key, cls }) => (
            <button
              key={rating}
              type="button"
              onClick={() => rate(rating)}
              className={
                "flex flex-col items-center gap-1 rounded-[2px] border bg-paper-3 px-1.5 py-3.5 font-sans text-[12px] font-bold uppercase " +
                cls
              }
            >
              <span>{label}</span>
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                {nextHint(sched, rating)}
              </span>
              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-ink-3">
                {key}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Footer: keyboard hint + end-session */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-rule px-[22px] pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3 md:px-0">
        <span>Press 1 / 2 / 3 / 4 to rate · SPACE to flip</span>
        <Link href="/flashcards" className="btn ghost sm">
          End session
        </Link>
      </div>
    </div>
  );
}

function nextHint(
  sched:
    | { intervalDays: number; easiness: number; repetitions: number }
    | undefined,
  rating: Rating,
): string {
  if (!sched || sched.repetitions === 0) {
    if (rating === "again") return "<1m";
    if (rating === "hard") return "<10m";
    if (rating === "good") return "1d";
    return "4d";
  }
  if (rating === "again") return "<1m";
  if (rating === "hard")
    return `${Math.max(1, Math.round(sched.intervalDays * 0.7))}d`;
  if (rating === "good")
    return sched.repetitions === 1
      ? "6d"
      : `${Math.round(sched.intervalDays * sched.easiness)}d`;
  return `${Math.round(sched.intervalDays * sched.easiness * 1.3)}d`;
}

function SessionComplete({
  deckId,
  completed,
}: {
  deckId: string;
  completed: number;
}) {
  return (
    <article className="border border-rule bg-paper-3 px-7 py-10 text-center md:px-14 md:py-14">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-red">
        Session complete
      </p>
      <h2 className="mt-3 font-display text-[28px] font-extrabold tracking-[-0.02em] text-ink md:text-[40px]">
        {completed === 0
          ? "Nothing due"
          : completed === 1
          ? "1 card reviewed"
          : `${completed} cards reviewed`}
      </h2>
      <p className="mt-3 text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
        Each card you rated has been scheduled for its next review based on
        how well you knew it.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <Link href="/flashcards" className="btn">
          Back to flashcards
        </Link>
        {deckId !== "review" ? (
          <Link href="/flashcards/study/review" className="btn ghost">
            Daily review
          </Link>
        ) : null}
      </div>
    </article>
  );
}
