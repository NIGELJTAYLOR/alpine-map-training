"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISSED_KEY = "alpine-map-training:install-dismissed";

/**
 * Shows a small install banner when the browser fires `beforeinstallprompt`
 * (Chrome/Edge/Android). On iOS Safari the event never fires; we detect that
 * separately and surface a brief instruction instead.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect prior dismissal
    if (window.localStorage.getItem(DISMISSED_KEY)) {
      setDismissed(true);
      return;
    }

    // Already-installed PWAs run in standalone display mode — don't prompt.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari standalone flag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;
    if (standalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari heuristic: webkit + no chrome + no Edge + no Android.
    const ua = window.navigator.userAgent;
    const isIos =
      /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIos) setShowIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setDismissed(true);
    setDeferred(null);
    setShowIosHint(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted" || choice.outcome === "dismissed") {
      setDeferred(null);
      dismiss();
    }
  }

  if (dismissed) return null;

  if (deferred) {
    return (
      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-lg sm:bottom-4">
        <p className="font-sans text-sm font-medium text-foreground">
          Install this app for offline use
        </p>
        <p className="mt-1 font-serif text-xs text-muted-foreground">
          Adds an icon to your home screen and lets you use the workbook
          without a connection.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={install}
            className="rounded-md bg-primary px-3 py-1.5 font-sans text-sm text-primary-foreground hover:bg-primary/90"
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-border px-3 py-1.5 font-sans text-sm hover:border-foreground"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-lg sm:bottom-4">
        <p className="font-sans text-sm font-medium text-foreground">
          Add to Home Screen for offline use
        </p>
        <p className="mt-1 font-serif text-xs text-muted-foreground">
          On iPhone: tap the Share button, then &ldquo;Add to Home
          Screen&rdquo;.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-border px-3 py-1.5 font-sans text-sm hover:border-foreground"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return null;
}
