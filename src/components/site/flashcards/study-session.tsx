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

const RATING_LABELS: { rating: Rating; label: string; key: string; tone: string }[] = [
  { rating: "again", label: "Again", key: "1", tone: "border-crimson/40 bg-crimson/[.06] hover:bg-crimson/[.12] text-ink" },
  { rating: "hard",  label: "Hard",  key: "2", tone: "border-amber/40 bg-amber/[.06] hover:bg-amber/[.12] text-ink" },
  { rating: "good",  label: "Good",  key: "3", tone: "border-rule bg-paper-3 hover:bg-paper-2 text-ink" },
  { rating: "easy",  label: "Easy",  key: "4", tone: "border-moss/40 bg-moss/[.06] hover:bg-moss/[.12] text-ink" },
];

export function StudySession({ deckId, pseudo, cards }: StudySessionProps) {
  const { hydrated, store, getFlashcardSchedule, setFlashcardSchedule } = useProgress();

  // Derive the queue once at session start (and whenever the underlying deck
  // changes). We deliberately *don't* re-derive on every rating, otherwise a
  // card you just rated would jump out of the queue mid-session.
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

  // If the queue is empty (and we know it's empty — i.e. we hydrated and there
  // really are no cards), short-circuit to the done state.
  useEffect(() => {
    if (hydrated && queue.length === 0) setDone(true);
  }, [hydrated, queue.length]);

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-muted-foreground">
        Loading your schedule…
      </p>
    );
  }

  if (done || queue.length === 0) {
    return <SessionComplete deckId={deckId} completed={completed} />;
  }

  const card = queue[Math.min(idx, queue.length - 1)];
  const sched = getFlashcardSchedule(card.id);

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
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
          <span>Session · {String(idx + 1).padStart(2, "0")} / {queue.length}</span>
          <span>SM-2 · {sched ? `ease ${sched.easiness.toFixed(2)}` : "new"}</span>
        </div>
        <div className="carta-progress mt-2">
          <i style={{ width: `${((idx + (revealed ? 0.5 : 0)) / queue.length) * 100}%` }} />
        </div>
      </div>

      <article className="surface-card p-5 sm:p-7">
        <header className="mb-4">
          <p className="eyebrow eyebrow-contour">
            Card · {card.id} · {card.title}
          </p>
        </header>

        <div className="mt-3 [&_p]:font-display [&_p]:text-xl [&_p]:font-medium [&_p]:tracking-[-0.01em] [&_p]:leading-snug [&_p]:text-ink">
          <MarkdownString text={card.front} />
        </div>

        {revealed ? (
          <div className="mt-6 border-t border-rule pt-5">
            <p className="eyebrow">Back</p>
            <div className="mt-2">
              <MarkdownString text={card.back} />
            </div>
            {card.tags.length > 0 ? (
              <p className="page-code mt-4">
                {card.tags.join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>

      {!revealed ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-ink bg-ink px-6 py-3 font-sans text-sm font-semibold text-paper hover:bg-ink-2"
          >
            Show answer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RATING_LABELS.map(({ rating, label, key, tone }) => (
            <button
              key={rating}
              type="button"
              onClick={() => rate(rating)}
              className={`flex flex-col items-center justify-center rounded-md border px-3 py-3 transition-colors ${tone}`}
            >
              <span className="font-display text-base font-medium">{label}</span>
              <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                {nextHint(sched, rating)} · {key}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-rule pt-4">
        <span className="page-code">
          Press 1 / 2 / 3 / 4 to rate · SPACE to flip
        </span>
        <Link
          href="/flashcards"
          className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-rule bg-transparent px-3 py-1.5 font-sans text-xs font-semibold text-ink hover:border-ink"
        >
          End session
        </Link>
      </div>
    </div>
  );
}

/** Lightweight next-interval hint shown under each rating button. */
function nextHint(
  sched: { intervalDays: number; easiness: number; repetitions: number } | undefined,
  rating: Rating,
): string {
  if (!sched || sched.repetitions === 0) {
    if (rating === "again") return "<1d";
    if (rating === "hard") return "1d";
    if (rating === "good") return "1d";
    return "4d";
  }
  if (rating === "again") return "<1d";
  if (rating === "hard")  return `${Math.max(1, Math.round(sched.intervalDays * 0.7))}d`;
  if (rating === "good")  return sched.repetitions === 1 ? "6d" : `${Math.round(sched.intervalDays * sched.easiness)}d`;
  return `${Math.round(sched.intervalDays * sched.easiness * 1.3)}d`;
}

function SessionComplete({ deckId, completed }: { deckId: string; completed: number }) {
  return (
    <div className="surface-card p-7 text-center sm:p-10">
      <p className="eyebrow eyebrow-contour">
        Session complete
      </p>
      <h2 className="mt-2 font-sans text-2xl font-semibold text-foreground">
        {completed === 0
          ? "Nothing due"
          : completed === 1
          ? "1 card reviewed"
          : `${completed} cards reviewed`}
      </h2>
      <p className="mt-3 font-sans text-[14px] leading-relaxed text-ink-2">
        Each card you rated has been scheduled for its next review based on
        how well you knew it.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/flashcards"
          className="inline-flex items-center justify-center rounded-[4px] border border-ink bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper hover:bg-ink-2"
        >
          Back to flashcards
        </Link>
        {deckId !== "review" ? (
          <Link
            href="/flashcards/study/review"
            className="inline-flex items-center justify-center rounded-[4px] border border-rule bg-transparent px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-ink"
          >
            Daily review
          </Link>
        ) : null}
      </div>
    </div>
  );
}
