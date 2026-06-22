"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bear } from "./Bear";
import { FloatingDecor, PinkButton, Pill } from "./ui/decor";
import { useKidify } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Lock, AlertTriangle } from "lucide-react";

type Step = "welcome" | "letter" | "unlock" | "setup-code";

const LETTER_TEXT = `my love,

if you're reading this, it means you opened the little world i built for you.

i don't know how to build something this soft without it sounding like a lot, so i'll just say it plainly: every part of this exists because i wanted you to have a place that is only ours. no noise. no other people. just you, and me, and the bear you're about to name.

while you read this, the app is quietly getting itself ready for you — like i wish i could be doing in person, making the bed, warming the chai, clearing a space on the couch. since i can't, this will have to do.

take your time. there's no rush. when you're ready, close this letter and type in our little code. i'll be on the other side.

all my love,
me 💌`;

export function Onboarding() {
  const setBearName = useKidify((s) => s.setBearName);
  const bearName = useKidify((s) => s.bearName);
  const completeOnboarding = useKidify((s) => s.completeOnboarding);
  const setUnlocked = useKidify((s) => s.setUnlocked);
  const registerWrongAttempt = useKidify((s) => s.registerWrongAttempt);
  const resetUnlockAttempts = useKidify((s) => s.resetUnlockAttempts);
  const unlockAttempts = useKidify((s) => s.unlockAttempts);
  const lockedUntil = useKidify((s) => s.lockedUntil);

  const [step, setStep] = useState<Step>("welcome");
  const [nameInput, setNameInput] = useState("");
  const [letterOpen, setLetterOpen] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [code, setCode] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [shake, setShake] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [codeExists, setCodeExists] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/unlock/status")
      .then((r) => r.json())
      .then((d) => setCodeExists(d.exists))
      .catch(() => setCodeExists(false))
  }, [])

  useEffect(() => {
    if (step !== "letter" || !letterOpen) return;
    setLoadProgress(0);
    const t = setInterval(() => {
      setLoadProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          return 100;
        }
        return p + 2;
      });
    }, 90);
    return () => clearInterval(t);
  }, [step, letterOpen]);

  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [lockedUntil]);

  useEffect(() => {
    if (code.length !== 4) return;
    if (lockedUntil && now < lockedUntil) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/unlock/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        })
        const data = await res.json()
        if (data.success) {
          resetUnlockAttempts()
          setUnlocked(true)
          completeOnboarding()
        } else {
          const { locked } = registerWrongAttempt()
          if (data.locked) {
            console.log("[FAILSAFE] 5 wrong attempts logged server-side")
          }
          setCodeError(true)
          setShake(true)
          setTimeout(() => setShake(false), 500)
          setTimeout(() => {
            setCode("")
            setCodeError(false)
          }, 700)
          if (locked) {
            setNow(Date.now())
          }
        }
      } catch {
        setCodeError(true)
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setTimeout(() => { setCode(""); setCodeError(false) }, 700)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [code])

  const handleNameSubmit = () => {
    const n = nameInput.trim() || "Mochi";
    setBearName(n);
    setStep("letter");
  };

  const handleCloseLetter = () => {
    setLetterOpen(false);
    setTimeout(() => {
      setStep(codeExists ? "unlock" : "setup-code")
    }, 500);
  };

  const handleSetupCode = async () => {
    if (setupCode.length !== 4 || setupCode !== setupConfirm) return
    try {
      const res = await fetch("/api/unlock/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode }),
      })
      const data = await res.json()
      if (data.success) {
        setCodeExists(true)
        setStep("unlock")
        setSetupCode("")
        setSetupConfirm("")
      }
    } catch {}
  }

  const lockedRemaining = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const isLocked = lockedRemaining > 0;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <FloatingDecor density={16} />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-5 py-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME / NAME THE BEAR */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              className="flex w-full max-w-md flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Pill className="mb-6">
                <Sparkles className="h-3 w-3" /> a little world, just for you
              </Pill>

              <motion.div
                className="mb-4"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
              >
                <Bear size={150} mood="excited" />
              </motion.div>

              <h1 className="font-display text-3xl font-extrabold text-gradient-rose">
                hi, you.
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-rose-500/80">
                before anything else — this little one needs a name.
                <br />
                it's going to follow you around this whole app, so choose wisely (or don't, i won't tell).
              </p>

              <div className="mt-6 w-full space-y-3">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                  placeholder="name your bear…"
                  maxLength={20}
                  className="h-12 rounded-2xl border-rose-200 bg-white/70 text-center text-lg font-semibold text-rose-600 placeholder:text-rose-300 placeholder:font-normal focus-visible:ring-rose-300"
                  autoFocus
                />
                <PinkButton
                  onClick={handleNameSubmit}
                  className="w-full"
                  heart
                  size="lg"
                >
                  that's the one
                </PinkButton>
              </div>

              <p className="mt-6 text-xs text-rose-400/60">
                she's waiting for you on the other side 💗
              </p>
            </motion.div>
          )}

          {/* STEP 2: THE LETTER */}
          {step === "letter" && (
            <motion.div
              key="letter"
              className="w-full max-w-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {!letterOpen ? (
                  <motion.div
                    key="envelope"
                    className="flex flex-col items-center text-center"
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="mb-4 font-hand text-2xl text-rose-500">a letter for you</p>
                    <motion.button
                      onClick={() => setLetterOpen(true)}
                      className="relative cursor-pointer"
                      whileHover={{ scale: 1.05, rotate: -2 }}
                      whileTap={{ scale: 0.97 }}
                      aria-label="open the letter"
                    >
                      {/* envelope */}
                      <div className="relative h-44 w-64 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 shadow-glow-rose">
                        <div className="absolute inset-0 rounded-2xl border-2 border-rose-300/50" />
                        {/* address line — "to: my love" */}
                        <div className="absolute left-4 top-16 text-left">
                          <p className="font-hand text-sm text-rose-400/70">to:</p>
                          <p className="font-hand text-lg font-semibold text-rose-500">my love</p>
                        </div>
                        {/* wax seal */}
                        <motion.div
                          className="absolute -bottom-2 left-1/2 flex h-12 w-12 -translate-x-1/2 rotate-[-8deg] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 shadow-glow-rose"
                          initial={{ scale: 0, rotate: -40 }}
                          animate={{ scale: 1, rotate: -8 }}
                          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 12 }}
                        >
                          <span className="font-display text-[10px] font-bold leading-none text-white">S &amp; M</span>
                        </motion.div>
                        {/* flap */}
                        <div className="absolute left-0 right-0 top-0 h-0 w-0 border-l-[128px] border-r-[128px] border-t-[60px] border-l-transparent border-r-transparent border-t-rose-300/70" style={{ clipPath: "polygon(0 0, 100% 0, 50% 70%)" }} />
                      </div>
                      <motion.div
                        className="absolute -right-3 -top-3 text-2xl"
                        animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ✉️
                      </motion.div>
                    </motion.button>
                    <p className="mt-5 text-sm text-rose-400">tap to open</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="letter-open"
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* paper */}
                    <div
                      className="relative rounded-3xl bg-gradient-to-b from-amber-50 to-rose-50 p-6 shadow-glow-rose"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 27px, oklch(0.8 0.05 20 / 0.18) 27px, oklch(0.8 0.05 20 / 0.18) 28px)",
                      }}
                    >
                      <div className="absolute -right-2 -top-2 text-3xl">💌</div>
                      <div className="font-hand text-xl leading-8 text-rose-800/90 whitespace-pre-line">
                        {LETTER_TEXT}
                      </div>

                      {/* loading bar at the bottom of the letter */}
                      <div className="mt-5 rounded-2xl bg-white/60 p-3">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-rose-400">
                          <span className="flex items-center gap-1">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                              className="inline-block"
                            >
                              🌸
                            </motion.span>
                            getting your world ready…
                          </span>
                          <span>{loadProgress}%</span>
                        </div>
                        <Progress
                          value={loadProgress}
                          className="h-2 bg-rose-100"
                        />
                        <p className="mt-1.5 text-[10px] text-rose-400/70">
                          {loadProgress < 100
                            ? "keep reading, no rush. i'll be done soon."
                            : "all ready. take your time. 💗"}
                        </p>
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: loadProgress >= 60 ? 1 : 0.3 }}
                      className="mt-5 flex justify-center"
                    >
                      <PinkButton onClick={handleCloseLetter} size="lg" heart>
                        i've read it — let me in
                      </PinkButton>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STEP 3: UNLOCK CODE */}
          {step === "unlock" && (
            <motion.div
              key="unlock"
              className="flex w-full max-w-md flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bear size={110} mood={codeError ? "shy" : "happy"} />
              </motion.div>

              <h2 className="mt-4 font-display text-2xl font-bold text-gradient-rose">
                almost there, {bearName || "love"} is waiting
              </h2>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-rose-500/80">
                <Lock className="h-3.5 w-3.5" />
                type in our little code to unlock
              </p>

              <motion.div
                className={`mt-6 ${shake ? "animate-wiggle" : ""}`}
                animate={codeError ? { x: [-10, 10, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <InputOTP
                  maxLength={4}
                  value={code}
                  onChange={(v) => !isLocked && setCode(v)}
                  disabled={isLocked}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400"
                    />
                    <InputOTPSlot
                      index={3}
                      className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </motion.div>

              {/* attempts indicator */}
              <div className="mt-4 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <motion.div
                    key={n}
                    className={`h-2 w-2 rounded-full ${n <= unlockAttempts ? "bg-rose-400" : "bg-rose-100"}`}
                    animate={n === unlockAttempts ? { scale: [1, 1.4, 1] } : {}}
                  />
                ))}
              </div>

              <AnimatePresence>
                {isLocked ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 flex items-center gap-2 rounded-2xl bg-rose-100/80 px-4 py-3 text-sm font-semibold text-rose-600"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    too many tries. come back in {Math.ceil(lockedRemaining / 60)}m {lockedRemaining % 60}s. 💗
                  </motion.div>
                ) : codeError ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-sm font-medium text-rose-500"
                  >
                    not quite. {5 - unlockAttempts} {unlockAttempts === 4 ? "try" : "tries"} left. you've got this.
                  </motion.p>
                ) : (
                  <p className="mt-4 text-xs text-rose-400/60">
                    tip: it's a number that means something to us.
                  </p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* STEP 4: SETUP CODE (first boot) */}
          {step === "setup-code" && (
            <motion.div
              key="setup-code"
              className="flex w-full max-w-md flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bear size={110} mood="excited" />
              </motion.div>

              <h2 className="mt-4 font-display text-2xl font-bold text-gradient-rose">
                choose your code, {bearName || "love"}
              </h2>
              <p className="mt-2 text-sm text-rose-500/80">
                a little 4-digit key that only you know.
                <br />you'll use it every time you come back.
              </p>

              <div className="mt-6 w-full max-w-xs space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-rose-400">create a code</p>
                  <InputOTP
                    maxLength={4}
                    value={setupCode}
                    onChange={setSetupCode}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                      <InputOTPSlot index={1} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                      <InputOTPSlot index={2} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                      <InputOTPSlot index={3} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-rose-400">confirm it</p>
                  <InputOTP
                    maxLength={4}
                    value={setupConfirm}
                    onChange={setSetupConfirm}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                      <InputOTPSlot index={1} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                      <InputOTPSlot index={2} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                      <InputOTPSlot index={3} className="h-14 w-12 rounded-2xl border-2 border-rose-200 bg-white/80 text-2xl font-bold text-rose-600 data-[active]:border-rose-400" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {setupCode.length === 4 && setupConfirm.length === 4 && setupCode !== setupConfirm && (
                  <p className="text-sm text-rose-500">codes don't match — try again</p>
                )}

                <PinkButton
                  onClick={handleSetupCode}
                  disabled={setupCode.length !== 4 || setupCode !== setupConfirm}
                  className="w-full"
                  heart
                  size="lg"
                >
                  lock it in
                </PinkButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
