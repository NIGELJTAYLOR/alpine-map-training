"use client";

/**
 * Auth provider for the Alpine Map Training PWA.
 *
 * Wraps the app in a React context that exposes the current Supabase user
 * (or null) plus helpers for the magic-link sign-in flow. Sits ABOVE the
 * ProgressProvider in the tree so progress sync can react to login and
 * logout events.
 *
 * The actual cross-device sync logic lives in the ProgressProvider; this
 * file only handles authentication state.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AuthContextValue {
  /** True once the initial session check has resolved. Before this, treat
   *  `user` as unknown rather than as "definitely not signed in". */
  hydrated: boolean;
  /** Current authenticated user, or null if not signed in. */
  user: User | null;
  /** Current session, or null if not signed in. Exposed for callers that
   *  need the access token (rare in V1.4.0). */
  session: Session | null;
  /** Send a magic-link email to the given address. Returns null on success,
   *  or an error message string on failure. */
  signInWithEmail: (email: string) => Promise<string | null>;
  /** End the current session. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // Supabase env vars missing: degrade to permanent signed-out state.
      // The app continues to work in local-only mode; cross-device sync
      // simply does not engage.
      setHydrated(true);
      return;
    }
    let mounted = true;

    // Initial session check on mount.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setHydrated(true);
      })
      .catch(() => {
        if (!mounted) return;
        setHydrated(true);
      });

    // Subscribe to subsequent auth events (sign in, sign out, token refresh).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      setUser(next?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return "Sign-in is not yet available on this deployment. The app works fully without an account; cross-device sync will switch on in a future update.";
    }
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      return "Please enter a valid email address.";
    }
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: redirectTo,
        // shouldCreateUser defaults to true: first time someone signs in with
        // their email, Supabase creates the user record automatically.
      },
    });
    if (error) return error.message;
    return null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ hydrated, user, session, signInWithEmail, signOut }),
    [hydrated, user, session, signInWithEmail, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
