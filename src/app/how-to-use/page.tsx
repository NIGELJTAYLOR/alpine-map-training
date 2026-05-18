import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = { title: "How to use this app" };

export default function HowToUsePage() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* ===== Header band ===== */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Getting started
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          How to use this app
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          A short guide to getting the most out of the app. It is designed
          to be self-guiding, so think of this as a quick orientation
          rather than a manual: read it once, then dive in.
        </p>
      </header>

      {/* ===== Hero photo strip ===== */}
      <div
        className="photo-slot has-img"
        style={{
          height: 220,
          backgroundImage: "url(/photos/pair-with-maps.jpg)",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
        aria-label="Two skiers studying a topographic map"
      />

      <div className="px-[22px] pb-12 pt-6 md:mx-auto md:max-w-3xl md:px-14 md:pt-10">
        {/* ===== Welcome ===== */}
        <section className="mb-10">
          <h2 className="mb-3 font-display text-[22px] font-extrabold tracking-[-0.018em] text-ink md:text-[26px]">
            Welcome to the Alpine Map Training app
          </h2>
          <p className="mb-3 max-w-[62ch] text-[15px] leading-[1.6] text-ink-2 md:text-[16px]">
            The PerformOS Alpine Map Training app is a digital learning
            companion built to help you reach the standard required for
            the BASI Alpine Level 4 ISTD and the ISIA Card. The ISIA Card
            is the international equivalent of the BASI Alpine Level 4.
            Map reading is an essential skill at this level for ski
            instructing and guiding, and the course takes a beginner or
            novice map reader through to the standard those qualifications
            expect.
          </p>
          <p className="max-w-[62ch] text-[15px] leading-[1.6] text-ink-2 md:text-[16px]">
            Inside you&rsquo;ll find sixty-six lesson pages, one hundred
            and sixty flashcards, and two graded quizzes. A companion
            workbook of over four hundred pages is bundled in for
            reference, available both as an online edition you can read in
            your browser and a downloadable PDF. Once installed the app
            itself works offline, in the hut, on the lift, or anywhere you
            have a few minutes to study. Every answer you type stays on
            your device until you choose to share it.
          </p>
        </section>

        {/* ===== The objective ===== */}
        <section className="mb-10">
          <h2 className="mb-3 font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[22px]">
            What you&rsquo;re working towards
          </h2>
          <p className="mb-4 max-w-[62ch] text-[14px] leading-[1.6] text-ink-2 md:text-[15px]">
            The course is built around the BASI Alpine Level 4 ISTD and
            ISIA Card navigation syllabus, organised as a three-level
            pathway:
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="border border-rule bg-paper-3 p-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-red">
                Level 1
              </p>
              <h3 className="mt-1 font-display text-[15px] font-bold tracking-[-0.005em] text-ink">
                Map literacy
              </h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-ink-2">
                Scale, grid references, contour reading, symbol recognition.
                The fundamentals.
              </p>
            </div>
            <div className="border border-rule bg-paper-3 p-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-red">
                Level 2
              </p>
              <h3 className="mt-1 font-display text-[15px] font-bold tracking-[-0.005em] text-ink">
                Terrain interpretation
              </h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-ink-2">
                Read shape before steepness. Summits, ridges, gullies, aspect,
                slope angle, terrain traps.
              </p>
            </div>
            <div className="border border-rule bg-paper-3 p-4">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-red">
                Level 3
              </p>
              <h3 className="mt-1 font-display text-[15px] font-bold tracking-[-0.005em] text-ink">
                Navigation toolkit
              </h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-ink-2">
                Compass, altimeter, route cards, pacing, attack points, and
                poor-visibility techniques.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-[62ch] text-[14px] leading-[1.6] text-ink-2 md:text-[15px]">
            Each level builds on the one before. You can start at any level
            (set during onboarding, and changeable in <Link
              href="/settings"
              className="text-red hover:text-ink"
            >Settings</Link>), but work through pages in order within a level.
          </p>
        </section>

        {/* ===== Step by step ===== */}
        <section className="mb-10">
          <h2 className="mb-3 font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[22px]">
            How a typical session works
          </h2>
          <ol className="space-y-4">
            <Step n={1} title="Pick up where you left off">
              The <Link href="/" className="text-red hover:text-ink">Overview</Link>{" "}
              page shows your current pathway position and the next page to
              read. Tap any level in the sidebar to see its full list of
              pages. Pages you&rsquo;ve completed are marked green; pages
              in progress amber.
            </Step>
            <Step n={2} title="Read the page, then answer the exercises">
              Each lesson page has a short reading section followed by
              numbered exercises. Type your answers directly into the
              inline fields and your work auto-saves as you type. Use the
              self-check checkboxes to mark off the page&rsquo;s learning
              aims.
            </Step>
            <Step n={3} title="Grade with AI">
              At the bottom of each exercise, click{" "}
              <strong>Grade Exercise N with AI</strong> to get trainer-style
              feedback. You&rsquo;ll see a Met / Nearly / Not yet rubric
              score, a short feedback paragraph, two or three strengths, and
              two or three improvement points. Re-grade as often as you like
              after editing your answer.
            </Step>
            <Step n={4} title="Confirm with the answer key">
              Each page has a model answer hidden under an{" "}
              <strong>Answer key</strong> toggle below the exercises. Use it
              to cross-check after grading, not before.
            </Step>
            <Step n={5} title="Track progress and export">
              The{" "}
              <Link href="/progress" className="text-red hover:text-ink">
                Progress
              </Link>{" "}
              page shows percent complete by level, quiz scores, flashcard
              schedules, and an export panel. Export your work as
              Markdown, HTML, PDF or Word any time you want to share it with
              a trainer.
            </Step>
          </ol>
        </section>

        {/* ===== Where things live ===== */}
        <section className="mb-10">
          <h2 className="mb-3 font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[22px]">
            Where to find things
          </h2>
          <ul className="space-y-2 text-[14px] leading-[1.6] text-ink-2 md:text-[15px]">
            <li>
              <strong className="text-ink">Course</strong>: the three
              levels in the sidebar. This is the main learning content.
            </li>
            <li>
              <strong className="text-ink">Flashcards</strong>: 160
              spaced-repetition cards covering the whole syllabus. Useful
              between sessions to keep concepts fresh.
            </li>
            <li>
              <strong className="text-ink">Diagrams</strong>: every visual
              reference, including schematic teaching diagrams, quiz map
              extracts, and the full Swisstopo and IGN source maps used
              throughout the course. All zoomable.
            </li>
            <li>
              <strong className="text-ink">Templates</strong>: printable
              route cards and pro-formas.
            </li>
            <li>
              <strong className="text-ink">Glossary</strong>: quick
              definitions for the technical vocabulary used throughout the
              course.
            </li>
            <li>
              <strong className="text-ink">Settings</strong>: your name,
              email, trainer mode, &ldquo;Start fresh / new user&rdquo;
              for sharing a device, and storage info.
            </li>
            <li>
              <strong className="text-ink">Companion manual</strong>: a
              four-hundred-page workbook PDF and online edition that
              mirrors and expands on the course. Use it as a deeper
              reference, an alternative angle on a topic, or a printable
              copy to mark up by hand. Read it online in your browser
              (works offline once you have opened it) or download the PDF
              for a permanent copy.
            </li>
          </ul>
        </section>

        {/* ===== Tips ===== */}
        <section className="mb-10">
          <h2 className="mb-3 font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[22px]">
            A few quick tips
          </h2>
          <ul className="space-y-2 text-[14px] leading-[1.6] text-ink-2 md:text-[15px]">
            <li>
              <strong className="text-ink">Install it as an app.</strong>{" "}
              This is a Progressive Web App. On a phone, use your
              browser&rsquo;s &ldquo;Add to Home Screen&rdquo; option; on
              a laptop, look for the install icon in your address bar.
              Once installed it works offline.
            </li>
            <li>
              <strong className="text-ink">Your work stays on your device.</strong>{" "}
              Nothing is sent to any server unless you choose to grade an
              answer with AI (which sends just that one answer to Anthropic)
              or to export your progress. Switching browsers means starting
              fresh; if you want continuity, export and import.
            </li>
            <li>
              <strong className="text-ink">Trainer mode</strong> in
              Settings auto-expands every page&rsquo;s answer key and
              surfaces the trainer notes inline. Useful when reviewing a
              candidate with you.
            </li>
            <li>
              <strong className="text-ink">Use the diagrams page</strong> for
              focused study. Pinch to zoom on the source maps to read tiny
              detail.
            </li>
          </ul>
        </section>

        {/* ===== Help / contact ===== */}
        <section className="mt-10 border-t border-rule pt-8">
          <h2 className="mb-3 font-display text-[20px] font-extrabold tracking-[-0.015em] text-ink md:text-[22px]">
            Got stuck or want to give feedback?
          </h2>
          <p className="mb-4 max-w-[62ch] text-[14px] leading-[1.6] text-ink-2 md:text-[15px]">
            Most things in the app are self-evident once you start working
            through the pages. If something is genuinely broken, confusing,
            or missing, we&rsquo;d like to know.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${BRAND.authorEmail}?subject=${encodeURIComponent(
                BRAND.productName + ": feedback",
              )}`}
              className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
            >
              Email {BRAND.authorEmail}
            </a>
            <a
              href={BRAND.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-[2px] border border-rule bg-paper-2 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2 hover:border-ink hover:text-ink"
            >
              {BRAND.authorUrl.replace(/^https?:\/\//, "")} →
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 border-l border-rule pl-4 md:gap-4 md:pl-5">
      <span className="shrink-0 font-display text-[26px] font-extrabold leading-none tracking-[-0.018em] text-red md:text-[32px]">
        {n.toString().padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-bold tracking-[-0.005em] text-ink md:text-[16px]">
          {title}
        </h3>
        <p className="mt-1 text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          {children}
        </p>
      </div>
    </li>
  );
}
