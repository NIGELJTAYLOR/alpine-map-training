# Session 4 — Report

Pre-approved continuation from Session 3.

## TL;DR

- **C7.1 and D10.1 are now interactive quizzes.** 15 questions each, mixed-type, with auto-graded numeric/multiple-choice answers and self-marked open-text answers against a model answer.
- **Final score page** for each quiz shows total score, per-skill breakdown, and an auto-generated error log linking back to the page to revisit for each wrong/skipped question.
- **CTA on the static pages** at `/levels/2/C7.1` and `/levels/3/D10.1` invites the user into the interactive version. The static MDX-rendered version is still there as a reference / for trainer-led marking.
- Build clean. 87 routes (was 85) — the two new quiz routes are added at `/levels/2/C7.1/quiz` and `/levels/3/D10.1/quiz`.
- Pushed to `main` as `5acd5bd`.

## Showcase URL

`/levels/2/C7.1/quiz` — work through the 15-question Level 2 mixed contour quiz. You'll see:
- A progress bar at the top.
- One question per card with a typed input area.
- Submit gives instant feedback for auto-graded questions (numeric and multiple-choice) — green correct or red incorrect with an explanation.
- Open-text questions reveal a model answer card after you click "Show model answer & self-mark", with three buttons: Correct, Partially correct, Incorrect.
- Sketch tasks (Q7, Q14) show a "What good looks like" panel and a "I have done this on paper" / "Skip for now" pair.
- Finishing produces a score summary with a per-skill breakdown and an error log table.

## What's wired

### Quiz collection
- `content/quizzes/L2.C7.1.json` — Level 2 quiz, 15 questions, 6 skill areas
- `content/quizzes/L3.D10.1.json` — Level 3 quiz, 15 questions, 7 skill areas
- Velite loads + validates them through a typed `Quiz` schema in `velite.config.ts`.

### Question types
| Type | What you do | How it scores |
|---|---|---|
| `numeric` | Type one or more numbers | Auto-graded — exact match, optional tolerance per input |
| `mc` | Pick one option | Auto-graded — exact match against `correct` index |
| `self-mark` | Type free-form, see model answer, self-mark | Self-mark gives 1 (correct) / 0.5 (partial) / 0 (incorrect) |
| `practical` | Sketch task or field drill — confirm done on paper | Marks self-correct if confirmed, skipped otherwise |

### Components
```
src/components/site/quiz/markdown.tsx     ← inline ReactMarkdown for question prompts
src/components/site/quiz/quiz-player.tsx  ← QuizPlayer + QuestionCard + 4 input types + Feedback + ScoreSummary
src/app/levels/[level]/[page]/quiz/page.tsx ← the route
```

State is fully transient (`useState` only). Reload = restart. Persistence is **Session 5** explicit work.

### CTA on the static pages
The static MDX rendering of C7.1 and D10.1 still exists at `/levels/2/C7.1` (rendering the original prose, the answer-key toggle, etc.). At the top of the body, a primary-coloured callout links to the interactive `quiz` sub-route. The static page is still useful for trainer-led marking and as a printable reference; the interactive quiz is for self-paced study.

## Judgment calls

1. **Hand-authored JSON, not parser-extracted.** I considered extracting question structure from the source markdown algorithmically. Decided against — the prose mixes prompt with answer-key shape with marking guidance in inconsistent ways; auto-extracting would either be brittle or require so much per-question logic it's no faster than just typing the JSON. Tradeoff: the JSON is now the source of truth for the interactive version. If you change the source markdown for C7.1/D10.1, the JSON won't auto-update — you'll need to edit it too. For 30 questions across 2 quizzes, manageable.
2. **Two grading modes mixed in one score.** Auto-graded questions give 1/0; self-marked give 1/0.5/0. I sum them into a single score. Means a 12/15 is a mix of "I got 8 numerical/MC right and self-marked 4 open-text correct". Might want to show the breakdown more prominently — currently it shows in the summary header ("8 auto-graded correct · 4 self-marked correct · 0 partial · 2 incorrect · 1 skipped").
3. **Model answers are written from your answer-key sources verbatim where they're definitive,** and lightly paraphrased + extended where the source said "accept any of..." or "a strong answer captures...". I kept your specific coaching notes ("if the learner answers X, recycle Y" → reframed as "If you answered X, the rule has slipped — recycle Y").
4. **Sketch tasks (Q7 and Q14 of C7.1)** give a "What good looks like" panel rather than a model answer. The user clicks "I have done this on paper" or "Skip for now". The done button currently auto-grades as self-correct (full point); skip auto-grades as skipped (zero). No way to downgrade a sketch to "partial" mid-flow — small UX gap. Easy to fix in Session 5 if desired.
5. **No timer.** The brief calls for "C7.1 and D10.1 quizzes interactive with submit, scoring, error log generation" — I note the elapsed minutes in the final summary but there's no countdown or per-question timer. The source workbook explicitly says "comfortable pace, not graded for speed", so I left a soft elapsed-time display rather than a stopwatch.
6. **Confidence score table from the source is NOT in the interactive quiz.** The source has a "Confidence score (1-5 per skill area)" table after the questions. The interactive flow shows a per-skill score breakdown derived from the actual question performance instead — more concrete than self-rated confidence. The original confidence table is still on the static page if you want both.
7. **Error log is auto-generated, not user-edited.** The source has a blank table for the trainer + candidate to fill in collaboratively ("Question #, Skill area, Page to revisit, What to do before C7.2"). My version derives Question / Skill area / Page to revisit / Status from the responses and the quiz definition. The "What to do" column is missing — that's a Session 5 addition (probably an editable text field per row that persists to localStorage).
8. **Numeric tolerance defaults to 0** (exact match). Q1 (crossings = 8) and Q4 (magnetic bearing = 180) are the kinds of questions where being off by 1 is genuinely wrong. If you want forgiveness on any specific question, add `"tolerance": 1` to that input in the JSON.
9. **The level-3 trainer answer key for Q14** lists 11 route card fields. I auto-marked it as `self-mark` rather than `text` (with all 11 expected) because users are unlikely to type them all in the exact order — self-mark against the model is less frustrating.

