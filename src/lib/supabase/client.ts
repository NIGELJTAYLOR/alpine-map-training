/**
 * Browser-side Supabase client.
 *
 * The anon key is safe to expose: row-level security on the user_progress
 * table restricts every read and write to the authenticated user's own row.
 * The service role key (which bypasses RLS) must never end up here.
 *
 * NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in
 * .env.local for local dev and in Vercel project settings for production.
 *
 * detectSessionInUrl is enabled so the /auth/callback page automatically
 * picks up the magic-link parameters and exchanges them for a session.
 *
 * We use the implicit flow (token in URL hash) rather than PKCE. PKCE
 * requires a code verifier to be stored in the same browser between the
 * signInWithOtp call and the magic-link click; with a custom storageKey
 * the verifier sometimes lands under a key the exchange code does not
 * read, surfacing as "Params are not set" / "could not be verified".
 * Implicit avoids that entirely. The marginal referrer-header risk does
 * not apply to a private-domain PWA.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let triedToInitialise = false;

/**
 * Whether the Supabase auth/sync layer is configured in this environment.
 *
 * Returns true only when both NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set. UI components use this to hide
 * sign-in surfaces when the app is running without an auth backend (for
 * example, the very first production deploy before Vercel env vars are
 * added). Cross-device sync degrades gracefully to local-only.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Return the singleton Supabase client, or null if env vars are missing.
 *
 * Callers MUST handle the null case. The AuthProvider treats null as
 * "user is permanently signed out" and disables sign-in flows. This is
 * what makes the build deployable before Supabase is fully wired in
 * production: nothing crashes, sign-in surfaces are hidden, and the
 * local-only experience still works.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cached) return cached;
  if (triedToInitialise) return null;
  triedToInitialise = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (typeof window !== "undefined") {
      console.info(
        "[supabase] Auth/sync not configured in this environment. The app will run in local-only mode.",
      );
    }
    return null;
  }

  cached = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit",
      storageKey: "alpine-map-training:auth",
    },
  });
  return cached;
}
