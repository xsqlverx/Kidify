"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type Props = {
  message: string;
  onDismiss: () => void;
};

/* ------------------------------------------------------------------ */
/*  floating heart particle                                            */
/* ------------------------------------------------------------------ */
function FloatHeart({ delay, left, color, size }: { delay: number; left: number; color: string; size: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ left: `${left}%`, bottom: "-8%", color }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{
        opacity: [0, 0.7, 0.4, 0],
        y: [0, -window.innerHeight * (0.6 + Math.random() * 0.4)],
        x: [0, (Math.random() - 0.5) * 100],
        scale: [0, 1.3, 0.6, 0],
        rotate: [0, (Math.random() - 0.5) * 60],
      }}
      transition={{ duration: 3.5 + Math.random() * 2.5, delay, repeat: Infinity, ease: "easeOut" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z" />
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  bear + letter SVG                                                  */
/* ------------------------------------------------------------------ */
function BearWithLetter({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* bear SVG (reused from Bear.tsx, scaled down) */}
      <svg viewBox="0 0 200 200" className="h-56 w-56 drop-shadow-2xl md:h-64 md:w-64" aria-hidden>
        <defs>
          <radialGradient id="ibBody" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FBE3D0" />
            <stop offset="55%" stopColor="#F3C9A8" />
            <stop offset="100%" stopColor="#E0AC85" />
          </radialGradient>
          <radialGradient id="ibBelly" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFF6EE" />
            <stop offset="100%" stopColor="#FBE3D0" />
          </radialGradient>
          <radialGradient id="ibEar" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFC0CB" />
            <stop offset="100%" stopColor="#F7A5B8" />
          </radialGradient>
          <radialGradient id="ibCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9EB5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF9EB5" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ears */}
        <circle cx="52" cy="50" r="22" fill="url(#ibBody)" />
        <circle cx="148" cy="50" r="22" fill="url(#ibBody)" />
        <circle cx="52" cy="50" r="12" fill="url(#ibEar)" />
        <circle cx="148" cy="50" r="12" fill="url(#ibEar)" />
        {/* head */}
        <ellipse cx="100" cy="100" rx="62" ry="58" fill="url(#ibBody)" />
        <ellipse cx="100" cy="125" rx="34" ry="26" fill="url(#ibBelly)" />
        {/* cheeks */}
        <ellipse cx="64" cy="118" rx="13" ry="9" fill="url(#ibCheek)" />
        <ellipse cx="136" cy="118" rx="13" ry="9" fill="url(#ibCheek)" />
        {/* heart eyes */}
        <path d="M88 99 c-3 -4 -8 -2 -8 2 c0 4 8 8 8 8 c0 0 8 -4 8 -8 c0 -4 -5 -6 -8 -2 z" fill="#E8527B" />
        <path d="M112 99 c-3 -4 -8 -2 -8 2 c0 4 8 8 8 8 c0 0 8 -4 8 -8 c0 -4 -5 -6 -8 -2 z" fill="#E8527B" />
        {/* nose */}
        <ellipse cx="100" cy="116" rx="7" ry="5" fill="#3B2A22" />
        {/* smile */}
        <path d="M100 121 L100 128 M100 128 Q92 134 86 130 M100 128 Q108 134 114 130" stroke="#3B2A22" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* paws reaching forward */}
        <motion.ellipse cx="52" cy="155" rx="16" ry="12" fill="url(#ibBody)" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.ellipse cx="148" cy="155" rx="16" ry="12" fill="url(#ibBody)" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
      </svg>

      {/* envelope overlay — clickable */}
      <motion.button
        onClick={onOpen}
        className="absolute bottom-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-glow-rose focus:outline-none"
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 20px rgba(244,114,182,0.4)",
            "0 0 40px rgba(244,114,182,0.7)",
            "0 0 20px rgba(244,114,182,0.4)",
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        whileTap={{ scale: 0.92 }}
        aria-label="open the letter"
      >
        <svg viewBox="0 0 40 32" className="h-8 w-10 fill-white drop-shadow">
          <path d="M0 4 C0 1.8 1.8 0 4 0 L36 0 C38.2 0 40 1.8 40 4 L40 28 C40 30.2 38.2 32 36 32 L4 32 C1.8 32 0 30.2 0 28 Z" />
          <path d="M0 4 L20 18 L40 4" stroke="#F472B6" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          <path d="M4 2 L36 2 L20 15 Z" fill="#FDF2F8" />
          {/* tiny heart seal */}
          <path d="M20 12 c-2 -3 -6 -1 -6 2 c0 3 6 6 6 6 c0 0 6 -3 6 -6 c0 -3 -4 -5 -6 -2 z" fill="#EC4899" />
        </svg>
      </motion.button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  main component                                                     */
/* ------------------------------------------------------------------ */
export function IncomingHug({ message, onDismiss }: Props) {
  const [opened, setOpened] = useState(false);

  const hearts = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    color: ["#F472B6", "#EC4899", "#F9A8D4", "#FB7185", "#FDA4AF", "#E879F9", "#F43F5E"][i % 7],
    size: 18 + Math.random() * 22,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a0a14] via-[#2d0f1f] to-[#1a0a14]"
    >
      {/* flashing heart background */}
      <div className="pointer-events-none absolute inset-0">
        {hearts.map((h) => (
          <FloatHeart key={h.id} delay={h.delay} left={h.left} color={h.color} size={h.size} />
        ))}
      </div>

      {/* pink glow pulse */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <div className="h-80 w-80 rounded-full bg-pink-500/20 blur-3xl" />
      </motion.div>

      {/* title */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 mb-4 font-display text-sm font-semibold tracking-[0.2em] text-rose-300 uppercase"
      >
        a hug arrived for you
      </motion.p>

      {/* bear + letter */}
      <motion.div
        initial={{ scale: 0, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.4 }}
        className="relative z-10"
      >
        <BearWithLetter onOpen={() => setOpened(true)} />
      </motion.div>

      {/* tap hint */}
      {!opened && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 mt-4 text-xs text-rose-400/60"
        >
          tap the envelope to open it
        </motion.p>
      )}

      {/* letter content overlay */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setOpened(false)}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              className="mx-6 max-w-sm rounded-3xl bg-white/10 p-8 text-center backdrop-blur"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-4 font-display text-sm tracking-widest text-rose-300 uppercase"
              >
                a message for you
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="font-display text-xl leading-relaxed text-white md:text-2xl"
              >
                &ldquo;{message}&rdquo;
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                onClick={onDismiss}
                whileTap={{ scale: 0.95 }}
                className="mt-8 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-8 py-3 font-display font-bold text-white shadow-lg transition hover:from-rose-500 hover:to-pink-600"
              >
                okay 💗
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
