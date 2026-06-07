import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What we store, where it lives, and how to delete your data.",
};

/**
 * Privacy notice (V1.4.0).
 *
 * Kept deliberately plain-language. Updated alongside any change to the
 * data model, the sync flow, or third-party processors.
 */
export default function PrivacyPage() {
  return (
    <main id="main-content" className="px-[22px] py-8 md:px-16 md:py-12">
      <div className="mx-auto max-w-[68ch]">
        <p className="eyebrow eyebrow-contour">Privacy</p>
        <h1 className="mt-3 font-display text-[28px] font-extrabold leading-tight tracking-[-0.018em] text-ink md:text-[36px]">
          What we store and where
        </h1>
        <p className="mt-3 text-[13px] font-medium uppercase tracking-[0.14em] text-ink-3">
          Last updated: 5 June 2026
        </p>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-[18px] font-bold text-ink md:text-[20px]">
            If you do not sign in
          </h2>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            Your progress, settings, names, and exercise answers stay in this
            browser only, in localStorage. No account is created, no server
            holds your data, and nothing leaves the device unless you choose
            to email an export to a trainer.
          </p>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            You can clear all of it from{" "}
            <a href="/settings" className="underline hover:text-ink">
              Settings
            </a>{" "}
            using the &ldquo;Start fresh&rdquo; control. It is a one-click
            wipe with no recovery.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-[18px] font-bold text-ink md:text-[20px]">
            If you sign in
          </h2>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            Signing in creates an account identified by your email address.
            We store, in a Supabase Postgres database hosted in the European
            Union:
          </p>
          <ul className="ml-5 list-disc space-y-1.5 text-[14px] leading-[1.6] text-ink-2">
            <li>Your email address (used as your login identifier).</li>
            <li>
              Your in-app progress: which pages you have completed, your
              quiz responses, your free-text exercise answers, AI grades on
              those answers, flashcard schedules, readiness checks, and any
              display name you entered in onboarding.
            </li>
            <li>
              Timestamps recording when each item was last updated, so the
              sync logic can choose the most recent version.
            </li>
          </ul>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            We do not store passwords. Sign-in uses an emailed magic link
            handled by Supabase. We do not use cookies for tracking, and we
            do not share any data with third parties beyond the providers
            named below.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-[18px] font-bold text-ink md:text-[20px]">
            Third-party processors
          </h2>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            <strong className="font-semibold text-ink">Supabase</strong>{" "}
            (EU-hosted) provides the authentication system and the database
            that stores your progress.
          </p>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            <strong className="font-semibold text-ink">Anthropic</strong>{" "}
            (Claude API) receives your free-text exercise answers when you
            press &ldquo;Grade with AI&rdquo;, plus the corresponding
            exercise prompt from the workbook, so it can return a grade. We
            do not send your email or display name with the grading request.
          </p>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            <strong className="font-semibold text-ink">Vercel</strong> hosts
            the app and serves the static and server-rendered pages.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-[18px] font-bold text-ink md:text-[20px]">
            Deleting your data
          </h2>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            From{" "}
            <a href="/settings" className="underline hover:text-ink">
              Settings
            </a>{" "}
            you can:
          </p>
          <ul className="ml-5 list-disc space-y-1.5 text-[14px] leading-[1.6] text-ink-2">
            <li>
              Sign out (does not delete anything; your data stays available
              the next time you sign in).
            </li>
            <li>
              Delete your synced progress (removes everything held in the
              database for your account; your local-device copy is also
              cleared).
            </li>
          </ul>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            To delete the account itself (the auth record holding your
            email), email{" "}
            <a
              href="mailto:Hello@performos.ai"
              className="underline hover:text-ink"
            >
              Hello@performos.ai
            </a>{" "}
            and we will remove it within 30 days. A self-service account
            deletion control is on the roadmap for V1.4.1.
          </p>
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="font-display text-[18px] font-bold text-ink md:text-[20px]">
            Questions
          </h2>
          <p className="text-[14px] leading-[1.6] text-ink-2">
            Email{" "}
            <a
              href="mailto:Hello@performos.ai"
              className="underline hover:text-ink"
            >
              Hello@performos.ai
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
