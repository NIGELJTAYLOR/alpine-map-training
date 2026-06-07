"use client";

/**
 * Magic-link callback page (V1.4.0).
 *
 * Supabase returns the user here after they click the magic link in their
 * email. The Supabase client automatically detects the auth code in the
 * URL (because detectSessionInUrl: true is set on the client) and exchanges
 * it for a session. We just wait for the auth state to update, then
 * redirect home.
 *
 * If the exchange fails (expired or already-used link, network error, etc.)
 * we surface a brief message and offer a route back to /login.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";

type CallbackState = "exchanging" | "success" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>("exchanging");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    let cancelled = false;

    // Defensive: if auth is not configured in this environment, surface
    // a clear message rather than crashing on a null client.
    if (!supabase) {
      setState("error");
      setErrorMsg(
        "Sign-in is not yet configured on this deployment. Continue without an account; cross-device sync will switch on in a future update.",
      );
      return;
    }

    // From here on, supabase is non-null. Capture into a const that
    // TypeScript can confidently narrow inside the nested waitForSession
    // function below (the outer-scope narrowing is sometimes lost in
    // async closures).
    const client = supabase;

    // The Supabase client auto-detects the auth code in the URL and exchanges
    // it for a session (detectSessionInUrl: true on the client config). We
    // just need to wait for that to land. Poll getSession briefly with a
    // ceiling; if no session appears, surface an error.
    async function waitForSession() {
      const deadline = Date.now() + 5000;
      while (Date.now() < deadline) {
        const { data } = await client.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          setState("success");
          setTimeout(() => {
            if (!cancelled) router.replace("/");
          }, 600);
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelled) return;
      // Check the URL for a Supabase error param before defaulting to a
      // generic message; Supabase appends ?error_description=... on failure.
      const params = new URLSearchParams(window.location.search);
      const apiErr = params.get("error_description") || params.get("error");
      setState("error");
      setErrorMsg(
        apiErr
          ? decodeURIComponent(apiErr.replace(/\+/g, " "))
          : "Sign-in link could not be verified. It may have expired or already been used.",
      );
    }

    waitForSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main
      id="main-content"
      className="flex flex-1 items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md border border-rule bg-paper-2 px-6 py-8 md:px-8 md:py-10">
        {state === "exchanging" ? (
          <>
            <p className="eyebrow eyebrow-contour">Signing in</p>
            <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              Verifying your sign-in link…
            </h1>
            <p className="mt-3 text-[14px] leading-[1.55] text-ink-2">
              Just a moment.
            </p>
          </>
        ) : null}

        {state === "success" ? (
          <>
            <p className="eyebrow eyebrow-contour">Signed in</p>
            <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              You are signed in
            </h1>
            <p className="mt-3 text-[14px] leading-[1.55] text-ink-2">
              Taking you back to the app.
            </p>
          </>
        ) : null}

        {state === "error" ? (
          <>
            <p className="eyebrow eyebrow-contour">Sign-in failed</p>
            <h1 className="mt-3 font-display text-2xl font-medium tracking-[-0.01em] text-ink">
              That link could not be verified
            </h1>
            <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.55] text-ink-2">
              {errorMsg ||
                "The link may have expired or already been used. Please try again from the login page."}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center rounded-[4px] border border-ink bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper hover:bg-ink-2"
            >
              Back to sign-in
            </Link>
          </>
        ) : null}
      </div>
    </main>
  );
}
