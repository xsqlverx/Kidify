"use client";

import { useKidify, useHydrated } from "@/lib/store";
import { Onboarding } from "@/components/kidify/Onboarding";
import { AppShell } from "@/components/kidify/AppShell";

export default function Home() {
  const hydrated = useHydrated();
  const onboardingComplete = useKidify((s) => s.onboardingComplete);
  const unlocked = useKidify((s) => s.unlocked);

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="animate-pulse text-4xl">🧸</div>
      </div>
    );
  }

  const showApp = onboardingComplete && unlocked;

  return showApp ? <AppShell /> : <Onboarding />;
}
