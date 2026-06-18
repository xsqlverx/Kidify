"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { PinkCard, PinkButton, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { Gift, X, Sparkles } from "lucide-react";

// 30 little daily surprises — one per day, rotating by day-of-year
const SURPRISES = [
  { emoji: "🌅", title: "a sunrise for you", body: "today's sunrise, wherever you are. pretend i sent it." },
  { emoji: "🫧", title: "a tiny permission", body: "you don't have to be productive today. you just have to be." },
  { emoji: "🍫", title: "an imaginary chocolate", body: "the good kind. the kind that melts slow. enjoy." },
  { emoji: "📖", title: "a line from a book i love", body: "\"and so we beat on, boats against the current, borne back ceaselessly into the past.\" — fitzgerald. i think of you when i read it." },
  { emoji: "🌧️", title: "a sound i wish you could hear", body: "rain on my window, right now. it's gentle. it's saying your name." },
  { emoji: "🌷", title: "a flower, drawn badly", body: "i tried to draw a tulip for you. it looks like a spoon. but it's yours." },
  { emoji: "☕", title: "a warm cup, teleported", body: "chai. two sugars. the way you like it. pretend it's in your hands." },
  { emoji: "🌙", title: "tonight's moon", body: "it's doing its slow climb. if you look up later, we'll be seeing the same one." },
  { emoji: "🧸", title: "a hug from the bear", body: "mochi says: 'i got her. she's okay. go drink water.'" },
  { emoji: "✨", title: "a tiny secret", body: "i still replay the first time you laughed at something i said. on loop." },
  { emoji: "🌻", title: "a permission slip", body: "to cancel the thing you don't want to go to. signed, me." },
  { emoji: "🎶", title: "a song i had on repeat", body: "the one that made me think of you at 2am. you know the one." },
  { emoji: "🕊️", title: "a deep breath", body: "inhale for 4. hold for 7. exhale for 8. there. that one's on me." },
  { emoji: "🍰", title: "a tiny celebration", body: "for getting through yesterday. that counts. i'm proud of you." },
  { emoji: "🪞", title: "a mirror note", body: "if no one's told you today: your eyes are kind. your laugh fixes things. you're loved." },
  { emoji: "🐌", title: "permission to go slow", body: "the world can wait. you're allowed to move at the speed of you." },
  { emoji: "🫶", title: "a little heart", body: "this one. right here. i'm holding it out. take it." },
  { emoji: "🌈", title: "a promise", body: "the grey passes. it always does. i'll be here when it does." },
  { emoji: "🧷", title: "a safety pin", body: "for whatever feels like it's coming undone. you're not. i've got you." },
  { emoji: "🏡", title: "a tiny home", body: "this app. this little world. it's yours. it's safe. stay as long as you want." },
  { emoji: "🌿", title: "a growing thing", body: "go water your garden. something's about to bloom. i can feel it." },
  { emoji: "🕯️", title: "a candle, lit", body: "i lit one for you today. for peace. for softness. for you." },
  { emoji: "🐾", title: "an animal i saw today", body: "a stray cat, stretching in the sun. it reminded me of you. don't ask why." },
  { emoji: "💌", title: "a note you didn't expect", body: "you're doing better than you think. i see it, even from here." },
  { emoji: "🌺", title: "a flower i passed", body: "a hibiscus, impossibly red. i wanted you to see it. so: here." },
  { emoji: "🪐", title: "a far-away thing", body: "saturn is doing its rings thing. it doesn't know about us. i like that." },
  { emoji: "🫧", title: "a bubble, blown", body: "watch it float. watch it pop. that's it. that's the surprise." },
  { emoji: "🍃", title: "a leaf, falling", body: "i watched one today. it landed soft. i thought of you." },
  { emoji: "🤍", title: "a blank space", body: "this one's empty on purpose. write whatever you need here. it's yours." },
  { emoji: "🔮", title: "a tiny prediction", body: "something small is about to go right. i can't say what. but watch for it." },
];

export function SurpriseBox() {
  const surpriseOpened = useKidify((s) => s.surpriseOpened);
  const surpriseIndex = useKidify((s) => s.surpriseIndex);
  const openSurprise = useKidify((s) => s.openSurprise);
  const resetSurpriseIfNewDay = useKidify((s) => s.resetSurpriseIfNewDay);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    resetSurpriseIfNewDay();
  }, [resetSurpriseIfNewDay]);

  const surprise = SURPRISES[surpriseIndex] ?? SURPRISES[0];

  const handleOpen = () => {
    if (!surpriseOpened) {
      openSurprise();
    }
    setShowModal(true);
  };

  return (
    <>
      <PinkCard className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 to-pink-100">
        <div className="absolute -right-3 -top-3 text-6xl opacity-10">🎁</div>

        <div className="mb-3 flex items-center justify-between">
          <Pill className="bg-amber-100/80 text-amber-600">
            <Gift className="h-3 w-3" /> daily surprise
          </Pill>
          {surpriseOpened && (
            <span className="text-[10px] font-semibold text-rose-400">opened today ✓</span>
          )}
        </div>

        <div className="flex flex-col items-center py-2">
          <motion.div
            animate={
              surpriseOpened
                ? { rotate: [0, -5, 5, 0] }
                : { y: [0, -6, 0], rotate: [0, 3, -3, 0] }
            }
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl"
          >
            {surpriseOpened ? surprise.emoji : "🎁"}
          </motion.div>

          <p className="mt-3 text-center text-sm font-semibold text-rose-600">
            {surpriseOpened ? surprise.title : "a little something, every day"}
          </p>
          <p className="mt-1 text-center text-xs text-rose-400">
            {surpriseOpened
              ? "come back tomorrow for a new one."
              : "tap to unwrap today's tiny surprise."}
          </p>

          {!surpriseOpened && (
            <PinkButton
              onClick={handleOpen}
              size="sm"
              className="mt-3 h-9 px-5 text-xs"
              heart
            >
              <Sparkles className="mr-1 h-3 w-3" /> unwrap
            </PinkButton>
          )}

          {surpriseOpened && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-xs text-rose-400 underline decoration-dotted underline-offset-4 hover:text-rose-600"
            >
              read it again
            </button>
          )}
        </div>
      </PinkCard>

      {/* surprise reveal modal */}
      <AnimatePresence>
        {showModal && surpriseOpened && (
          <Portal>
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-rose-950/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              {/* sparkle burst background */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${50 + Math.cos((i * 30 * Math.PI) / 180) * 35}%`,
                    top: `${50 + Math.sin((i * 30 * Math.PI) / 180) * 35}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, delay: i * 0.05, repeat: Infinity, repeatDelay: 1 }}
                >
                  ✨
                </motion.div>
              ))}

              <motion.div
                className="relative mx-4 w-full max-w-sm rounded-3xl bg-gradient-to-b from-white to-rose-50 p-6 shadow-glow-rose"
                initial={{ scale: 0.7, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                  aria-label="close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="mb-3 text-6xl"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    {surprise.emoji}
                  </motion.div>

                  <motion.h3
                    className="font-display text-xl font-bold text-gradient-rose"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {surprise.title}
                  </motion.h3>

                  <motion.p
                    className="mt-3 font-hand text-xl leading-7 text-rose-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {surprise.body}
                  </motion.p>

                  <motion.p
                    className="mt-4 text-[10px] text-rose-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    a little surprise, just for today. 🤍
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
