"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import * as React from "react";

/** Soft floating hearts/sparkles/petals drifting in the background. */
export function FloatingDecor({ density = 14 }: { density?: number }) {
  const items = React.useMemo(() => {
    const emojis = ["💗", "🌸", "✨", "🧸", "🌷", "🫧", "💕", "🌙"];
    return Array.from({ length: density }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 12 + Math.random() * 18,
      emoji: emojis[i % emojis.length],
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 6,
      drift: (Math.random() - 0.5) * 40,
    }));
  }, [density]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((it) => (
        <motion.div
          key={it.id}
          className="absolute opacity-30"
          style={{ left: `${it.left}%`, top: `${it.top}%`, fontSize: it.size }}
          animate={{
            y: [0, -30, 0],
            x: [0, it.drift, 0],
            rotate: [0, 12, -8, 0],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: it.duration,
            delay: it.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {it.emoji}
        </motion.div>
      ))}
    </div>
  );
}

/** The pink primary button with a soft glow + little heart. */
export const PinkButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { heart?: boolean }
>(({ className, children, heart = false, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(
      "relative rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-glow-rose transition-all hover:from-rose-500 hover:to-pink-600 hover:shadow-lg active:scale-95",
      className,
    )}
    {...props}
  >
    {heart && <span className="mr-1.5 text-sm">💗</span>}
    {children}
  </Button>
));
PinkButton.displayName = "PinkButton";

/** Soft glassy pink card. */
export function PinkCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-pink rounded-3xl p-5 shadow-soft",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** A small pill badge. */
export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-rose-100/80 px-3 py-1 text-xs font-semibold text-rose-600",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Section heading with the display font and a gradient. */
export function SectionTitle({
  children,
  subtitle,
  className,
}: {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="font-display text-2xl font-bold text-gradient-rose">{children}</h2>
      {subtitle && <p className="text-sm text-rose-400/80">{subtitle}</p>}
    </div>
  );
}
