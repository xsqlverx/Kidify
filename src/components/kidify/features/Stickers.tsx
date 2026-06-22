"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PinkCard, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify, type StickerTask } from "@/lib/store";
import { Droplets, Mail, Heart, PawPrint, Sprout, Sparkles, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const TASKS: {
  task: StickerTask;
  label: string;
  emoji: string;
  icon: typeof Droplets;
  color: string;
  bg: string;
}[] = [
  { task: "water", label: "drink water", emoji: "💧", icon: Droplets, color: "text-sky-500", bg: "bg-sky-100" },
  { task: "read", label: "read today's note", emoji: "📖", icon: Mail, color: "text-rose-500", bg: "bg-rose-100" },
  { task: "hug", label: "send a hug", emoji: "🤗", icon: Heart, color: "text-pink-500", bg: "bg-pink-100" },
  { task: "pat", label: "pat the bear", emoji: "🧸", icon: PawPrint, color: "text-amber-600", bg: "bg-amber-100" },
  { task: "garden", label: "tend the garden", emoji: "🌱", icon: Sprout, color: "text-emerald-500", bg: "bg-emerald-100" },
  { task: "reason", label: "reveal a reason", emoji: "💌", icon: Sparkles, color: "text-violet-500", bg: "bg-violet-100" },
];

export function StickerBook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stickersEarnedToday = useKidify((s) => s.stickersEarnedToday);
  const stickerCollection = useKidify((s) => s.stickerCollection);

  const allDone = TASKS.every((t) => stickersEarnedToday.includes(t.task));

  return (
    <AnimatePresence>
      {open && (
        <Portal>
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-gradient-to-b from-white to-rose-50 p-5 shadow-glow-rose pretty-scroll sm:rounded-3xl"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-gradient-rose">your sticker book</h3>
                  <p className="text-xs text-rose-400">little wins, collected with love</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                  aria-label="close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* today's tasks */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-display text-sm font-bold text-rose-600">today's care tasks</p>
                  <Pill>{stickersEarnedToday.length}/{TASKS.length}</Pill>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TASKS.map((t) => {
                    const done = stickersEarnedToday.includes(t.task);
                    return (
                      <motion.div
                        key={t.task}
                        className={cn(
                          "relative flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all",
                          done
                            ? "border-rose-300 bg-white shadow-soft"
                            : "border-rose-100 bg-rose-50/50 opacity-70",
                        )}
                      >
                        <motion.div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-xl",
                            done ? t.bg : "bg-rose-100/50 grayscale",
                          )}
                          animate={done ? { scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          {done ? t.emoji : "🔒"}
                        </motion.div>
                        <span className={cn("text-center text-[10px] font-semibold leading-tight", done ? "text-rose-600" : "text-rose-300")}>
                          {t.label}
                        </span>
                        {done && (
                          <motion.div
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                {allDone ? (
                  <motion.div
                    className="mt-3 rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100 p-3 text-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <p className="font-display text-sm font-bold text-rose-600">
                      🌟 you did every little thing today. 🌟
                    </p>
                    <p className="text-[11px] text-rose-400">the bear is so, so proud of you.</p>
                  </motion.div>
                ) : (
                  <p className="mt-3 text-center text-[11px] text-rose-400">
                    complete each to earn a sticker for your collection
                  </p>
                )}
              </div>

              {/* collection stats */}
              <div className="rounded-2xl bg-white/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-rose-400" />
                  <p className="font-display text-sm font-bold text-rose-600">all-time collection</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-2xl font-bold text-gradient-rose">
                      {stickerCollection.length}
                    </p>
                    <p className="text-[10px] uppercase text-rose-400">total stickers earned</p>
                  </div>
                  <div className="flex gap-1 text-xl">
                    {TASKS.map((t) => {
                      const count = stickerCollection.filter((s) => s.task === t.task).length;
                      return (
                        <div key={t.task} className="relative" title={`${t.label}: ${count}`}>
                          <span className={count === 0 ? "opacity-30 grayscale" : ""}>{t.emoji}</span>
                          {count > 0 && (
                            <span className="absolute -bottom-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8px] font-bold text-white">
                              {count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

/** Compact daily-progress strip shown on Home. */
export function StickerStrip({ onOpen }: { onOpen: () => void }) {
  const stickersEarnedToday = useKidify((s) => s.stickersEarnedToday);
  const done = stickersEarnedToday.length;
  const total = TASKS.length;

  return (
    <PinkCard
      className="cursor-pointer"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm font-bold text-rose-600">today's little wins</p>
          <p className="text-[11px] text-rose-400">{done}/{total} care tasks done</p>
        </div>
        <div className="flex gap-0.5">
          {TASKS.map((t) => {
            const isDone = stickersEarnedToday.includes(t.task);
            return (
              <motion.div
                key={t.task}
                className={cn("text-lg", !isDone && "opacity-25 grayscale")}
                animate={isDone ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {t.emoji}
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500"
          animate={{ width: `${(done / total) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </PinkCard>
  );
}
