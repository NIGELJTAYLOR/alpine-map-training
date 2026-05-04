"use client";

import { useEffect } from "react";

/**
 * Registers the hand-rolled service worker on mount.
 *
 * Skipped in development (Next.js dev server doesn't serve a stable origin)
 * and on browsers without service-worker support.
 */
export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname === "localhost" && process.env.NODE_ENV === "development") {
      return;
    }
    let cancelled = false;
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;
        // Listen for an update; when one becomes installed, ask it to take over.
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              installing.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch (err) {
        // SW registration is non-critical; if it fails we still serve content normally.
        console.warn("SW registration failed", err);
      }
    };
    // Wait for `load` so SW registration doesn't compete with the initial paint.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
