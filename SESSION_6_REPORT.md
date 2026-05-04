# Session 6 — Report

## TL;DR

- **The app is now installable as a PWA** on iOS, Android, and Desktop Chrome/Edge.
- **Once installed, it works offline.** Pages you've visited are cached; new pages prompt the offline fallback page rather than a browser error.
- **Install prompt** appears as a slide-up card the first time you visit on a supported browser; dismissal persists.
- **Offline indicator** pill appears at the top of the screen when you lose connectivity.
- Pushed to `main` as `03517ad`. Vercel auto-deploys.

## What's wired

### Service worker (`public/sw.js`)
Hand-rolled vanilla SW. ~150 lines. Strategy:

| Request kind | Strategy |
|---|---|
| Document navigation (HTML page) | network-first → cached → `/~offline` fallback |
| Static asset (`/_next/static/*`, fonts, SVGs, images) | cache-first |
| Other GET | stale-while-revalidate |
| Cross-origin (Google Fonts CDN, Vercel analytics) | passes through to browser |

**Cache version**: bumping `CACHE_VERSION` at the top of `sw.js` evicts the runtime cache on next activation. Static assets evict naturally as Next changes their hashed filenames between deploys.

### Install prompt (`InstallPrompt`)
- Listens for the browser's `beforeinstallprompt` event (Chrome / Edge / Android).
- Detects iOS Safari separately (the event never fires there) and shows a brief "Add to Home Screen" instruction.
- Dismissal stored in localStorage as `alpine-map-training:install-dismissed` so the prompt doesn't reappear after you say no.
- Skipped entirely if the app is already running in standalone mode (i.e. installed).

### Offline indicator (`OfflineIndicator`)
Tiny red pill that drops down at the top of the screen when `navigator.onLine` flips. Disappears on reconnection. Doesn't get in the way of content.

