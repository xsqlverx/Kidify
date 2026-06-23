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

export type Memory = {
  id: string;
  text: string;
  emoji: string;
  date: string; // YYYY-MM-DD she wrote it
  ts: number;
};

export type Wish = {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  ts: number;
  granted: boolean; // always false for now; a gentle future hook
};

export type MoodEntry = {
  date: string; // YYYY-MM-DD
  emoji: string;
  label: string;
  note?: string;
  ts: number;
};

export type SelfCareTask =
  | "water"
  | "sleep"
  | "eat"
  | "move"
  | "freshair"
  | "skincare"
  | "medicine"
  | "shower";

export type StoryMilestone = {
  id: string;
  emoji: string;
  title: string;
  date: string; // YYYY-MM-DD
  note?: string;
  ts: number;
};

export type Gratitude = {
  id: string;
  text: string;
  emoji: string;
  date: string; // YYYY-MM-DD
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

  // Memory Jar
  memories: Memory[];

  // Affirmations — which ones she's saved
  savedAffirmations: number[]; // indices into AFFIRMATIONS

  // Wishes — stars she's wished upon
  wishes: Wish[];

  // Mood diary — how she's feeling today
  moodToday: MoodEntry | null;
  moodHistory: MoodEntry[];

  // Daily self-care checklist
  careDate: string; // YYYY-MM-DD the care tasks belong to
  careDoneToday: SelfCareTask[];

  // Our Story — relationship milestones
  storyMilestones: StoryMilestone[];

  // Gratitude Jar — things she's grateful for
  gratitudes: Gratitude[];

  // Daily surprise box — one little surprise per day
  surpriseDate: string; // YYYY-MM-DD the surprise belongs to
  surpriseOpened: boolean;
  surpriseIndex: number; // which surprise she got today

  // Breathing — last time she did a breathing exercise
  lastBreathAt: number | null;
  breathSessions: number;

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

  addMemory: (text: string, emoji: string) => void;
  removeMemory: (id: string) => void;

  toggleAffirmation: (i: number) => void;

  addWish: (text: string) => void;
  removeWish: (id: string) => void;

  logMood: (emoji: string, label: string, note?: string) => void;

  toggleCareTask: (task: SelfCareTask) => void;
  resetCareIfNewDay: () => void;

  addMilestone: (emoji: string, title: string, date: string, note?: string) => void;
  removeMilestone: (id: string) => void;

  addGratitude: (text: string, emoji: string) => void;
  removeGratitude: (id: string) => void;

  openSurprise: () => void;
  resetSurpriseIfNewDay: () => void;

  logBreathSession: () => void;

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
      memories: [],
      savedAffirmations: [],
      wishes: [],
      moodToday: null,
      moodHistory: [],
      careDate: todayStr(),
      careDoneToday: [],
      storyMilestones: [
        // a couple of seeded milestones so the timeline doesn't look empty
        {
          id: "seed-story-1",
          emoji: "🧸",
          title: "the bear was born",
          date: "2024-09-01",
          note: "you gave him a name before i even finished drawing him.",
          ts: Date.now() - 86400000 * 30,
        },
        {
          id: "seed-story-2",
          emoji: "🌷",
          title: "rosie bloomed",
          date: "2024-11-03",
          note: "we watered her together, on a call, in silence.",
          ts: Date.now() - 86400000 * 10,
        },
      ],
      gratitudes: [],
      surpriseDate: todayStr(),
      surpriseOpened: false,
      surpriseIndex: 0,
      lastBreathAt: null,
      breathSessions: 0,
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

      addMemory: (text, emoji) =>
        set((s) => ({
          memories: [
            {
              id: `mem-${Date.now()}`,
              text: text.trim(),
              emoji: emoji || "✨",
              date: todayStr(),
              ts: Date.now(),
            },
            ...s.memories,
          ],
        })),

      removeMemory: (id) =>
        set((s) => ({ memories: s.memories.filter((m) => m.id !== id) })),

      toggleAffirmation: (i) =>
        set((s) => ({
          savedAffirmations: s.savedAffirmations.includes(i)
            ? s.savedAffirmations.filter((x) => x !== i)
            : [...s.savedAffirmations, i],
        })),

      addWish: (text) =>
        set((s) => ({
          wishes: [
            {
              id: `wish-${Date.now()}`,
              text: text.trim(),
              date: todayStr(),
              ts: Date.now(),
              granted: false,
            },
            ...s.wishes,
          ],
        })),

      removeWish: (id) =>
        set((s) => ({ wishes: s.wishes.filter((w) => w.id !== id) })),

      logMood: (emoji, label, note) => {
        const today = todayStr();
        const entry: MoodEntry = { date: today, emoji, label, note, ts: Date.now() };
        set((s) => {
          // replace today's entry if already logged
          const history = s.moodHistory.filter((m) => m.date !== today);
          return {
            moodToday: entry,
            moodHistory: [entry, ...history],
          };
        });
      },

      toggleCareTask: (task) =>
        set((s) => {
          const today = todayStr();
          const done = s.careDate === today ? s.careDoneToday : [];
          return {
            careDate: today,
            careDoneToday: done.includes(task)
              ? done.filter((t) => t !== task)
              : [...done, task],
          };
        }),

      resetCareIfNewDay: () =>
        set((s) =>
          s.careDate !== todayStr()
            ? { careDate: todayStr(), careDoneToday: [] }
            : s,
        ),

      addMilestone: (emoji, title, date, note) =>
        set((s) => ({
          storyMilestones: [
            ...s.storyMilestones,
            {
              id: `story-${Date.now()}`,
              emoji: emoji || "✨",
              title: title.trim() || "a little moment",
              date,
              note: note?.trim() || undefined,
              ts: Date.now(),
            },
          ].sort((a, b) => (a.date < b.date ? 1 : -1)),
        })),

      removeMilestone: (id) =>
        set((s) => ({
          storyMilestones: s.storyMilestones.filter((m) => m.id !== id),
        })),

      addGratitude: (text, emoji) =>
        set((s) => ({
          gratitudes: [
            {
              id: `grat-${Date.now()}`,
              text: text.trim(),
              emoji: emoji || "🤍",
              date: todayStr(),
              ts: Date.now(),
            },
            ...s.gratitudes,
          ],
        })),

      removeGratitude: (id) =>
        set((s) => ({
          gratitudes: s.gratitudes.filter((g) => g.id !== id),
        })),

      openSurprise: () => {
        const today = todayStr();
        set((s) => {
          // if already opened today, do nothing
          if (s.surpriseDate === today && s.surpriseOpened) return s;
          // pick a surprise index based on day-of-year for consistency
          const dayOfYear = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
          );
          return {
            surpriseDate: today,
            surpriseOpened: true,
            surpriseIndex: dayOfYear % 30, // 30 unique surprises
          };
        });
      },

      resetSurpriseIfNewDay: () =>
        set((s) =>
          s.surpriseDate !== todayStr()
            ? { surpriseDate: todayStr(), surpriseOpened: false, surpriseIndex: 0 }
            : s,
        ),

      logBreathSession: () =>
        set((s) => ({ lastBreathAt: Date.now(), breathSessions: s.breathSessions + 1 })),

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
          memories: [],
          savedAffirmations: [],
          wishes: [],
          moodToday: null,
          moodHistory: [],
          careDate: todayStr(),
          careDoneToday: [],
          storyMilestones: [],
          gratitudes: [],
          surpriseDate: todayStr(),
          surpriseOpened: false,
          surpriseIndex: 0,
          lastBreathAt: null,
          breathSessions: 0,
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
          unlocked: _unlocked,
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
