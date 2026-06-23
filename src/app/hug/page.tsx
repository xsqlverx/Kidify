"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

const HUG_MESSAGES = [
  "it landed. 🤍",
  "she felt that one. she always does.",
  "sent. the warmth is on its way.",
  "delivered. right to her heart.",
  "he felt it too. promise.",
];

export default function HugPage() {
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/hugs/incoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (res.ok) setDone(true);
    } catch {
      // silently fail
    }
    setSending(false);
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-white px-6">
      {/* floating hearts bg — only on client to avoid hydration mismatch */}
      {mounted && Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-300/30"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            fontSize: `${20 + Math.random() * 30}px`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        >
          <Heart className="fill-current" />
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-sm"
          >
            <div className="mb-6 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-2xl shadow-glow-rose"
              >
                <Heart className="h-8 w-8 fill-white text-white" />
              </motion.div>
              <h1 className="font-display text-2xl font-extrabold text-gradient-rose">
                send her a hug
              </h1>
              <p className="mt-1 text-sm text-rose-400">
                type a message to go with it
              </p>
            </div>

            <div className="rounded-3xl bg-white/80 p-5 shadow-soft backdrop-blur">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="you've got this. i'm right here. always. 🤍"
                rows={4}
                maxLength={280}
                className="w-full resize-none rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-800 placeholder-rose-300 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              />
              <div className="mt-1 text-right text-xs text-rose-300">
                {message.length}/280
              </div>

              <motion.button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                whileTap={{ scale: 0.95 }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-3 font-display font-bold text-white shadow-glow-rose transition-all hover:from-rose-500 hover:to-pink-600 disabled:opacity-40"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                ) : (
                  <>
                    send it <Heart className="h-4 w-4 fill-white" />
                  </>
                )}
              </motion.button>
            </div>

            <p className="mt-6 text-center text-xs text-rose-300">
              she&apos;ll see it the next time she opens the app
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-3xl shadow-glow-rose"
            >
              <Heart className="h-10 w-10 fill-white text-white" />
            </motion.div>
            <h2 className="font-display text-2xl font-extrabold text-gradient-rose">
              {HUG_MESSAGES[Math.floor(Math.random() * HUG_MESSAGES.length)]}
            </h2>
            <p className="mt-2 text-sm text-rose-400">
              you can close this now
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
