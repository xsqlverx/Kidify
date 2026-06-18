"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useKidify } from "@/lib/store";
import { PinkCard, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { CalendarHeart, Sparkles } from "lucide-react";
import { toast } from "sonner";

function daysSince(dateStr: string): number {
  const start = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((now.getTime() - start.getTime()) / 86400000));
}

function formatNum(n: number): string {
  return n.toLocaleString();
}

const MILESTONES = [
  { days: 1, label: "day one", emoji: "🌱" },
  { days: 30, label: "one month", emoji: "🌷" },
  { days: 100, label: "100 days", emoji: "💯" },
  { days: 365, label: "one whole year", emoji: "🎂" },
  { days: 500, label: "500 days", emoji: "🌸" },
  { days: 1000, label: "a thousand days", emoji: "✨" },
];

export function DaysCounter() {
  const anniversaryDate = useKidify((s) => s.anniversaryDate);
  const setAnniversary = useKidify((s) => s.setAnniversary);
  const [editing, setEditing] = useState(false);
  const [pickDate, setPickDate] = useState(anniversaryDate ?? "");

  const days = anniversaryDate ? daysSince(anniversaryDate) : null;
  const nextMilestone = days
    ? MILESTONES.find((m) => m.days > days) ?? MILESTONES[MILESTONES.length - 1]
    : null;
  const daysToNext = nextMilestone ? nextMilestone.days - (days ?? 0) : null;

  // a little compliment based on the day count
  const compliment = days === null
    ? ""
    : days < 7
      ? "and it's only the beginning."
      : days < 30
        ? "still counting. still choosing you."
        : days < 100
          ? "a hundred is coming. so is everything else."
          : days < 365
            ? "a whole year of you, almost."
            : "and somehow still day one, every morning.";

  const handleSave = () => {
    if (!pickDate) {
      toast.error("pick the day it all began");
      return;
    }
    setAnniversary(pickDate);
    setEditing(false);
    toast.success("saved. 💗", {
      description: "now the bear will count with you, every single day.",
    });
  };

  if (!anniversaryDate) {
    return (
      <>
        <PinkCard className="flex items-center gap-4">
          <motion.div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-100"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <CalendarHeart className="h-7 w-7 text-rose-500" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-rose-600">
              since the day we began
            </h3>
            <p className="mt-0.5 text-xs text-rose-400">
              set the date your story started, and the bear will count every day since.
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-full bg-rose-400 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            set date
          </button>
        </PinkCard>

        <AnimatePresence>
          {editing && (
            <Portal>
              <motion.div
                className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditing(false)}
              >
                <motion.div
                  className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-glow-rose sm:rounded-3xl"
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />
                  <h3 className="font-display text-xl font-bold text-rose-600">when did it begin?</h3>
                  <p className="mt-1 text-sm text-rose-400">
                    the day you two became "you two". the bear will count from here.
                  </p>
                  <input
                    type="date"
                    value={pickDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setPickDate(e.target.value)}
                    className="mt-4 h-12 w-full rounded-2xl border-2 border-rose-200 bg-rose-50/50 px-4 text-rose-700 focus:border-rose-400 focus:outline-none"
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 rounded-full bg-rose-100 py-2.5 text-sm font-semibold text-rose-500"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 py-2.5 text-sm font-bold text-white shadow-glow-rose"
                    >
                      save 💗
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </Portal>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <PinkCard className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">💗</div>
      <div className="flex items-center justify-between">
        <Pill>
          <CalendarHeart className="h-3 w-3" /> our story
        </Pill>
        <button
          onClick={() => {
            setPickDate(anniversaryDate);
            setEditing(true);
          }}
          className="text-[10px] font-semibold text-rose-400 underline-offset-2 hover:underline"
        >
          edit date
        </button>
      </div>

      <div className="mt-2 text-center">
        <motion.div
          key={days}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="font-display text-5xl font-extrabold text-gradient-rose"
        >
          {formatNum(days ?? 0)}
        </motion.div>
        <p className="font-display text-sm font-bold uppercase tracking-wide text-rose-400">
          days since you said yes
        </p>
        <p className="mt-1 font-hand text-lg text-rose-500">{compliment}</p>
      </div>

      {nextMilestone && daysToNext !== null && daysToNext > 0 && (
        <div className="mt-3 rounded-2xl bg-rose-50/60 p-3 text-center">
          <p className="flex items-center justify-center gap-1 text-[11px] text-rose-400">
            <Sparkles className="h-3 w-3" />
            {daysToNext} {daysToNext === 1 ? "day" : "days"} until{" "}
            <span className="font-bold text-rose-500">
              {nextMilestone.emoji} {nextMilestone.label}
            </span>
          </p>
          {/* milestone progress track */}
          <div className="mt-2 flex items-center gap-1">
            {MILESTONES.map((m) => {
              const reached = days !== null && days >= m.days;
              const isNext = nextMilestone?.days === m.days;
              return (
                <div
                  key={m.days}
                  className={`flex-1 rounded-full transition-all ${
                    reached
                      ? "bg-gradient-to-r from-rose-400 to-pink-500"
                      : isNext
                        ? "bg-rose-300/60"
                        : "bg-rose-200/40"
                  }`}
                  style={{ height: reached ? "6px" : isNext ? "5px" : "4px" }}
                >
                  {reached && (
                    <div className="flex items-center justify-center pt-0.5 text-[8px]">
                      {m.emoji}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditing(false)}
            >
              <motion.div
                className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-glow-rose sm:rounded-3xl"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />
                <h3 className="font-display text-xl font-bold text-rose-600">edit anniversary</h3>
                <input
                  type="date"
                  value={pickDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setPickDate(e.target.value)}
                  className="mt-4 h-12 w-full rounded-2xl border-2 border-rose-200 bg-rose-50/50 px-4 text-rose-700 focus:border-rose-400 focus:outline-none"
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 rounded-full bg-rose-100 py-2.5 text-sm font-semibold text-rose-500"
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 py-2.5 text-sm font-bold text-white shadow-glow-rose"
                  >
                    save 💗
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </PinkCard>
  );
}
