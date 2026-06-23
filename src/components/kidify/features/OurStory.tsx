"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify, type StoryMilestone } from "@/lib/store";
import { logActivity } from "@/lib/activity-logger";
import { BookHeart, X, Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

const EMOJI_CHOICES = ["✨", "🧸", "🌷", "🌙", "☕", "💌", "🌸", "☁️", "💗", "🦋", "🌹", "🫧"];

export function OurStory() {
  const storyMilestones = useKidify((s) => s.storyMilestones);
  const addMilestone = useKidify((s) => s.addMilestone);
  const removeMilestone = useKidify((s) => s.removeMilestone);

  const [showAdd, setShowAdd] = useState(false);
  const [emoji, setEmoji] = useState("✨");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const handleAdd = () => {
    if (!title.trim()) {
      toast.error("give it a name first 🌸");
      return;
    }
    addMilestone(emoji, title, date, note);
    logActivity("milestone_added", `Milestone added: ${emoji} ${title} (${date})`);
    toast.success("added to our story. 🤍", {
      description: `${emoji} ${title}`,
    });
    setTitle("");
    setNote("");
    setEmoji("✨");
    setDate(new Date().toISOString().slice(0, 10));
    setShowAdd(false);
  };

  return (
    <>
      <PinkCard className="relative overflow-hidden">
        <div className="absolute -right-3 -top-3 text-6xl opacity-10">📖</div>

        <div className="mb-3 flex items-center justify-between">
          <Pill>
            <BookHeart className="h-3 w-3" /> our story
          </Pill>
          <PinkButton
            onClick={() => setShowAdd(true)}
            size="sm"
            className="h-8 px-3 text-xs"
          >
            <Plus className="mr-1 h-3 w-3" /> add
          </PinkButton>
        </div>

        <SectionTitle subtitle="little moments, kept in order">
          the story of us
        </SectionTitle>

        {storyMilestones.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-2 text-4xl"
            >
              📖
            </motion.div>
            <p className="text-sm text-rose-400">
              no chapters yet. add the first one.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {storyMilestones.slice(0, 4).map((m, i) => (
              <StoryRow
                key={m.id}
                milestone={m}
                isLast={i === Math.min(3, storyMilestones.length - 1)}
                onRemove={() => {
                  removeMilestone(m.id);
                  logActivity("milestone_removed", `Milestone removed: ${m.emoji} ${m.title}`);
                  toast("chapter removed");
                }}
              />
            ))}
            {storyMilestones.length > 4 && (
              <p className="pt-1 text-center text-[10px] text-rose-300">
                + {storyMilestones.length - 4} more chapters…
              </p>
            )}
          </div>
        )}
      </PinkCard>

      {/* add milestone modal */}
      <AnimatePresence>
        {showAdd && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
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
                      add a chapter
                    </h3>
                    <p className="text-xs text-rose-400">a moment worth keeping</p>
                  </div>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* emoji picker */}
                <p className="mb-1.5 text-xs font-semibold text-rose-500">pick a feeling</p>
                <div className="mb-4 grid grid-cols-6 gap-1.5">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`flex h-9 items-center justify-center rounded-xl text-lg transition-all ${
                        emoji === e
                          ? "bg-rose-200 ring-2 ring-rose-400"
                          : "bg-white/60 hover:bg-white/80"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* title */}
                <p className="mb-1.5 text-xs font-semibold text-rose-500">what happened?</p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="the day you said…"
                  maxLength={60}
                  className="mb-4 h-11 w-full rounded-2xl border-2 border-rose-100 bg-white/60 px-3 text-sm text-rose-800 placeholder:text-rose-300 focus:border-rose-300 focus:outline-none"
                />

                {/* date */}
                <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-rose-500">
                  <Calendar className="h-3 w-3" /> when?
                </p>
                <input
                  type="date"
                  value={date}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="mb-4 h-11 w-full rounded-2xl border-2 border-rose-100 bg-white/60 px-3 text-sm text-rose-800 focus:border-rose-300 focus:outline-none"
                />

                {/* note */}
                <p className="mb-1.5 text-xs font-semibold text-rose-500">a little more (optional)</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="what made it matter?"
                  rows={3}
                  maxLength={150}
                  className="mb-4 w-full resize-none rounded-2xl border-2 border-rose-100 bg-white/60 p-3 text-sm text-rose-800 placeholder:text-rose-300 focus:border-rose-300 focus:outline-none"
                />

                <PinkButton onClick={handleAdd} className="w-full" heart size="sm">
                  keep this chapter
                </PinkButton>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}

function StoryRow({
  milestone,
  isLast,
  onRemove,
}: {
  milestone: StoryMilestone;
  isLast: boolean;
  onRemove: () => void;
}) {
  const d = new Date(milestone.date + "T00:00:00");
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="group relative flex gap-3"
    >
      {/* timeline dot + line */}
      <div className="flex flex-col items-center">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-lg shadow-soft"
          whileHover={{ scale: 1.1 }}
        >
          {milestone.emoji}
        </motion.div>
        {!isLast && (
          <div className="mt-1 w-0.5 flex-1 bg-gradient-to-b from-rose-200 to-rose-100" />
        )}
      </div>

      {/* content */}
      <div className="flex-1 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase text-rose-400">
              {d.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <h4 className="font-display text-sm font-bold text-rose-600">
              {milestone.title}
            </h4>
            {milestone.note && (
              <p className="mt-0.5 text-xs text-rose-500/80">{milestone.note}</p>
            )}
          </div>
          <button
            onClick={onRemove}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-rose-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
            aria-label="remove chapter"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
