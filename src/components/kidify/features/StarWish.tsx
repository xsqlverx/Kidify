"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { Star, X, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function StarWish() {
  const wishes = useKidify((s) => s.wishes);
  const addWish = useKidify((s) => s.addWish);
  const removeWish = useKidify((s) => s.removeWish);

  const [showMaker, setShowMaker] = useState(false);
  const [text, setText] = useState("");
  const [shooting, setShooting] = useState(false);

  const handleWish = () => {
    if (!text.trim()) {
      toast.error("make a wish first 🌟");
      return;
    }
    setShooting(true);
    setTimeout(() => {
      addWish(text);
      toast.success("your wish is on its way. 🌠", {
        description: "the stars are listening. they always are.",
      });
      setText("");
      setShooting(false);
      setShowMaker(false);
    }, 1600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle subtitle="make a wish. the stars are listening">
          <span className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-300 text-amber-400" /> wish upon a star
          </span>
        </SectionTitle>
        <PinkButton onClick={() => setShowMaker(true)} size="sm" className="h-8 px-3 text-xs">
          <Star className="mr-1 h-3 w-3 fill-white" /> wish
        </PinkButton>
      </div>

      {/* night sky */}
      <PinkCard className="relative overflow-hidden bg-gradient-to-b from-indigo-950/90 via-violet-950/80 to-rose-950/80">
        {/* twinkling stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-[8px] text-white"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{
                duration: 2 + (i % 3),
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            >
              ✦
            </motion.div>
          ))}
        </div>

        {/* shooting star animation */}
        <AnimatePresence>
          {shooting && (
            <motion.div
              className="absolute left-0 top-1/3 text-2xl"
              initial={{ x: -50, y: 0, opacity: 0 }}
              animate={{ x: 350, y: 120, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <motion.span
                className="inline-block"
                animate={{ rotate: 30 }}
              >
                🌠
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 p-4 text-center text-white">
          <motion.div
            className="mb-2 text-5xl"
            animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🌙
          </motion.div>
          <p className="font-hand text-xl text-rose-100">
            {wishes.length === 0
              ? "your night sky is waiting for a wish"
              : `${wishes.length} ${wishes.length === 1 ? "wish" : "wishes"} among the stars`}
          </p>
          <p className="mt-1 text-xs text-white/50">
            {wishes.length === 0
              ? "tap 'wish' and send one up"
              : "tap a wish to let it go, or make a new one"}
          </p>
        </div>

        {/* wish list */}
        {wishes.length > 0 && (
          <div className="relative z-10 mt-2 space-y-1.5 px-3 pb-3">
            {wishes.slice(0, 5).map((w) => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur"
              >
                <span className="text-sm">⭐</span>
                <p className="flex-1 truncate text-xs text-white/90">{w.text}</p>
                <button
                  onClick={() => {
                    removeWish(w.id);
                    toast("wish released to the sky");
                  }}
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
                  aria-label="release wish"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </PinkCard>

      {/* wish maker modal */}
      <AnimatePresence>
        {showMaker && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-indigo-950/80 backdrop-blur-md sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !shooting && setShowMaker(false)}
            >
              {/* shooting star overlay during wish */}
              <AnimatePresence>
                {shooting && (
                  <>
                    <motion.div
                      className="absolute left-0 top-1/4 text-4xl"
                      initial={{ x: -100, y: 0, opacity: 0 }}
                      animate={{ x: 500, y: 200, opacity: [0, 1, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                      🌠
                    </motion.div>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-lg"
                        style={{ left: `${20 + i * 8}%`, top: `${30 + (i % 3) * 15}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>

              <motion.div
                className="w-full max-w-md rounded-t-3xl bg-gradient-to-b from-violet-950 to-rose-950 p-6 shadow-glow-rose sm:rounded-3xl"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 sm:hidden" />
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-white">make a wish</h3>
                  <button
                    onClick={() => setShowMaker(false)}
                    disabled={shooting}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <motion.div
                  className="mb-4 flex flex-col items-center"
                  animate={shooting ? { scale: [1, 1.2, 1] } : { y: [0, -6, 0] }}
                  transition={{ duration: shooting ? 0.8 : 3, repeat: Infinity }}
                >
                  <span className="text-6xl">{shooting ? "🌠" : "🌟"}</span>
                </motion.div>

                <p className="mb-3 text-center font-hand text-lg text-rose-100">
                  {shooting
                    ? "your wish is flying up to the stars…"
                    : "close your eyes for a second. what do you really want?"}
                </p>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="i wish…"
                  rows={3}
                  maxLength={150}
                  disabled={shooting}
                  className="w-full resize-none rounded-2xl border-2 border-white/20 bg-white/10 p-3 text-center text-white placeholder:text-white/40 focus:border-rose-400 focus:outline-none disabled:opacity-50"
                  autoFocus
                />

                <PinkButton
                  onClick={handleWish}
                  disabled={shooting || !text.trim()}
                  className="mt-3 w-full"
                  heart
                >
                  <Send className="mr-1.5 h-4 w-4" />
                  {shooting ? "flying…" : "send it to the stars"}
                </PinkButton>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
