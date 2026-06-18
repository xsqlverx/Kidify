"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { PinkCard, PinkButton, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { LOVE_QUOTES } from "@/lib/quotes-data";
import { Quote, X, Shuffle, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

export function DailyQuote() {
  const [idx, setIdx] = useState(() => dayOfYear() % LOVE_QUOTES.length);
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const quote = LOVE_QUOTES[idx];
  const isFav = favorites.includes(idx);

  const handleShuffle = () => {
    let next = idx;
    while (next === idx && LOVE_QUOTES.length > 1) {
      next = Math.floor(Math.random() * LOVE_QUOTES.length);
    }
    setIdx(next);
  };

  const handleFav = () => {
    setFavorites((f) =>
      f.includes(idx) ? f.filter((i) => i !== idx) : [...f, idx],
    );
    toast.success(isFav ? "unsaved. 💗" : "saved to your heart. 🤍");
  };

  const handleShare = () => {
    const text = `"${quote.text}" — ${quote.author}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard?.writeText(text);
        toast.success("copied to clipboard 📋");
      });
    } else {
      navigator.clipboard?.writeText(text);
      toast.success("copied to clipboard 📋");
    }
  };

  return (
    <>
      <PinkCard className="relative overflow-hidden bg-gradient-to-br from-rose-50/80 via-white/60 to-pink-50/80">
        <div className="absolute -right-3 -top-3 text-6xl opacity-10">💭</div>
        <div className="absolute left-3 top-3 text-3xl opacity-20">"</div>
        <div className="absolute bottom-3 right-3 text-3xl opacity-20">"</div>

        <div className="mb-3 flex items-center justify-between">
          <Pill>
            <Quote className="h-3 w-3" /> today's quote
          </Pill>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100"
              aria-label="share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleShuffle}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100"
              aria-label="another one"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleFav}
              className={cn(
                "flex h-7 items-center justify-center gap-1 rounded-full px-2 text-[10px] font-semibold hover:bg-rose-100",
                isFav ? "bg-rose-100 text-rose-500" : "bg-rose-50 text-rose-400",
              )}
              aria-label="favorite"
            >
              <Heart className={cn("h-3 w-3", isFav && "fill-rose-500 text-rose-500")} />
              {favorites.length}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-3 text-center">
          <motion.p
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-hand text-xl leading-7 text-rose-700"
          >
            {quote.text}
          </motion.p>
          <motion.p
            key={`author-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-xs font-semibold uppercase tracking-wide text-rose-400"
          >
            — {quote.author}
          </motion.p>
        </div>
      </PinkCard>
    </>
  );
}
