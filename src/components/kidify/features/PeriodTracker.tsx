"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { Droplet, Heart, Sparkles, Flower2, Moon, Plus, X } from "lucide-react";
import { toast } from "sonner";

type Phase = {
  key: string;
  name: string;
  emoji: string;
  color: string;
  bg: string;
  desc: string;
  icon: typeof Droplet;
};

const PHASES: Phase[] = [
  {
    key: "menstrual",
    name: "resting days",
    emoji: "🌙",
    color: "text-rose-500",
    bg: "bg-rose-100",
    desc: "slow down. warm things. you owe nobody your energy today.",
    icon: Moon,
  },
  {
    key: "follicular",
    name: "blooming",
    emoji: "🌱",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
    desc: "energy's coming back. the world feels possible again.",
    icon: Flower2,
  },
  {
    key: "ovulation",
    name: "glowing",
    emoji: "✨",
    color: "text-amber-500",
    bg: "bg-amber-100",
    desc: "peak you. you could charm a houseplant today.",
    icon: Sparkles,
  },
  {
    key: "luteal",
    name: "softening",
    emoji: "🫧",
    color: "text-violet-500",
    bg: "bg-violet-100",
    desc: "be gentle with yourself. extra water, extra kindness.",
    icon: Heart,
  },
];

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function PeriodTracker() {
  const periodLogs = useKidify((s) => s.periodLogs);
  const cycleLength = useKidify((s) => s.cycleLength);
  const periodLength = useKidify((s) => s.periodLength);
  const addPeriodLog = useKidify((s) => s.addPeriodLog);
  const removePeriodLog = useKidify((s) => s.removePeriodLog);

  const [showLogger, setShowLogger] = useState(false);
  const [pickedDate, setPickedDate] = useState(todayStr());

  const { phase, dayOfCycle, nextPeriod, daysUntilNext } = useMemo(() => {
    if (periodLogs.length === 0) {
      return { phase: null, dayOfCycle: 0, nextPeriod: null, daysUntilNext: null };
    }
    const last = new Date(periodLogs[0].date + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const doc = daysBetween(last, now) + 1; // day of cycle (1-indexed)
    const next = new Date(last);
    next.setDate(next.getDate() + cycleLength);
    const dun = daysBetween(now, next);

    let p: Phase;
    if (doc <= periodLength) p = PHASES[0];
    else if (doc <= cycleLength / 2 - 2) p = PHASES[1];
    else if (doc <= cycleLength / 2 + 2) p = PHASES[2];
    else p = PHASES[3];

    return { phase: p, dayOfCycle: doc, nextPeriod: next, daysUntilNext: dun };
  }, [periodLogs, cycleLength, periodLength]);

  const handleLog = () => {
    addPeriodLog(pickedDate);
    toast.success("logged. 💗", {
      description: "take it easy. you know where the bear is.",
    });
    setShowLogger(false);
  };

  const handleRemove = (id: string, date: string) => {
    removePeriodLog(id);
    toast(`removed ${date}`);
  };

  return (
    <div className="space-y-5">
      <SectionTitle subtitle="no pressure, no shame — just gentle tracking">
        your cycle
      </SectionTitle>

      {phase ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >          <PinkCard className={`overflow-hidden ${phase.bg} border-0`}>
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-3xl"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {phase.emoji}
              </motion.div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500/70">
                  day {dayOfCycle} of {cycleLength}
                </p>
                <h3 className={`font-display text-xl font-bold ${phase.color}`}>{phase.name}</h3>
              </div>
            </div>

            {/* cycle progress bar */}
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-violet-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (dayOfCycle / cycleLength) * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[9px] font-semibold text-rose-500/50">
                <span>resting</span>
                <span>blooming</span>
                <span>glowing</span>
                <span>softening</span>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-rose-900/70">{phase.desc}</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/70 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-rose-400">next one</p>
                <p className="font-display text-lg font-bold text-rose-600">
                  {nextPeriod?.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-rose-400">in about</p>
                <p className="font-display text-lg font-bold text-rose-600">
                  {daysUntilNext! > 0 ? `${daysUntilNext} days` : "any day now"}
                </p>
              </div>
            </div>
          </PinkCard>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PinkCard className="text-center">
            <motion.div
              className="mx-auto mb-3 text-5xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌸
            </motion.div>
            <h3 className="font-display text-xl font-bold text-rose-600">let's get to know you</h3>
            <p className="mt-2 text-sm text-rose-500/80">
              log the first day of your most recent period and the bear will start keeping track — gently, never nagging.
            </p>
            <PinkButton onClick={() => setShowLogger(true)} className="mt-4" heart>
              log my period
            </PinkButton>
          </PinkCard>
        </motion.div>
      )}

      {/* phase legend */}
      <div className="grid grid-cols-2 gap-2">
        {PHASES.map((p) => (
          <div key={p.key} className={`flex items-center gap-2 rounded-2xl ${p.bg} p-2.5`}>
            <span className="text-xl">{p.emoji}</span>
            <div>
              <p className={`text-xs font-bold ${p.color}`}>{p.name}</p>
              <p className="text-[10px] text-rose-400/70">phase</p>
            </div>
          </div>
        ))}
      </div>

      {/* log history */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-rose-600">your log</h3>
          <PinkButton onClick={() => setShowLogger(true)} size="sm" className="h-8 px-3 text-xs">
            <Plus className="mr-1 h-3 w-3" /> log
          </PinkButton>
        </div>

        {periodLogs.length === 0 ? (
          <PinkCard className="py-8 text-center text-sm text-rose-400">
            nothing logged yet. that's okay. 💗
          </PinkCard>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {periodLogs.map((log, i) => {
                const d = new Date(log.date + "T00:00:00");
                const gap =
                  i < periodLogs.length - 1
                    ? daysBetween(new Date(periodLogs[i + 1].date + "T00:00:00"), d)
                    : null;
                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <PinkCard className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-lg">
                          🩷
                        </div>
                        <div>
                          <p className="font-semibold text-rose-700">
                            {d.toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          {gap && (
                            <p className="text-[11px] text-rose-400">
                              {gap}-day cycle {gap < 21 || gap > 35 ? "· worth a note" : "· healthy range"}
                            </p>
                          )}
                          {log.note && <p className="text-[11px] italic text-rose-400">{log.note}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(log.id, log.date)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-rose-300 hover:bg-rose-50 hover:text-rose-500"
                        aria-label="remove log"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </PinkCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* logger modal */}
      <AnimatePresence>
        {showLogger && (
          <Portal>
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/20 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogger(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-glow-rose sm:rounded-3xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />
              <h3 className="font-display text-xl font-bold text-rose-600">log a period</h3>
              <p className="mt-1 text-sm text-rose-400">
                pick the first day it started. you can always remove it later.
              </p>
              <input
                type="date"
                value={pickedDate}
                max={todayStr()}
                onChange={(e) => setPickedDate(e.target.value)}
                className="mt-4 h-12 w-full rounded-2xl border-2 border-rose-200 bg-rose-50/50 px-4 text-rose-700 focus:border-rose-400 focus:outline-none"
              />
              <div className="mt-4 flex gap-2">
                <PinkButton
                  onClick={() => setShowLogger(false)}
                  className="flex-1 bg-rose-100 from-rose-100 to-rose-100 text-rose-500 hover:from-rose-200 hover:to-rose-200"
                >
                  cancel
                </PinkButton>
                <PinkButton onClick={handleLog} className="flex-1" heart>
                  save
                </PinkButton>
              </div>
            </motion.div>
          </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
