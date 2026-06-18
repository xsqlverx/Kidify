"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAdmin } from "@/lib/admin-store";
import { useKidify } from "@/lib/store";
import { PinkButton, Pill } from "../ui/decor";
import { X, Mail, ImagePlus, Heart, Settings, Trash2, Plus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { THANK_YOU_CONTENT } from "@/lib/mock-data";

type Tab = "messages" | "gallery" | "thanks" | "settings";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("messages");
  const bearName = useKidify((s) => s.bearName);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-rose-950/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <div>
            <p className="font-display text-lg font-bold">admin — for him</p>
            <p className="text-[10px] text-white/50">
              shhh. {bearName ?? "the bear"} won't tell.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
          aria-label="close admin"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* tabs */}
      <div className="flex gap-1 border-b border-white/10 p-2">
        {([
          { id: "messages", label: "messages", icon: Mail },
          { id: "gallery", label: "gallery", icon: ImagePlus },
          { id: "thanks", label: "thank you", icon: Heart },
          { id: "settings", label: "settings", icon: Settings },
        ] as { id: Tab; label: string; icon: typeof Mail }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-xs font-semibold transition-all",
              tab === id ? "bg-white/15 text-white" : "text-white/40",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto pretty-scroll p-4 text-white">
        {tab === "messages" && <MessagesAdmin />}
        {tab === "gallery" && <GalleryAdmin />}
        {tab === "thanks" && <ThankYouAdmin />}
        {tab === "settings" && <SettingsAdmin />}
      </div>
    </motion.div>
  );
}

