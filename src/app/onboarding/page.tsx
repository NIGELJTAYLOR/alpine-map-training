import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/site/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Get started",
};

export default function OnboardingPage() {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <OnboardingFlow />
    </main>
  );
}
