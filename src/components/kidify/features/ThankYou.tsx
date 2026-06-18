"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { PinkCard, SectionTitle } from "../ui/decor";
import { useThankYou } from "@/lib/data-access";
import { useKidify } from "@/lib/store";
import { Heart } from "lucide-react";

export function ThankYou() {
  const bearName = useKidify((s) => s.bearName);
  const [tappedHearts, setTappedHearts] = useState<number[]>([]);
  const thankYou = useThankYou();

  const handleHeartTap = (i: number) => {
    setTappedHearts((h) => [...h, i]);
  };

  return (
    <div className="relative space-y-6">
      {/* hero heart */}
      <div className="relative flex flex-col items-center pt-4 text-center">
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 via-pink-200 to-rose-300 shadow-glow-rose">
              {/* inner glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-rose-300/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Heart className="h-14 w-14 fill-rose-500 text-rose-500" />
              {/* little orbiting hearts */}
              {[0, 90, 180, 270].map((deg) => (
                <motion.div
                  key={deg}
                  className="absolute text-lg"
                  style={{
                    transformOrigin: "center",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div
                    style={{
                      transform: `rotate(${deg}deg) translateY(-58px)`,
                    }}
                  >
                    💗
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.h1
          className="mt-5 font-display text-3xl font-extrabold text-gradient-rose"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          thank you
        </motion.h1>
        <motion.div
          className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-rose-300 to-pink-400"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ transformOrigin: "center" }}
        />
        <motion.p
          className="mt-3 max-w-xs text-sm leading-relaxed text-rose-500/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {thankYou.intro}
        </motion.p>
      </div>

      {/* sections — each reveals on scroll */}
      <div className="space-y-5">
        {thankYou.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <PinkCard
              className="relative cursor-pointer overflow-hidden transition-all hover:scale-[1.01] hover:shadow-glow-rose/30"
              onClick={() => handleHeartTap(i)}
            >
              {/* gradient accent bar on the left */}
              <div
                className="absolute bottom-4 left-0 top-4 w-1 rounded-r-full"
                style={{
                  background: [
                    "linear-gradient(180deg, oklch(0.72 0.19 8), oklch(0.8 0.12 30))",
                    "linear-gradient(180deg, oklch(0.8 0.12 30), oklch(0.78 0.14 340))",
                    "linear-gradient(180deg, oklch(0.78 0.14 340), oklch(0.83 0.1 75))",
                    "linear-gradient(180deg, oklch(0.83 0.1 75), oklch(0.7 0.16 290))",
                    "linear-gradient(180deg, oklch(0.7 0.16 290), oklch(0.72 0.19 8))",
                  ][i % 5],
                }}
              />
              <div className="absolute -right-3 -top-3 text-5xl opacity-10">
                {["💗", "🌷", "✨", "🧸", "🌙"][i % 5]}
              </div>

              <div className="mb-2 flex items-center gap-2">
                <motion.span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white shadow-soft"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {i + 1}
                </motion.span>
                <h3 className="font-display text-lg font-bold text-rose-600">{section.heading}</h3>
              </div>

              <p className="text-[15px] leading-7 text-rose-900/75 whitespace-pre-line">
                {section.body}
              </p>

              {/* tap to leave a heart */}
              <div className="mt-3 flex items-center gap-1.5">
                <motion.button
                  className="flex items-center gap-1 text-xs text-rose-400"
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHeartTap(i);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${tappedHearts.filter((x) => x === i).length > 0 ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                  <span>{tappedHearts.filter((x) => x === i).length}</span>
                </motion.button>
              </div>

              {/* floating hearts on tap */}
              {tappedHearts
                .map((h, idx) => ({ h, idx }))
                .filter(({ h }) => h === i)
                .map(({ idx }) => (
                  <motion.div
                    key={idx}
                    className="pointer-events-none absolute bottom-6 left-1/2 text-rose-400"
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], y: -80, scale: [0.5, 1.2, 0.8], x: (Math.random() - 0.5) * 60 }}
                    transition={{ duration: 1.4 }}
                  >
                    <Heart className="h-5 w-5 fill-rose-400" />
                  </motion.div>
                ))}
            </PinkCard>
          </motion.div>
        ))}
      </div>

      {/* closing */}
      <motion.div
        className="flex flex-col items-center pt-4 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-4xl"
        >
          🤍
        </motion.div>
        <p className="mt-3 font-hand text-2xl text-rose-500">
          and that's just the start.
        </p>
        <div className="mx-auto mt-1 h-0.5 w-8 rounded-full bg-gradient-to-r from-rose-300 to-pink-400" />
        <p className="mt-3 text-xs text-rose-400/70">
          tap any card to leave a little heart. {bearName} is keeping them safe.
        </p>
      </motion.div>
    </div>
  );
}
