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
        className="mx-auto max-w-3xl px-4 py-8 sm:py-10 focus:outline-none"
      >
        <header className="mb-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Spaced repetition
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Flashcards
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
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
