"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type ConfettiPiece = {
  id: number;
  x: number;
  delay: number;
  emoji: string;
  drift: number;
  size: number;
};

const EMOJIS = ["💗", "🌸", "✨", "🎉", "🌷", "💕", "🧸", "🫧"];

/**
 * A one-shot confetti burst. Mount this (with a unique `key`) when you want
 * it to fire — pieces are generated once in the useState initializer and the
 * component self-clears after the animation finishes.
 */
export function Confetti() {
  // generate pieces once on mount (pure-ish; the key remount guarantees freshness)
  const [pieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      emoji: EMOJIS[i % EMOJIS.length],
      drift: (Math.random() - 0.5) * 120,
      size: 14 + Math.random() * 16,
    })),
  );
  const [visible, setVisible] = useState(true);

  // hide after the animation completes (timeout callback setState is allowed)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      <AnimatePresence>
        {visible &&
          pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute top-1/3"
              style={{ left: `${p.x}%`, fontSize: p.size }}
              initial={{ opacity: 0, y: 0, scale: 0.4, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, 300, 420],
                x: [0, p.drift, p.drift * 1.5],
                rotate: [0, 360, 540],
                scale: [0.4, 1.2, 0.8],
              }}
              transition={{ duration: 2.4, delay: p.delay, ease: "easeOut" }}
            >
              {p.emoji}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
