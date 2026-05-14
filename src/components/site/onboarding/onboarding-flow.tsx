"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/site/carta/wordmark";
import { useProgress } from "@/lib/progress/provider";
import type { StartingLevel } from "@/lib/progress/types";

type Step = 1 | 2 | 3 | 4;
const TOTAL_STEPS = 4;

const PATHWAYS: ReadonlyArray<{
  level: StartingLevel;
  title: string;
  blurb: string;
  pages: number;
}> = [
  {
    level: 1,
    title: "Map literacy",
    blurb:
      "Scale, grid, contour, symbols. Start here if you want the foundation cold.",
    pages: 19,
  },
  {
    level: 2,
    title: "Terrain interpretation",
    blurb:
      "Reading shape before steepness. Pick this if Level 1 is already familiar.",
    pages: 24,
  },
  {
    level: 3,
    title: "Navigation toolkit",
    blurb:
      "Compass, altimeter, route cards, poor-vis. For an experienced candidate refreshing the toolkit.",
    pages: 23,
  },
];

const SESSION_MINUTES = [5, 10, 15, 20, 30, 50] as const;
const STUDY_DAYS = [2, 3, 4, 5, 7] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const { setOnboardingPrefs, setProfile, store } = useProgress();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState<string>(store.settings.profileName ?? "");
  const [email, setEmail] = useState<string>(store.settings.profileEmail ?? "");
  const [startingLevel, setStartingLevel] = useState<StartingLevel>(1);
  const [sessionMinutes, setSessionMinutes] = useState<number>(20);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState<number>(4);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailValid =
    trimmedEmail === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const canAdvanceIdentity = trimmedName.length > 0 && emailValid;

  function next() {
    if (step < TOTAL_STEPS) setStep((step + 1) as Step);
  }
  function back() {
    if (step > 1) setStep((step - 1) as Step);
  }
  function finish() {
    setProfile({ name: trimmedName, email: trimmedEmail });
    setOnboardingPrefs({ startingLevel, sessionMinutes, studyDaysPerWeek });
    router.push("/");
  }
  function skip() {
    setProfile({ name: trimmedName, email: trimmedEmail });
    setOnboardingPrefs({ startingLevel, sessionMinutes, studyDaysPerWeek });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* ===== Step 1: Welcome ===== */}
      {step === 1 ? (
        <section className="flex min-h-screen flex-col">
          <div
            className="photo-slot has-img relative h-[240px] md:h-[360px]"
            style={{
              backgroundImage: "url(/photos/trio-blue-run.png)",
              backgroundPosition: "center 35%",
            }}
          >
            <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-b from-ink/40 via-transparent to-ink/55" />
            <div className="absolute left-[22px] top-[22px] z-10 md:left-14 md:top-14">
              <Wordmark href="" />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-[18px] px-[22px] py-7 md:mx-auto md:max-w-[560px] md:px-0 md:py-10">
            <StepDots current={1} />
            <h1 className="font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.028em] text-ink md:text-[44px]">
              Read the <span className="text-red">cool</span> mountain.
            </h1>
            <p className="text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
              Sixty-six workbook pages and one hundred and sixty flashcards,
              tuned for BASI Alpine L4 ISTD navigation. Works offline in the
              hut and on the lift.
            </p>
            <div className="grid grid-cols-3 gap-px border border-rule bg-rule">
              <StatCell value="66" label="Pages" />
              <StatCell value="160" label="Cards" />
              <StatCell value="2" label="Quizzes" />
            </div>
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <button type="button" onClick={next} className="btn red block">
                Get started <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
              <p className="mt-1 text-center font-mono text-[11px] font-semibold tracking-[0.06em] text-ink-3">
                Local-only. No account needed.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== Step 2: Identity ===== */}
      {step === 2 ? (
        <section className="flex min-h-screen flex-col">
          <header className="border-b border-rule bg-paper-3 px-[22px] pb-4 pt-[26px] md:px-14 md:pt-12">
            <StepDots current={2} />
            <h2 className="mb-1.5 mt-3.5 font-display text-[24px] font-extrabold leading-tight tracking-[-0.018em] text-ink md:text-[36px]">
              Who&rsquo;s studying?
            </h2>
            <p className="max-w-[58ch] text-[13px] leading-[1.5] text-ink-2 md:text-[15px]">
              Your name appears on any progress export. The email is only used
              when you choose to email an export to a trainer; nothing is sent
              automatically.
            </p>
          </header>

          <div className="flex flex-col gap-4 px-[22px] py-5 md:mx-auto md:w-full md:max-w-[560px] md:px-0 md:py-8">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Lendrum"
                autoComplete="name"
                className="rounded-[2px] border border-rule bg-paper-3 px-3 py-2.5 font-display text-[15px] font-bold tracking-[-0.005em] text-ink outline-none placeholder:font-sans placeholder:font-normal placeholder:text-ink-4 focus:border-ink"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={
                  "rounded-[2px] border bg-paper-3 px-3 py-2.5 font-mono text-[13px] text-ink outline-none placeholder:text-ink-4 focus:border-ink " +
                  (emailValid ? "border-rule" : "border-crimson")
                }
              />
              {!emailValid ? (
                <span className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-crimson">
                  Doesn&rsquo;t look like a valid email.
                </span>
              ) : (
                <span className="mt-0.5 text-[11px] leading-[1.4] text-ink-3">
                  Optional. Leave blank if you don&rsquo;t plan to email exports.
                </span>
              )}
            </label>
          </div>

          <div className="mt-auto flex items-center gap-2 border-t border-rule bg-paper-3 px-[22px] py-4 md:mx-auto md:w-full md:max-w-[560px] md:border-0">
            <button type="button" onClick={back} className="btn ghost sm">
              <ArrowLeft className="h-3 w-3" aria-hidden />
              Back
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canAdvanceIdentity}
              aria-disabled={!canAdvanceIdentity}
              className="btn red sm flex-1"
            >
              Continue
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </section>
      ) : null}

      {/* ===== Step 3: Pathway ===== */}
      {step === 3 ? (
        <section className="flex min-h-screen flex-col">
          <header className="border-b border-rule bg-paper-3 px-[22px] pb-4 pt-[26px] md:px-14 md:pt-12">
            <StepDots current={3} />
            <h2 className="mb-1.5 mt-3.5 font-display text-[24px] font-extrabold leading-tight tracking-[-0.018em] text-ink md:text-[36px]">
              Where are you starting from?
            </h2>
            <p className="max-w-[58ch] text-[13px] leading-[1.5] text-ink-2 md:text-[15px]">
              Pick the level closest to where you&rsquo;re at. You can change this
              later from Settings.
            </p>
          </header>

          <div className="flex flex-col gap-2 px-[22px] py-4 md:mx-auto md:w-full md:max-w-[640px] md:px-0 md:py-8">
            {PATHWAYS.map((p) => {
              const selected = startingLevel === p.level;
              return (
                <button
                  key={p.level}
                  type="button"
                  onClick={() => setStartingLevel(p.level)}
                  className={
                    "grid items-center gap-3.5 border bg-paper-3 px-3.5 py-3.5 text-left no-underline " +
                    (selected
                      ? "border-2 border-ink px-3 py-3"
                      : "border-rule")
                  }
                  style={{ gridTemplateColumns: "44px 1fr 16px" }}
                  aria-pressed={selected}
                >
                  <span
                    className={
                      "flex h-11 w-11 items-center justify-center rounded-[2px] border font-display text-[18px] font-extrabold tracking-[-0.02em] " +
                      (selected
                        ? "border-red bg-red text-paper-3"
                        : "border-rule bg-paper text-ink")
                    }
                  >
                    {p.level.toString().padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15px] font-bold tracking-[-0.01em] text-ink">
                      Level {p.level} · {p.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-[1.45] text-ink-2 md:text-[13px]">
                      {p.blurb}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-ink-3">
                    {p.pages} pp
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-rule bg-paper-3 px-[22px] py-4 md:mx-auto md:w-full md:max-w-[640px] md:border md:py-5">
            <p className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
              Target session length
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SESSION_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSessionMinutes(m)}
                  aria-pressed={sessionMinutes === m}
                  className={
                    "rounded-[2px] border px-3 py-1.5 font-mono text-[12px] font-semibold " +
                    (sessionMinutes === m
                      ? "border-ink bg-ink text-paper-3"
                      : "border-rule bg-paper-3 text-ink-2 hover:border-rule-2")
                  }
                >
                  {m} min
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-[1.4] text-ink-3">
              You&rsquo;ll see this used by the daily review schedule and the
              flashcard queue length.
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 border-t border-rule bg-paper-3 px-[22px] py-4 md:mx-auto md:w-full md:max-w-[640px] md:border-0">
            <button type="button" onClick={back} className="btn ghost sm">
              <ArrowLeft className="h-3 w-3" aria-hidden />
              Back
            </button>
            <button type="button" onClick={next} className="btn red sm flex-1">
              Continue
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </section>
      ) : null}

      {/* ===== Step 4: Cadence ===== */}
      {step === 4 ? (
        <section className="flex min-h-screen flex-col">
          <header className="border-b border-rule bg-paper-3 px-[22px] pb-4 pt-[26px] md:px-14 md:pt-12">
            <StepDots current={4} />
            <h2 className="mb-1.5 mt-3.5 font-display text-[24px] font-extrabold leading-tight tracking-[-0.018em] text-ink md:text-[36px]">
              How often will you study?
            </h2>
            <p className="max-w-[58ch] text-[13px] leading-[1.5] text-ink-2 md:text-[15px]">
              The spaced-repetition queue is paced against this number. Be
              honest with yourself; you can change it later.
            </p>
          </header>

          <div className="flex-1 px-[22px] py-6 md:mx-auto md:w-full md:max-w-[640px] md:px-0 md:py-8">
            <p className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
              Study days per week
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {STUDY_DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setStudyDaysPerWeek(d)}
                  aria-pressed={studyDaysPerWeek === d}
                  className={
                    "flex flex-col items-center gap-0.5 rounded-[2px] border px-1 py-3 " +
                    (studyDaysPerWeek === d
                      ? "border-ink bg-ink text-paper-3"
                      : "border-rule bg-paper-3 text-ink hover:border-rule-2")
                  }
                >
                  <span className="font-display text-[20px] font-extrabold leading-none tracking-[-0.015em]">
                    {d}
                  </span>
                  <span
                    className={
                      "font-mono text-[9px] font-semibold uppercase tracking-[0.1em] " +
                      (studyDaysPerWeek === d ? "text-paper-3/70" : "text-ink-3")
                    }
                  >
                    {d === 7 ? "every day" : "days"}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 border border-rule bg-paper-3 px-4 py-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                Your plan
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-2 md:text-[15px]">
                <span className="font-display font-bold text-ink">
                  {trimmedName || "Candidate"}
                </span>{" "}
                · Level{" "}
                <span className="font-display font-bold text-ink">
                  {startingLevel.toString().padStart(2, "0")}
                </span>{" "}
                ·{" "}
                <span className="font-display font-bold text-ink">
                  {sessionMinutes}
                </span>{" "}
                min sessions ·{" "}
                <span className="font-display font-bold text-ink">
                  {studyDaysPerWeek}
                </span>{" "}
                day{studyDaysPerWeek === 1 ? "" : "s"} a week.
              </p>
              <p className="mt-1 text-[12px] leading-[1.4] text-ink-3">
                All saved on this device. Nothing leaves.
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2 border-t border-rule bg-paper-3 px-[22px] py-4 md:mx-auto md:w-full md:max-w-[640px] md:border-0">
            <button type="button" onClick={back} className="btn ghost sm">
              <ArrowLeft className="h-3 w-3" aria-hidden />
              Back
            </button>
            <button type="button" onClick={finish} className="btn red sm flex-1">
              Begin pathway
              <ArrowRight className="h-3 w-3" aria-hidden />
            </button>
          </div>
        </section>
      ) : null}

      <div className="fixed bottom-3 right-3 z-10">
        <Link
          href="/"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3 no-underline hover:text-ink"
          onClick={(e) => {
            e.preventDefault();
            skip();
          }}
        >
          Skip for now →
        </Link>
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function StepDots({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-3">
      <span>
        Step {current} of {TOTAL_STEPS}
      </span>
      <span className="inline-flex gap-1">
        {([1, 2, 3, 4] as const).map((n) => (
          <span
            key={n}
            className={
              "inline-block h-[3px] w-[18px] " +
              (n <= current ? "bg-red" : "bg-rule")
            }
          />
        ))}
      </span>
    </div>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-paper-3 px-3 py-2.5">
      <div className="font-display text-[20px] font-extrabold leading-none tracking-[-0.015em] text-ink">
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3">
        {label}
      </div>
    </div>
  );
}
