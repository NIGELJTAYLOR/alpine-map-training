import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "How the Alpine Map Training PWA was built — eleven Claude conversations, ~30 hours of build time, end-to-end from a written brief to a deployed PWA.",
};

interface SessionEntry {
  id: string;
  title: string;
  what: string;
}

const SESSIONS: SessionEntry[] = [
  {
    id: "1",
    title: "Scaffold",
    what: "Next.js 16 + Tailwind v4 + shadcn/ui + Velite. First Vercel deploy.",
  },
  {
    id: "2",
    title: "Level 1 ingestion",
    what: "Source-to-MDX parser; 19 Level 1 pages, 25 answer-key records, 5 trainer-notes bundles.",
  },
  {
    id: "3",
    title: "Levels 2 + 3 + diagrams + templates",
    what: "47 more pages, 20 schematic SVGs, 9 printable templates.",
  },
  {
    id: "4",
    title: "Interactive quizzes",
    what: "C7.1 + D10.1 with 4 question types, auto-grading, self-mark, error log.",
  },
  {
    id: "5",
    title: "localStorage progress",
    what: "Page completion, self-checks, quiz state — all persistent on the device.",
  },
  {
    id: "6",
    title: "PWA service worker",
    what: "Hand-rolled service worker; installable to home screen; works offline.",
  },
  {
    id: "7",
    title: "Trainer mode",
    what: "Toggle in settings auto-expands answer keys, shows trainer notes inline; confidence + readiness capture.",
  },
  {
    id: "8",
    title: "Accessibility + print + v1.0",
    what: "Skip link, semantic main, aria-live indicators, reduced-motion support, print stylesheet.",
  },
  {
    id: "9",
    title: "Flashcards (the original ask)",
    what: "160 hand-curated cards, SM-2 spaced repetition, 8 decks plus a daily-review pseudo-deck.",
  },
  {
    id: "10",
    title: "Carta visual rebuild",
    what: "Direction designed in Claude Design, ported into code: Fraunces + Inter + JetBrains Mono, contour-line motif, paper-and-ink palette.",
  },
  {
    id: "11",
    title: "Content enrichment",
    what: "Glossary, this About page, see-also panels, OpenTopoMap quiz extracts.",
  },
];

