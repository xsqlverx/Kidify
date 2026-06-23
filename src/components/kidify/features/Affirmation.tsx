"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { PinkCard, PinkButton, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { logActivity } from "@/lib/activity-logger";
import { AFFIRMATIONS } from "@/lib/affirmations-data";
import { Sparkles, Heart, X, Bookmark, BookmarkCheck, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function AffirmationCard() {
  const savedAffirmations = useKidify((s) => s.savedAffirmations);
  const toggleAffirmation = useKidify((s) => s.toggleAffirmation);
  const [idx, setIdx] = useState(() => dayOfYear() % AFFIRMATIONS.length);
  const [showAll, setShowAll] = useState(false);

  const current = AFFIRMATIONS[idx];
  const isSaved = savedAffirmations.includes(idx);

  const handleShuffle = () => {
    let next = idx;
    while (next === idx && AFFIRMATIONS.length > 1) {
      next = Math.floor(Math.random() * AFFIRMATIONS.length);
    }
    setIdx(next);
  };

  const handleSave = () => {
    toggleAffirmation(idx);
    logActivity("affirmation_saved", `${isSaved ? "unsaved" : "saved"}: ${current.emoji} ${current.text.substring(0, 40)}`);
    toast.success(isSaved ? "unsaved. 💗" : "saved to your heart. 🤍", {
      description: isSaved ? undefined : "come back to it whenever you need it.",
    });
  };

  return (
    <>
      <PinkCard className="relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-6xl opacity-10">{current.emoji}</div>

        <div className="mb-3 flex items-center justify-between">
          <Pill>
            <Sparkles className="h-3 w-3" /> today's affirmation
          </Pill>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShuffle}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100"
              aria-label="another one"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowAll(true)}
              className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-400 hover:bg-rose-100"
            >
              saved ({savedAffirmations.length})
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-4 text-center">
          <motion.div
            key={idx}
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="mb-3 text-5xl"
          >
            {current.emoji}
          </motion.div>
          <motion.p
            key={`text-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-hand text-2xl leading-8 text-rose-700"
          >
            {current.text}
          </motion.p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <PinkButton
            onClick={handleSave}
            size="sm"
            className={cn(
              "h-9 px-4 text-xs",
              isSaved && "bg-rose-100 from-rose-100 to-rose-100 text-rose-500 hover:from-rose-200 hover:to-rose-200",
            )}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="mr-1.5 h-3.5 w-3.5" /> saved
              </>
            ) : (
              <>
                <Bookmark className="mr-1.5 h-3.5 w-3.5" /> save this one
              </>
            )}
          </PinkButton>
        </div>
      </PinkCard>

      {/* saved affirmations modal */}
      <AnimatePresence>
        {showAll && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAll(false)}
            >
              <motion.div
                className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-gradient-to-b from-white to-rose-50 p-5 shadow-glow-rose pretty-scroll sm:rounded-3xl"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-gradient-rose">your saved affirmations</h3>
                    <p className="text-xs text-rose-400">the ones that landed</p>
                  </div>
                  <button
                    onClick={() => setShowAll(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {savedAffirmations.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mb-2 text-4xl"
                    >
                      🤍
                    </motion.div>
                    <p className="text-sm text-rose-400">
                      nothing saved yet. when an affirmation lands, tap "save this one".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedAffirmations.map((i) => {
                      const a = AFFIRMATIONS[i];
                      if (!a) return null;
                      return (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-start gap-3 rounded-2xl bg-white/70 p-3"
                        >
                          <span className="text-2xl">{a.emoji}</span>
                          <p className="flex-1 font-hand text-lg leading-6 text-rose-700">{a.text}</p>
                          <button
                            onClick={() => {
                              toggleAffirmation(i);
                              logActivity("affirmation_saved", `Removed saved affirmation`);
                              toast("unsaved");
                            }}
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-rose-300 hover:bg-rose-100 hover:text-rose-500"
                            aria-label="remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
