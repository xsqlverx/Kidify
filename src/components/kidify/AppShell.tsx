"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bear } from "./Bear";
import { FloatingDecor } from "./ui/decor";
import { useKidify } from "@/lib/store";
import { HomeFeature } from "./features/Home";
import { PeriodTracker } from "./features/PeriodTracker";
import { Gallery } from "./features/Gallery";
import { Garden } from "./features/Garden";
import { ThankYou } from "./features/ThankYou";
import { BearSpeech } from "./features/BearSpeech";
import { Home, Droplet, ImageIcon, Flower2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "home" | "cycle" | "gallery" | "garden" | "thanks";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "today", icon: Home },
  { id: "cycle", label: "cycle", icon: Droplet },
  { id: "gallery", label: "us", icon: ImageIcon },
  { id: "garden", label: "garden", icon: Flower2 },
  { id: "thanks", label: "thank you", icon: Heart },
];

export function AppShell() {
  const [tab, setTab] = useState<Tab>("home");
  const bearName = useKidify((s) => s.bearName);
  const resetWaterIfNewDay = useKidify((s) => s.resetWaterIfNewDay);
  const bearPats = useKidify((s) => s.bearPats);

  useEffect(() => {
    resetWaterIfNewDay();
  }, [resetWaterIfNewDay]);

  return (
    <div className="relative min-h-[100dvh] w-full">
      <FloatingDecor density={10} />

      <main className="relative z-10 mx-auto w-full max-w-md px-4 pb-28 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="relative"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {tab === "home" && <HomeFeature />}
            {tab === "cycle" && <PeriodTracker />}
            {tab === "gallery" && <Gallery />}
            {tab === "garden" && <Garden />}
            {tab === "thanks" && <ThankYou />}
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.button
        className="fixed bottom-24 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 140 }}
        aria-label={bearName ?? "bear"}
      >
        <motion.div
          key={tab}
          className="absolute -left-3 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm shadow-soft"
          initial={{ scale: 0, x: 10, opacity: 0 }}
          animate={{ scale: 1, x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
        >
          {tab === "home" && "💌"}
          {tab === "cycle" && "🩷"}
          {tab === "gallery" && "📷"}
          {tab === "garden" && "🌱"}
          {tab === "thanks" && "🤍"}
        </motion.div>
        <Bear size={72} />
        {bearPats > 0 && (
          <motion.span
            key={bearPats}
            className="absolute -left-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
          >
            {bearPats}
          </motion.span>
        )}
      </motion.button>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-rose-100/60 bg-gradient-to-t from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
                aria-label={label}
              >
                {active && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-x-2 inset-y-0 rounded-2xl bg-rose-100/80"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div
                  className={cn(
                    "relative z-10 flex flex-col items-center gap-0.5",
                    active ? "text-rose-600" : "text-rose-300",
                  )}
                  animate={active ? { scale: 1.05, y: -1 } : { scale: 1, y: 0 }}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2} />
                  <span className="text-[10px] font-semibold">{label}</span>
                </motion.div>
              </button>
            );
          })}
        </div>
      </nav>

      <BearSpeech />
    </div>
  );
}
