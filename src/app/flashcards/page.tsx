import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { FlashcardsIndex } from "@/components/site/flashcards/flashcards-index";
import { DECKS, FLASHCARDS } from "@/data/flashcards.generated";

export const metadata: Metadata = { title: "Flashcards" };

export default function FlashcardsPage() {
  // Pass plain serialisable data into the client component (no functions).
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none"
      >
        <header className="mb-10">
          <p className="eyebrow eyebrow-contour">Spaced repetition</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Flashcards
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            {FLASHCARDS.length} cards across the workbook. Each card you rate
            schedules its next review using the SM-2 algorithm — keep your
            daily review queue clear and the deck builds toward fluent recall.
          </p>
        </header>

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
      </main>
    </>
  );
}
