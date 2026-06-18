"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { PinkButton, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { getMessagesForRange } from "@/lib/data-access";
import type { DailyMessage } from "@/lib/mock-data";
import { useKidify } from "@/lib/store";
import { Mail, X, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoveLetterArchive() {
  const readMessages = useKidify((s) => s.readMessages);
  const [showArchive, setShowArchive] = useState(false);

  // load the last 7 days of notes using the non-hook function
  const notes: DailyMessage[] = useMemo(() => getMessagesForRange(-6, 0), []);

  const readCount = notes.filter((n) => readMessages.includes(n.date)).length;

  return (
    <>
      <button
        onClick={() => setShowArchive(true)}
        className="flex w-full items-center gap-3 rounded-2xl bg-white/50 p-3 text-left backdrop-blur transition-all hover:bg-white/70 active:scale-[0.98]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
          <Mail className="h-5 w-5 text-rose-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-rose-600">love letter archive</p>
          <p className="text-[10px] text-rose-400">
            {readCount} of {notes.length} this week
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-rose-300" />
      </button>

      {/* archive modal */}
      <AnimatePresence>
        {showArchive && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowArchive(false)}
            >
              <motion.div
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-gradient-to-b from-white to-rose-50 p-5 shadow-glow-rose pretty-scroll sm:rounded-3xl"
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
                      💌 love letters
                    </h3>
                    <p className="text-xs text-rose-400">every word, kept safe for you</p>
                  </div>
                  <button
                    onClick={() => setShowArchive(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* timeline */}
                <div className="relative space-y-4">
                  {/* vertical line */}
                  <div className="absolute bottom-2 left-5 top-2 w-0.5 bg-gradient-to-b from-rose-300 via-rose-200 to-rose-100" />

                  {notes.map((n, i) => {
                    const isRead = readMessages.includes(n.date);
                    const isToday = i === notes.length - 1;

                    return (
                      <motion.div
                        key={n.date}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative flex gap-3"
                      >
                        {/* timeline dot */}
                        <div className="relative z-10 flex flex-col items-center pt-1">
                          <motion.div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full border-2",
                              isRead
                                ? "border-rose-400 bg-rose-100 text-rose-500"
                                : "border-rose-200 bg-white text-rose-300",
                            )}
                            animate={isToday ? { scale: [1, 1.08, 1] } : {}}
                            transition={
                              isToday ? { duration: 2, repeat: Infinity } : {}
                            }
                          >
                            {isRead ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <span className="text-xs">{n.sticker}</span>
                            )}
                          </motion.div>
                        </div>

                        {/* letter card */}
                        <div
                          className={cn(
                            "flex-1 rounded-2xl p-3.5",
                            isRead
                              ? "bg-white/70"
                              : "bg-rose-50/60 border border-rose-100",
                          )}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase text-rose-400">
                              {isToday ? "today" : n.date}
                            </span>
                            <span className="text-sm">{n.sticker}</span>
                          </div>
                          <h4
                            className={cn(
                              "font-display text-sm font-bold",
                              isRead ? "text-rose-500" : "text-rose-600",
                            )}
                          >
                            {n.title}
                          </h4>
                          <p className="mt-1 line-clamp-3 text-xs leading-5 text-rose-800/60">
                            {n.body}
                          </p>
                          <p className="mt-2 font-hand text-sm text-rose-400">
                            {n.signature}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* bottom spacer */}
                <div className="h-4" />
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
