"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { PinkCard, PinkButton, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { Wind, X, Play, Pause } from "lucide-react";
import { toast } from "sonner";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { key: Phase; label: string; duration: number; emoji: string }[] = [
  { key: "inhale", label: "breathe in", duration: 4, emoji: "🌸" },
  { key: "hold", label: "hold", duration: 7, emoji: "🤍" },
  { key: "exhale", label: "breathe out", duration: 8, emoji: "🫧" },
  { key: "rest", label: "rest", duration: 2, emoji: "🌙" },
];

const TOTAL_CYCLE = PHASES.reduce((a, p) => a + p.duration, 0); // 21s

export function BreathingBubble() {
  const [open, setOpen] = useState(false);
  const breathSessions = useKidify((s) => s.breathSessions);
  const lastBreathAt = useKidify((s) => s.lastBreathAt);
  const logBreathSession = useKidify((s) => s.logBreathSession);

  return (
    <>
      <PinkCard
        className="cursor-pointer overflow-hidden"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wind className="h-6 w-6 text-violet-400" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-rose-600">
              need a breath?
            </h3>
            <p className="text-xs text-rose-400">
              {breathSessions === 0
                ? "a tiny 4-7-8 breathing exercise, for the loud moments"
                : `${breathSessions} ${breathSessions === 1 ? "session" : "sessions"} of calm, together`}
            </p>
          </div>
          <motion.div
            className="text-2xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🫧
          </motion.div>
        </div>
      </PinkCard>

      <AnimatePresence>
        {open && (
          <BreathingExercise
            onClose={() => setOpen(false)}
            onComplete={() => {
              logBreathSession();
              toast.success("there you are. 🤍", {
                description: "you did good. the bear is proud of you.",
              });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function BreathingExercise({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration);
  const [cyclesDone, setCycleDone] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = PHASES[phaseIdx];

  // bubble scale per phase
  const bubbleScale =
    phase.key === "inhale"
      ? 1.6
      : phase.key === "exhale"
        ? 0.6
        : phase.key === "hold"
          ? phaseIdx === 1
            ? 1.6
            : 0.6
          : 0.6; // rest

  const tick = useCallback(() => {
    setSecondsLeft((s) => {
      if (s > 1) return s - 1;
      // advance phase
      setPhaseIdx((p) => {
        const next = (p + 1) % PHASES.length;
        if (next === 0) {
          // completed a full cycle
          setCycleDone((c) => c + 1);
        }
        return next;
      });
      return 0;
    });
  }, []);

  // reset seconds when phase changes
  useEffect(() => {
    setSecondsLeft(PHASES[phaseIdx].duration);
  }, [phaseIdx]);

  // detect completion (3 cycles) — triggered outside of state updaters
  useEffect(() => {
    if (cyclesDone >= 3 && !completed) {
      setCompleted(true);
      setRunning(false);
      onComplete();
    }
  }, [cyclesDone, completed, onComplete]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  const handleStart = () => {
    setRunning(true);
  };

  const handlePause = () => {
    setRunning(false);
  };

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose();
  };

  const progress = cyclesDone / 3;

  return (
    <Portal>
      <motion.div
        className="fixed inset-0 z-[70] flex flex-col bg-gradient-to-b from-violet-950 via-rose-950 to-pink-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* header */}
        <div className="flex items-center justify-between p-4 text-white">
          <div>
            <p className="font-display text-lg font-bold">breathe with me</p>
            <p className="text-[10px] text-white/50">
              4-7-8 · 3 cycles · {cyclesDone}/3 done
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
            aria-label="close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-all ${
                i < cyclesDone ? "bg-rose-400" : i === cyclesDone && running ? "bg-rose-400/60" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* breathing bubble */}
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="relative flex h-72 w-72 items-center justify-center">
            {/* outer rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-rose-400/10"
              animate={{ scale: running ? bubbleScale : 1, opacity: [0.3, 0.5, 0.3] }}
              transition={{
                scale: { duration: phase.duration, ease: "easeInOut" },
                opacity: { duration: 3, repeat: Infinity },
              }}
            />
            <motion.div
              className="absolute inset-4 rounded-full bg-rose-400/20"
              animate={{ scale: running ? bubbleScale : 1, opacity: [0.4, 0.6, 0.4] }}
              transition={{
                scale: { duration: phase.duration, ease: "easeInOut" },
                opacity: { duration: 3, repeat: Infinity, delay: 0.3 },
              }}
            />
            {/* main bubble */}
            <motion.div
              className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-rose-300/80 via-pink-400/70 to-violet-400/60 shadow-glow-rose"
              animate={{ scale: running ? bubbleScale : 1 }}
              transition={{ duration: phase.duration, ease: "easeInOut" }}
            >
              {/* shimmer */}
              <motion.div
                className="absolute left-8 top-8 h-6 w-6 rounded-full bg-white/40 blur-sm"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="text-center text-white">
                <motion.div
                  className="text-4xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {phase.emoji}
                </motion.div>
                <p className="mt-2 font-display text-xl font-bold">
                  {running ? phase.label : "ready?"}
                </p>
                {running && (
                  <motion.p
                    key={secondsLeft}
                    className="text-3xl font-bold"
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {secondsLeft}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </div>

          <p className="mt-8 text-center text-sm text-white/60">
            {!running && cyclesDone === 0 && "tap start. follow the bubble. that's all."}
            {!running && cyclesDone > 0 && cyclesDone < 3 && "keep going. you're doing beautifully."}
            {!running && cyclesDone >= 3 && "all done. take one more breath, just for you."}
            {running && "follow the bubble — it knows the way."}
          </p>
        </div>

        {/* controls */}
        <div className="p-6">
          {!running ? (
            cyclesDone >= 3 ? (
              <button
                onClick={handleClose}
                className="w-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500 py-3.5 font-display text-base font-bold text-white shadow-glow-rose"
              >
                🤍 all done
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 py-3.5 font-display text-base font-bold text-white shadow-glow-rose"
              >
                <Play className="h-5 w-5 fill-white" />
                {cyclesDone === 0 ? "start breathing" : "continue"}
              </button>
            )
          ) : (
            <button
              onClick={handlePause}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-3.5 font-display text-base font-bold text-white backdrop-blur"
            >
              <Pause className="h-5 w-5 fill-white" /> pause
            </button>
          )}
        </div>
      </motion.div>
    </Portal>
  );
}
