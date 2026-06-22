"use client";

import { motion } from "framer-motion";

/** A soft pink shimmering skeleton block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-xl bg-rose-100/70 ${className ?? ""}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/** A skeleton placeholder shaped like the daily love-note card. */
export function LoveNoteSkeleton() {
  return (
    <div className="glass-pink rounded-3xl p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-11/12" />
      <Skeleton className="mb-4 h-4 w-4/5" />
      <Skeleton className="h-5 w-28" />
    </div>
  );
}
