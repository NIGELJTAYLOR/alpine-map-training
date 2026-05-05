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
    <div className="space-y-10">
      {reviewSummary ? (
        <section className="surface-card p-6 sm:p-8">
          <p className="eyebrow eyebrow-contour">Today</p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            {hydrated ? (
              <>
                {reviewSummary.dueCount}{" "}
                <span className="text-ink-3">{reviewSummary.dueCount === 1 ? "card due" : "cards due"}</span>
              </>
            ) : (
              "Loading…"
            )}
          </h2>
          <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink-2">
            {reviewSummary.deck.description}
          </p>
          {hydrated && reviewSummary.dueCount > 0 ? (
            <Link
              href="/flashcards/study/review"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-[4px] border border-ink bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-ink-2"
            >
              Start daily review →
            </Link>
          ) : hydrated ? (
            <p className="mt-4 font-sans text-sm text-ink-3">
              All caught up — see you tomorrow.
            </p>
          ) : null}
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
            Focused decks
          </h2>
          <span className="eyebrow eyebrow-contour">By level</span>
        </div>
        <p className="font-sans text-[14px] leading-relaxed text-ink-2">
          Pick a level and study its cards in order. New cards graduate into
          your daily review queue once you rate them.
        </p>
        <ul className="mt-4 space-y-2">
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
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
            Other decks
          </h2>
          <span className="eyebrow eyebrow-contour">Topical</span>
        </div>
        <ul className="space-y-2">
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
    <li className="rounded-md border border-rule bg-paper-3 transition-colors hover:border-ink">
      <Link
        href={`/flashcards/study/${deck.id}`}
        className="block p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-base font-medium text-ink">
              {deck.title}
            </p>
            <p className="mt-1 font-sans text-[13px] leading-relaxed text-ink-2">
              {deck.description}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[15px] text-ink">
              {hydrated ? `${dueCount}/${totalCount}` : `–/${totalCount}`}
            </p>
            <p className="page-code">due / total</p>
            {hydrated && newCount > 0 ? (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-contour">
                {newCount} new
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
