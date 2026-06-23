"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

const COLORS = ["#F472B6", "#EC4899", "#F9A8D4", "#FB7185", "#FDA4AF", "#E879F9"];

type Props = {
  message: string;
  onDismiss: () => void;
};

export function IncomingHug({ message, onDismiss }: Props) {
  const hearts = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    size: 16 + Math.random() * 24,
    drift: (Math.random() - 0.5) * 120,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-rose-950/95 via-pink-950/95 to-fuchsia-950/95"
        onClick={onDismiss}
      >
        {/* floating hearts */}
        <div className="pointer-events-none absolute inset-0">
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              className="absolute"
              style={{ left: `${h.left}%`, bottom: "-10%", color: h.color }}
              initial={{ opacity: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0.6, 0],
                y: [0, -300 - Math.random() * 400],
                x: [0, h.drift],
                scale: [0, 1.2, 0.6],
                rotate: [0, h.drift > 0 ? 30 : -30],
              }}
              transition={{ duration: 3.5 + Math.random() * 2, delay: h.delay, repeat: Infinity, ease: "easeOut" }}
            >
              <Heart className="fill-current" style={{ width: h.size, height: h.size }} />
            </motion.div>
          ))}
        </div>

        {/* glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-64 w-64 rounded-full bg-rose-400/20 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* content */}
        <div className="relative z-10 mx-8 max-w-md text-center" onClick={(e) => e.stopPropagation()}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-glow-rose"
          >
            <Heart className="h-10 w-10 fill-white text-white" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-2 font-display text-sm font-semibold tracking-widest text-rose-300 uppercase"
          >
            a hug arrived for you
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="font-display text-2xl leading-relaxed text-white md:text-3xl">
              &ldquo;{message}&rdquo;
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-sm text-rose-300/60"
          >
            tap anywhere to close
          </motion.p>
        </div>

        {/* close button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={onDismiss}
          className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur transition hover:bg-white/20 hover:text-white"
        >
          <X className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
