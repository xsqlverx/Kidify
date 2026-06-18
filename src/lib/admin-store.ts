import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyMessage, GalleryImage, ThankYouContent } from "./mock-data";

type AdminState = {
  // custom daily messages keyed by date
  customMessages: DailyMessage[];
  // custom gallery images
  customGallery: GalleryImage[];
  // custom thank you content (null = use default)
  customThankYou: ThankYouContent | null;

  addMessage: (m: DailyMessage) => void;
  removeMessage: (date: string) => void;
  addGalleryImage: (img: GalleryImage) => void;
  removeGalleryImage: (id: string) => void;
  setThankYou: (t: ThankYouContent) => void;
  resetThankYou: () => void;
  resetAll: () => void;
};

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      customMessages: [],
      customGallery: [],
      customThankYou: null,

      addMessage: (m) =>
        set((s) => ({
          customMessages: [
            ...s.customMessages.filter((x) => x.date !== m.date),
            m,
          ].sort((a, b) => (a.date < b.date ? 1 : -1)),
        })),
      removeMessage: (date) =>
        set((s) => ({ customMessages: s.customMessages.filter((m) => m.date !== date) })),
      addGalleryImage: (img) =>
        set((s) => ({ customGallery: [img, ...s.customGallery] })),
      removeGalleryImage: (id) =>
        set((s) => ({ customGallery: s.customGallery.filter((g) => g.id !== id) })),
      setThankYou: (t) => set({ customThankYou: t }),
      resetThankYou: () => set({ customThankYou: null }),
      resetAll: () => set({ customMessages: [], customGallery: [], customThankYou: null }),
    }),
    { name: "kidify-admin" },
  ),
);
