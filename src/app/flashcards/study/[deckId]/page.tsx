import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { StudySession } from "@/components/site/flashcards/study-session";
import {
  DECKS,
  FLASHCARDS,
  getDeck,
  type Flashcard,
} from "@/data/flashcards.generated";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export function generateStaticParams() {
  return DECKS.map((d) => ({ deckId: d.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { deckId } = await params;
  const deck = getDeck(deckId);
  if (!deck) return {};
  return { title: `${deck.title} — Flashcards` };
}

export default async function StudyDeckRoute({ params }: PageProps) {
  const { deckId } = await params;
  const deck = getDeck(deckId);
  if (!deck) notFound();

  // For pseudo decks (review), pass the full card collection — the client
  // filters by due-date. For static decks, pass the deck's card list.
  const allCards: Flashcard[] = deck.pseudo
    ? FLASHCARDS
    : deck.cardIds
        .map((id) => FLASHCARDS.find((c) => c.id === id))
        .filter((c): c is Flashcard => Boolean(c));

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <nav className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
          <Link href="/" className="no-underline hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-2 w-2" aria-hidden />
          <Link href="/flashcards" className="no-underline hover:text-ink">
            Flashcards
          </Link>
          <ChevronRight className="h-2 w-2" aria-hidden />
          <span className="text-ink">{deck.title}</span>
        </nav>
        <h1 className="mb-1.5 mt-3 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          {deck.title}
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          {deck.description}
        </p>
      </header>

      <div className="px-[22px] py-6 md:mx-auto md:max-w-3xl md:px-14 md:py-10">
        <StudySession
          deckId={deck.id}
          pseudo={deck.pseudo === true}
          cards={allCards}
        />
      </div>
    </main>
  );
}
