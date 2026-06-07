"use client";

/**
 * Home-page welcome card (V1.4.0).
 *
 * Replaces the V1.3 forced redirect to /onboarding. New visitors now see
 * this dismissible card on the home page with two optional next steps:
 *   - Pick where to start (opens the onboarding wizard at /onboarding)
 *   - Sign in to sync across devices (opens /login)
 *
 * Hidden once the user dismisses it OR once both onboarding is complete
 * AND they are signed in. Dismissal is per-device, stored in localStorage
 * under a dedicated key.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useAuth } from "@/lib/auth/provider";
import { useProgress } from "@/lib/progress/provider";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const DISMISS_KEY = "alpine-map-training:welcome-dismissed";

export function WelcomeCard() {
  const { hydrated: authReady, user } = useAuth();
  const { hydrated: progressReady, store } = useProgress();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  // Read dismissal flag on mount. Null while reading; true/false after.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // storage disabled — fail silently; the card still hides in-session.
    }
  }

  // Wait for everything to hydrate before deciding visibility, so the card
  // does not flash on screen during the initial render.
  if (!authReady || !progressReady || dismissed === null) return null;
  if (dismissed) return null;

  const onboardingComplete = Boolean(store.settings.onboardingComplete);
  const signedIn = Boolean(user);
  // If Supabase auth is not yet configured in this environment, the
  // "Sign in to sync" CTA is suppressed. The card then degrades to a
  // pure "Pick where to start" prompt for users who have not finished
  // onboarding; once they have, it hides entirely.
  const authAvailable = isSupabaseConfigured();

  // Hide once both prompts are answered, or when there is nothing left
  // to prompt (onboarding done and auth not available).
  if (onboardingComplete && (signedIn || !authAvailable)) return null;

  return (
    <section
      aria-labelledby="welcome-card-heading"
      className="border-b border-rule bg-paper-3 px-[22px] py-5 md:px-16 md:py-7"
    >
      <div className="relative md:mx-auto md:max-w-[960px]">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss welcome card"
          className="absolute right-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-transparent text-ink-3 hover:border-rule hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <p className="eyebrow eyebrow-contour">Get started</p>
        <h2
          id="welcome-card-heading"
          className="mt-2 font-display text-[22px] font-extrabold leading-tight tracking-[-0.014em] text-ink md:text-[26px]"
        >
          {onboardingComplete && !signedIn && authAvailable
            ? "Want your progress on every device?"
            : signedIn && !onboardingComplete
            ? "Pick where you want to start"
            : !onboardingComplete && !authAvailable
            ? "Pick where you want to start"
            : "Welcome. Two optional next steps."}
        </h2>
        <p className="mt-2 max-w-[58ch] text-[13px] leading-[1.55] text-ink-2 md:text-[14px]">
          {onboardingComplete && !signedIn && authAvailable
            ? "Sign in and your progress is mirrored across this device and any other you use. Local-only still works if you prefer."
            : signedIn && !onboardingComplete
            ? "Tell us which level to start from and how long your study sessions tend to be. Two minutes."
            : !onboardingComplete && !authAvailable
            ? "Tell us which level to start from and how long your study sessions tend to be. Two minutes. You can also back up and restore your progress from Settings."
            : "You can browse straight away. When you are ready, pick a starting level so the home page tracks your progress, and sign in so it follows you between devices. Both are optional."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!onboardingComplete ? (
            <Link href="/onboarding" className="btn red sm">
              Pick where to start
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : null}
          {!signedIn && authAvailable ? (
            <Link
              href="/login"
              className={
                onboardingComplete ? "btn red sm" : "btn ghost sm"
              }
            >
              Sign in to sync
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
