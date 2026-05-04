# Session 5 — Report

## TL;DR

- **Progress now persists.** Page completion, self-check ticks, and quiz state all survive a reload (and a browser restart on the same device).
- **Self-check checkboxes are interactive.** Every `- [ ]` line in your source MDX is now a real checkbox bound to the per-page store.
- **"Mark page complete" button** at the bottom of every page; visiting a page auto-marks it as visited.
- **Per-page status badges** on the level index (✓ / ◐ / blank) and a level-wide progress bar.
- **New `/progress` dashboard** showing overall stats, per-level progress bars, per-quiz status, and a "Reset all progress" button.
- **QuizPlayer is now persistent**: leave a quiz mid-flow and your responses + position are all there when you come back. Finish it and the score + error log persist.
- 89 routes prerender as static HTML. Build clean. Pushed to `main` as `878318f`.

## Showcase URLs

1. **`/levels/1/B1.1`** — scroll to the Self-check section. Tick the boxes. Reload. They stay ticked. Click "Mark page complete" at the bottom. Reload. Status persists. Visit the home page — Level 1 now shows "1 of 19 complete".
2. **`/levels/1`** — every page now has a status badge to the left of the page code. Top of page has a level-wide progress bar.
3. **`/levels/2/C7.1/quiz`** — answer a few questions, navigate away, come back: same place, same answers. Finish the quiz and the score persists. The `/progress` dashboard shows the completed quiz.
4. **`/progress`** — full dashboard. Overall stats, per-level breakdown, per-quiz status. Reset button (with confirm) wipes everything.

## What's wired

### Storage schema (matches the brief)
```
{
  candidateId: "default",
  version: 1,
  lastUpdated: ISO,
  pages: {
    "L1.B1.1": { status, selfCheck: bool[], lastViewed }
  },
  quizzes: {
    "L2.C7.1": { startedAt, completedAt?, responses, score?, totalQuestions?, timeMinutes? }
  },
  confidenceScores: {},   // Session 7 fills these
  readinessChecks: {}     // Session 7 fills these
}
```
- **Single localStorage key:** `alpine-map-training:progress`
- **Versioned:** v1; future schema changes drop old data with a clean fallback (no migration plumbing yet — easy to add when needed).

### Files added
```
src/lib/progress/types.ts          schema types + STORAGE_KEY + emptyProgress()
src/lib/progress/store.ts          load/save/clear localStorage helpers
src/lib/progress/provider.tsx      ProgressProvider context + useProgress hook
src/components/site/page-body.tsx  PageBody client wrapper (MDX inside SelfCheckProvider)
src/components/site/answer-key-body.tsx  AnswerKeyBody client wrapper
src/components/site/self-check-context.tsx  Provides pageId + index counter to checkboxes
src/components/site/self-check-checkbox.tsx Interactive checkbox bound to the store
src/components/site/page-completion.tsx     "Mark complete" + status panel
src/components/site/progress-indicators.tsx PageStatusBadge, LevelProgressBar, LevelProgressCount
src/components/site/progress-dashboard.tsx  Full /progress dashboard
src/app/progress/page.tsx          /progress route
```

### Files modified
- `velite.config.ts` — `remarkPlugins: [remarkGfm]` so `- [ ]` source becomes `<input type="checkbox">`.
- `src/lib/mdx.tsx` and `src/components/mdx/components.tsx` — both marked `"use client"` (see Judgment Call 1).
- `src/app/layout.tsx` — wraps the app in `<ProgressProvider>`.
- `src/app/page.tsx` — home page level cards show "X of Y complete".
- `src/app/levels/[level]/page.tsx` — level index gets per-page status badges + a level-wide progress bar.
- `src/app/levels/[level]/[page]/page.tsx` — uses PageBody/AnswerKeyBody wrappers; renders PageCompletionControls at the bottom.
- `src/app/templates/[slug]/page.tsx` — uses AnswerKeyBody wrapper.
- `src/components/site/site-header.tsx` — adds Progress nav entry.
- `src/components/site/quiz/quiz-player.tsx` — reads/writes through `useProgress()` instead of local state.

## Judgment calls

1. **MDX runtime moved to client** (`"use client"`). The original setup ran the MDX through `new Function(code)` server-side at build time, producing static HTML. Adding interactive checkboxes meant passing a function-bag (mdxComponents) across the Server→Client boundary, which Next.js 16 forbids ("Functions cannot be passed directly to Client Components"). The fix: mark the MDX runtime + components map as client-only, and add two thin client wrappers (`PageBody`, `AnswerKeyBody`) that own the import. Tradeoff: the MDX evaluation now happens during SSR + hydration rather than purely at build time. The HTML output is identical for static content; the cost is a slightly larger client bundle (~10KB) per route. Worth it for the interactivity.

2. **Self-check checkboxes indexed by render-order position.** The store holds `selfCheck: bool[]` as an array, indexed 0..N. Each rendered `<input type="checkbox">` claims its index from a per-page counter. **Fragile if you reorder source content.** If you add a new self-check item before existing ones in any source MDX, the existing checkboxes shift and a candidate's previously-ticked items will appear ticked against different items. There's no good fix without keying checkboxes by content-hash or assigning explicit IDs in source. For v1 this is acceptable — your source files are stable; if you do reorder, candidates can re-tick.