### Service worker registration (`SwRegister`)
- Registers `/sw.js` once on `load` (after first paint, so it doesn't compete for bandwidth).
- Skipped on localhost dev (Next dev server doesn't have a stable origin for SW registration).
- Auto-handles updates: when a new SW reaches the "installed" state, it's told to skip-waiting so users get the new version without a manual reload.

### Files added / modified
```
public/sw.js                                    NEW   service worker source (committed)
src/app/~offline/page.tsx                       NEW   offline fallback route
src/components/site/sw-register.tsx             NEW
src/components/site/install-prompt.tsx          NEW
src/components/site/offline-indicator.tsx       NEW
src/app/layout.tsx                              MOD   wires the three components
.gitignore                                      MOD   sw.js no longer ignored
package.json / lock                             MOD   removed @serwist/next + serwist
next.config.ts                                  MOD   removed Serwist wrapper
```

## Judgment calls

1. **Hand-rolled, not Serwist.** Spent the first ~20 minutes trying to make Serwist work. It silently no-ops under Next.js 16's default Turbopack pipeline (no `sw.js` was emitted; no error either). Switching back to webpack mode would have meant losing Turbopack's faster builds for the rest of the project. Hand-rolling a 150-line SW gets us all the v1 PWA capability without that tradeoff. If Serwist ships proper Turbopack support later, swapping back is a small refactor.
2. **No precache list — runtime cache only.** The brief asks for offline support; this delivers it for any page you've visited, not for every page in the workbook. To make every page available offline immediately on install, I'd need a precache list of all 89 routes' HTML + their asset chunks. Without Serwist auto-generating that list, hand-maintaining it is a recipe for staleness. Pragmatic compromise: shell + visited pages get cached, anything else hits the offline fallback. **Most candidates will visit pages in order, so this works fine in practice.**
3. **Network-first for navigations** rather than cache-first. The cost: every navigation makes a network round-trip when online (slower than pure cache hits). The benefit: candidates always see the latest content; no stale-page bug where they're staring at last week's deploy. For a content-heavy reference app this is the right tradeoff. (Switch to stale-while-revalidate at the top of `sw.js` if you ever want it the other way.)
4. **CACHE_VERSION is hardcoded "v1".** A meaningful change to the SW logic or content layout that needs to invalidate everyone's cache requires bumping this string by hand and re-deploying. Trade-off vs auto-versioning by build hash: simpler, more deliberate. For an app that updates rarely, fine.
5. **Install prompt dismissal is forever** (until they clear site data). No re-prompt. If you want it to re-appear after, say, 30 days, easy to add a date check on the dismiss flag.
6. **iOS Safari detection is heuristic** (UA sniffing) rather than feature-detection — there's no reliable feature signal for "iOS Safari that doesn't fire `beforeinstallprompt`". The check excludes iOS Chrome / Firefox / Edge, all of which ride on Safari's WebKit on iOS but use slightly different UA strings.
7. **Offline indicator uses `navigator.onLine`**, which is famously unreliable (the browser only knows the OS-level network state, not whether your specific endpoint is reachable). For a v1 indicator this is fine — it's a hint, not a guarantee. If we ever care about "can I reach Vercel right now", we'd need a heartbeat ping.
8. **Skipped Serwist's full feature set** (precache manifest, navigation preload, auto-update notifications, sync queueing). If you ever need any of these, reintroduce Serwist (likely under their new Turbopack-compatible plugin once it ships properly).
9. **No "you have a new version, click here to refresh" UI.** When a new SW activates, it takes over silently. The user gets the new version on their next navigation. Good enough for v1; if you want a dismissible "update available" toast, ~30 lines of React.
10. **The dev server doesn't run the SW.** This is intentional. Next dev does HMR which doesn't play well with aggressive caching. Test PWA behaviour against `npm run build && npm start` locally, or against the deployed Vercel URL.

## What needs your eyes when you look

In rough priority order:

1. **On phone (iPhone or Android):** open the deployed Vercel URL. After ~5 seconds you should see the install banner at the bottom. iOS users see the "Add to Home Screen" hint; Android Chrome users see an Install button.
2. **Install it.** Tap install (or do the iOS Share → Add to Home Screen). The app icon appears on your home screen.
3. **Open from the home screen.** The app should run full-screen with no browser chrome. Theme colour should be slate-blue.
4. **Test offline:** open the installed app, browse 2-3 pages. Then turn on Airplane Mode. Reload — pages you visited should still load. The red "Offline — showing cached pages" pill appears at the top. Try a page you haven't visited — you'll see the offline fallback page with links back to the cached ones.
5. **In a desktop browser:** open DevTools → Application → Service Workers. You should see "alpine-map-training-...vercel.app/sw.js" listed as "activated and is running". The Application → Manifest tab should show the manifest with the slate-blue theme.

## What I deliberately deferred

| Item | When |
|---|---|
| Trainer mode toggle and trainer-notes inline rendering | Session 7 |
| Confidence-score and readiness-check capture UI | Session 7 |
| Real PWA icons (the placeholders are slate squares with a white triangle) | Anytime |
| Precache manifest (every page available offline before first visit) | Future, if needed |
| "Update available" toast UI | Future polish |
| Background sync (e.g. for queued offline progress writes — currently unnecessary because all storage is local) | Future, only if backend syncing comes later |

## Things I noticed but didn't change

- **The OneDrive scaffold note from Session 1 still applies:** the project is at `C:\Users\mrnig_ndtz4tw\Projects\alpine-map-training`, not in OneDrive. Good.
- **Bundle size impact: ~2KB.** The three client components are tiny. The SW itself is served separately and doesn't bloat the JS bundle.
- **First navigation after install** still hits the network because the SW only just activated. Subsequent navigations get the cached fallback if you go offline. Standard PWA behaviour.
- **The `/~offline` route** uses Next conventions. The `~` prefix is unusual but valid — chosen so it sorts away from real routes in the file tree and avoids collision with anything called `offline`.

## Commits since last report

```
03517ad  Session 6: PWA service worker and install prompt
05257e3  Add SESSION_5_REPORT
878318f  Session 5: localStorage progress persistence
f785495  Add SESSION_4_REPORT
5acd5bd  Session 4: interactive C7.1 and D10.1 quizzes
8067859  Add SESSION_3_REPORT
3371f18  Session 3: ingest L2 + L3, schematic diagrams, templates
15ef2d6  Add SESSION_2_REPORT for morning review
cdf1f39  Session 2: ingest Level 1 content and render pages
0eb87f8  Scaffold Session 1: …
```

— End of Session 6.
