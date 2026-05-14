"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
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
      return decks.map((d) => ({
        deck: d,
        dueCount: 0,
        newCount: 0,
        totalCount: d.cardIds.length,
      }));
    }
    const today = todayIso();
    return decks.map((deck) => {
      let cardIds = deck.cardIds;
      if (deck.pseudo && deck.id === "review") {
        cardIds = FLASHCARDS.filter((c) => isDue(store.flashcards[c.id])).map(
          (c) => c.id,
        );
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
      return {
        deck,
        dueCount: due,
        newCount: neverStudied,
        totalCount: cardIds.length,
      };
    });
  }, [decks, hydrated, store.flashcards]);

  const reviewSummary = enriched.find((e) => e.deck.id === "review");
  const focused = enriched.filter((e) => e.deck.primary && e.deck.id !== "review");
  const others = enriched.filter((e) => !e.deck.primary);

  return (
    <div className="flex flex-col gap-8">
      {/* ===== Today's review ===== */}
      {reviewSummary ? (
        <section className="relative overflow-hidden border border-rule bg-paper-3 px-5 py-6 md:px-8 md:py-8">
          <span className="absolute inset-x-0 top-0 h-[3px] bg-red" aria-hidden />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-red">
            Today
          </p>
          <h2 className="mt-2 font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-[56px]">
            {hydrated ? (
              <>
                {reviewSummary.dueCount}
                <span className="text-ink-3">
                  {" "}
                  {reviewSummary.dueCount === 1 ? "card due" : "cards due"}
                </span>
              </>
            ) : (
              <span className="text-ink-3">Loading…</span>
            )}
          </h2>
          <p className="mt-2 max-w-[60ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
            {reviewSummary.deck.description}
          </p>
          {hydrated && reviewSummary.dueCount > 0 ? (
            <Link href="/flashcards/study/review" className="btn red mt-4">
              Start daily review
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : hydrated ? (
            <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-moss">
              All caught up — see you tomorrow.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ===== Focused decks ===== */}
      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[24px]">
            Focused decks
          </h3>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            By level
          </span>
        </div>
        <p className="mb-4 max-w-[60ch] text-[13px] leading-[1.5] text-ink-2 md:text-[14px]">
          Pick a level and study its cards in order. New cards graduate into
          your daily review queue once you rate them.
        </p>
        <ul className="flex flex-col">
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

      {/* ===== Other decks ===== */}
      {others.length > 0 ? (
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[24px]">
              Other decks
            </h3>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              Topical
            </span>
          </div>
          <ul className="flex flex-col">
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
      ) : null}
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
  const dueHighlight = hydrated && dueCount > 0;
  return (
    <li className="border-t border-rule first:border-t-0">
      <Link
        href={`/flashcards/study/${deck.id}`}
        className="grid items-center gap-3 bg-paper-3 px-4 py-3.5 text-ink no-underline hover:bg-paper-4 md:px-5 md:py-4"
        style={{ gridTemplateColumns: "1fr auto auto" }}
      >
        <div className="min-w-0">
          <p className="font-display text-[15px] font-bold tracking-[-0.01em] text-ink md:text-[16px]">
            {deck.title}
          </p>
          <p className="mt-0.5 text-[12px] leading-[1.5] text-ink-2 md:text-[13px]">
            {deck.description}
          </p>
        </div>
        <div className="text-right">
          <p
            className={
              "font-display text-[18px] font-extrabold tracking-[-0.01em] " +
              (dueHighlight ? "text-red" : "text-ink-3")
            }
          >
            {hydrated ? dueCount : "—"}
            <small className="ml-0.5 font-mono text-[10px] font-semibold text-ink-3">
              / {totalCount}
            </small>
          </p>
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-ink-3">
            {dueHighlight ? "due" : hydrated ? "all clear" : "loading"}
          </p>
          {hydrated && newCount > 0 ? (
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ice">
              {newCount} new
            </p>
          ) : null}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-ink-3" aria-hidden />
      </Link>
    </li>
  );
}
