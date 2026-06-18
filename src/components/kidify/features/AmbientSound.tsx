"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { PinkCard, Pill } from "../ui/decor";
import { Volume2, VolumeX, Cloud, CloudRain, Wind, Waves } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SoundType = "rain" | "wind" | "waves" | "none";

const SOUNDS: {
  id: SoundType;
  label: string;
  icon: typeof Cloud;
  desc: string;
  color: string;
}[] = [
  { id: "rain", label: "rain", icon: CloudRain, desc: "soft, steady, forgiving", color: "text-sky-400" },
  { id: "wind", label: "wind", icon: Wind, desc: "a quiet hush through trees", color: "text-emerald-400" },
  { id: "waves", label: "waves", icon: Waves, desc: "in and out, like breathing", color: "text-cyan-400" },
];

export function AmbientSound() {
  const [active, setActive] = useState<SoundType>("none");
  const [volume, setVolume] = useState(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Create synthetic ambient sounds using Web Audio API (no audio files needed)
  const startSound = (type: SoundType) => {
    stopSound();
    if (type === "none") return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      toast.error("audio not supported on this browser");
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Create white noise buffer
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    gain.gain.value = volume;

    // Configure filter based on sound type
    if (type === "rain") {
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      filter.Q.value = 0.5;
    } else if (type === "wind") {
      filter.type = "lowpass";
      filter.frequency.value = 400;
      filter.Q.value = 1;
    } else if (type === "waves") {
      filter.type = "lowpass";
      filter.frequency.value = 600;
      filter.Q.value = 0.7;
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    noiseNodeRef.current = source;
    filterNodeRef.current = filter;
    gainNodeRef.current = gain;

    // gentle volume modulation for waves
    if (type === "waves") {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.15;
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
    }
  };

  const stopSound = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch {
        // already stopped
      }
      noiseNodeRef.current = null;
    }
  };

  const handleSelect = (type: SoundType) => {
    if (type === active) {
      setActive("none");
      stopSound();
      toast("sound off");
      return;
    }
    setActive(type);
    startSound(type);
    const sound = SOUNDS.find((s) => s.id === type);
    if (sound) {
      toast(`${sound.icon ? "🔊" : ""} ${sound.label} on`, {
        description: sound.desc,
      });
    }
  };

  // update volume live
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        volume,
        audioCtxRef.current.currentTime,
      );
    }
  }, [volume]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <PinkCard className="relative overflow-hidden">
      <div className="absolute -right-3 -top-3 text-6xl opacity-10">🎧</div>

      <div className="mb-3 flex items-center justify-between">
        <Pill>
          {active === "none" ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}{" "}
          ambient sound
        </Pill>
        {active !== "none" && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] font-semibold text-rose-400"
          >
            ● playing
          </motion.span>
        )}
      </div>

      <p className="mb-3 text-sm text-rose-500/80">
        a little background noise, for the loud moments.
      </p>

      {/* sound options */}
      <div className="grid grid-cols-3 gap-2">
        {SOUNDS.map((s) => {
          const isActive = active === s.id;
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all",
                isActive
                  ? "border-rose-400 bg-rose-50 shadow-glow-rose"
                  : "border-rose-100 bg-white/60 hover:bg-white/80",
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
              >
                <Icon className={cn("h-5 w-5", isActive ? s.color : "text-rose-300")} />
              </motion.div>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  isActive ? "text-rose-600" : "text-rose-400",
                )}
              >
                {s.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* volume slider */}
      <AnimatePresence>
        {active !== "none" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-rose-400">vol</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-rose-100 accent-rose-400"
                aria-label="volume"
              />
              <span className="w-8 text-right text-[10px] font-bold text-rose-400">
                {Math.round(volume * 100)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-center text-[10px] text-rose-400/70">
        tap a sound to start · tap again to stop
      </p>
    </PinkCard>
  );
}
