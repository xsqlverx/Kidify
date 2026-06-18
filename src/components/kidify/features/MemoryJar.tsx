"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify, type Memory } from "@/lib/store";
import { FlaskConical, Plus, X, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMOJI_CHOICES = ["✨", "🤍", "🧸", "☕", "🌙", "🌷", "🫧", "💌", "🌸", "☁️"];

export function MemoryJar() {
  const memories = useKidify((s) => s.memories);
  const addMemory = useKidify((s) => s.addMemory);
  const removeMemory = useKidify((s) => s.removeMemory);

  const [showEditor, setShowEditor] = useState(false);
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [viewing, setViewing] = useState<Memory | null>(null);

  const handleSave = () => {
    if (!text.trim()) {
      toast.error("write a little something first");
      return;
    }
    addMemory(text, emoji);
    toast.success("tucked into the jar. 🫙", {
      description: "it's safe there forever.",
    });
    setText("");
    setEmoji("✨");
    setShowEditor(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle subtitle="tiny moments, kept safe forever">
          <span className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-rose-400" /> memory jar
          </span>
        </SectionTitle>
        <PinkButton onClick={() => setShowEditor(true)} size="sm" className="h-8 px-3 text-xs">
          <Plus className="mr-1 h-3 w-3" /> add
        </PinkButton>
      </div>

      {/* the jar */}
      {memories.length === 0 ? (
        <PinkCard className="flex flex-col items-center py-10 text-center">
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-3 text-6xl"
          >
            🫙
          </motion.div>
          <h3 className="font-display text-lg font-bold text-rose-600">your jar is empty</h3>
          <p className="mt-1 max-w-xs text-sm text-rose-400">
            every time something small makes you happy — a smell, a word, a moment —
            tuck it in here. it'll be safe.
          </p>
          <PinkButton onClick={() => setShowEditor(true)} className="mt-4" heart size="sm">
            add your first memory
          </PinkButton>
        </PinkCard>
      ) : (
        <>
          {/* jar visualization */}
          <PinkCard className="relative overflow-hidden">
            <div className="mb-3 flex items-center justify-between">
              <Pill>
                <Sparkles className="h-3 w-3" /> {memories.length} {memories.length === 1 ? "memory" : "memories"} inside
              </Pill>
              <span className="text-xs text-rose-400">tap one to read</span>
            </div>

            {/* folded notes peeking out of the jar */}
            <div className="relative flex flex-wrap gap-2">
              <AnimatePresence>
                {memories.map((m, i) => (
                  <motion.button
                    key={m.id}
                    onClick={() => setViewing(m)}
                    className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 text-2xl shadow-soft"
                    style={{
                      transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (3 + (i % 4))}deg)`,
                    }}
                    initial={{ scale: 0, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    whileHover={{ scale: 1.12, rotate: 0, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`memory from ${m.date}`}
                  >
                    {m.emoji}
                    {/* fold corner */}
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-bl-lg bg-rose-200/60" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </PinkCard>

          {/* recent list */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-400">recent</p>
            <div className="space-y-2">
              {memories.slice(0, 4).map((m) => (
                <motion.button
                  key={m.id}
                  onClick={() => setViewing(m)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/60 p-3 text-left backdrop-blur transition-all hover:bg-white/80"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-lg">
                    {m.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-rose-700">{m.text}</p>
                    <p className="text-[10px] text-rose-400">{m.date}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* editor modal */}
      <AnimatePresence>
        {showEditor && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditor(false)}
            >
              <motion.div
                className="w-full max-w-md rounded-t-3xl bg-gradient-to-b from-white to-rose-50 p-6 shadow-glow-rose sm:rounded-3xl"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold text-rose-600">tuck a memory in</h3>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mb-3 text-sm text-rose-400">
                  what little thing made you smile today?
                </p>

                {/* emoji picker */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all",
                        emoji === e
                          ? "scale-110 bg-rose-200 shadow-soft"
                          : "bg-rose-50 hover:bg-rose-100",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="the way the light looked at 5pm. the chai he made. that one text. anything."
                  rows={4}
                  maxLength={300}
                  className="w-full resize-none rounded-2xl border-2 border-rose-200 bg-white/70 p-3 text-sm text-rose-800 placeholder:text-rose-300 focus:border-rose-400 focus:outline-none"
                  autoFocus
                />
                <p className="mt-1 text-right text-[10px] text-rose-300">{text.length}/300</p>

                <div className="mt-3 flex gap-2">
                  <PinkButton
                    onClick={() => setShowEditor(false)}
                    className="flex-1 bg-rose-100 from-rose-100 to-rose-100 text-rose-500 hover:from-rose-200 hover:to-rose-200"
                  >
                    cancel
                  </PinkButton>
                  <PinkButton onClick={handleSave} className="flex-1" heart>
                    tuck it in 🫙
                  </PinkButton>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>

      {/* viewer modal */}
      <AnimatePresence>
        {viewing && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-rose-950/80 p-6 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewing(null)}
            >
              <motion.div
                className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-50 to-rose-50 p-6 shadow-glow-rose"
                initial={{ scale: 0.8, rotate: -3, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -right-3 -top-3 text-4xl">{viewing.emoji}</div>
                <Pill className="mb-3">
                  <Sparkles className="h-3 w-3" /> {viewing.date}
                </Pill>
                <p className="font-hand text-xl leading-8 text-rose-800/90 whitespace-pre-line">
                  {viewing.text}
                </p>
                <div className="mt-5 flex gap-2">
                  <PinkButton
                    onClick={() => setViewing(null)}
                    className="flex-1"
                  >
                    close
                  </PinkButton>
                  <button
                    onClick={() => {
                      removeMemory(viewing.id);
                      setViewing(null);
                      toast("removed from the jar");
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-400 hover:bg-rose-200 hover:text-rose-600"
                    aria-label="delete memory"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
