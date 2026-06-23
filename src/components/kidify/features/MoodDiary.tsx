"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify, type MoodEntry } from "@/lib/store";
import { logActivity } from "@/lib/activity-logger";
import { Smile, X, PenLine, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOODS: { emoji: string; label: string; color: string }[] = [
  { emoji: "🌸", label: "soft & gentle", color: "bg-pink-100 border-pink-300" },
  { emoji: "☀️", label: "sunny & bright", color: "bg-amber-50 border-amber-300" },
  { emoji: "🧸", label: "cozy & safe", color: "bg-orange-50 border-orange-200" },
  { emoji: "🌊", label: "up & down", color: "bg-sky-50 border-sky-200" },
  { emoji: "🌧️", label: "a little grey", color: "bg-slate-50 border-slate-300" },
  { emoji: "⚡", label: "wired & restless", color: "bg-violet-50 border-violet-200" },
  { emoji: "🤍", label: "quiet & okay", color: "bg-rose-50 border-rose-200" },
  { emoji: "🔥", label: "fired up", color: "bg-red-50 border-red-200" },
];

export function MoodDiary() {
  const moodToday = useKidify((s) => s.moodToday);
  const moodHistory = useKidify((s) => s.moodHistory);
  const logMood = useKidify((s) => s.logMood);

  const [showPicker, setShowPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMood, setSelectedMood] = useState<typeof MOODS[number] | null>(null);
  const [note, setNote] = useState("");

  const handleSelect = (m: typeof MOODS[number]) => {
    setSelectedMood(m);
  };

  const handleSave = () => {
    if (!selectedMood) return;
    logMood(selectedMood.emoji, selectedMood.label, note.trim() || undefined);
    logActivity("mood_logged", `Mood logged: ${selectedMood.emoji} ${selectedMood.label}${note ? ' - ' + note : ''}`);
    toast.success("noted. 🤍", {
      description: selectedMood.emoji + " " + selectedMood.label,
    });
    setSelectedMood(null);
    setNote("");
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    setSelectedMood(null);
    setNote("");
    setShowPicker(true);
  };

  return (
    <>
      <PinkCard className="relative overflow-hidden">
        <div className="absolute -right-3 -top-3 text-6xl opacity-10">🌸</div>

        <div className="mb-3 flex items-center justify-between">
          <Pill>
            <Smile className="h-3 w-3" /> how are you today?
          </Pill>
          {moodHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-0.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-400 hover:bg-rose-100"
            >
              <PenLine className="h-3 w-3" /> {moodHistory.length} {moodHistory.length === 1 ? "entry" : "entries"}
            </button>
          )}
        </div>

        {moodToday ? (
          <div className="flex flex-col items-center py-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="mb-2 text-5xl"
            >
              {moodToday.emoji}
            </motion.div>
            <p className="font-hand text-xl text-rose-600">{moodToday.label}</p>
            {moodToday.note && (
              <p className="mt-1 text-center text-xs text-rose-400/80">&ldquo;{moodToday.note}&rdquo;</p>
            )}
            <button
              onClick={handleOpenPicker}
              className="mt-3 text-xs text-rose-400 underline decoration-dotted underline-offset-4 hover:text-rose-600"
            >
              change today's mood
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-2 text-4xl"
            >
              🫧
            </motion.div>
            <p className="mb-3 text-center text-sm text-rose-400/80">
              take a breath. how does today feel?
            </p>
            <PinkButton onClick={handleOpenPicker} size="sm" className="h-9 px-4 text-xs">
              log your mood
            </PinkButton>
          </div>
        )}
      </PinkCard>

      {/* mood picker modal */}
      <AnimatePresence>
        {showPicker && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
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
                    <h3 className="font-display text-xl font-bold text-gradient-rose">how are you?</h3>
                    <p className="text-xs text-rose-400">no wrong answer. just honest.</p>
                  </div>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* mood grid */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                  {MOODS.map((m) => {
                    const isSelected = selectedMood?.emoji === m.emoji;
                    return (
                      <motion.button
                        key={m.emoji}
                        onClick={() => handleSelect(m)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition-all",
                          isSelected
                            ? "border-rose-400 bg-rose-50 shadow-glow-rose"
                            : "border-transparent bg-white/60 hover:bg-white/80",
                        )}
                        whileTap={{ scale: 0.96 }}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isSelected ? "text-rose-600" : "text-rose-400",
                          )}
                        >
                          {m.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* optional note */}
                {selectedMood && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="want to say more? (optional)"
                      rows={2}
                      maxLength={120}
                      className="mb-3 w-full resize-none rounded-2xl border-2 border-rose-100 bg-white/60 p-3 text-sm text-rose-800 placeholder:text-rose-300 focus:border-rose-300 focus:outline-none"
                    />
                    <PinkButton onClick={handleSave} className="w-full" heart size="sm">
                      save today's mood
                    </PinkButton>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* mood history modal */}
      <AnimatePresence>
        {showHistory && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
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
                    <h3 className="font-display text-xl font-bold text-gradient-rose">your mood diary</h3>
                    <p className="text-xs text-rose-400">a gentle record of your days</p>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {moodHistory.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <p className="text-sm text-rose-400">no moods logged yet. start today?</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {moodHistory.map((m, i) => (
                      <motion.div
                        key={m.date}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 rounded-2xl bg-white/70 p-3"
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-rose-600">{m.label}</p>
                          <p className="text-[10px] text-rose-300">{m.date}</p>
                          {m.note && (
                            <p className="mt-0.5 text-xs text-rose-400/80">&ldquo;{m.note}&rdquo;</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
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
