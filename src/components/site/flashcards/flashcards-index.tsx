"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/lib/progress/provider";
import { isDue, todayIso } from "@/lib/flashcards/sm2";
import { FLASHCARDS } from "@/data/flashcards.generated";

interface DeckSummary {
  id: string;
  title: string;
  description: string;
  primary: boolean;
  pseudo: boolean;
  cardIds: string[];
}

export function FlashcardsIndex({ decks }: { decks: DeckSummary[] }) {
  const { hydrated, store } = useProgress();

  const enriched = useMemo(() => {
    if (!hydrated) {
      return decks.map((d) => ({ deck: d, dueCount: 0, newCount: 0, totalCount: d.cardIds.length }));
    }
    const today = todayIso();
    return decks.map((deck) => {
      let cardIds = deck.cardIds;
      if (deck.pseudo && deck.id === "review") {
        // Pseudo "review" deck: every card whose schedule is due today, across the deck collection
        cardIds = FLASHCARDS.filter((c) => isDue(store.flashcards[c.id])).map((c) => c.id);
      }
      let due = 0;
      let neverStudied = 0;
      for (const id of cardIds) {
        const sched = store.flashcards[id];
        if (!sched) {
          neverStudied += 1;
          due += 1;
        } else if (sched.dueDate <= today) {
          due += 1;
        }
      }
      return { deck, dueCount: due, newCount: neverStudied, totalCount: cardIds.length };
    });
  }, [decks, hydrated, store.flashcards]);

  const reviewSummary = enriched.find((e) => e.deck.id === "review");
  const focused = enriched.filter((e) => e.deck.primary && e.deck.id !== "review");
  const others = enriched.filter((e) => !e.deck.primary);

  return (
    <div className="space-y-8">
      {reviewSummary ? (
        <section className="rounded-xl border border-primary/40 bg-primary/5 p-5 sm:p-6">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-primary">
            Today
          </p>
          <h2 className="mt-1 font-sans text-2xl font-semibold tracking-tight text-foreground">
            {hydrated ? `${reviewSummary.dueCount} cards due` : "Loading…"}
          </h2>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            {reviewSummary.deck.description}
          </p>
          {hydrated && reviewSummary.dueCount > 0 ? (
            <Link
              href="/flashcards/study/review"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start daily review →
            </Link>
          ) : hydrated ? (
            <p className="mt-3 font-serif text-sm text-muted-foreground">
              All caught up — see you tomorrow.
            </p>
          ) : null}
        </section>
      ) : null}

      <section>
        <h2 className="font-sans text-xl font-semibold text-foreground">
          Focused decks
        </h2>
        <p className="mt-1 font-sans text-sm text-muted-foreground">
          Pick a level and study its cards in order. New cards graduate into
          your daily review queue once you rate them.
        </p>
        <ul className="mt-3 space-y-2">
          {focused.map(({ deck, dueCount, newCount, totalCount }) => (
            <DeckRow
              key={deck.id}
              deck={deck}
              dueCount={dueCount}
              newCount={newCount}
              totalCount={totalCount}
              hydrated={hydrated}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-sans text-xl font-semibold text-foreground">
          Other decks
        </h2>
        <ul className="mt-3 space-y-2">
          {others.map(({ deck, dueCount, newCount, totalCount }) => (
            <DeckRow
              key={deck.id}
              deck={deck}
              dueCount={dueCount}
              newCount={newCount}
              totalCount={totalCount}
              hydrated={hydrated}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function DeckRow({
  deck,
  dueCount,
  newCount,
  totalCount,
  hydrated,
}: {
  deck: DeckSummary;
  dueCount: number;
  newCount: number;
  totalCount: number;
  hydrated: boolean;
}) {
  return (
    <li className="rounded-lg border border-border transition-colors hover:border-primary">
      <Link
        href={`/flashcards/study/${deck.id}`}
        className="block p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-sans text-base font-medium text-foreground">
              {deck.title}
            </p>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              {deck.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-sm text-foreground">
              {hydrated ? `${dueCount}/${totalCount}` : `–/${totalCount}`}
            </p>
            <p className="font-sans text-xs text-muted-foreground">
              due / total
            </p>
            {hydrated && newCount > 0 ? (
              <p className="mt-1 font-sans text-xs text-primary">
                {newCount} new
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