function MessagesAdmin() {
  const custom = useAdmin((s) => s.customMessages);
  const addMessage = useAdmin((s) => s.addMessage);
  const removeMessage = useAdmin((s) => s.removeMessage);

  const [date, setDate] = useState(todayStr());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [signature, setSignature] = useState("— always, me");
  const [sticker, setSticker] = useState("💗");

  const handleAdd = () => {
    if (!body.trim()) {
      toast.error("write something first");
      return;
    }
    addMessage({
      date,
      title: title.trim() || "a little note",
      body: body.trim(),
      signature: signature.trim() || "— me",
      sticker,
    });
    toast.success("posted 💗", { description: `she'll see it on ${date}` });
    setTitle("");
    setBody("");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4">
        <h3 className="mb-3 font-display text-base font-bold">new daily message</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 border-white/20 bg-white/10 text-white"
            />
            <Input
              value={sticker}
              onChange={(e) => setSticker(e.target.value.slice(0, 2))}
              className="w-16 border-white/20 bg-white/10 text-center text-lg text-white"
              aria-label="sticker"
            />
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="title (optional)"
            className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="your message… take your time. she'll read this."
            rows={5}
            className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
          />
          <Input
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="signature"
            className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
          />
          <PinkButton onClick={handleAdd} className="w-full" heart>
            <Plus className="mr-1 h-4 w-4" /> post message
          </PinkButton>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-white/70">
          queued ({custom.length})
        </h3>
        {custom.length === 0 ? (
          <p className="rounded-2xl bg-white/5 p-4 text-center text-sm text-white/40">
            nothing queued yet. write her something.
          </p>
        ) : (
          <div className="space-y-2">
            {custom.map((m) => (
              <div key={m.date} className="rounded-2xl bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-rose-300">
                      {m.date} {m.sticker}
                    </p>
                    <p className="text-sm font-semibold text-white">{m.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-white/60">{m.body}</p>
                  </div>
                  <button
                    onClick={() => {
                      removeMessage(m.date);
                      toast("removed");
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-rose-500/20 hover:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryAdmin() {
  const custom = useAdmin((s) => s.customGallery);
  const addGalleryImage = useAdmin((s) => s.addGalleryImage);
  const removeGalleryImage = useAdmin((s) => s.removeGalleryImage);

  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");

  const handleAdd = () => {
    if (!url.trim()) {
      toast.error("paste an image url");
      return;
    }
    addGalleryImage({
      id: `admin-${Date.now()}`,
      url: url.trim(),
      caption: caption.trim() || "a moment for us",
      date: todayStr(),
    });
    toast.success("added to gallery 📷");
    setUrl("");
    setCaption("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUrl(reader.result as string);
      toast("image ready — add a caption");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4">
        <h3 className="mb-1 font-display text-base font-bold">add to gallery</h3>
        <p className="mb-3 text-xs text-white/50">
          for the prototype, upload a local file or paste a URL. later this goes to Cloudinary.
        </p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/60 hover:bg-white/10">
            <ImagePlus className="h-4 w-4" />
            choose a photo
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {url && (
            <div className="overflow-hidden rounded-2xl">
              <img src={url} alt="preview" className="max-h-40 w-full object-cover" />
            </div>
          )}
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="…or paste image URL"
            className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
          />
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="caption (a little memory)"
            className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
          />
          <PinkButton onClick={handleAdd} className="w-full" heart>
            <Plus className="mr-1 h-4 w-4" /> add to gallery
          </PinkButton>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-bold text-white/70">uploaded ({custom.length})</h3>
        {custom.length === 0 ? (
          <p className="rounded-2xl bg-white/5 p-4 text-center text-sm text-white/40">
            nothing uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {custom.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl">
                <img src={img.url} alt={img.caption} className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    removeGalleryImage(img.id);
                    toast("removed");
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-rose-950/70 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThankYouAdmin() {
  const custom = useAdmin((s) => s.customThankYou);
  const setThankYou = useAdmin((s) => s.setThankYou);
  const resetThankYou = useAdmin((s) => s.resetThankYou);

  const [intro, setIntro] = useState(custom?.intro ?? THANK_YOU_CONTENT.intro);
  const [sections, setSections] = useState(
    custom?.sections ?? THANK_YOU_CONTENT.sections,
  );

  const handleSave = () => {
    setThankYou({ intro, sections });
    toast.success("thank you updated 🤍", {
      description: "she'll see this next time she opens it.",
    });
  };

  const handleReset = () => {
    resetThankYou();
    setIntro(THANK_YOU_CONTENT.intro);
    setSections(THANK_YOU_CONTENT.sections);
    toast("reset to default");
  };

  const updateSection = (i: number, key: "heading" | "body", val: string) => {
    setSections((s) => s.map((sec, idx) => (idx === i ? { ...sec, [key]: val } : sec)));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4">
        <h3 className="mb-3 font-display text-base font-bold">edit "thank you"</h3>
        <Textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="intro"
          rows={3}
          className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
        />
        <div className="mt-3 space-y-3">
          {sections.map((sec, i) => (
            <div key={i} className="rounded-2xl bg-white/5 p-3">
              <Input
                value={sec.heading}
                onChange={(e) => updateSection(i, "heading", e.target.value)}
                placeholder="heading"
                className="mb-2 border-white/20 bg-white/10 text-white placeholder:text-white/30"
              />
              <Textarea
                value={sec.body}
                onChange={(e) => updateSection(i, "body", e.target.value)}
                placeholder="body"
                rows={4}
                className="border-white/20 bg-white/10 text-white placeholder:text-white/30"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <PinkButton
            onClick={handleReset}
            className="flex-1 bg-white/10 from-white/10 to-white/10 text-white hover:from-white/20 hover:to-white/20"
          >
            reset
          </PinkButton>
          <PinkButton onClick={handleSave} className="flex-1" heart>
            save
          </PinkButton>
        </div>
      </div>
    </div>
  );
}

function SettingsAdmin() {
  const resetAll = useAdmin((s) => s.resetAll);
  const resetKidify = useKidify((s) => s.resetAll);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4">
        <h3 className="mb-2 font-display text-base font-bold">how admin access works</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li className="flex gap-2">
            <span>🧸</span>
            <span>tap the floating bear 7 times (within 2s each) to open this panel</span>
          </li>
          <li className="flex gap-2">
            <span>⚙️</span>
            <span>once unlocked, a gear appears for easy re-entry during the session</span>
          </li>
          <li className="flex gap-2">
            <span>🔐</span>
            <span>in production, protect this with the ADMIN_SECRET env var (server-side)</span>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
        <h3 className="mb-1 flex items-center gap-2 font-display text-base font-bold text-rose-300">
          <AlertTriangle className="h-4 w-4" /> danger zone
        </h3>
        <p className="mb-3 text-xs text-white/50">
          reset everything — bear name, onboarding, water, period logs, garden, admin content. this can't be undone.
        </p>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="w-full rounded-full bg-rose-500/20 py-2 text-sm font-semibold text-rose-300"
          >
            reset all data
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 rounded-full bg-white/10 py-2 text-sm font-semibold text-white"
            >
              cancel
            </button>
            <button
              onClick={() => {
                resetAll();
                resetKidify();
                toast("everything reset. reloading…");
                setTimeout(() => window.location.reload(), 800);
              }}
              className="flex-1 rounded-full bg-rose-500 py-2 text-sm font-bold text-white"
            >
              yes, reset all
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white/5 p-4 text-center">
        <Pill className="bg-rose-500/20 text-rose-300">prototype build</Pill>
        <p className="mt-2 text-xs text-white/40">
          backend (MongoDB + Cloudinary) not yet connected. all data lives in this browser.
          see backend-setup.md to go live.
        </p>
      </div>
    </div>
  );
}
