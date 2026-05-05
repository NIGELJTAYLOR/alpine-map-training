/**
 * Parse FLASHCARDS_CONTENT.md and emit src/data/flashcards.generated.ts.
 *
 * Run:  node scripts/build-flashcards-data.mjs
 *
 * Each `### CardId — Title` block in the markdown becomes a Card record.
 * Cards are grouped into Decks by their primary tag (L1 / L2 / L3 / cross,
 * with the C7.1 + D10.1 quiz auto-seeds also surfaced as their own decks).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const SOURCE = path.join(PROJECT_ROOT, "FLASHCARDS_CONTENT.md");
const TARGET = path.join(PROJECT_ROOT, "src", "data", "flashcards.generated.ts");

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

async function parseMarkdown() {
  const md = await fs.readFile(SOURCE, "utf8");
  const lines = md.split(/\r?\n/);
  const cards = [];
  let current = null;
  let currentField = null;
  let buffer = [];

  function flushField() {
    if (current && currentField && buffer.length > 0) {
      const value = buffer.join("\n").trim();
      if (currentField === "front") current.front = value;
      else if (currentField === "back") current.back = value;
      else if (currentField === "tags") current.tags = parseTags(value);
    }
    buffer = [];
    currentField = null;
  }

  function flushCard() {
    flushField();
    if (current && current.id && current.front && current.back) {
      cards.push(current);
    }
    current = null;
  }

  for (const raw of lines) {
    const line = raw;

    // New card heading
    const cardMatch = line.match(/^### ([\w.\-]+)\s+—\s+(.+)$/);
    if (cardMatch) {
      flushCard();
      current = {
        id: cardMatch[1].trim(),
        title: cardMatch[2].trim(),
        front: "",
        back: "",
        tags: [],
      };
      continue;
    }

    // Section heading or other H2 — close any open card
    if (line.startsWith("## ") || line.startsWith("# ")) {
      flushCard();
      continue;
    }

    if (!current) continue;

    // Field line — `- **Front:** body` (and similar)
    const fieldMatch = line.match(/^- \*\*([^*:]+):\*\*\s*(.*)$/);
    if (fieldMatch) {
      flushField();
      const fieldName = fieldMatch[1].trim().toLowerCase();
      currentField = fieldName === "front" ? "front" : fieldName === "back" ? "back" : fieldName === "tags" ? "tags" : null;
      if (currentField) buffer.push(fieldMatch[2]);
      continue;
    }

    // Continuation line (sub-bullet or indented text under a field)
    if (currentField && (line.startsWith("  ") || line.startsWith("\t"))) {
      buffer.push(line.replace(/^( {2}|\t)/, ""));
      continue;
    }

    // Blank line inside a card resets nothing — just gets included as
    // separator in the field value.
    if (line.trim() === "" && currentField) {
      buffer.push("");
      continue;
    }
  }

  flushCard();
  return cards;
}

function parseTags(text) {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Deck assembly
// ---------------------------------------------------------------------------

const DECK_DEFS = [
  {
    id: "all",
    title: "Everything",
    description: "All 160 cards across all levels.",
    filter: () => true,
    primary: false,
  },
  {
    id: "review",
    title: "Daily review",
    description: "Cards that are due today, across every deck. Build it up by studying the focused decks first.",
    filter: () => false, // populated at runtime from due dates
    primary: true,
    pseudo: true,
  },
  {
    id: "l1",
    title: "Level 1 — Map literacy foundations",
    description: "Map basics, anatomy, colours, scale, grid, orientation.",
    filter: (card) => card.tags.includes("L1"),
    primary: true,
  },
  {
    id: "l2",
    title: "Level 2 — Terrain interpretation",
    description: "Contour fundamentals, feature recognition, advanced features, aspect, route choice.",
    filter: (card) => card.tags.includes("L2"),
    primary: true,
  },
  {
    id: "l3",
    title: "Level 3 — Mountain navigation toolkit",
    description: "Compass, bearings, accuracy, altimeter, barometer, combined techniques, route cards.",
    filter: (card) => card.tags.includes("L3"),
    primary: true,
  },
  {
    id: "c7-quiz",
    title: "C7.1 quiz prep",
    description: "Just the 15 mixed-contour quiz cards.",
    filter: (card) => card.id.startsWith("C7.1-"),
    primary: false,
  },
  {
    id: "d10-quiz",
    title: "D10.1 quiz prep",
    description: "Just the 15 Level 3 mixed-quiz cards.",
    filter: (card) => card.id.startsWith("D10.1-"),
    primary: false,
  },
  {
    id: "cross",
    title: "Cross-cutting standards & vocabulary",
    description: "IMS terminology, recycling vs progressing, error-log philosophy.",
    filter: (card) => card.tags.includes("cross"),
    primary: false,
  },
];

function assembleDecks(cards) {
  return DECK_DEFS.map((def) => {
    if (def.pseudo) {
      // Pseudo deck has no static cardIds — populated client-side from due dates.
      return {
        id: def.id,
        title: def.title,
        description: def.description,
        primary: def.primary,
        pseudo: true,
        cardIds: [],
      };
    }
    const cardIds = cards.filter(def.filter).map((c) => c.id);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      primary: def.primary,
      cardIds,
    };
  });
}

// ---------------------------------------------------------------------------
// Emit TS
// ---------------------------------------------------------------------------

function emitTs(cards, decks) {
  const cardsLiteral = JSON.stringify(cards, null, 2);
  const decksLiteral = JSON.stringify(decks, null, 2);

  return `// AUTO-GENERATED by scripts/build-flashcards-data.mjs.
// Edit FLASHCARDS_CONTENT.md and re-run \`node scripts/build-flashcards-data.mjs\`.

export interface Flashcard {
  id: string;
  title: string;
  front: string;
  back: string;
  tags: string[];
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  primary: boolean;
  pseudo?: boolean;
  cardIds: string[];
}

export const FLASHCARDS: Flashcard[] = ${cardsLiteral};

export const DECKS: Deck[] = ${decksLiteral};

export function getCard(id: string): Flashcard | undefined {
  return FLASHCARDS.find((c) => c.id === id);
}

export function getDeck(id: string): Deck | undefined {
  return DECKS.find((d) => d.id === id);
}

export function getCardsForDeck(id: string): Flashcard[] {
  const deck = getDeck(id);
  if (!deck) return [];
  return deck.cardIds.map((cid) => getCard(cid)).filter((c): c is Flashcard => Boolean(c));
}
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const cards = await parseMarkdown();
  const decks = assembleDecks(cards);
  const ts = emitTs(cards, decks);
  await fs.mkdir(path.dirname(TARGET), { recursive: true });
  await fs.writeFile(TARGET, ts, "utf8");
  console.log(`Wrote ${TARGET}`);
  console.log(`  ${cards.length} cards`);
  for (const d of decks) {
    if (d.pseudo) continue;
    console.log(`  deck "${d.id}": ${d.cardIds.length} cards`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
