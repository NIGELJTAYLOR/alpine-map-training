"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress/provider";

/**
 * First-run gate.
 *
 * When the progress store hydrates and reveals that the user has not yet
 * completed the onboarding wizard, this redirects them to /onboarding.
 * The redirect happens once per device. Already-onboarded users see
 * nothing; the splash is silent.
 */
export function IntroSplash() {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, store } = useProgress();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!hydrated || hasChecked) return;
    setHasChecked(true);
    // Already on the onboarding route — nothing to do.
    if (pathname === "/onboarding") return;
    // First-run: kick into the wizard.
    if (!store.settings.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [hydrated, hasChecked, pathname, store.settings.onboardingComplete, router]);

  return null;
}
