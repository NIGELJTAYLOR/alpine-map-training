"use client";

/**
 * Login page (V1.4.0).
 *
 * Email + magic link only. The user enters their email, presses Send,
 * and gets a Supabase magic-link email. Clicking the link returns them
 * to /auth/callback, which finishes the exchange and redirects home.
 *
 * Sign-in is opt-in: the app continues to work without an account, with
 * progress stored locally in localStorage. Signing in enables cross-device
 * sync.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/provider";

type SubmitState = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const router = useRouter();
  const { user, hydrated, signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // If the user is already signed in, bounce them back to the home page.
  useEffect(() => {
    if (hydrated && user) {
      router.replace("/");
    }
  }, [hydrated, user, router]);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setState("sending");
    setErrorMsg("");
    const err = await signInWithEmail(email);
    if (err) {
      setState("error");
      setErrorMsg(err);
      return;
    }
    setState("sent");
  }

  return (
    <main
      id="main-content"
      className="flex flex-1 items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md border border-rule bg-paper-2 px-6 py-8 md:px-8 md:py-10">
        <p className="eyebrow eyebrow-contour">Cross-device sync</p>
        <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.01em] text-ink">
          Sign in to your account
        </h1>
        <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.55] text-ink-2">
          Enter your email and we will send you a sign-in link. No password
          to remember. Once signed in, your progress is synced across every
          device you use.
        </p>

        {state === "sent" ? (
          <div className="mt-6 border border-rule bg-paper-3 px-4 py-3">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2">
              Check your inbox
            </p>
            <p className="mt-2 text-[14px] leading-[1.55] text-ink-2">
              We have sent a sign-in link to{" "}
              <span className="font-semibold text-ink">{email}</span>. Click
              the link in the email to finish signing in. You can close this
              tab; the link opens the app for you.
            </p>
            <button
              type="button"
              onClick={() => {
                setState("idle");
                setEmail("");
              }}
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 hover:text-ink"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "sending"}
                className="mt-2 w-full rounded-[2px] border border-rule bg-paper px-3 py-2 font-sans text-[15px] text-ink placeholder:text-ink-4 focus:border-ink focus:outline-none disabled:opacity-60"
                placeholder="you@example.com"
              />
            </div>
            {state === "error" ? (
              <p className="text-[13px] leading-[1.5] text-red">{errorMsg}</p>
            ) : null}
            <button
              type="submit"
              disabled={state === "sending" || !email}
              className="inline-flex w-full items-center justify-center rounded-[4px] border border-ink bg-ink px-4 py-2.5 font-sans text-sm font-semibold text-paper hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-[12px] leading-[1.5] text-ink-3">
          Prefer to stay local-only? You can{" "}
          <Link href="/" className="underline hover:text-ink">
            continue without an account
          </Link>
          . Your progress will live on this device only.
        </p>
      </div>
    </main>
  );
}
