"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bear } from "./Bear";
import { FloatingDecor } from "./ui/decor";
import { useKidify } from "@/lib/store";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock, AlertTriangle } from "lucide-react";

export function LockScreen() {
  const bearName = useKidify((s) => s.bearName);
  const setUnlocked = useKidify((s) => s.setUnlocked);
  const registerWrongAttempt = useKidify((s) => s.registerWrongAttempt);
  const resetUnlockAttempts = useKidify((s) => s.resetUnlockAttempts);
  const unlockAttempts = useKidify((s) => s.unlockAttempts);
  const lockedUntil = useKidify((s) => s.lockedUntil);

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [shake, setShake] = useState(false);
  const [now, setNow] = useState(Date.now());

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

  const lockedRemaining = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const isLocked = lockedRemaining > 0;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <FloatingDecor density={16} />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-5 py-10">
        <motion.div
          className="flex w-full max-w-md flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bear size={110} mood={codeError ? "shy" : "happy"} />
          </motion.div>

          <h2 className="mt-4 font-display text-2xl font-bold text-gradient-rose">
            welcome back, {bearName || "love"}
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
      </div>
    </div>
  );
}