export default function AboutPage() {
  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className="focus:outline-none"
      >
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-rule bg-paper">
          <div className="grid-bg" />
          <div className="relative px-[22px] pb-7 pt-7 md:mx-auto md:max-w-3xl md:px-14 md:pb-12 md:pt-14">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
              About this build
            </p>
            <h1 className="mt-2 font-display text-[36px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink md:text-[56px]">
              A workbook,
              <br />a conversation,
              <br />a working app.
            </h1>
            <p className="mt-5 max-w-[55ch] text-[14px] leading-[1.55] text-ink-2 md:text-[17px]">
              This Progressive Web App was built across multiple conversations
              with Claude — starting from a written brief in March 2026 and
              ending with the build you&rsquo;re reading right now.
            </p>
          </div>
        </section>

        {/* Body */}
        <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20 space-y-14">
          <section>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              What it is
            </h2>
            <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
              The digital companion to the <em>Alpine Map Training</em>{" "}
              workbook for ski instructors preparing for BASI Alpine Level 4
              ISTD (with the IMS / EMS Nav Programme inside it). Sixty-six
              pages of content across three Levels, two interactive quizzes,
              160 spaced-repetition flashcards, twenty schematic diagrams,
              nine printable templates, a trainer mode, and a glossary.
              Installable to your phone&rsquo;s home screen, works offline.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              How it was built
            </h2>
            <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
              Nigel (PerformOS) wrote the workbook content and a build brief.
              Claude Code translated the brief into a deployed Next.js
              application, conversation by conversation. Each session ended
              with a written report, a clean local build, and a push to
              GitHub that auto-deploys on Vercel. No code was written by
              human hands; every architectural decision was made through
              extended prompting.
            </p>
            <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
              The visual identity (codename: <em>Glacier Lab</em>) was designed in
              Anthropic&rsquo;s Claude Design tool and ported to the codebase
              as design tokens. The system pairs a pale glacier-grey paper
              with deep navy ink, a single alpine-red accent for primary
              actions, and glacier blue for in-progress state. The headline
              and body face is{" "}
              <a
                href="https://fonts.google.com/specimen/Manrope"
                className="text-ink-3 underline underline-offset-4 hover:text-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Manrope
              </a>
              ; machine codes use IBM Plex Mono; the paper background is
              <span className="mono"> #EEF1F4</span>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              Stack
            </h2>
            <ul className="mt-3 grid gap-2 font-sans text-[14px] text-ink-2 sm:grid-cols-2">
              <li>· Next.js 16 (App Router, TypeScript, Turbopack)</li>
              <li>· Tailwind CSS v4</li>
              <li>· Velite (MDX content pipeline)</li>
              <li>· react-markdown + remark-gfm</li>
              <li>· Hand-rolled service worker</li>
              <li>· localStorage progress store (versioned)</li>
              <li>· OpenTopoMap (CC-BY-SA) for map extracts</li>
              <li>· Vercel (auto-deploy from GitHub)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              The eleven conversations
            </h2>
            <ol className="mt-4 space-y-3">
              {SESSIONS.map((s) => (
                <li
                  key={s.id}
                  className="flex gap-4 border-b border-rule pb-3 last:border-b-0"
                >
                  <span className="page-code w-12 shrink-0 pt-0.5">
                    S{s.id.padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <p className="font-display text-base font-medium text-ink">
                      {s.title}
                    </p>
                    <p className="mt-0.5 font-sans text-[14px] leading-relaxed text-ink-2">
                      {s.what}
                    </p>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              Acknowledgements
            </h2>
            <ul className="mt-3 space-y-2 font-sans text-[14px] leading-relaxed text-ink-2">
              <li>
                · <strong className="text-ink">Workbook content</strong> by Nigel
                Taylor, PerformOS. All Level 1–3 material, the trainer notes,
                and the diagrams brief.
              </li>
              <li>
                · <strong className="text-ink">Schematic diagrams</strong>{" "}
                drawn from the workbook source. SVG rendering preserves the
                pedagogical intent of the original sketches.
              </li>
              <li>
                · <strong className="text-ink">Map data</strong> from{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  className="text-contour underline underline-offset-4 hover:text-ink"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap contributors
                </a>{" "}
                · rendering ©{" "}
                <a
                  href="https://opentopomap.org"
                  className="text-contour underline underline-offset-4 hover:text-ink"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenTopoMap
                </a>{" "}
                (CC-BY-SA). Used under personal-use terms for this demo.
              </li>
              <li>
                · <strong className="text-ink">Typography</strong>: Fraunces
                (Undercase Type), Inter (Rasmus Andersson), JetBrains Mono
                (JetBrains). All open-source.
              </li>
              <li>
                · <strong className="text-ink">BASI / IMS / EMS</strong>{" "}
                referenced under fair-use; no official endorsement implied.
                The qualification standards quoted are from the publicly
                available IMS Nav Programme syllabus.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              Find the source
            </h2>
            <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
              Source on GitHub:{" "}
              <a
                href="https://github.com/NIGELJTAYLOR/alpine-map-training"
                className="text-contour underline underline-offset-4 hover:text-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                NIGELJTAYLOR/alpine-map-training
              </a>
              . Each conversation has a written report committed alongside
              the code (search the repo for <code className="rounded-[3px] bg-paper-2 px-1.5 py-0.5 font-mono text-[13px]">SESSION_*_REPORT.md</code>).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              Get in touch
            </h2>
            <ul className="mt-3 space-y-2 font-sans text-base leading-relaxed text-ink-2">
              <li>
                · <strong className="text-ink">Web</strong>:{" "}
                <a
                  href="https://www.performos.ai"
                  className="text-contour underline underline-offset-4 hover:text-ink"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  performos.ai
                </a>
              </li>
              <li>
                · <strong className="text-ink">Email</strong>:{" "}
                <a
                  href="mailto:Hello@performos.ai"
                  className="text-contour underline underline-offset-4 hover:text-ink"
                >
                  Hello@performos.ai
                </a>
              </li>
            </ul>
          </section>

          <section className="border-t border-rule pt-8">
            <p className="page-code">
              Built by Claude · Conversations directed by Nigel Taylor ·
              PerformOS · 2026
            </p>
            </section>
        </article>
      </main>
    </>
  );
}