## What needs your eyes when you look

In rough priority order:

1. **Take the C7.1 quiz** at `/levels/2/C7.1/quiz`. Work through 5-6 questions to get the feel of the flow. Things to evaluate:
   - Does the prompt rendering look right (especially Q12 with bold bits and Q11 which is a self-mark)?
   - Do the model answers match what you'd actually want a candidate to see?
   - Does the final summary card (after finishing) feel useful, or too thin?
2. **Take the D10.1 quiz** at `/levels/3/D10.1/quiz`. Mostly numeric and definitive-answer questions — the auto-grading does more of the work here. Spot-check 2 or 3 model answers for accuracy.
3. **Open `/levels/2/C7.1`** (static page). Confirm the "Take the interactive quiz" callout looks right at the top, doesn't get in the way of the prose.
4. **Open the score summary** by finishing a quiz with a couple wrong answers + a couple skipped. Check that the error log table makes sense and the "back to page" links actually go to the right pages.

## What I deliberately deferred

| Item | When |
|---|---|
| localStorage persistence (so the score and error log survive a reload) | Session 5 |
| Per-page exercise inputs across the rest of the workbook (every Exercise N becomes interactive) | Session 5 |
| Self-check checklist persistence | Session 5 |
| Confidence-score tables (separate from auto-derived per-skill performance) | Session 5 |
| Timer / countdown | Out of scope per the brief |
| Editable "What to do" column on the error log | Session 5 |
| Trainer view of a candidate's quiz attempt | Session 7 |

## Things I noticed but didn't change

- **Practical questions** that get marked "I have done this on paper" auto-grade as self-correct. That's the most charitable interpretation. If a candidate is dishonest with themselves, the score won't reflect it. The trainer review (Session 7) is the corrective.
- **The static C7.1 page also includes C7.2** content (the virtual terrain walk). C7.2 is not a quiz — it's an in-session structured narration. I haven't built an interactive version because it makes more sense as a guided trainer-led activity (Session 7). Same applies to D10.2.
- **react-markdown bundle size.** Adds ~25KB minified+gzipped to the quiz route. Acceptable for an interactive route; not loaded on the rest of the site (it's only imported by the quiz components, which are client-only).

## How to add or edit a quiz question

Just edit `content/quizzes/L<level>.<page>.json`:
- For numeric: add `{"type": "numeric", "inputs": [{"label": "...", "expected": 8, "tolerance": 0}]}`
- For multiple choice: `{"type": "mc", "options": ["A", "B", "C"], "correct": 1}` (correct is the index)
- For open: `{"type": "self-mark", "modelAnswer": "Markdown string here..."}`
- For sketch / drill: `{"type": "practical", "expectations": "What good looks like..."}`

Then `npx velite` (or `npm run build`) — the schema validation will tell you if the JSON shape is wrong.

## Commits since last report

```
5acd5bd  Session 4: interactive C7.1 and D10.1 quizzes
8067859  Add SESSION_3_REPORT
3371f18  Session 3: ingest L2 + L3, schematic diagrams, templates
15ef2d6  Add SESSION_2_REPORT for morning review
cdf1f39  Session 2: ingest Level 1 content and render pages
0eb87f8  Scaffold Session 1: ...
```

Pushed cleanly to `origin/main`. Vercel auto-deploy should produce a fresh URL within ~2 minutes.

— End of Session 4.
