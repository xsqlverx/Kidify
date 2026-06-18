"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { Sparkles, X, Plus, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMOJI_CHOICES = ["🤍", "✨", "🌸", "☕", "🧸", "🌙", "🌷", "☁️", "💗", "🦋", "🌿", "🕯️"];

export function GratitudeJar() {
  const gratitudes = useKidify((s) => s.gratitudes);
  const addGratitude = useKidify((s) => s.addGratitude);
  const removeGratitude = useKidify((s) => s.removeGratitude);

  const [showEditor, setShowEditor] = useState(false);
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("🤍");

  const handleSave = () => {
    if (!text.trim()) {
      toast.error("what are you grateful for? 🌸");
      return;
    }
    addGratitude(text, emoji);
    toast.success("kept. 🤍", {
      description: "small gratitudes, big heart.",
    });
    setText("");
    setEmoji("🤍");
    setShowEditor(false);
  };

  return (
    <>
      <PinkCard className="relative overflow-hidden">
        <div className="absolute -right-3 -top-3 text-6xl opacity-10">🙏</div>

        <div className="mb-3 flex items-center justify-between">
          <Pill>
            <Sparkles className="h-3 w-3" /> gratitude jar
          </Pill>
          <PinkButton
            onClick={() => setShowEditor(true)}
            size="sm"
            className="h-8 px-3 text-xs"
          >
            <Plus className="mr-1 h-3 w-3" /> add
          </PinkButton>
        </div>

        <SectionTitle subtitle="tiny things, noticed & kept">
          what went right today
        </SectionTitle>

        {gratitudes.length === 0 ? (
          <div className="flex flex-col items-center py-5 text-center">
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="mb-2 text-4xl"
            >
              🫙
            </motion.div>
            <p className="text-sm text-rose-400">
              even on grey days, something went right.
            </p>
            <p className="mt-0.5 text-[10px] text-rose-300">
              a warm cup, a kind word, a quiet minute. add the first one.
            </p>
          </div>
        ) : (
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pretty-scroll pr-1">
            <AnimatePresence>
              {gratitudes.map((g, i) => (
                <motion.div
                  key={g.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex items-start gap-2.5 rounded-2xl bg-white/60 p-3"
                >
                  <span className="text-xl">{g.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-rose-700">{g.text}</p>
                    <p className="mt-0.5 text-[9px] text-rose-300">{g.date}</p>
                  </div>
                  <button
                    onClick={() => {
                      removeGratitude(g.id);
                      toast("released");
                    }}
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-rose-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                    aria-label="remove gratitude"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {gratitudes.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-rose-400">
            <Heart className="h-3 w-3 fill-rose-300 text-rose-300" />
            {gratitudes.length} {gratitudes.length === 1 ? "thing" : "things"} to be glad for
          </div>
        )}
      </PinkCard>

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
                className="w-full max-w-md rounded-t-3xl bg-gradient-to-b from-white to-rose-50 p-5 shadow-glow-rose sm:rounded-3xl"
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
                      what went right?
                    </h3>
                    <p className="text-xs text-rose-400">even the smallest thing counts</p>
                  </div>
                  <button
                    onClick={() => setShowEditor(false)}
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
                      className={cn(
                        "flex h-9 items-center justify-center rounded-xl text-lg transition-all",
                        emoji === e
                          ? "bg-rose-200 ring-2 ring-rose-400"
                          : "bg-white/60 hover:bg-white/80",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* text input */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="today i'm grateful for…"
                  rows={3}
                  maxLength={150}
                  autoFocus
                  className="w-full resize-none rounded-2xl border-2 border-rose-100 bg-white/60 p-3 text-sm text-rose-800 placeholder:text-rose-300 focus:border-rose-300 focus:outline-none"
                />
                <p className="mt-1 text-right text-[10px] text-rose-300">
                  {text.length}/150
                </p>

                <PinkButton onClick={handleSave} className="mt-2 w-full" heart size="sm">
                  keep this gratitude
                </PinkButton>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
