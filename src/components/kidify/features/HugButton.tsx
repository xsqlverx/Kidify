"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { useKidify } from "@/lib/store";
import { Heart } from "lucide-react";
import { toast } from "sonner";

type HeartParticle = {
  id: number;
  x: number;
  delay: number;
  size: number;
  drift: number;
  color: string;
};

const HUG_MESSAGES = [
  "a hug is on its way. 🤍",
  "received. sending one back. always.",
  "hug delivered. the bear felt it too.",
  "squeeze. hold. breathe. there. that one.",
  "he felt that one. he always does.",
  "one hug, coming right up. extra tight this time.",
  "you just made his whole day. again.",
];

export function HugButton() {
  const sendHug = useKidify((s) => s.sendHug);
  const earnSticker = useKidify((s) => s.earnSticker);
  const hugsSent = useKidify((s) => s.hugsSent);
  const [particles, setParticles] = useState<HeartParticle[]>([]);
  const [burst, setBurst] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHug = useCallback(() => {
    if (cooldown) return;
    sendHug();
    earnSticker("hug");
    setBurst(true);
    setTimeout(() => setBurst(false), 1200);

    // enter cooldown for 3 seconds
    setCooldown(true);
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    cooldownTimer.current = setTimeout(() => setCooldown(false), 3000);

    // spawn a burst of heart particles
    const colors = ["#F472B6", "#EC4899", "#F9A8D4", "#FB7185", "#FDA4AF"];
    const newParticles: HeartParticle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      size: 14 + Math.random() * 18,
      drift: (Math.random() - 0.5) * 80,
      color: colors[i % colors.length],
    }));
    setParticles((p) => [...p, ...newParticles]);
    setTimeout(() => {
      setParticles((p) => p.filter((x) => !newParticles.some((np) => np.id === x.id)));
    }, 2500);

    toast.success(HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)], {
      description: hugsSent + 1 === 1 ? "your first hug. 🤍" : `that's ${hugsSent + 1} hugs sent.`,
    });
  }, [cooldown, sendHug, earnSticker, hugsSent]);

  return (
    <div className="relative flex flex-col items-center">
      {/* heart particle burst */}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute bottom-12"
              style={{ left: `${p.x}%`, color: p.color }}
              initial={{ opacity: 0, y: 0, scale: 0.4, x: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-20, -180, -240],
                x: [0, p.drift, p.drift * 1.4],
                scale: [0.4, 1.2, 0.8],
                rotate: [0, p.drift > 0 ? 25 : -25, 0],
              }}
              transition={{ duration: 2.2, delay: p.delay, ease: "easeOut" }}
            >
              <Heart className="fill-current" style={{ width: p.size, height: p.size }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* the big hug button */}
      <motion.button
        onClick={handleHug}
        disabled={cooldown}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        className="relative flex h-28 w-28 items-center justify-center rounded-full"
        aria-label="send a hug"
      >
        {/* glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-rose-400/40"
          animate={burst ? { scale: [1, 1.8], opacity: [0.6, 0] } : { scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={burst ? { duration: 1 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-rose-400/30"
          animate={burst ? { scale: [1, 2.2], opacity: [0.5, 0] } : { scale: [1, 1.18, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={burst ? { duration: 1.2 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        {/* main button */}
        <motion.div
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-rose-500 shadow-glow-rose"
          animate={burst ? { scale: [1, 1.15, 0.95, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Heart className="h-10 w-10 fill-white text-white drop-shadow" />
          </motion.div>
        </motion.div>
      </motion.button>

      <p className="mt-3 font-display text-base font-bold text-gradient-rose">
        send me a hug
      </p>
      <p className="mt-0.5 text-xs text-rose-400/80">
        {hugsSent === 0
          ? "tap to send your first one"
          : `${hugsSent} ${hugsSent === 1 ? "hug" : "hugs"} sent so far 🤍`}
      </p>
      {cooldown && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-[10px] italic text-rose-400/60"
        >
          one at a time, love. let it land.
        </motion.p>
      )}
    </div>
  );
}
