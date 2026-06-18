"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { PinkCard, Pill, SectionTitle } from "../ui/decor";
import { useKidify, type SelfCareTask } from "@/lib/store";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CARE_TASKS: {
  id: SelfCareTask;
  emoji: string;
  label: string;
  hint: string;
}[] = [
  { id: "water", emoji: "💧", label: "water", hint: "even one sip counts" },
  { id: "sleep", emoji: "🛌", label: "rest", hint: "a nap, a lie-down, enough last night" },
  { id: "eat", emoji: "🍓", label: "eat", hint: "something. anything. please." },
  { id: "move", emoji: "🚶‍♀️", label: "move", hint: "a walk, a stretch, a little wiggle" },
  { id: "freshair", emoji: "🌬️", label: "fresh air", hint: "open a window. poke your nose out." },
  { id: "shower", emoji: "🚿", label: "shower", hint: "warm water fixes a surprising amount" },
  { id: "skincare", emoji: "🧴", label: "skincare", hint: "the little ritual you like" },
  { id: "medicine", emoji: "💊", label: "medicine", hint: "if you take any. we remember, so you don't have to." },
];

export function SelfCareChecklist() {
  const careDoneToday = useKidify((s) => s.careDoneToday);
  const toggleCareTask = useKidify((s) => s.toggleCareTask);
  const resetCareIfNewDay = useKidify((s) => s.resetCareIfNewDay);

  useEffect(() => {
    resetCareIfNewDay();
  }, [resetCareIfNewDay]);

  const doneCount = careDoneToday.length;
  const total = CARE_TASKS.length;
  const pct = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const handleToggle = (task: (typeof CARE_TASKS)[number]) => {
    const wasDone = careDoneToday.includes(task.id);
    toggleCareTask(task.id);
    if (!wasDone && doneCount + 1 === total) {
      toast.success("every single one. 🤍", {
        description: "you took care of you today. that's the whole point.",
      });
    } else if (!wasDone) {
      toast(`${task.emoji} ${task.label} done`, {
        description: task.hint,
      });
    }
  };

  return (
    <PinkCard className="relative overflow-hidden">
      <div className="absolute -right-3 -top-3 text-6xl opacity-10">🌿</div>

      <div className="mb-3 flex items-center justify-between">
        <Pill>
          <Sparkles className="h-3 w-3" /> daily care
        </Pill>
        <span className="text-xs font-bold text-rose-400">
          {doneCount}/{total}
        </span>
      </div>

      <SectionTitle subtitle="tiny things, big difference. no pressure.">
        did you…
      </SectionTitle>

      {/* progress bar */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-rose-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-rose-300 to-pink-400"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-[10px] font-bold text-rose-400">{pct}%</span>
      </div>

      {/* task grid */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {CARE_TASKS.map((task, i) => {
          const done = careDoneToday.includes(task.id);
          return (
            <motion.button
              key={task.id}
              onClick={() => handleToggle(task)}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border-2 p-2.5 text-left transition-all",
                done
                  ? "border-emerald-300 bg-emerald-50/80"
                  : "border-rose-100 bg-white/60 hover:bg-white/80",
              )}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <motion.div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-lg",
                  done ? "bg-emerald-100" : "bg-rose-50",
                )}
                animate={done ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {done ? <Check className="h-4 w-4 text-emerald-500" /> : task.emoji}
              </motion.div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-xs font-bold",
                    done ? "text-emerald-600" : "text-rose-500",
                  )}
                >
                  {task.label}
                </p>
                <p className="truncate text-[9px] text-rose-300">{task.hint}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* all-done celebration */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-4 flex flex-col items-center rounded-2xl bg-gradient-to-br from-emerald-50 to-rose-50 p-4 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-3xl"
            >
              🌿
            </motion.div>
            <p className="mt-1 font-hand text-lg text-emerald-600">
              you took care of you today.
            </p>
            <p className="text-[10px] text-rose-400">
              that's the whole point. that's all i ever want.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </PinkCard>
  );
}
