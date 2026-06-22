"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useKidify } from "@/lib/store";

/**
 * A small speech bubble that appears above the floating bear and shows
 * gentle, contextual messages based on what she's been doing.
 *
 * Uses Zustand's subscribe API (outside of effects) to listen for store
 * changes and trigger messages — avoids the setState-in-effect lint rule.
 */
const MESSAGES = {
  idle: [
    "hi, you. 🧸",
    "you're doing good.",
    "drink some water?",
    "i'm here.",
    "pat me if you want.",
  ],
  afterPat: [
    "hehe. that tickles. 💗",
    "i love you too.",
    "you're cute when you do that.",
    "one more?",
    "my favourite person.",
  ],
  afterHug: [
    "got it. 🤍 sending one back.",
    "warm. like you.",
    "you're a good hugger.",
    "i felt that.",
  ],
  afterWater: [
    "good. hydration is sexy.",
    "proud of you. 💧",
    "one more?",
    "your skin says thanks.",
  ],
  afterRead: [
    "you read it. 💌",
    "he wrote that for you.",
    "keep it close.",
  ],
  afterBreath: [
    "there you are. 🫧",
    "better?",
    "you did good.",
  ],
  afterMood: [
    "thank you for telling me. 🌸",
    "whatever it is, it's okay.",
    "i've got you.",
  ],
} as const;

type ReactionType = keyof typeof MESSAGES;

export function BearSpeech() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRandom = (type: ReactionType) => {
    const pool = MESSAGES[type];
    const msg = pool[Math.floor(Math.random() * pool.length)];
    setMessage(msg);
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 3500);
  };

  useEffect(() => {
    // idle message every ~28s
    const idle = setInterval(() => {
      if (Math.random() < 0.35) showRandom("idle");
    }, 28000);

    // subscribe to store changes (outside of render cycle)
    const unsub = useKidify.subscribe((state, prev) => {
      if (state.bearPats > prev.bearPats) showRandom("afterPat");
      else if (state.hugsSent > prev.hugsSent) showRandom("afterHug");
      else if (state.waterCups > prev.waterCups) showRandom("afterWater");
      else if (state.breathSessions > prev.breathSessions) showRandom("afterBreath");
      else if (state.readMessages.length > prev.readMessages.length) showRandom("afterRead");
      else if (state.moodToday && state.moodToday.date !== prev.moodToday?.date)
        showRandom("afterMood");
    });

    return () => {
      clearInterval(idle);
      unsub();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          className="pointer-events-none fixed bottom-36 right-4 z-50 max-w-[200px]"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <div className="relative rounded-2xl bg-white/95 px-3 py-2 text-xs font-semibold text-rose-600 shadow-glow-rose backdrop-blur">
            {message}
            {/* speech tail */}
            <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-white/95" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
