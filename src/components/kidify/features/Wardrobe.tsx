"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bear } from "../Bear";
import { PinkButton, Pill } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify } from "@/lib/store";
import { Sparkles, Lock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Accessory = "bow" | "flower" | "crown" | "scarf" | "glasses" | "halo";

const ACCESSORIES: {
  id: Accessory;
  name: string;
  emoji: string;
  cost: number;
  desc: string;
}[] = [
  { id: "bow", name: "pink bow", emoji: "🎀", cost: 0, desc: "the classic. always cute." },
  { id: "flower", name: "flower", emoji: "🌸", cost: 0, desc: "a little bloom behind the ear." },
  { id: "crown", name: "crown", emoji: "👑", cost: 0, desc: "because she's a princess." },
  { id: "scarf", name: "lavender scarf", emoji: "🧣", cost: 0, desc: "for the soft hours." },
  { id: "glasses", name: "tiny glasses", emoji: "🤓", cost: 15, desc: "she's reading. do not disturb." },
  { id: "halo", name: "halo", emoji: "😇", cost: 25, desc: "angel energy only." },
];

export function Wardrobe({ open, onClose }: { open: boolean; onClose: () => void }) {
  const bearName = useKidify((s) => s.bearName);
  const accessory = useKidify((s) => s.bearAccessory);
  const setBearAccessory = useKidify((s) => s.setBearAccessory);
  const gardenCoins = useKidify((s) => s.gardenCoins);

  const handlePick = (a: (typeof ACCESSORIES)[number]) => {
    if (a.cost > 0 && gardenCoins < a.cost) {
      toast.error("not enough coins yet", {
        description: `water your plants to earn ${a.cost} coins for the ${a.name}.`,
      });
      return;
    }
    setBearAccessory(a.id);
    toast.success(`${bearName} looks adorable in the ${a.name}! ${a.emoji}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <Portal>
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/30 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="w-full max-w-md rounded-t-3xl bg-gradient-to-b from-white to-rose-50 p-5 shadow-glow-rose sm:rounded-3xl"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />

              {/* header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-gradient-rose">
                    {bearName}'s closet
                  </h3>
                  <p className="text-xs text-rose-400">dress your little one up</p>
                </div>
                <div className="flex items-center gap-2">
                  <Pill>🪙 {gardenCoins}</Pill>
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-500"
                    aria-label="close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* bear preview */}
              <div className="relative mb-4 flex flex-col items-center rounded-3xl bg-gradient-to-br from-rose-100/60 to-pink-200/40 py-5">
                <motion.div
                  key={accessory}
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Bear size={130} mood="excited" interactive={false} />
                </motion.div>
                <p className="mt-2 font-hand text-lg text-rose-500">
                  {ACCESSORIES.find((a) => a.id === accessory)?.emoji}{" "}
                  {ACCESSORIES.find((a) => a.id === accessory)?.name}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {ACCESSORIES.map((a) => {
                  const active = accessory === a.id;
                  const affordable = gardenCoins >= a.cost;
                  return (
                    <motion.button
                      key={a.id}
                      onClick={() => handlePick(a)}
                      whileTap={{ scale: 0.93 }}
                      whileHover={{ scale: 1.04 }}
                      className={cn(
                        "relative flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all",
                        active
                          ? "border-rose-400 bg-rose-100 shadow-glow-rose"
                          : affordable
                            ? "border-rose-100 bg-white hover:border-rose-200"
                            : "border-rose-100 bg-rose-50/50 opacity-70",
                      )}
                    >
                      {active && (
                        <motion.div
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                      <span className="text-2xl">{a.emoji}</span>
                      <span className="text-[10px] font-semibold text-rose-600">{a.name}</span>
                      {a.cost > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600">
                          🪙 {a.cost}
                        </span>
                      )}
                      {!affordable && a.cost > 0 && (
                        <Lock className="absolute right-1 top-1 h-3 w-3 text-rose-300" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <p className="mt-3 flex items-center justify-center gap-1 text-center text-[11px] text-rose-400">
                <Sparkles className="h-3 w-3" />
                premium accessories cost garden coins — keep tending your garden
              </p>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
