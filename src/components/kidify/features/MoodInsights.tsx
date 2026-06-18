"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify, type MoodEntry } from "@/lib/store";
import { TrendingUp, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const MOOD_EMOJI_MAP: Record<string, { emoji: string; label: string; valence: number }> = {
  "🌸": { emoji: "🌸", label: "soft & gentle", valence: 3 },
  "☀️": { emoji: "☀️", label: "sunny & bright", valence: 5 },
  "🧸": { emoji: "🧸", label: "cozy & safe", valence: 4 },
  "🌊": { emoji: "🌊", label: "up & down", valence: 2 },
  "🌧️": { emoji: "🌧️", label: "a little grey", valence: 1 },
  "⚡": { emoji: "⚡", label: "wired & restless", valence: 2 },
  "🤍": { emoji: "🤍", label: "quiet & okay", valence: 3 },
  "🔥": { emoji: "🔥", label: "fired up", valence: 4 },
};

export function MoodInsights() {
  const moodHistory = useKidify((s) => s.moodHistory);
  const [showInsights, setShowInsights] = useState(false);

  const insights = useMemo(() => {
    if (moodHistory.length === 0) return null;

    // last 7 entries
    const recent = moodHistory.slice(0, 7).reverse();

    // count moods
    const counts: Record<string, number> = {};
    recent.forEach((m) => {
      counts[m.emoji] = (counts[m.emoji] || 0) + 1;
    });

    // most common mood
    const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const topMoodInfo = MOOD_EMOJI_MAP[topMood?.[0] ?? "🌸"];

    // average valence
    const avgValence =
      recent.reduce((sum, m) => {
        const info = MOOD_EMOJI_MAP[m.emoji];
        return sum + (info?.valence ?? 3);
      }, 0) / recent.length;

    // streak (consecutive days logged)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      if (moodHistory.some((m) => m.date === ds)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      recent,
      counts,
      topMood: topMoodInfo,
      avgValence: Math.round(avgValence * 10) / 10,
      streak,
      total: moodHistory.length,
    };
  }, [moodHistory]);

  if (!insights || insights.total < 2) {
    return null; // don't show insights until she has at least 2 moods logged
  }

  const valenceLabel =
    insights.avgValence >= 4
      ? "you've been glowing lately"
      : insights.avgValence >= 3
        ? "you've been steady"
        : insights.avgValence >= 2
          ? "it's been a bit much, huh"
          : "rough patch. be gentle with you.";

  return (
    <>
      <button
        onClick={() => setShowInsights(true)}
        className="flex w-full items-center gap-3 rounded-2xl bg-white/50 p-3 text-left backdrop-blur transition-all hover:bg-white/70 active:scale-[0.98]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
          <TrendingUp className="h-5 w-5 text-violet-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-rose-600">mood insights</p>
          <p className="text-[10px] text-rose-400">
            {insights.streak}-day streak · {valenceLabel}
          </p>
        </div>
        <span className="text-lg">{insights.topMood?.emoji}</span>
      </button>

      {/* insights modal */}
      <AnimatePresence>
        {showInsights && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsights(false)}
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
                    <h3 className="font-display text-xl font-bold text-gradient-rose">
                      your mood, lately
                    </h3>
                    <p className="text-xs text-rose-400">a gentle look back</p>
                  </div>
                  <button
                    onClick={() => setShowInsights(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* stats row */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-white/70 p-3 text-center">
                    <p className="font-display text-xl font-bold text-rose-500">
                      {insights.streak}
                    </p>
                    <p className="text-[9px] font-semibold uppercase text-rose-400">
                      day streak
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-3 text-center">
                    <p className="font-display text-xl font-bold text-rose-500">
                      {insights.total}
                    </p>
                    <p className="text-[9px] font-semibold uppercase text-rose-400">
                      total logs
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-3 text-center">
                    <p className="font-display text-xl font-bold text-rose-500">
                      {insights.avgValence}
                    </p>
                    <p className="text-[9px] font-semibold uppercase text-rose-400">
                      avg out of 5
                    </p>
                  </div>
                </div>

                {/* valence summary */}
                <div className="mb-4 rounded-2xl bg-gradient-to-br from-violet-50 to-rose-50 p-4 text-center">
                  <p className="font-hand text-lg text-rose-600">{valenceLabel}</p>
                  <p className="mt-1 text-[10px] text-rose-400">
                    most common lately: {insights.topMood?.emoji} {insights.topMood?.label}
                  </p>
                </div>

                {/* recent moods chart */}
                <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-rose-500">
                  <Calendar className="h-3 w-3" /> last {insights.recent.length} days
                </p>
                <div className="mb-4 flex items-end justify-between gap-1.5 rounded-2xl bg-white/70 p-3">
                  {insights.recent.map((m, i) => {
                    const info = MOOD_EMOJI_MAP[m.emoji];
                    const height = 20 + (info?.valence ?? 3) * 12;
                    return (
                      <motion.div
                        key={m.date}
                        className="flex flex-1 flex-col items-center gap-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <span className="text-sm">{m.emoji}</span>
                        <motion.div
                          className="w-full rounded-t-md bg-gradient-to-t from-rose-300 to-rose-400"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}px` }}
                          transition={{ delay: i * 0.06 + 0.2, type: "spring" }}
                        />
                        <span className="text-[8px] text-rose-300">
                          {new Date(m.date + "T00:00:00").toLocaleDateString(undefined, {
                            weekday: "narrow",
                          })}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* mood distribution */}
                <p className="mb-2 text-xs font-semibold text-rose-500">mood distribution</p>
                <div className="space-y-1.5">
                  {Object.entries(insights.counts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([emoji, count]) => {
                      const pct = (count / insights.recent.length) * 100;
                      const info = MOOD_EMOJI_MAP[emoji];
                      return (
                        <div key={emoji} className="flex items-center gap-2">
                          <span className="w-6 text-lg">{emoji}</span>
                          <div className="h-4 flex-1 overflow-hidden rounded-full bg-rose-100">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-rose-300 to-pink-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <span className="w-6 text-right text-[10px] font-bold text-rose-400">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <p className="mt-4 text-center text-[10px] text-rose-400/70">
                  this is just a gentle mirror. not a diagnosis. just a little reflection. 🌸
                </p>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
