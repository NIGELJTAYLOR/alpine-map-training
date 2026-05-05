import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
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
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-8 sm:py-10 focus:outline-none"
      >
        <nav className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link href="/flashcards" className="hover:text-foreground">
            Flashcards
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground">{deck.title}</span>
        </nav>

        <header className="mt-4 mb-6">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {deck.title}
          </h1>
          <p className="mt-2 font-serif text-base leading-relaxed text-muted-foreground">
            {deck.description}
          </p>
        </header>

        <StudySession deckId={deck.id} pseudo={deck.pseudo === true} cards={allCards} />
      </main>
    </>
  );
}
