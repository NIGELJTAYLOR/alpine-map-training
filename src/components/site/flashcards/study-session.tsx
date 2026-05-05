"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Flashcard } from "@/data/flashcards.generated";
import { useProgress } from "@/lib/progress/provider";
import {
  applyRating,
  dueHint,
  isDue,
  type Rating,
} from "@/lib/flashcards/sm2";
import { MarkdownString } from "@/components/site/quiz/markdown";
import { Button, buttonVariants } from "@/components/ui/button";

interface StudySessionProps {
  deckId: string;
  pseudo: boolean;
  cards: Flashcard[];
}

const RATING_LABELS: { rating: Rating; label: string; help: string; tone: string }[] = [
  { rating: "again", label: "Again", help: "I forgot — show me soon", tone: "border-destructive bg-destructive/10 hover:bg-destructive/20 text-foreground" },
  { rating: "hard", label: "Hard", help: "Got it but with effort", tone: "border-contour bg-contour/10 hover:bg-contour/20 text-foreground" },
  { rating: "good", label: "Good", help: "Normal recall", tone: "border-primary bg-primary/10 hover:bg-primary/20 text-foreground" },
  { rating: "easy", label: "Easy", help: "Trivial — wider gap next time", tone: "border-success bg-success/10 hover:bg-success/20 text-foreground" },
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
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>
            Card {idx + 1} of {queue.length}
          </span>
          <span>
            {sched ? dueHint(sched) : "new"} · ease {sched ? sched.easiness.toFixed(2) : "—"}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((idx + (revealed ? 0.5 : 0)) / queue.length) * 100}%` }}
          />
        </div>
      </div>

      <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <header className="mb-3">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {card.id} · {card.title}
          </p>
        </header>

        <div className="mt-2">
          <MarkdownString text={card.front} />
        </div>

        {revealed ? (
          <div className="mt-6 border-t border-border pt-4">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-primary">
              Back
            </p>
            <div className="mt-2">
              <MarkdownString text={card.back} />
            </div>
            {card.tags.length > 0 ? (
              <p className="mt-3 font-sans text-xs text-muted-foreground">
                {card.tags.join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>

      {!revealed ? (
        <div className="flex justify-center">
          <Button onClick={() => setRevealed(true)} size="lg">
            Show answer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RATING_LABELS.map(({ rating, label, help, tone }) => (
            <button
              key={rating}
              type="button"
              onClick={() => rate(rating)}
              className={`flex flex-col items-center justify-center rounded-md border px-3 py-3 transition-colors ${tone}`}
            >
              <span className="font-sans text-sm font-semibold">{label}</span>
              <span className="mt-0.5 font-sans text-[11px] text-muted-foreground">
                {help}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <Link
          href="/flashcards"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          End session
        </Link>
      </div>
    </div>
  );
}

function SessionComplete({ deckId, completed }: { deckId: string; completed: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Session complete
      </p>
      <h2 className="mt-2 font-sans text-2xl font-semibold text-foreground">
        {completed === 0
          ? "Nothing due"
          : completed === 1
          ? "1 card reviewed"
          : `${completed} cards reviewed`}
      </h2>
      <p className="mt-3 font-serif text-sm text-muted-foreground">
        Each card you rated has been scheduled for its next review based on
        how well you knew it.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/flashcards"
          className={buttonVariants({})}
        >
          Back to flashcards
        </Link>
        {deckId !== "review" ? (
          <Link
            href="/flashcards/study/review"
            className={buttonVariants({ variant: "outline" })}
          >
            Daily review
          </Link>
        ) : null}
      </div>
    </div>
  );
}
