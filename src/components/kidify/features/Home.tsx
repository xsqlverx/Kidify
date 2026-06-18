"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useEffect } from "react";
import { Bear } from "../Bear";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Confetti } from "../ui/confetti";
import { Wardrobe } from "./Wardrobe";
import { HugButton } from "./HugButton";
import { DaysCounter } from "./DaysCounter";
import { ReasonsCard, ReasonsDeck } from "./Reasons";
import { StickerStrip, StickerBook } from "./Stickers";
import { MemoryJar } from "./MemoryJar";
import { BreathingBubble } from "./BreathingBubble";
import { AffirmationCard } from "./Affirmation";
import { StarWish } from "./StarWish";
import { MoodDiary } from "./MoodDiary";
import { LoveLetterArchive } from "./LoveLetterArchive";
import { SelfCareChecklist } from "./SelfCareChecklist";
import { OurStory } from "./OurStory";
import { MoodInsights } from "./MoodInsights";
import { SurpriseBox } from "./SurpriseBox";
import { useKidify } from "@/lib/store";
import { useDailyMessage } from "@/lib/data-access";
import type { DailyMessage } from "@/lib/mock-data";
import { Droplets, ChevronLeft, ChevronRight, Check, CalendarDays, Shirt, Heart } from "lucide-react";
import { toast } from "sonner";

