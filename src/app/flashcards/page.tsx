import type { Metadata } from "next";
import { FlashcardsIndex } from "@/components/site/flashcards/flashcards-index";
import { DECKS, FLASHCARDS } from "@/data/flashcards.generated";

export const metadata: Metadata = { title: "Flashcards" };

export default function FlashcardsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Spaced repetition
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          Flashcards
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          {FLASHCARDS.length} cards across the workbook. Each card you rate
          schedules its next review using SM-2 spaced repetition — keep the
          daily queue clear and the deck builds toward fluent recall.
        </p>
      </header>

      <div className="px-[22px] py-6 md:px-14 md:py-10">
        <FlashcardsIndex
          decks={DECKS.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            primary: d.primary,
            pseudo: d.pseudo === true,
            cardIds: d.cardIds,
          }))}
        />
      </div>
    </main>
  );
}
