"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "alpine-map-training:intro-splash-shown";
const HOLD_MS = 1600;
const FADE_MS = 700;

/**
 * One-shot brand intro overlay. Mounts above the page on first visit per
 * tab/session, holds for ~1.6s while the brand reads, then fades over ~0.7s
 * to reveal the home page. Hidden completely on subsequent navigations
 * within the same session, and respects `prefers-reduced-motion` (instant
 * dismiss with no fade).
 */
export function IntroSplash() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading" | "gone">(
    "hidden",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Private mode etc. — fall through and show the splash.
    }
    if (alreadyShown) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase("visible");

    const fadeAt = window.setTimeout(
      () => setPhase("fading"),
      reduce ? 0 : HOLD_MS,
    );
    const removeAt = window.setTimeout(
      () => {
        setPhase("gone");
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignore */
        }
      },
      reduce ? 50 : HOLD_MS + FADE_MS,
    );

    return () => {
      window.clearTimeout(fadeAt);
      window.clearTimeout(removeAt);
    };
  }, []);

  if (phase === "hidden" || phase === "gone") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Alpine Map Training — loading"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-paper px-6 transition-opacity ease-out"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/brand/amt-emblem.png"
          alt=""
          width={480}
          height={412}
          priority
          className="h-auto w-full max-w-[260px] sm:max-w-[320px]"
        />
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Alpine Map Training
          </p>
          <Image
            src="/brand/by-performos-black-transparent.svg"
            alt="By PerformOS"
            width={638}
            height={127}
            priority
            unoptimized
            className="h-[28px] w-auto sm:h-[34px]"
          />
        </div>
      </div>
    </div>
  );
}
