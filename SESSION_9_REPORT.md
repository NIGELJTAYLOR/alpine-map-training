# Session 9 — Stage 1 report (Flashcards)

## TL;DR

**The original goal of the project ships.** 160 cards. Spaced repetition. Daily review queue. Per-deck study sessions. Persists to your existing localStorage progress store. Pushed to `main` as `d9b681e`. 98 routes prerender static.

## Showcase walkthrough (~90 seconds)

1. Visit **`/flashcards`**.
2. The blue card at the top says "X cards due" — initially this will be **160 (everything is "new" until you've studied it)**.
3. Below that, eight decks. Pick **"Level 2 — Terrain interpretation"** (55 cards).
4. You land on `/flashcards/study/l2`. The first card shows the front (a question). Click **"Show answer"** to reveal the back.
5. Four buttons appear: **Again** (red) / **Hard** (brown) / **Good** (slate) / **Easy** (green). Each tells the SM-2 scheduler what to do with the card. **Good** schedules it for the standard interval; **Again** resets it to tomorrow.
6. Card auto-advances. Progress bar at the top. After three or four cards, click **"End session"** — your ratings are persisted.
7. Visit **`/progress`** — the new "Flashcards" panel shows due / studied / total.
8. Reload the page; reload the browser; close and reopen — your schedule is intact. Tomorrow morning the daily-review count drops to whatever's actually due then.

## What's wired

### Pipeline
```
FLASHCARDS_CONTENT.md          ← source of truth (you edit this)
       │
       │  npm run flashcards:build  (or just `npm run build`)
       ▼
src/data/flashcards.generated.ts   ← typed FLASHCARDS + DECKS
       │
       │  imported by routes + components
       ▼
/flashcards + /flashcards/study/[deckId]
```

### Decks (computed from card tags at build time)

| Deck ID | Title | Card count | Source |
|---|---|---:|---|
| `review` | Daily review | dynamic | Cards due today, across everything |
| `l1` | Level 1 — Map literacy foundations | 30 | Cards tagged `L1` |
| `l2` | Level 2 — Terrain interpretation | 55 | Cards tagged `L2` (foundations + C7.1 quiz seeds) |
| `l3` | Level 3 — Mountain navigation toolkit | 65 | Cards tagged `L3` (foundations + D10.1 quiz seeds) |
| `c7-quiz` | C7.1 quiz prep | 15 | Cards with id starting `C7.1-` |
| `d10-quiz` | D10.1 quiz prep | 15 | Cards with id starting `D10.1-` |
| `cross` | Cross-cutting standards | 10 | Cards tagged `cross` |
| `all` | Everything | 160 | All cards |

### SM-2 scheduling

Standard SuperMemo SM-2 with the Anki-style 4-button mapping:

| Button | Quality | Effect |
|---|---:|---|
| **Again** | 1 | Reset repetitions to 0; next review **tomorrow**. |
| **Hard** | 3 | Correct, but small ease drop. Interval grows by ease factor. |
| **Good** | 4 | Normal recall. Interval grows by full ease factor. |
| **Easy** | 5 | Correct, ease bump. Interval grows faster than Good. |

After a few reviews per card, intervals naturally settle into days, then weeks, then months — exactly what you want for long-term retention without re-studying everything constantly.

### Storage

- Schedules live in `localStorage` under the existing progress-store key (`alpine-map-training:progress`) under a new `flashcards` slice.
- Per-card record: `{ easiness, repetitions, intervalDays, dueDate, lastReviewed?, lastQuality? }`.
- Old payloads (no `flashcards` field) hydrate cleanly to `flashcards: {}`.
- A "Reset all progress" on `/progress` wipes flashcard schedules along with everything else.

### Files added
```
scripts/build-flashcards-data.mjs           parser: MD → TS
src/data/flashcards.generated.ts            generated typed data
src/lib/flashcards/sm2.ts                   SM-2 algorithm + helpers
src/app/flashcards/page.tsx                 deck index route
src/app/flashcards/study/[deckId]/page.tsx  study session route
src/components/site/flashcards/
  flashcards-index.tsx                      deck picker UI
  study-session.tsx                         study session UI
```

### Files modified
- `src/lib/progress/types.ts` — `FlashcardSchedule` interface, new `flashcards` slice on `ProgressStore`, `emptyProgress()` initializes it.
- `src/lib/progress/store.ts` — hydrates `flashcards` from old payloads.
- `src/lib/progress/provider.tsx` — `getFlashcardSchedule`, `setFlashcardSchedule`, `resetFlashcards` setters.
- `src/components/site/site-header.tsx` — new "Flashcards" nav entry.
- `src/app/page.tsx` — Flashcards card on the home page (alongside Diagrams + Templates).
- `src/components/site/progress-dashboard.tsx` — Flashcards panel showing due / studied / total.
- `package.json` — `prebuild` runs `node scripts/build-flashcards-data.mjs` after Velite, plus `flashcards:build` and `flashcards:docx` scripts for manual runs.

## Judgment calls

1. **Generated TS, not Velite collection.** The cards are static; bundling them through Velite would round-trip JSON for no benefit. A generated TS file gets full type safety with zero runtime overhead (cards are inlined into the chunk that imports them). The downside: flashcards-content.md is now the source of truth and edits there must be re-run through `npm run flashcards:build` (or any `npm run build`) to take effect. Documented in the regen-script header and the prebuild hook makes this automatic at deploy time.
2. **Pseudo deck for daily review.** Rather than build a special "review queue" UI, I treated the daily review as just another deck — one whose cards are computed at runtime from due-dates. Same study-session component handles both fixed decks and the daily review. Less code; one mental model.
3. **Queue is fixed at session start.** Once you start studying, the card list doesn't shrink in real-time as you rate. So a mid-session deck reload doesn't surprise you with a different queue. The next session re-derives.
4. **No "new cards per day" cap.** Anki has a daily new-card limit so users don't get overwhelmed. We don't — initially everything is "new," and you can plough through as many as you want. If you find yourself wanting to drip new cards in over weeks, this is one line of code to add.
5. **No "leech" handling.** Anki demotes cards that you keep failing. We don't. Honestly, for a 160-card deck where the user knows the material from working through the workbook, leech behaviour is unlikely to matter.
6. **Markdown rendering inside cards.** Card front/back are rendered through the same `MarkdownString` component the quiz uses, with GFM enabled. So `**bold**`, lists, and tables in card backs (e.g. the magnetic-interference card with its 4-row table, or the route-card-fields card with its 11-item list) render correctly.
7. **No card images yet.** The current card model is text-only. Adding images per card would be a `imageUrl` field on `Flashcard` plus rendering — fits naturally into Stage 4 (content enrichment) when we have real imagery sourced.
8. **No reverse cards.** Some flashcard tools generate a "back-to-front" card automatically (e.g. given the answer, recall the question). Useful for vocabulary; less useful for procedural / explanatory cards like ours. Skipped for v1.
9. **Card ordering inside a deck is source order.** No shuffle. Predictable for now; easy to add a shuffle toggle later if you want.
10. **Deck metadata is hardcoded** in the build script. Adding a new deck definition (e.g. "Compass-only", "Decision-making") needs an edit to `scripts/build-flashcards-data.mjs`. Acceptable for now — the eight decks cover the obvious slices.

## What needs your eyes when you look

In rough priority:

1. **Take a 5-minute study session** on `/flashcards/study/l2` (or whichever level you'd review first). Rate ~5 cards across the four buttons. Confirm the flow feels right.
2. **Reload mid-session** — the card you're on resets to the start of the queue (for now, by design — see judgment call 3). Confirm your ratings before the reload have persisted by checking `/progress`.
3. **Open `/progress`** — confirm the Flashcards panel shows the cards you've rated.
4. **Edit the source markdown** — try changing the `Back:` of one card in `FLASHCARDS_CONTENT.md`, run `npm run flashcards:build` (or just `npm run build`), and confirm the change appears in `src/data/flashcards.generated.ts` and on `/flashcards/study/...`.
5. **End-of-session card** — finish a deck (or finish the daily review when it's empty) and confirm the completion card looks right.

## Known limitations / open polish items

| Item | Severity | When to address |
|---|---|---|
| Card UI is all the same colour scheme — would benefit from per-deck colour cues | Low | Stage 3 (visual rebuild) |
| No flip animation; back appears below front instead of replacing it | Low | Stage 3 — could add a real flip with `prefers-reduced-motion` respect |
| No "How long since last review" hint on the per-card UI | Low | Could add `dueHint(sched)` display next to the card title |
| No way to "study a deck without saving" (peek mode) | Low | Optional URL flag like `?peek=1` |
| No keyboard shortcuts for the rating buttons | Medium | Easy add: `1` → Again, `2` → Hard, `3` → Good, `4` → Easy |
| New cards aren't dripped in (everything is "new" until rated) | Medium | One-line config when desired |
| Daily review doesn't shuffle — reviews in card-id order | Low | Add shuffle when desired |

## Workflow summary

| Task | Command |
|---|---|
| Re-generate the TS data file from the markdown | `npm run flashcards:build` |
| Re-generate the .docx review copy | `npm run flashcards:docx` |
| Local dev | `npm run dev` (predev runs both Velite + flashcards build) |
| Production build | `npm run build` (prebuild runs both) |

## Commits since last report

```
d9b681e  Stage 1: flashcards feature with SM-2 spaced repetition
73ad8d5  Draft 160-card flashcard deck for Stage 1 review
a79522e  Switch MC quiz options to native radio inputs
a10523a  Add SESSION_8_REPORT — v1.0 release notes
1c8f675  Session 8: a11y audit, print stylesheet, v1.0 polish
…earlier sessions in their respective reports.
```

Pushed cleanly to `origin/main`. Vercel auto-deploy will produce the
new flashcards routes within ~90 seconds.

## What's next

Per the agreed roadmap:

- **Stage 2 — Brand direction via Claude Design** (your time): I'll draft a self-contained prompt for you to paste into [claude.ai/design](https://claude.ai/design). You generate 2-3 brand directions, pick one, export the chosen direction as HTML, share back.
- **Stage 3 — Implement chosen design in code** (~8-10 hrs): apply tokens, rebuild home, decorative motifs, etc.
- **Stage 4 — Content enrichment**: imagery, OpenTopoMap extracts, glossary, see-also panels.
- **Stage 5 — Smoke test + ship v1.5** with `SESSION_10_REPORT.md`.

When you're ready, say "draft the Claude Design prompt" and I'll produce that brief next.

— End of Stage 1.
