# Smoke test checklist

Run before any deploy you actually trust. ~5 minutes for the core flow,
~15 minutes for the full pass.

## Pre-flight (local)

- [ ] `npm run build` exits 0
- [ ] No TypeScript errors in build output
- [ ] No new "Failed to fetch" or unexpected `console.error` lines

## Core flow (production deploy or `npm start` after a build)

### Navigation
- [ ] Home `/` loads. "Start Level 1" button visible. Per-level cards show "X of Y complete".
- [ ] Header nav covers Level 1 / 2 / 3 / Diagrams / Templates / Progress / Settings.
- [ ] Tabbing through the header reaches every link in order; focus ring is visible.
- [ ] Active page in the header has the muted-grey background and `aria-current="page"`.

### Reading a workbook page
- [ ] `/levels/1/B1.1` renders the title, learning aim card, and full body.
- [ ] Self-check checkboxes accept clicks and persist on reload.
- [ ] "Mark page complete" toggles status; reload preserves it.
- [ ] Diagrams (e.g. `/levels/2/C2.1` — actual workbook title is "Hills and Summits") render inline below the body.
- [ ] Linked templates (e.g. `/levels/3/D9.2`) appear as a card linking to `/templates/...`.
- [ ] Answer-key toggle reveals the answer key with no scroll jump.

### Quizzes
- [ ] `/levels/2/C7.1/quiz` opens with question 1 of 15.
- [ ] Numeric question (Q1) — typing 8 + 80 then "Submit answer" shows green correct.
- [ ] MC question (Q2) — picking the right option, then submit, shows green correct.
- [ ] Self-mark question (Q3) — typing anything, then "Show model answer & self-mark", reveals the model answer; the three self-mark buttons set status.
- [ ] Skip preserves "skipped" status in the score summary.
- [ ] Finishing the quiz shows the score / per-skill / error log card.
- [ ] Confidence-rating section appears in the score summary; selecting values persists.
- [ ] Reload mid-quiz returns you with answers intact (state persists).
- [ ] "Restart quiz" wipes responses and goes back to Q1.

### Trainer mode
- [ ] `/settings` toggle slides ON. Header shows "Trainer" pill.
- [ ] Open any page with an answer key — answer key is auto-expanded with the brown accent; "Hide" button is disabled with explanatory label.
- [ ] Trainer-notes panel appears below; first bundle expanded.
- [ ] Toggle OFF — answer key collapses, trainer panel hides, header pill disappears.

### Readiness
- [ ] `/levels/2/C7.2` near the bottom — readiness panel with three options + notes.
- [ ] Selecting an option updates state; notes save on blur.
- [ ] `/progress` shows the readiness check with status pill + notes.

### Progress dashboard
- [ ] `/progress` shows overall progress bar, per-level breakdowns, per-quiz status.
- [ ] If you've taken the C7.1 quiz, confidence ratings section appears.
- [ ] If you've set readiness, readiness section appears.
- [ ] "Reset all progress" pops a confirm dialog; on confirm, all state wipes.

### Diagrams + templates
- [ ] `/diagrams` shows all 20 diagrams grouped by level. Page-ref backlinks work.
- [ ] `/templates` lists 9 templates. Each links to a per-template view that renders the form.

### Glossary (new in v1.5)
- [ ] `/glossary` shows the alphabet jump strip plus 50+ terms grouped by initial letter.
- [ ] Each term shows level pills (L1/L2/L3); cross-references link to other terms.
- [ ] Header nav has a "Glossary" link, highlighted when active.

### About (new in v1.5)
- [ ] `/about` opens with a contour-line backdrop and the "A workbook, a conversation, a working app." headline.
- [ ] Lists 11 sessions; links to performos.ai, mailto Hello@performos.ai, and the GitHub repo.

### Quiz map extracts (new in v1.5)
- [ ] `/levels/2/C7.1/quiz` shows an OpenTopoMap extract above the QuizPlayer with three coloured marker dots (Q1 crimson, Q2 ink, Q3 moss) and a legend.
- [ ] `/levels/3/D10.1/quiz` shows its extract with Q4 + F1 + F2 markers.
- [ ] `/levels/2/C7.2` shows the A → B → C → D walk with a route line drawn between markers.
- [ ] `/levels/3/D10.2` shows the multi-leg tour with Start / DP1 / DP2 / DP3 / End markers + line.
- [ ] Each map carries the OpenStreetMap + OpenTopoMap CC-BY-SA attribution.

### See-also panels (new in v1.5)
- [ ] Bottom of `/levels/2/C2.1` (or any page with diagrams) — a "See also" card with related diagrams + flashcards in two columns.

### PerformOS branding (new in v1.5)
- [ ] Header byline shows the PerformOS SVG wordmark, not the typed-out "BY PERFORMOS" text.
- [ ] Browser tab favicon is the PerformOS icon.
- [ ] Re-installing the PWA shows the PerformOS icon on the home screen (not the placeholder slate triangle).

## Accessibility (5 mins)

- [ ] Skip-to-content link appears when you press Tab on a fresh page load.
- [ ] Activating it lands focus on `<main id="main-content">`.
- [ ] Native browser zoom to 200% — content stays readable, no horizontal scroll on mobile widths.
- [ ] Keyboard-only navigation through quiz inputs works — radio groups via arrow keys, buttons via Enter/Space.
- [ ] Self-check checkboxes have visible focus rings and an `aria-label`.
- [ ] OS reduced-motion preference (Settings → Accessibility) eliminates the progress-bar fill animation and other transitions.
- [ ] Screen reader announces the offline indicator (turn on Wi-Fi off; the polite live-region announcement should fire).

## PWA + offline (mobile-friendly, 5 mins)

- [ ] On Chrome/Edge desktop or Android: install banner appears within 5s.
- [ ] Install — the app opens standalone; theme colour is cream paper (Carta).
- [ ] Browse 3 pages while online.
- [ ] Turn on Airplane Mode — already-visited pages still load; a never-visited page routes to `/~offline`.
- [ ] Red "Offline" pill appears at the top.
- [ ] Reconnecting hides the pill within ~1s.

## Print

- [ ] Browser print dialog (`Ctrl/Cmd+P`) on `/levels/1/B1.1` — page chrome (header, install prompt, completion controls) hidden; content is left.
- [ ] Headings don't break across pages awkwardly.
- [ ] `/templates/route-card-compact-format` prints as a usable form.
- [ ] Trainer mode ON before printing → answer keys included in print.

## After-test cleanup

- [ ] If you reset progress as part of testing, restore your real progress (or accept the wipe).
- [ ] If you toggled trainer mode for a candidate device, toggle it back off.