export function HomeFeature() {
  const bearName = useKidify((s) => s.bearName);
  const waterCups = useKidify((s) => s.waterCups);
  const waterGoal = useKidify((s) => s.waterGoal);
  const addWater = useKidify((s) => s.addWater);
  const markMessageRead = useKidify((s) => s.markMessageRead);
  const readMessages = useKidify((s) => s.readMessages);
  const bearPats = useKidify((s) => s.bearPats);
  const hugsSent = useKidify((s) => s.hugsSent);
  const earnSticker = useKidify((s) => s.earnSticker);
  const resetStickersIfNewDay = useKidify((s) => s.resetStickersIfNewDay);

  const [dayOffset, setDayOffset] = useState(0); // 0 = today
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [stickersOpen, setStickersOpen] = useState(false);
  const [confettiFire, setConfettiFire] = useState(0);
  const celebratedRef = useRef(false);
  const today = useDailyMessage(0);
  const msg: DailyMessage = useDailyMessage(dayOffset);

  // reset daily sticker count on a new day
  useEffect(() => {
    resetStickersIfNewDay();
  }, [resetStickersIfNewDay]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "you're up so late, love";
    if (h < 12) return "good morning, sunshine";
    if (h < 17) return "good afternoon, you";
    if (h < 21) return "good evening, my heart";
    return "good night, soft thing";
  }, []);

  const waterPct = Math.min(100, (waterCups / waterGoal) * 100);
  const isToday = dayOffset === 0;
  const alreadyRead = readMessages.includes(msg.date);

  const handleRead = () => {
    markMessageRead(msg.date);
    if (isToday) earnSticker("read");
    toast.success("marked as read. 💗", {
      description: "he'll know you saw it.",
    });
  };

  const handleWater = () => {
    const willComplete = waterCups + 1 >= waterGoal && waterCups < waterGoal;
    addWater(1);
    earnSticker("water");
    if (willComplete) {
      toast.success("you did it! 💧", {
        description: `${bearName} is so proud of you.`,
      });
      if (!celebratedRef.current) {
        celebratedRef.current = true;
        setConfettiFire((f) => f + 1);
      }
    }
  };

  return (
    <div className="space-y-5">
      {confettiFire > 0 && <Confetti key={confettiFire} />}

      {/* greeting */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex-1">
          <motion.p
            className="text-sm text-rose-400"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {greeting}
          </motion.p>
          <motion.h1
            className="font-display text-2xl font-extrabold text-gradient-rose"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            welcome back, you
          </motion.h1>
          <motion.div
            className="mt-0.5 h-1 w-16 rounded-full bg-gradient-to-r from-rose-300 to-pink-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            style={{ transformOrigin: "left" }}
          />
        </div>
        <button
          onClick={() => setWardrobeOpen(true)}
          className="relative flex flex-col items-center"
          aria-label="open bear wardrobe"
        >
          <Bear size={64} mood="happy" />
          <motion.span
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-400 text-white shadow"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shirt className="h-2.5 w-2.5" />
          </motion.span>
        </button>
      </motion.div>

      {/* quick stats row */}
      <motion.div
        className="grid grid-cols-3 gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="group rounded-2xl bg-white/60 p-2.5 text-center backdrop-blur transition-all hover:bg-white/80 hover:shadow-soft">
          <div className="font-display text-lg font-bold text-rose-500">{bearPats}</div>
          <div className="text-[9px] font-semibold uppercase text-rose-400/70">🧸 bear pats</div>
        </div>
        <div className="group rounded-2xl bg-white/60 p-2.5 text-center backdrop-blur transition-all hover:bg-white/80 hover:shadow-soft">
          <div className="font-display text-lg font-bold text-rose-500">{hugsSent}</div>
          <div className="text-[9px] font-semibold uppercase text-rose-400/70">🤗 hugs sent</div>
        </div>
        <div className="group rounded-2xl bg-white/60 p-2.5 text-center backdrop-blur transition-all hover:bg-white/80 hover:shadow-soft">
          <div className="font-display text-lg font-bold text-sky-500">{Math.min(waterCups, waterGoal)}/{waterGoal}</div>
          <div className="text-[9px] font-semibold uppercase text-sky-400/70">💧 water</div>
        </div>
      </motion.div>

      {/* days-together counter */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <DaysCounter />
      </motion.div>

      {/* daily surprise box */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.10 }}
      >
        <SurpriseBox />
      </motion.div>

      {/* today's love note */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <PinkCard className="relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-7xl opacity-10">{msg.sticker}</div>
          {/* wax seal stamp */}
          <motion.div
            className="absolute -bottom-3 -left-3 flex h-12 w-12 rotate-[-12deg] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-glow-rose"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: -12 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 12 }}
            aria-hidden
          >
            <span className="font-display text-xs font-bold leading-none">with<br />love</span>
          </motion.div>

          <div className="mb-3 flex items-center justify-between">
            <Pill>
              <CalendarDays className="h-3 w-3" />
              {isToday ? "today's note" : msg.date}
            </Pill>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDayOffset((d) => Math.min(0, d - 1))}
                disabled={dayOffset <= -6}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-400 disabled:opacity-30"
                aria-label="previous day"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDayOffset((d) => Math.min(0, d + 1))}
                disabled={dayOffset >= 0}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-400 disabled:opacity-30"
                aria-label="next day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{msg.sticker}</span>
            <h3 className="font-display text-xl font-bold text-rose-600">{msg.title}</h3>
          </div>

          <p className="whitespace-pre-line text-[15px] leading-7 text-rose-900/70">{msg.body}</p>

          <p className="mt-4 font-hand text-xl text-rose-500">{msg.signature}</p>

          {isToday && !alreadyRead ? (
            <PinkButton onClick={handleRead} className="mt-4 w-full" size="sm" heart>
              i read it
            </PinkButton>
          ) : isToday && alreadyRead ? (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-rose-400">
              <Check className="h-4 w-4" /> you've read today's note
            </div>
          ) : (
            <p className="mt-4 text-center text-xs text-rose-300">a note from {msg.date}</p>
          )}
        </PinkCard>
      </motion.div>

      {/* daily affirmation */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13 }}
      >
        <AffirmationCard />
      </motion.div>

      {/* reasons i love you */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
      >
        <ReasonsCard onOpen={() => setReasonsOpen(true)} />
      </motion.div>

      {/* today's little wins (sticker strip) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <StickerStrip onOpen={() => setStickersOpen(true)} />
      </motion.div>

      {/* send a hug */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <PinkCard className="flex flex-col items-center py-7">
          <Pill className="mb-3">
            <Heart className="h-3 w-3 fill-rose-400 text-rose-400" /> physical touch, digitised
          </Pill>
          <HugButton />
        </PinkCard>
      </motion.div>

      {/* water reminder */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PinkCard className="overflow-hidden">
          <div className="flex items-center justify-between">
            <SectionTitle subtitle="tiny sip, big love">
              <span className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-sky-400" /> water
              </span>
            </SectionTitle>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-sky-500">
                {Math.min(waterCups, waterGoal)}/{waterGoal}
              </div>
              <div className="text-[10px] font-semibold uppercase text-sky-400/70">cups today</div>
            </div>
          </div>

          {/* water glasses row */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Array.from({ length: waterGoal }).map((_, i) => {
              const filled = i < waterCups;
              return (
                <motion.button
                  key={i}
                  onClick={() => i === waterCups && handleWater()}
                  disabled={i !== waterCups}
                  className="relative"
                  whileTap={{ scale: 0.85 }}
                  aria-label={filled ? `cup ${i + 1} filled` : `fill cup ${i + 1}`}
                >
                  <motion.div
                    className="flex h-12 w-9 items-end overflow-hidden rounded-b-lg rounded-t-md border-2 border-sky-200 bg-white/60"
                    animate={filled ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {filled && (
                      <motion.div
                        className="w-full bg-gradient-to-t from-sky-400 to-sky-300"
                        initial={{ height: 0 }}
                        animate={{ height: "85%" }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </motion.div>
                  {filled && (
                    <span className="absolute -right-1 -top-1 text-xs">💧</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-sky-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400"
                animate={{ width: `${waterPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-bold text-sky-500">{Math.round(waterPct)}%</span>
          </div>

          {waterCups >= waterGoal ? (
            <motion.p
              className="mt-3 text-center text-sm font-semibold text-rose-500"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              you're all watered up. {bearName} is doing a happy dance. 💃
            </motion.p>
          ) : (
            <p className="mt-3 text-center text-xs text-rose-400/70">
              tap the next empty glass to sip. {bearName} is watching. 👀
            </p>
          )}
        </PinkCard>
      </motion.div>

      {/* breathing bubble — for the loud moments */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <BreathingBubble />
      </motion.div>

      {/* memory jar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <MemoryJar />
      </motion.div>

      {/* star wish — make a wish upon a star */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
      >
        <StarWish />
      </motion.div>

      {/* love letter archive */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <LoveLetterArchive />
      </motion.div>

      {/* mood diary */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.30 }}
      >
        <MoodDiary />
      </motion.div>

      {/* mood insights — only shows after 2+ moods logged */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.31 }}
      >
        <MoodInsights />
      </motion.div>

      {/* daily self-care checklist */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
      >
        <SelfCareChecklist />
      </motion.div>

      {/* our story timeline */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
      >
        <OurStory />
      </motion.div>

      {/* bear pats footer */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-1 text-xs text-rose-400/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.36 }}
      >
        <span>🧸 you've given {bearName} {bearPats} {bearPats === 1 ? "pat" : "pats"}. it's keeping count.</span>
      </motion.div>

      {/* sheets & modals */}
      <Wardrobe open={wardrobeOpen} onClose={() => setWardrobeOpen(false)} />
      <ReasonsDeck open={reasonsOpen} onClose={() => setReasonsOpen(false)} />
      <StickerBook open={stickersOpen} onClose={() => setStickersOpen(false)} />
    </div>
  );
}
