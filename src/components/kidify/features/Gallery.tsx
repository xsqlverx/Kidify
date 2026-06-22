"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { PinkCard, Pill, SectionTitle } from "../ui/decor";
import { Portal } from "../ui/portal";
import { useGalleryImages } from "@/lib/data-access";
import type { GalleryImage } from "@/lib/mock-data";
import { useKidify } from "@/lib/store";
import { Heart, X, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const favorites = useKidify((s) => s.favorites);
  const toggleFavorite = useKidify((s) => s.toggleFavorite);
  const images = useGalleryImages();

  const isFav = (id: string) => favorites.some((f) => f.id === id);

  const navigate = (dir: number) => {
    if (active === null) return;
    const next = (active + dir + images.length) % images.length;
    setActive(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle subtitle="our little moments, kept just for us">
          us
        </SectionTitle>
        <Pill>
          <Lock className="h-3 w-3" /> private
        </Pill>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {images.map((img, i) => {
          const fav = isFav(img.id);
          const isFeatured = i === 0;
          return (
            <motion.div
              key={img.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-3xl shadow-soft",
                isFeatured && "col-span-2 aspect-[16/10]",
                !isFeatured && "aspect-[4/5]",
              )}
              onClick={() => setActive(i)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.96 }}
              role="button"
              tabIndex={0}
              aria-label={`open ${img.caption}`}
              onKeyDown={(e) => e.key === "Enter" && setActive(i)}
            >
              <img
                src={img.url}
                alt={img.caption}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-900/70 via-rose-900/10 to-transparent" />
              {isFeatured && (
                <div className="absolute left-3 top-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/80 px-2.5 py-1 text-[9px] font-bold uppercase text-white backdrop-blur">
                    ✨ featured
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <p className={cn(
                  "font-semibold text-white/90 line-clamp-2",
                  isFeatured ? "text-sm" : "text-[11px]",
                )}>{img.caption}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-wide text-white/60">
                  {new Date(img.date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(img.id);
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/30 backdrop-blur transition-all hover:bg-white/50"
                aria-label="favorite"
              >
                <Heart
                  className={cn(
                    "h-3.5 w-3.5 transition-all",
                    fav ? "fill-rose-500 text-rose-500 scale-110" : "text-white",
                  )}
                />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* favorites strip */}
      {favorites.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 font-display text-sm font-bold text-rose-500">
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> your favourites
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {images.filter((g) => isFav(g.id)).map((img) => (
              <button
                key={img.id}
                onClick={() => setActive(images.findIndex((g) => g.id === img.id))}
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl"
              >
                <img src={img.url} alt={img.caption} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* footer note */}
      <p className="pt-2 text-center text-xs text-rose-400/70">
        more moments coming soon — he's always adding to this. 📷
      </p>

      {/* fullscreen viewer */}
      <AnimatePresence>
        {active !== null && (
          <Portal>
          <FullscreenViewer
            image={images[active]}
            index={active}
            total={images.length}
            isFav={isFav(images[active].id)}
            onFav={() => toggleFavorite(images[active].id)}
            onClose={() => setActive(null)}
            onPrev={() => navigate(-1)}
            onNext={() => navigate(1)}
          />
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}

function FullscreenViewer({
  image,
  index,
  total,
  isFav,
  onFav,
  onClose,
  onPrev,
  onNext,
}: {
  image: GalleryImage;
  index: number;
  total: number;
  isFav: boolean;
  onFav: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col bg-rose-950/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
          aria-label="close"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-white/70">
          {index + 1} / {total}
        </span>
        <button
          onClick={onFav}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
          aria-label="favorite"
        >
          <Heart
            className={cn(
              "h-5 w-5",
              isFav ? "fill-rose-500 text-rose-500" : "text-white",
            )}
          />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <button
          onClick={onPrev}
          className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <motion.div
          key={image.id}
          className="relative max-h-full max-w-full"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <img
            src={image.url}
            alt={image.caption}
            className="max-h-[60vh] max-w-full rounded-2xl object-contain"
          />
        </motion.div>

        <button
          onClick={onNext}
          className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <motion.div
        className="p-6 text-center text-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <p className="font-hand text-2xl text-rose-100">{image.caption}</p>
        <p className="mt-1 text-xs text-white/50">
          {new Date(image.date).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </motion.div>
    </motion.div>
  );
}
