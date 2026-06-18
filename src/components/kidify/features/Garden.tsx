"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, PinkButton, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useKidify, PLANT_TYPES, type Plant } from "@/lib/store";
import { Droplets, Coins, Sprout, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLANT_INFO: Record<Plant["type"], { emoji: string; name: string; color: string }> = {
  sprout: { emoji: "🌱", name: "sprout", color: "text-emerald-500" },
  tulip: { emoji: "🌷", name: "tulip", color: "text-pink-500" },
  rose: { emoji: "🌹", name: "rose", color: "text-rose-500" },
  sunflower: { emoji: "🌻", name: "sunflower", color: "text-amber-500" },
  cactus: { emoji: "🌵", name: "cactus", color: "text-emerald-600" },
};

function PlantSVG({ type, growth, thirsty }: { type: Plant["type"]; growth: number; thirsty: boolean }) {
  const scale = 0.4 + growth * 0.18;
  return (
    <motion.div
      className="relative flex h-20 w-16 items-end justify-center"
      animate={thirsty ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* pot */}
      <div className="absolute bottom-0 h-7 w-14 rounded-b-xl rounded-t-md bg-gradient-to-b from-amber-400 to-amber-600 shadow-sm" />
      <div className="absolute bottom-6 h-2 w-16 rounded-t-md bg-amber-500" />
      {/* soil */}
      <div className="absolute bottom-7 h-1.5 w-14 rounded-full bg-amber-800/60" />
      {/* plant */}
      <motion.div
        className="absolute bottom-8"
        style={{ fontSize: 38 * scale }}
        animate={growth >= 4 ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        {growth === 0 ? "🌰" : PLANT_INFO[type].emoji}
      </motion.div>
      {thirsty && (
        <motion.div
          className="absolute -right-1 -top-1 text-xs"
          animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          💧
        </motion.div>
      )}
      {growth >= 4 && (
        <motion.div
          className="absolute -right-1 top-0 text-xs"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
}

export function Garden() {
  const plants = useKidify((s) => s.plants);
  const gardenCoins = useKidify((s) => s.gardenCoins);
  const addPlant = useKidify((s) => s.addPlant);
  const waterPlant = useKidify((s) => s.waterPlant);
  const removePlant = useKidify((s) => s.removePlant);

  const [showShop, setShowShop] = useState(false);
  const [newName, setNewName] = useState("");
  const [pickedType, setPickedType] = useState<Plant["type"]>("tulip");

  const handlePlant = () => {
    if (gardenCoins < 5) {
      toast.error("not enough coins", {
        description: "water your thirsty plants to earn more. 💧",
      });
      return;
    }
    addPlant(pickedType, newName.trim() || PLANT_INFO[pickedType].name);
    toast.success("planted! 🌱", {
      description: `${newName || PLANT_INFO[pickedType].name} says hi. water it to help it grow.`,
    });
    setNewName("");
    setShowShop(false);
  };

  const handleWater = (p: Plant) => {
    if (!p.thirsty) {
      toast("it's not thirsty right now 💗", { description: "come back in a bit." });
      return;
    }
    waterPlant(p.id);
    if (p.growth + 1 >= 4) {
      toast.success("fully grown! 🌸", {
        description: "+2 coins. you're a natural.",
      });
    } else {
      toast.success("+2 coins 💰", {
        description: `${p.name} grew a little.`,
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle subtitle="a tiny place to tend & breathe">
          our garden
        </SectionTitle>
        <Pill>
          <Coins className="h-3 w-3" /> {gardenCoins}
        </Pill>
      </div>

      {/* garden plot */}
      <PinkCard className="overflow-hidden">
        <div
          className="relative rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.92 0.08 130) 0%, oklch(0.85 0.1 130) 100%)",
          }}
        >
          {/* sky accents */}
          <div className="pointer-events-none absolute right-3 top-3 text-2xl">☁️</div>
          <div className="pointer-events-none absolute left-3 top-3 text-lg">☀️</div>

          {plants.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <motion.div
                className="text-5xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🌱
              </motion.div>
              <p className="mt-3 text-sm font-semibold text-emerald-700/80">
                your garden is empty.
              </p>
              <p className="text-xs text-emerald-600/60">plant something to begin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 pt-8">
              <AnimatePresence>
                {plants.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="group relative flex flex-col items-center rounded-2xl bg-white/40 p-2 backdrop-blur-sm"
                  >
                    <button
                      onClick={() => handleWater(p)}
                      className="relative"
                      aria-label={`water ${p.name}`}
                    >
                      <PlantSVG type={p.type} growth={p.growth} thirsty={p.thirsty} />
                    </button>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-800/80">{p.name}</p>
                    <div className="mt-0.5 flex gap-0.5">
                      {[0, 1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={cn(
                            "h-1 w-1.5 rounded-full",
                            s < p.growth ? "bg-emerald-500" : "bg-emerald-200",
                          )}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => removePlant(p.id)}
                      className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-rose-100/80 text-rose-400 group-hover:flex hover:text-rose-600"
                      aria-label={`remove ${p.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-rose-400/80">
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3" /> tap a thirsty plant to water it (+2 coins)
          </span>
          <span>{plants.length} plant{plants.length !== 1 ? "s" : ""}</span>
        </div>
      </PinkCard>

      <PinkButton onClick={() => setShowShop(true)} className="w-full" heart>
        <Sprout className="mr-1.5 h-4 w-4" /> plant something new (5 coins)
      </PinkButton>

      {/* how it works */}
      <PinkCard className="bg-rose-50/60">
        <h3 className="mb-2 font-display text-sm font-bold text-rose-600">how your garden grows</h3>
        <ul className="space-y-1.5 text-xs text-rose-500/80">
          <li className="flex gap-2"><span>🌱</span> plant a seed for 5 coins</li>
          <li className="flex gap-2"><span>💧</span> water thirsty plants — they grow & you earn 2 coins</li>
          <li className="flex gap-2"><span>✨</span> fully grown plants sparkle forever</li>
          <li className="flex gap-2"><span>🧸</span> pat the bear (bottom-right) for bonus coins</li>
        </ul>
      </PinkCard>

      {/* shop modal */}
      <AnimatePresence>
        {showShop && (
          <Portal>
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-rose-900/20 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShop(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-glow-rose sm:rounded-3xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-rose-200 sm:hidden" />
              <h3 className="font-display text-xl font-bold text-rose-600">pick a seedling</h3>
              <p className="mt-1 text-sm text-rose-400">
                costs 5 coins. you have {gardenCoins}. 🪙
              </p>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {PLANT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPickedType(t)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-all",
                      pickedType === t
                        ? "border-rose-400 bg-rose-50 scale-105"
                        : "border-rose-100 bg-white",
                    )}
                  >
                    <span className="text-2xl">{PLANT_INFO[t].emoji}</span>
                    <span className="text-[9px] font-semibold text-rose-500">{PLANT_INFO[t].name}</span>
                  </button>
                ))}
              </div>

              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="name your plant…"
                maxLength={16}
                className="mt-4 h-11 w-full rounded-2xl border-2 border-rose-200 bg-rose-50/50 px-4 text-rose-700 placeholder:text-rose-300 focus:border-rose-400 focus:outline-none"
              />

              <div className="mt-4 flex gap-2">
                <PinkButton
                  onClick={() => setShowShop(false)}
                  className="flex-1 bg-rose-100 from-rose-100 to-rose-100 text-rose-500 hover:from-rose-200 hover:to-rose-200"
                >
                  cancel
                </PinkButton>
                <PinkButton
                  onClick={handlePlant}
                  className="flex-1"
                  heart
                  disabled={gardenCoins < 5}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> plant
                </PinkButton>
              </div>
            </motion.div>
          </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}