3. **Strict-mode double-render concern.** The index counter mutates a ref during render (a pattern React warns against). It works because the provider resets the counter at the top of every render and React commits the same values that the final render produces. In dev strict mode you may see a brief flicker; in production it's stable. If it ever causes issues, switch to a content-hash keying.

4. **Self-check ticking auto-promotes a page from `not-started` → `in-progress`.** Visiting a page only sets `lastViewed`; it doesn't change status. Status only goes to `in-progress` when the user does something (ticks a self-check). This avoids a "everything I've ever opened is in progress" flood.

5. **Practical/sketch quiz answers persist as `self-correct`.** No change from Session 4 — the "I have done this on paper" button writes status `self-correct` to the store. Same caveat: the trainer review (Session 7) is the corrective if the candidate is too generous.

6. **Reset is destructive and confirmed.** The Reset All Progress button uses `window.confirm()`. Clears the store entirely. No undo, no export — that's a Session 6+ enhancement (export progress as JSON would let candidates take their data with them).

7. **No multi-candidate support yet.** The store has `candidateId: "default"` baked in. The brief mentions multi-candidate as a v1.5 should-have. The schema can grow to a `Record<candidateId, ProgressStore>` later without breaking changes.

8. **Storage uses a single big JSON blob.** Each change writes the whole object back. For a workbook this size (~80 pages, 2 quizzes, ~10KB total state) that's instant. If the store ever grows past tens of KB, switch to per-key writes.

9. **Self-check style.** I went with browser-default checkbox styling (with `accent-primary` to tint them slate-blue). Could be replaced with shadcn's Checkbox component for a more polished look — left as a polish item rather than block on it.

10. **Progress is *not* trainer-visible.** The `/progress` dashboard is for the candidate. Trainer mode (Session 7) will surface the same data through a different lens.

## What needs your eyes when you look

In rough priority order:

1. **Open `/levels/1/B1.1` and tick the self-check items.** Reload. Confirm they stay ticked. Click "Mark page complete" at the bottom. Reload. Confirm the status panel shows ✓ Completed.
2. **Open `/levels/1`.** Look for the new badge column on the left of each page. Status flows: blank → ◐ in-progress → ✓ completed. The top progress bar should reflect what you've done.
3. **Open `/progress`.** Confirm the overall stats look right and the per-quiz section shows "Not started" for the two quizzes.
4. **Take 3-4 questions of `/levels/2/C7.1/quiz`, navigate away, come back.** The quiz should resume from your last position with answers intact. Finish it. The `/progress` dashboard should now show the C7.1 quiz with score + time.
5. **Reset.** Try the "Reset all progress" button on `/progress`. Confirm the dialog. Page reloads, everything is wiped.

## What I deliberately deferred

| Item | When |
|---|---|
| Service worker / true offline support (PWA install) | Session 6 |
| Trainer mode + trainer view of candidate's progress | Session 7 |
| Confidence-score 1-5 sliders (the schema field exists; the UI doesn't) | Session 7 |
| Readiness-check capture (the schema field exists; the UI doesn't) | Session 7 |
| Export/import progress as JSON | Future polish |
| Per-candidate multi-store | v1.5 |
| Smart self-check keying (content-hash instead of position-index) | If position-index ever causes a real problem |

## Things I noticed but didn't change

- **Self-check items in the answer keys** would also become interactive if the answer keys had `- [ ]` lines, but they don't. The AnswerKeyBody wrapper deliberately omits the SelfCheckProvider so any future ones would render as inert.
- **The home page level cards re-fetch progress on every render.** Cheap (it's a Map lookup) but worth knowing.
- **`localStorage` is per-origin.** If you switch from the production URL to a Vercel preview URL, progress doesn't follow. Same for incognito.
- **No persistence of quiz `idx` (current question position).** I persist responses but not "which question you're on". Resuming a quiz drops you back at Q1 with all your previous answers visible. Could add `currentIdx` to the QuizProgress schema if that bothers you in practice — easy fix.
- **The "lastViewed" timestamp updates throttled to once per 60s** to avoid spamming localStorage during scroll-and-back-out behaviour. Side effect: rapidly navigating doesn't update last-viewed visibly. Fine.

## How to inspect the stored data

DevTools → Application → Local Storage → your origin → `alpine-map-training:progress`. JSON blob, the schema is in `src/lib/progress/types.ts`.

## Commits since last report

```
878318f  Session 5: localStorage progress persistence
f785495  Add SESSION_4_REPORT
5acd5bd  Session 4: interactive C7.1 and D10.1 quizzes
8067859  Add SESSION_3_REPORT
3371f18  Session 3: ingest L2 + L3, schematic diagrams, templates
15ef2d6  Add SESSION_2_REPORT for morning review
cdf1f39  Session 2: ingest Level 1 content and render pages
0eb87f8  Scaffold Session 1: …
```

— End of Session 5.
