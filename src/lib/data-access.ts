// Merges mock data with admin-posted content from localStorage.
// When the backend is live (see backend-setup.md section 8), replace these
// functions with real API calls.
import { useAdmin } from "./admin-store";
import {
  getDailyMessage,
  getMessageForOffset,
  GALLERY_IMAGES,
  THANK_YOU_CONTENT,
  type DailyMessage,
  type GalleryImage,
  type ThankYouContent,
} from "./mock-data";

/** Get today's message, preferring admin-posted ones for today's date. */
export function useDailyMessage(dayOffset: number = 0): DailyMessage {
  const custom = useAdmin((s) => s.customMessages);
  const base = dayOffset === 0 ? getDailyMessage() : getMessageForOffset(dayOffset);
  const override = custom.find((m) => m.date === base.date);
  return override ?? base;
}

/** All gallery images: admin-posted first, then defaults. */
export function useGalleryImages(): GalleryImage[] {
  const custom = useAdmin((s) => s.customGallery);
  return [...custom, ...GALLERY_IMAGES];
}

/** Thank you content: admin-edited or default. */
export function useThankYou(): ThankYouContent {
  const custom = useAdmin((s) => s.customThankYou);
  return custom ?? THANK_YOU_CONTENT;
}
