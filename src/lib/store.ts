import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";

export type Plant = {
  id: string;
  type: "sprout" | "tulip" | "rose" | "sunflower" | "cactus";
  name: string;
  growth: number; // 0 - 4
  lastWatered: number; // timestamp
  thirsty: boolean;
};

export type PeriodLog = {
  id: string;
  date: string; // YYYY-MM-DD
  note?: string;
};

export type GalleryFavorite = {
  id: string;
  ts: number;
};

export type BearMood = "happy" | "love" | "sleepy" | "excited" | "shy";

export type StickerTask =
  | "water" // drank a cup of water
  | "read" // read today's love note
  | "hug" // sent a hug
  | "pat" // patted the bear
  | "garden" // watered a plant
  | "reason"; // revealed a reason

type KidifyState = {
  // Onboarding
  bearName: string | null;
  onboardingComplete: boolean;
  unlocked: boolean;
  unlockAttempts: number;
  lockedUntil: number | null;

  // Bear
  bearMood: BearMood;
  bearPats: number;
  bearAccessory: "bow" | "flower" | "crown" | "scarf" | "glasses" | "halo";
  wardrobeUnlocked: boolean;

  // Hugs
  hugsSent: number;
  lastHugAt: number | null;

  // Anniversary / story
  anniversaryDate: string | null; // YYYY-MM-DD the two of you began

  // Water
  waterCups: number;
  waterDate: string; // YYYY-MM-DD the count belongs to
  waterGoal: number;

  // Period
  periodLogs: PeriodLog[];
  cycleLength: number;
  periodLength: number;

  // Garden
  plants: Plant[];
  gardenCoins: number;
  lastGardenVisit: number;

  // Daily messages
  readMessages: string[]; // dates read

  // Gallery favorites
  favorites: GalleryFavorite[];

  // Reasons I Love You
  revealedReasons: number[]; // indices of reasons she's flipped

  // Daily stickers — which tasks she's completed today
  stickerDate: string; // YYYY-MM-DD the stickers belong to
  stickersEarnedToday: StickerTask[]; // tasks completed today
  stickerCollection: { task: StickerTask; date: string }[]; // all-time collection

  // Admin
  adminUnlocked: boolean;
  adminTapCount: number;
  adminTapResetAt: number | null;

  // ---- actions ----
  setBearName: (name: string) => void;
  completeOnboarding: () => void;
  setUnlocked: (v: boolean) => void;
  registerWrongAttempt: () => { attempts: number; locked: boolean };
  resetUnlockAttempts: () => void;
  setLockedUntil: (ts: number | null) => void;

  setBearMood: (m: BearMood) => void;
  patBear: () => void;
  setBearAccessory: (a: KidifyState["bearAccessory"]) => void;

  addWater: (cups?: number) => void;
  resetWaterIfNewDay: () => void;

  addPeriodLog: (date: string, note?: string) => void;
  removePeriodLog: (id: string) => void;

  addPlant: (type: Plant["type"], name: string) => void;
  waterPlant: (id: string) => void;
  removePlant: (id: string) => void;
  earnCoins: (n: number) => void;

  markMessageRead: (date: string) => void;

  toggleFavorite: (id: string) => void;

  unlockAdmin: () => void;
  registerAdminTap: () => boolean;

  unlockWardrobe: () => void;
  sendHug: () => void;
  setAnniversary: (date: string) => void;
  refreshThirsty: () => void;

  revealReason: (i: number) => void;

  earnSticker: (task: StickerTask) => void;
  resetStickersIfNewDay: () => void;

  resetAll: () => void;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const PLANT_TYPES: Plant["type"][] = ["sprout", "tulip", "rose", "sunflower", "cactus"];

export const useKidify = create<KidifyState>()(
  persist(
    (set, get) => ({
      bearName: null,
      onboardingComplete: false,
      unlocked: false,
      unlockAttempts: 0,
      lockedUntil: null,

      bearMood: "happy",
      bearPats: 0,
      bearAccessory: "bow",
      wardrobeUnlocked: false,
      hugsSent: 0,
      lastHugAt: null,
      anniversaryDate: null,

      waterCups: 0,
      waterDate: todayStr(),
      waterGoal: 8,

      periodLogs: [],
      cycleLength: 28,
      periodLength: 5,

      plants: [
        {
          id: "seed-1",
          type: "tulip",
          name: "Rosie",
          growth: 2,
          lastWatered: Date.now() - 1000 * 60 * 60 * 20,
          thirsty: true,
        },
      ],
      gardenCoins: 12,
      lastGardenVisit: Date.now(),

      readMessages: [],
      favorites: [],
      revealedReasons: [],
      stickerDate: todayStr(),
      stickersEarnedToday: [],
      stickerCollection: [],
      adminUnlocked: false,
      adminTapCount: 0,
      adminTapResetAt: null,

      setBearName: (name) => set({ bearName: name.trim() || "Bear" }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      setUnlocked: (v) => set({ unlocked: v }),

      registerWrongAttempt: () => {
        const attempts = get().unlockAttempts + 1;
        if (attempts >= 5) {
          set({
            unlockAttempts: 0,
            lockedUntil: Date.now() + 1000 * 60 * 5,
          });
          return { attempts: 5, locked: true };
        }
        set({ unlockAttempts: attempts });
        return { attempts, locked: false };
      },

      resetUnlockAttempts: () => set({ unlockAttempts: 0, lockedUntil: null }),

      setLockedUntil: (ts) => set({ lockedUntil: ts }),

      setBearMood: (m) => set({ bearMood: m }),

      patBear: () => {
        set((s) => ({
          bearPats: s.bearPats + 1,
          bearMood: "love",
          gardenCoins: s.gardenCoins + 1,
        }));
        setTimeout(() => set({ bearMood: "happy" }), 1400);
      },

      setBearAccessory: (a) => set({ bearAccessory: a }),

      addWater: (cups = 1) =>
        set((s) => {
          const today = todayStr();
          if (s.waterDate !== today) {
            return { waterDate: today, waterCups: Math.min(cups, s.waterGoal) };
          }
          return {
            waterCups: Math.min(s.waterCups + cups, s.waterGoal + 4),
            bearMood: "excited",
          };
        }),

      resetWaterIfNewDay: () =>
        set((s) => (s.waterDate !== todayStr() ? { waterDate: todayStr(), waterCups: 0 } : s)),

      addPeriodLog: (date, note) =>
        set((s) => {
          if (s.periodLogs.some((p) => p.date === date)) return s;
          return {
            periodLogs: [...s.periodLogs, { id: `p-${Date.now()}`, date, note }].sort((a, b) =>
              a.date < b.date ? 1 : -1,
            ),
          };
        }),

      removePeriodLog: (id) =>
        set((s) => ({ periodLogs: s.periodLogs.filter((p) => p.id !== id) })),

      addPlant: (type, name) =>
        set((s) => {
          if (s.gardenCoins < 5) return s;
          return {
            gardenCoins: s.gardenCoins - 5,
            plants: [
              ...s.plants,
              {
                id: `plant-${Date.now()}`,
                type,
                name: name || "Little one",
                growth: 0,
                lastWatered: 0,
                thirsty: true,
              },
            ],
          };
        }),

      waterPlant: (id) =>
        set((s) => ({
          plants: s.plants.map((p) =>
            p.id === id
              ? {
                  ...p,
                  lastWatered: Date.now(),
                  thirsty: false,
                  growth: Math.min(4, p.growth + 1),
                }
              : p,
          ),
          gardenCoins: s.gardenCoins + 2,
        })),

      removePlant: (id) => set((s) => ({ plants: s.plants.filter((p) => p.id !== id) })),

      earnCoins: (n) => set((s) => ({ gardenCoins: s.gardenCoins + n })),

      markMessageRead: (date) =>
        set((s) => (s.readMessages.includes(date) ? s : { readMessages: [...s.readMessages, date] })),

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.id === id)
            ? s.favorites.filter((f) => f.id !== id)
            : [...s.favorites, { id, ts: Date.now() }],
        })),

      unlockAdmin: () => set({ adminUnlocked: true }),

      registerAdminTap: () => {
        const now = Date.now();
        const { adminTapCount, adminTapResetAt } = get();
        if (adminTapResetAt && now - adminTapResetAt > 2000) {
          set({ adminTapCount: 1, adminTapResetAt: now });
          return false;
        }
        const next = adminTapCount + 1;
        if (next >= 7) {
          set({ adminTapCount: 0, adminTapResetAt: null });
          return true;
        }
        set({ adminTapCount: next, adminTapResetAt: now });
        return false;
      },

      unlockWardrobe: () => set({ wardrobeUnlocked: true }),

      sendHug: () =>
        set((s) => ({ hugsSent: s.hugsSent + 1, lastHugAt: Date.now(), bearMood: "love" })),

      setAnniversary: (date) => set({ anniversaryDate: date }),

      refreshThirsty: () =>
        set((s) => {
          const THIRST_MS = 1000 * 60 * 60 * 8; // 8 hours
          const now = Date.now();
          return {
            plants: s.plants.map((p) =>
              !p.thirsty && p.lastWatered && now - p.lastWatered > THIRST_MS
                ? { ...p, thirsty: true }
                : p,
            ),
          };
        }),

      revealReason: (i) =>
        set((s) =>
          s.revealedReasons.includes(i)
            ? s
            : { revealedReasons: [...s.revealedReasons, i] },
        ),

      earnSticker: (task) =>
        set((s) => {
          // reset if new day
          const today = todayStr();
          const earnedToday =
            s.stickerDate === today ? s.stickersEarnedToday : [];
          if (earnedToday.includes(task)) return s; // already earned today
          return {
            stickerDate: today,
            stickersEarnedToday: [...earnedToday, task],
            stickerCollection: [
              ...s.stickerCollection,
              { task, date: today },
            ],
          };
        }),

      resetStickersIfNewDay: () =>
        set((s) =>
          s.stickerDate !== todayStr()
            ? { stickerDate: todayStr(), stickersEarnedToday: [] }
            : s,
        ),

      resetAll: () =>
        set({
          bearName: null,
          onboardingComplete: false,
          unlocked: false,
          unlockAttempts: 0,
          lockedUntil: null,
          bearMood: "happy",
          bearPats: 0,
          bearAccessory: "bow",
          wardrobeUnlocked: false,
          hugsSent: 0,
          lastHugAt: null,
          anniversaryDate: null,
          waterCups: 0,
          waterDate: todayStr(),
          periodLogs: [],
          plants: [],
          gardenCoins: 12,
          readMessages: [],
          favorites: [],
          revealedReasons: [],
          stickerDate: todayStr(),
          stickersEarnedToday: [],
          stickerCollection: [],
          adminUnlocked: false,
          adminTapCount: 0,
          adminTapResetAt: null,
        }),
    }),
    {
      name: "kidify-store",
      version: 1,
      // admin access is session-only — never persisted, so a refresh always
      // re-locks the admin panel (more secure, avoids auto-opening)
      partialize: (s) => {
        const {
          adminUnlocked: _u,
          adminTapCount: _c,
          adminTapResetAt: _r,
          ...rest
        } = s;
        return rest;
      },
    },
  ),
);

export { PLANT_TYPES };

/**
 * Returns true once the persisted store has rehydrated from localStorage on the
 * client. Uses useSyncExternalStore so SSR and the first client render agree
 * (both false), avoiding hydration mismatches.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const unsubFinish = useKidify.persist.onFinishHydration(cb);
      return () => unsubFinish();
    },
    () => useKidify.persist.hasHydrated(),
    () => false,
  );
}
