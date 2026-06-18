"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, PinkButton, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { REASONS } from "@/lib/reasons-data";
import { X, ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";

export function ReasonsDeck({ open, onClose }: { open: boolean; onClose: () => void }) {
  const revealedReasons = useKidify((s) => s.revealedReasons);
  const revealReason = useKidify((s) => s.revealReason);
  const earnSticker = useKidify((s) => s.earnSticker);
  const bearName = useKidify((s) => s.bearName);

  // index into REASONS; start at the first unrevealed one, or 0
  const [idx, setIdx] = useState(() => {
    const firstUnrevealed = REASONS.findIndex((_, i) => !revealedReasons.includes(i));
    return firstUnrevealed === -1 ? 0 : firstUnrevealed;
  });
  const [flipped, setFlipped] = useState(false);

  const current = REASONS[idx];
  const isRevealed = revealedReasons.includes(idx);
  const totalRevealed = revealedReasons.length;

  const handleFlip = () => {
    if (flipped) return;
    setFlipped(true);
    if (!isRevealed) {
      revealReason(idx);
      earnSticker("reason");
      setTimeout(() => {
        toast.success("a new reason, kept safe. 🤍", {
          description: `${bearName} tucked it into the jar.`,
        });
      }, 400);
    }
  };

  const navigate = (dir: number) => {
    setFlipped(false);
    setTimeout(() => {
      const next = (idx + dir + REASONS.length) % REASONS.length;
      setIdx(next);
    }, 150);
  };

  return (
    <AnimatePresence>
      {open && (
        <Portal>
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-b from-rose-950/95 to-pink-950/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* header */}
            <div className="flex items-center justify-between p-4 text-white">
              <div>
                <p className="font-display text-lg font-bold">reasons i love you</p>
                <p className="text-[10px] text-white/50">
                  {totalRevealed} of {REASONS.length} revealed
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
                aria-label="close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* progress dots */}
            <div className="flex flex-wrap justify-center gap-1 px-4 pb-2">
              {REASONS.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${revealedReasons.includes(i) ? "bg-rose-400" : "bg-white/20"}`}
                  animate={i === idx ? { scale: [1, 1.6, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              ))}
            </div>

            {/* card area */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 pb-6">
              {/* nav arrow left */}
              <div className="flex w-full items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
                  aria-label="previous reason"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* the flip card */}
                <motion.button
                  className="relative h-[60vh] max-h-96 w-64 cursor-pointer"
                  style={{ perspective: 1000 }}
                  onClick={handleFlip}
                  whileTap={{ scale: 0.97 }}
                  aria-label={flipped ? "reason revealed" : "tap to reveal reason"}
                >
                  <motion.div
                    className="relative h-full w-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 18 }}
                  >
                    {/* back of card (shown first, the "closed" envelope) */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 p-6 shadow-glow-rose"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <motion.div
                        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-6xl"
                      >
                        💌
                      </motion.div>
                      <p className="mt-4 text-center font-display text-lg font-bold text-white">
                        reason #{idx + 1}
                      </p>
                      <p className="mt-1 text-center text-xs text-white/80">
                        {flipped ? "revealed" : "tap to open"}
                      </p>
                      {!isRevealed && (
                        <motion.div
                          className="mt-3 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="h-3 w-3" /> new
                        </motion.div>
                      )}
                    </div>

                    {/* front of card (the reason, shown after flip) */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-amber-50 to-rose-50 p-6 shadow-glow-rose"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <div className="absolute -right-2 -top-2 text-3xl">{current.emoji}</div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                        <span className="text-2xl">{current.emoji}</span>
                      </div>
                      <p className="text-center font-hand text-xl leading-8 text-rose-800/90">
                        {current.text}
                      </p>
                      <p className="mt-6 font-hand text-base text-rose-400">
                        — reason #{idx + 1}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-rose-300">
                        <Heart className="h-3 w-3 fill-rose-300" />
                        <span className="text-[10px]">kept forever</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.button>

                {/* nav arrow right */}
                <button
                  onClick={() => navigate(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
                  aria-label="next reason"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-white/50">
                {flipped
                  ? "swipe or tap the arrows for another"
                  : "tap the letter to reveal this reason"}
              </p>
            </div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

/** A compact card shown on the Home tab that opens the full deck. */
export function ReasonsCard({ onOpen }: { onOpen: () => void }) {
  const revealedReasons = useKidify((s) => s.revealedReasons);
  const total = REASONS.length;
  const revealed = revealedReasons.length;
  const nextUnrevealed = REASONS.findIndex((_, i) => !revealedReasons.includes(i));
  const hasNew = nextUnrevealed !== -1;

  return (
    <PinkCard
      className="relative cursor-pointer overflow-hidden"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="absolute -right-3 -top-3 text-6xl opacity-10">💌</div>
      <div className="flex items-center justify-between">
        <Pill>
          <Heart className="h-3 w-3 fill-rose-400 text-rose-400" /> reasons i love you
        </Pill>
        {hasNew && (
          <motion.span
            className="flex items-center gap-1 rounded-full bg-rose-400 px-2 py-0.5 text-[10px] font-bold text-white"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="h-2.5 w-2.5" /> new
          </motion.span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <motion.div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 text-3xl shadow-soft"
          animate={{ rotate: [0, -6, 6, 0], y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          💌
        </motion.div>
        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-rose-600">
            {revealed === 0
              ? "open your first reason"
              : hasNew
                ? "there's a new one waiting"
                : "your little jar of reasons"}
          </h3>
          <p className="text-xs text-rose-400">
            {revealed} of {total} reasons revealed
          </p>
          {/* progress bar */}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500"
              animate={{ width: `${(revealed / total) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </PinkCard>
  );
}
