"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useKidify, type BearMood } from "@/lib/store";
import { logActivity } from "@/lib/activity-logger";
import { cn } from "@/lib/utils";

type BearProps = {
  size?: number;
  className?: string;
  /** When true, bear is the big interactive pet (default). When false, it's a small decorative variant. */
  interactive?: boolean;
  /** Override mood instead of reading from store */
  mood?: BearMood;
};

const MOOD_EMOJI: Record<BearMood, string> = {
  happy: "🌸",
  love: "💗",
  sleepy: "💤",
  excited: "✨",
  shy: "🌸",
};

/** A single floating heart particle */
function Heart({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute text-rose-400"
      style={{ left: x, bottom: "55%" }}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 0], y: -70, scale: [0.5, 1.1, 0.9] }}
      transition={{ duration: 1.6, delay, ease: "easeOut" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z" />
      </svg>
    </motion.div>
  );
}

export function Bear({ size = 120, className, interactive = true, mood: moodOverride }: BearProps) {
  const bearName = useKidify((s) => s.bearName);
  const bearMood = useKidify((s) => s.bearMood);
  const accessory = useKidify((s) => s.bearAccessory);
  const patBear = useKidify((s) => s.patBear);
  const earnSticker = useKidify((s) => s.earnSticker);
  const setBearMood = useKidify((s) => s.setBearMood);
  const registerAdminTap = useKidify((s) => s.registerAdminTap);
  const unlockAdmin = useKidify((s) => s.unlockAdmin);
  const adminUnlocked = useKidify((s) => s.adminUnlocked);

  const mood = moodOverride ?? bearMood;
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [squish, setSquish] = useState(false);

  // occasional idle mood drift for the big interactive bear
  useEffect(() => {
    if (!interactive) return;
    const t = setInterval(() => {
      const r = Math.random();
      if (r < 0.25) setBearMood("shy");
      else if (r < 0.5) setBearMood("happy");
      else if (r < 0.6) setBearMood("excited");
    }, 8000);
    return () => clearInterval(t);
  }, [interactive, setBearMood]);

  const handleTap = useCallback(() => {
    setSquish(true);
    setTimeout(() => setSquish(false), 320);
    const id = Date.now();
    setHearts((h) => [
      ...h.slice(-4),
      { id, x: 20 + Math.random() * 40 },
      { id: id + 1, x: 30 + Math.random() * 50 },
      { id: id + 2, x: 10 + Math.random() * 30 },
    ]);
    setTimeout(() => {
      setHearts((h) => h.filter((x) => x.id < id));
    }, 1800);

    if (interactive) {
      patBear();
      earnSticker("pat");
      logActivity("bear_patted");
    }

    if (registerAdminTap()) {
      unlockAdmin();
    }
  }, [interactive, patBear, earnSticker, registerAdminTap, unlockAdmin]);

  // eye state by mood
  const eyeShape =
    mood === "love"
      ? "heart"
      : mood === "sleepy"
        ? "closed"
        : mood === "shy"
          ? "shy"
          : mood === "excited"
            ? "wide"
            : "open";

  return (
    <motion.div
      className={cn("relative inline-flex cursor-pointer select-none", className)}
      style={{ width: size, height: size }}
      onClick={handleTap}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      role="button"
      aria-label={bearName ? `${bearName}, the bear` : "the bear"}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleTap()}
    >
      {/* hearts */}
      <AnimatePresence>
        {hearts.map((h) => (
          <Heart key={h.id} delay={Math.random() * 0.2} x={h.x} />
        ))}
      </AnimatePresence>

      <motion.div
        className="relative h-full w-full"
        animate={{
          y: [0, -6, 0],
          scale: squish ? [1, 0.88, 1.06, 1] : 1,
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.32 },
        }}
      >
        <svg
          viewBox="0 0 200 200"
          className="h-full w-full drop-shadow-[0_8px_18px_oklch(0.6_0.18_10/0.25)]"
          aria-hidden
        >
          <defs>
            <radialGradient id="bearBody" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#FBE3D0" />
              <stop offset="55%" stopColor="#F3C9A8" />
              <stop offset="100%" stopColor="#E0AC85" />
            </radialGradient>
            <radialGradient id="bearBelly" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FFF6EE" />
              <stop offset="100%" stopColor="#FBE3D0" />
            </radialGradient>
            <radialGradient id="earInner" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FFC0CB" />
              <stop offset="100%" stopColor="#F7A5B8" />
            </radialGradient>
            <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF9EB5" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FF9EB5" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ears */}
          <circle cx="52" cy="50" r="22" fill="url(#bearBody)" />
          <circle cx="148" cy="50" r="22" fill="url(#bearBody)" />
          <circle cx="52" cy="50" r="12" fill="url(#earInner)" />
          <circle cx="148" cy="50" r="12" fill="url(#earInner)" />

          {/* head */}
          <ellipse cx="100" cy="100" rx="62" ry="58" fill="url(#bearBody)" />

          {/* muzzle/belly patch */}
          <ellipse cx="100" cy="125" rx="34" ry="26" fill="url(#bearBelly)" />

          {/* cheeks */}
          <ellipse cx="64" cy="118" rx="13" ry="9" fill="url(#cheekGrad)" />
          <ellipse cx="136" cy="118" rx="13" ry="9" fill="url(#cheekGrad)" />

          {/* eyes */}
          {eyeShape === "open" && (
            <>
              <motion.g
                animate={{ scaleY: [1, 1, 0.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96] }}
                style={{ transformOrigin: "88px 96px" }}
              >
                <ellipse cx="88" cy="96" rx="6.5" ry="8.5" fill="#3B2A22" />
                <circle cx="90" cy="93" r="2.2" fill="#fff" />
              </motion.g>
              <motion.g
                animate={{ scaleY: [1, 1, 0.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.93, 0.96] }}
                style={{ transformOrigin: "112px 96px" }}
              >
                <ellipse cx="112" cy="96" rx="6.5" ry="8.5" fill="#3B2A22" />
                <circle cx="114" cy="93" r="2.2" fill="#fff" />
              </motion.g>
            </>
          )}
          {eyeShape === "wide" && (
            <>
              <circle cx="88" cy="96" r="9" fill="#3B2A22" />
              <circle cx="112" cy="96" r="9" fill="#3B2A22" />
              <circle cx="90" cy="93" r="3" fill="#fff" />
              <circle cx="114" cy="93" r="3" fill="#fff" />
            </>
          )}
          {eyeShape === "closed" && (
            <>
              <path d="M80 98 Q88 104 96 98" stroke="#3B2A22" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M104 98 Q112 104 120 98" stroke="#3B2A22" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
          {eyeShape === "heart" && (
            <>
              <path
                d="M88 99 c-3 -4 -8 -2 -8 2 c0 4 8 8 8 8 c0 0 8 -4 8 -8 c0 -4 -5 -6 -8 -2 z"
                fill="#E8527B"
              />
              <path
                d="M112 99 c-3 -4 -8 -2 -8 2 c0 4 8 8 8 8 c0 0 8 -4 8 -8 c0 -4 -5 -6 -8 -2 z"
                fill="#E8527B"
              />
            </>
          )}
          {eyeShape === "shy" && (
            <>
              <path d="M80 96 Q88 100 96 96" stroke="#3B2A22" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M104 96 Q112 100 120 96" stroke="#3B2A22" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* nose */}
          <ellipse cx="100" cy="116" rx="7" ry="5" fill="#3B2A22" />
          {/* mouth */}
          <path
            d="M100 121 L100 128 M100 128 Q92 134 86 130 M100 128 Q108 134 114 130"
            stroke="#3B2A22"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* accessories */}
          {accessory === "bow" && (
            <g>
              <path d="M148 44 L160 36 L160 56 Z" fill="#F472B6" />
              <path d="M148 44 L160 52 L160 56 Z" fill="#EC4899" />
              <path d="M148 44 L136 36 L136 56 Z" fill="#F472B6" />
              <path d="M148 44 L136 52 L136 56 Z" fill="#EC4899" />
              <circle cx="148" cy="46" r="5" fill="#F9A8D4" />
            </g>
          )}
          {accessory === "flower" && (
            <g transform="translate(140 40)">
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx="0"
                  cy="-9"
                  rx="5"
                  ry="8"
                  fill="#F9A8D4"
                  transform={`rotate(${a})`}
                />
              ))}
              <circle cx="0" cy="0" r="5" fill="#FBBF24" />
            </g>
          )}
          {accessory === "crown" && (
            <g transform="translate(100 32)">
              <path d="M-26 8 L-26 -8 L-13 4 L0 -14 L13 4 L26 -8 L26 8 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="0" cy="-12" r="3" fill="#F472B6" />
              <circle cx="-22" cy="-6" r="2.5" fill="#F472B6" />
              <circle cx="22" cy="-6" r="2.5" fill="#F472B6" />
            </g>
          )}
          {accessory === "scarf" && (
            <g>
              <path d="M55 150 Q100 168 145 150 L150 162 Q100 182 50 162 Z" fill="#A78BFA" />
              <path d="M140 156 L150 178 L132 172 Z" fill="#8B5CF6" />
            </g>
          )}
          {accessory === "glasses" && (
            <g>
              <circle cx="88" cy="96" r="13" fill="none" stroke="#3B2A22" strokeWidth="2.5" />
              <circle cx="112" cy="96" r="13" fill="none" stroke="#3B2A22" strokeWidth="2.5" />
              <line x1="101" y1="96" x2="99" y2="96" stroke="#3B2A22" strokeWidth="2.5" strokeLinecap="round" />
              {/* subtle lens shine */}
              <path d="M82 90 Q86 88 90 91" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
              <path d="M106 90 Q110 88 114 91" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round" />
            </g>
          )}
          {accessory === "halo" && (
            <g>
              <motion.ellipse
                cx="100"
                cy="38"
                rx="38"
                ry="8"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="3"
                opacity="0.85"
                animate={{ opacity: [0.6, 1, 0.6], rotate: [0, 4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "100px 38px" }}
              />
              <motion.ellipse
                cx="100"
                cy="38"
                rx="38"
                ry="8"
                fill="none"
                stroke="#FEF3C7"
                strokeWidth="1"
                opacity="0.6"
              />
            </g>
          )}

          {/* mood sparkle */}
          {mood === "excited" && (
            <g>
              <circle cx="40" cy="78" r="2" fill="#FBBF24" />
              <circle cx="160" cy="78" r="2" fill="#FBBF24" />
              <circle cx="30" cy="120" r="1.5" fill="#F9A8D4" />
              <circle cx="170" cy="120" r="1.5" fill="#F9A8D4" />
            </g>
          )}
        </svg>

        {/* mood emoji bubble */}
        <AnimatePresence>
          {mood !== "happy" && (
            <motion.div
              key={mood}
              className="absolute -right-1 -top-1 text-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -3, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {MOOD_EMOJI[mood]}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {bearName && interactive && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-rose-500 shadow-sm backdrop-blur"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {bearName}
        </motion.div>
      )}
      {adminUnlocked && (
        <motion.div
          className="absolute -right-2 top-0 text-xs"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          title="admin mode active"
        >
          🛠️
        </motion.div>
      )}
    </motion.div>
  );
}
