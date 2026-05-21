<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dev server command

Nigel checks every change on his mobile phone alongside the laptop. Whenever you tell him to run the dev server, ALWAYS use the LAN-accessible form:

```
npm run dev -- --hostname 0.0.0.0
```

Never tell him `npm run dev` on its own. He'll then reach it from the phone at `http://<laptop-ip>:3000/`, finding the IP via `ipconfig` on Windows. If Windows Firewall blocks the connection on first run, approving node.exe for private networks fixes it.

Next.js 15+ blocks cross-origin requests to dev resources (HMR socket, fonts) when the request comes from an IP that is not in `allowedDevOrigins`. The project's `next.config.ts` already whitelists `192.168.0.*`, `192.168.1.*`, and `10.0.0.*` to cover common home/office subnets. If Nigel's network uses a different subnet, add it there.

# Versioning convention

The app sits in the **V1.x.0** series for the life of this release line. Nigel's rule:

- Each meaningful iteration bumps the **middle digit**: V1.2.0, V1.3.0, V1.4.0, and so on.
- The third digit stays at `0` for normal iterations. Use `V1.x.1` etc. only for a quick patch within an iteration (a hotfix).
- Do **not** suggest bumping to V2.0.0 unilaterally. The move from V1 to V2 is a joint decision; wait for Nigel to indicate it.

The version is read from `package.json`'s `version` field and surfaced in the sidebar via `BRAND.version` in `src/config/brand.ts`. Bumping `package.json` is the only step needed.

# Voice strategy (deferred build, V1.4+ candidate)

A future iteration adds a Mock Examiner feature: voice-led, structured oral exam questioning mirroring the BASI L4 ISTD verbal component. The candidate speaks; an AI examiner asks questions, listens, hands the answer to Claude for grading, reads the grade back, runs Socratic follow-ups, then asks Claude to produce a written debrief that is appended to the page.

## Decisions taken

- **Free tier first.** Voice features will be free at launch with backend cost monitoring. Paid tiers may follow once real cost data exists.
- **Two voices, both British English.** Male and female, selectable in preferences. No accent menu; keep onboarding simple.
- **Gated by lesson completion.** The Mock Examiner is locked until the candidate has completed N lessons (N TBD). Stops beginners from burning expensive sessions on questions they cannot yet answer.
- **Anthropic stays the brain.** Claude grades, runs the Socratic prompts, and writes the debrief. The voice provider only does speech in / speech out and tool calling.
- **OpenAI Realtime is OUT on cost grounds.** ~$0.35/min is not sustainable for a niche specialist app. Decision documented after a Perplexity-led research pass.

## Recommended phased rollout

**Phase 1 (prototype):** Google Gemini Live API on its free tier. Goal is to learn the architecture and validate conversation feel, not production-ready. Disposable code is acceptable.

**Phase 2 (paid pilot):** pick one of these based on what Phase 1 reveals:
- AssemblyAI Voice Agent API ($4.50/hr flat) for cost and simplicity
- ElevenLabs Conversational AI (~$0.10/min) for voice persona quality
- Hume AI EVI 3 (~$0.072/min) for emotional-tone awareness during Socratic probing
- Vapi orchestration (~$0.15/min effective) to mix and match components

**Phase 3 (production / framework):** port to Pipecat (open-source pipeline) so any future customer can swap STT / LLM / TTS per their needs. Aligns with the multi-industry framework ambition. Cost drops to ~$1 to $2 per hour at the price of meaningful build effort (Python 3.10+, ~2 to 3 weeks).

## Pre-build sanity test

Before Phase 1 begins, validate ASR accuracy on real BASI vocabulary by reading the same 10 sentences (covering grid references, compass bearings, alpine terminology, foreign-language terms like couloir / sérac / Lawinenwarnstufe) through Gemini Live, AssemblyAI's demo, and ElevenLabs Scribe. Compare transcripts. If any provider mangles grid references or compass bearings, it is unusable for an examiner role regardless of price.

## Cost monitoring (must exist from day one)

Per voice session, log: session length, audio minutes, Claude tokens consumed, total cost. Without this telemetry the "free tier first" promise cannot be evaluated. Store somewhere durable (Vercel KV, Postgres, or even a `voice_sessions` table in a Supabase instance).

## What stays out for now

- Phone calling integration (SIP). Voice features live in the PWA only.
- Translation to other languages. English-only at launch.
- Voice in flashcards or any non-examiner flow. Mock Examiner is the only voice surface in the first release.
