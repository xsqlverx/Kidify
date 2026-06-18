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
import { AdminPanel } from "./features/Admin";
import { Home, Droplet, ImageIcon, Flower2, Heart, Settings } from "lucide-react";
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
  const [adminDismissed, setAdminDismissed] = useState(false);
  const adminUnlocked = useKidify((s) => s.adminUnlocked);
  const bearName = useKidify((s) => s.bearName);
  const resetWaterIfNewDay = useKidify((s) => s.resetWaterIfNewDay);
  const bearPats = useKidify((s) => s.bearPats);

  // reset water count on a new day
  useEffect(() => {
    resetWaterIfNewDay();
  }, [resetWaterIfNewDay]);

  // panel auto-opens when the secret 7-tap unlocks admin (unless dismissed)
  const adminOpen = adminUnlocked && !adminDismissed;

  const openAdmin = () => setAdminDismissed(false);
  const closeAdmin = () => setAdminDismissed(true);

  return (
    <div className="relative min-h-[100dvh] w-full">
      <FloatingDecor density={10} />

      {/* main scroll area */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 pb-28 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {tab === "home" && <HomeFeature />}
            {tab === "cycle" && <PeriodTracker />}
            {tab === "gallery" && <Gallery />}
            {tab === "garden" && <Garden />}
            {tab === "thanks" && <ThankYou />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* floating bear — follows her everywhere */}
      <motion.button
        className="fixed bottom-24 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 140 }}
        aria-label={`${bearName} — tap to play, tap 7 times for admin`}
        onClick={() => {
          // taps handled inside Bear; this is just so the button is focusable
        }}
      >
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

      {/* admin gear — only visible after unlock */}
      {adminUnlocked && (
        <motion.button
          className="fixed bottom-44 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-rose-500 shadow-soft backdrop-blur"
          onClick={() => openAdmin()}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          aria-label="open admin panel"
        >
          <Settings className="h-4 w-4" />
        </motion.button>
      )}

      {/* bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-rose-100/60 bg-white/70 backdrop-blur-xl">
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

      {/* admin panel */}
      <AnimatePresence>
        {adminOpen && <AdminPanel onClose={closeAdmin} />}
      </AnimatePresence>
    </div>
  );
}
