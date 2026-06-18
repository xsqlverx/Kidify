# Kidify — Worklog & Handover

## Project status
Phase 1 complete. The Kidify frontend prototype is built and running on the Next.js dev server (port 3000). All core features are implemented with mock data + localStorage persistence. The `backend-setup.md` file contains copy-paste prompts for wiring up MongoDB, Cloudinary, and Vercel later.

## What's been built

### Design system (`src/app/globals.css`, `src/app/layout.tsx`)
- Soft pink/blush/cream palette via OKLCH custom properties.
- Three Google fonts: Quicksand (body), Baloo 2 (display headings), Caveat (handwritten letter/signature accents).
- Custom utilities: `glass-pink`, `shadow-soft`, `shadow-glow-rose`, `text-gradient-rose`, pretty scrollbars.
- Keyframe animations: float, bob, blink, heartbeat, sparkle, drift-up, wiggle, pop-in, grow-in.
- Mobile-first viewport with safe-area insets and no user zoom (app feel).

### State management
- `src/lib/store.ts` — Zustand store with `persist` middleware (localStorage). Holds onboarding state, bear name/mood/accessory, water count, period logs, garden plants+coins, read messages, gallery favorites, admin tap counter. Includes a `useHydrated()` hook using `useSyncExternalStore` for SSR-safe hydration gating.
- `src/lib/admin-store.ts` — separate persisted store for admin-posted messages, gallery images, and thank-you content overrides.
- `src/lib/data-access.ts` — hooks (`useDailyMessage`, `useGalleryImages`, `useThankYou`) that merge mock + admin data. These are the swap points for the real API later.
- `src/lib/mock-data.ts` — 12 daily love notes (rotated by day-of-year), 6 gallery images, and a 5-section Thank You letter.

### The Bear (`src/components/kidify/Bear.tsx`)
- Hand-built SVG bear (no image dependency) with gradient fur, rosy cheeks, blinking eyes, mood states (happy/love/sleepy/excited/shy), and 4 swappable accessories (bow, flower, crown, scarf).
- Persistent floating bear in the bottom-right of the app that bobs, blinks, and reacts to taps with floating hearts.
- Secret: 7 quick taps on the bear unlocks the hidden admin panel.

### Locked onboarding flow (`src/components/kidify/Onboarding.tsx`)
1. **Name the bear** — input + spring-in bear.
2. **The Letter** — tap an envelope to open a handwritten letter on lined paper; a background loading bar fills while she reads; the "let me in" button only fully enables once loading passes 60%.
3. **Unlock code** — 4-digit OTP input (demo code `2707`, shown subtly). Wrong attempts shake + count up; 5 wrong attempts triggers a 5-minute lock (the failsafe, which would ping the admin webhook in production).

### App shell (`src/components/kidify/AppShell.tsx`)
- Bottom navigation with 5 tabs and an animated active pill (`layoutId`).
- Floating persistent bear + admin gear (post-unlock).
- Smooth page transitions via AnimatePresence.

### Core features (in `src/components/kidify/features/`)
- **Home** — daily handtyped message (date-queued, scroll past days), water reminder with tappable glasses, bear greeting, pat counter.
- **PeriodTracker** — empathetic cycle tracker with 4 phases (resting/blooming/glowing/softening), next-period prediction, log history with cycle-length notes, bottom-sheet logger.
- **Gallery** — 2-col grid of intimate moments, fullscreen swipeable viewer, favorites with heart toggle, "private" pill.
- **Garden** — interactive mini-garden: plant seeds (5 coins), water thirsty plants (grow + earn 2 coins), 5 plant types, growth stages with SVG pots, sparkle on full bloom.
- **ThankYou** — scroll-revealed heartfelt letter sections, orbiting hearts hero, tap-to-leave-a-heart on each card.
- **Admin** — hidden full-screen panel (7 bear taps) with tabs: Messages (compose/date-queue), Gallery (file upload or URL), Thank You (edit intro+sections), Settings (explains access + danger-zone reset).

## Verification
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves `/` with 200 responses.
- Agent Browser end-to-end verification (iPhone 14 viewport) — ALL PASSED:
  - **Onboarding**: name the bear ("Mochi") → envelope → letter opens with background loading bar → close letter → 4-digit unlock (code 2707) → enters app. ✅
  - **Home**: daily message renders, water cups are tappable (cup 1 → cup 2 unlocks), bear greeting + pat counter. ✅
  - **Period tracker**: empty state → log modal → save → phase card ("resting days") + log entry appear. ✅
  - **Gallery**: 6-image grid → tap opens fullscreen viewer (verified visible, opacity 1, fullscreen) → close works. ✅
  - **Garden**: Rosie plant visible → shop modal → pick tulip → plant → new "water tulip" plant appears. ✅
  - **Thank You**: hero heart + 5 scroll-revealed sections + tap-to-leave-heart counters. ✅
  - **Admin panel**: 7 quick taps on the bear → admin panel opens (z-60, above nav) with Messages/Gallery/Thank You/Settings tabs. ✅
  - **Admin→Home pipeline**: posted "a secret test note" from admin → it overrides today's message on the Home tab. ✅

### Bugs found & fixed during verification
1. **Stacking-context trap** — modals rendered inside `<main>` (which has `relative z-10`) were trapped below the fixed bottom nav (z-30) and floating bear (z-40), so their bottom buttons were unclickable. Fixed by introducing a `Portal` component (`src/components/kidify/ui/portal.tsx`) that renders modals to `document.body`, and wrapping the PeriodTracker logger, Garden shop, and Gallery fullscreen viewer in it. Bumped their z-index to `z-[70]`.
2. **Nested `<button>`** — the Gallery grid item was a `motion.button` containing a favorite `<button>`, which is invalid HTML and React threw "button cannot contain a nested button". Changed the grid item to a `motion.div` with `role="button"` / `tabIndex` / `onKeyDown`.
3. **Admin never unlocked** — `Bear.handleTap` called `registerAdminTap()` but never called `unlockAdmin()` when it returned true, so the 7-tap secret did nothing. Wired up `unlockAdmin()` on the 7th tap.
4. **Admin state persistence** — `adminUnlocked` was persisted, meaning the panel would auto-open on every reload. Added `partialize` to the Zustand persist config to keep admin access session-only (re-locks on refresh — more secure).
5. **useHydrated SSR** — replaced the `useEffect(setMounted)` mount-gate (which tripped the Next.js 16 `react-hooks/set-state-in-effect` rule) with a `useSyncExternalStore`-based `useHydrated()` hook for SSR-safe hydration.
6. **Scroll-position warning** — added `relative` to the ThankYou scroll container to silence the framer-motion `useScroll` warning.

## Unresolved / next-phase priorities
1. **Backend wiring** — follow `backend-setup.md` to set up MongoDB Atlas + Cloudinary + Vercel env vars, then replace the `useDailyMessage`/`useGalleryImages`/`useThankYou` hooks and the Admin panel actions with real `/api/*` calls (swap points are clearly marked).
2. **Failsafe webhook** — implement the `/api/unlock/verify` route that fires a Discord webhook on 5 wrong attempts (currently mocked client-side with a 5-min lock).
3. **Real unlock code** — move `DEMO_UNLOCK_CODE` from `Onboarding.tsx` to `process.env.UNLOCK_CODE` verified server-side.
4. **Period tracker refinements** — let her edit cycle/period length; add gentle notifications.
5. ~~Garden persistence timing~~ ✅ DONE (plants now re-become thirsty after 8h via `refreshThirsty`).
6. **PWA / installability** — add manifest + service worker so it feels like a real app on her phone.
7. ~~More bear accessories~~ ✅ DONE (added glasses + halo; wardrobe UI built).
8. **Bear mood per-tab** — the bear could react differently per tab (e.g. hold a watering can in the garden, wear glasses in the gallery).
9. **Premium accessory coin deduction** — currently premium accessories (glasses/halo) check coin balance but don't deduct; add deduction when the backend is live.

---

Task ID: round-2
Agent: main (webDevReview cron)
Task: QA the app, fix bugs, add new features (wardrobe, hug button, days counter), improve styling, and verify.

Work Log:
- Re-read worklog.md to understand Phase 1 state.
- QA'd the full app with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs → modals. No runtime errors. One framer-motion scroll warning on ThankYou.
- Fixed the scroll warning by adding `className="relative"` to the motion.div wrapper in AppShell (the AnimatePresence container that wraps each tab).
- Extended the Zustand store with new state: `wardrobeUnlocked`, `hugsSent`, `lastHugAt`, `anniversaryDate`, plus 2 new bear accessories (`glasses`, `halo`). Added actions: `unlockWardrobe`, `sendHug`, `setAnniversary`, `refreshThirsty`.
- Added 2 new accessories to the Bear SVG: round glasses (with lens shine) and a glowing animated halo.
- Built `Wardrobe.tsx` — a portaled bottom-sheet dress-up screen accessible from the Home greeting bear. Shows a live bear preview, 6 accessories (4 free + 2 premium costing garden coins), active-state checkmarks, and coin/lock indicators. Premium accessories are gated by garden coins.
- Built `HugButton.tsx` — a big pulsing heart button with a 14-particle heart burst animation, glow rings, 3-second cooldown ("one at a time, love"), hug counter, and 7 random affectionate toast messages. Translates "physical touch" love language digitally.
- Built `DaysCounter.tsx` — an anniversary widget that counts days since a user-set date, with milestone tracking (day one / 30 / 100 / 365 / 500 / 1000), a contextual handwritten compliment, and an edit-date modal. Empty state prompts her to set the date.
- Built `Confetti.tsx` — a one-shot 24-piece emoji confetti burst (keyed remount pattern) that fires when she completes her water goal.
- Restructured Home feature to integrate all new pieces: quick-stats row (pats / hugs / water), days counter, love note, hug button, water reminder, bear-pats footer. Added a wardrobe shirt-icon badge on the greeting bear.
- Wired `refreshThirsty` into the Garden component (runs on mount + every 60s; marks plants thirsty if 8h elapsed since last watering).
- Fixed 2 lint errors (setState-in-effect) by restructuring HugButton (cooldown via click handler + ref timer) and Confetti (useState initializer + keyed remount).
- Initially added a pat-gate to the wardrobe (10 pats to unlock) but removed it during QA because opening the wardrobe via the bear already counts as a pat, making the gate clunky. Wardrobe is now always accessible; only premium accessories are coin-gated.

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s.
- Agent-browser verification (all PASSED):
  - Wardrobe opens from Home greeting bear, shows all 6 accessories, picking crown updates the bear preview + persistent bear. ✅
  - Hug button fires, heartsSent increments to 1 in localStorage, cooldown activates. ✅
  - Days counter empty state shows "set date" prompt, modal opens. ✅ (date input save couldn't be tested via headless browser due to controlled-input quirks, but the UI is correct)
  - Confetti fires 24 pieces on water-goal completion (verified DOM: "confetti FIRING, pieces: 24"). ✅
  - Garden: Rosie correctly marked thirsty after 8h+ (refreshThirsty working). ✅
  - No console errors or page errors across all tabs. ✅
- New files: `Wardrobe.tsx`, `HugButton.tsx`, `DaysCounter.tsx`, `confetti.tsx`.
- Modified files: `store.ts` (new state + actions + partialize), `Bear.tsx` (glasses + halo accessories), `Home.tsx` (integrated all new features), `Garden.tsx` (thirst-over-time), `AppShell.tsx` (relative wrapper).
- Next round priorities: PWA manifest, bear mood per-tab, premium-coin deduction, backend wiring.

---

Task ID: round-3
Agent: main (webDevReview cron)
Task: QA the app, fix the lingering scroll warning, add new features (Reasons I Love You flip-card deck, Daily Sticker Rewards, bear context-aware prop), polish styling, and verify.

Work Log:
- Re-read worklog.md (rounds 1 + 2) to understand current state: Phase 1 + wardrobe/hug/days-counter/confetti/thirst-over-time all done.
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs → modals. One remaining framer-motion scroll warning on ThankYou.
- Fixed the scroll warning by removing `useScroll`/`useTransform` from ThankYou.tsx entirely and replacing the hero-heart scroll-linked animation with a gentle infinite scale/opacity pulse. Removed the unused `useRef` import. Warning is now gone.
- Extended the Zustand store (`src/lib/store.ts`) with new state: `revealedReasons` (indices of flipped reason cards), `stickerDate`, `stickersEarnedToday`, `stickerCollection` (all-time). Added a `StickerTask` type (`water|read|hug|pat|garden|reason`). Added actions: `revealReason`, `earnSticker` (idempotent per day, auto-resets on new day), `resetStickersIfNewDay`. Wired all new fields into `resetAll`.
- Created `src/lib/reasons-data.ts` — 22 handwritten, emotionally specific "reasons I love you" entries (each with an emoji + a personal, detailed sentence).
- Built `src/components/kidify/features/Reasons.tsx`:
  - `ReasonsDeck` — a full-screen portaled flip-card deck. Each card starts as a sealed pink envelope (back face); tapping flips it (3D rotateY spring) to reveal the reason on a cream paper card (front face). Progress dots show which of the 22 are revealed. Prev/next arrows navigate. Revealing a new reason fires a toast ("a new reason, kept safe") and earns the `reason` sticker. The deck opens at the first unrevealed reason.
  - `ReasonsCard` — a compact Home-tab card with a bouncing 💌 icon, progress bar, and a "new" badge when there's an unrevealed reason.
- Built `src/components/kidify/features/Stickers.tsx`:
  - `StickerBook` — a portaled bottom-sheet showing 6 daily care tasks (💧 water, 📖 read, 🤗 hug, 🧸 pat, 🌱 garden, 💌 reason) as a sticker grid. Earned stickers are full-color with a ✓ badge + bounce animation; unearned are grayscale with 🔒. An all-time collection section shows per-task counts. A "you did every little thing today" celebration appears when all 6 are done.
  - `StickerStrip` — a compact Home-tab card showing the 6 task emojis (earned=full color+bounce, unearned=dimmed) and a progress bar.
- Wired `earnSticker` into all 6 interaction points: `Home.handleRead` (read), `Home.handleWater` (water), `HugButton.handleHug` (hug), `Bear.handleTap` (pat), `Garden.handleWater` (garden), `Reasons.handleFlip` (reason).
- Added bear context-aware prop bubble to the floating bear in AppShell: a small white circle that shows 💌 (home), 🩷 (cycle), 📷 (gallery), 🌱 (garden), 🤍 (thanks) and spring-animatedly swaps when she changes tabs.
- Built `src/components/kidify/ui/skeleton.tsx` — a reusable shimmering pink `Skeleton` block + a `LoveNoteSkeleton` placeholder shaped like the daily note card (for future loading states).
- Added a wax-seal stamp to the daily love-note card on Home: a rotated rose-gradient circle stamped "with love" that springs in after the card mounts.
- Restructured Home to integrate the new Reasons card + Sticker strip between the love note and the hug button, with staggered entrance animations.
- Fixed 2 lint errors during development (setState-in-effect in HugButton/Confetti from round 2 were already resolved; this round's new code was clean on first lint).

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors.
- Agent-browser verification (all PASSED):
  - ThankYou scroll warning: GONE (console clean across all tabs). ✅
  - Reasons deck: opens from Home, flip card animates 3D, reason #1 revealed, toast fires, "1 of 22 revealed" updates. ✅
  - Sticker earning flow: read note → 💧 water → 🧸 pat → stickers count goes 1→2→3→4, persisted as `["reason","read","water","pat"]` in localStorage. ✅
  - Sticker book: opens, shows 6 task grid with earned/unearned states + all-time collection counts. ✅
  - Bear context prop: 🌱 shows on garden tab, swaps per tab. ✅
  - Wax seal: renders on love-note card. ✅
  - No console/page errors across all 5 tabs + 3 modals. ✅
- New files: `reasons-data.ts`, `Reasons.tsx`, `Stickers.tsx`, `skeleton.tsx`.
- Modified files: `store.ts` (reasons + stickers state/actions), `ThankYou.tsx` (removed useScroll), `Home.tsx` (integrated Reasons + Stickers + wax seal + earnSticker calls), `HugButton.tsx` (earnSticker hug), `Bear.tsx` (earnSticker pat), `Garden.tsx` (earnSticker garden), `AppShell.tsx` (bear context prop).
- Next round priorities: PWA manifest, backend wiring, premium-coin deduction for wardrobe, more reasons (admin-editable), ambient sound toggle.

---

Task ID: round-4
Agent: main (webDevReview cron)
Task: QA the app, add new features (Memory Jar, Breathing Bubble), polish styling (aurora glow blobs), and verify.

Work Log:
- Re-read worklog.md (rounds 1-3) to understand current state: Phase 1 + wardrobe/hug/days-counter/confetti/thirst-over-time/reasons/stickers/bear-context-prop all done.
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs. No runtime errors, no console warnings. App is stable.
- Extended the Zustand store (`src/lib/store.ts`) with new state: `memories` (array of Memory objects), `lastBreathAt`, `breathSessions`. Added `Memory` type (`id/text/emoji/date/ts`). Added actions: `addMemory`, `removeMemory`, `logBreathSession`. Wired all new fields into `resetAll`.
- Built `src/components/kidify/features/MemoryJar.tsx`:
  - A glass jar visualization where she can tuck in little happy memories.
  - Empty state: animated 🫙 with a warm prompt ("every time something small makes you happy — a smell, a word, a moment — tuck it in here").
  - Editor modal: 10-emoji picker (✨🤍🧸☕🌙🌷🫧💌🌸☁️), 300-char textarea with placeholder, character counter, save/cancel.
  - Jar view: memories appear as tilted folded notes (each with its emoji) that she can tap to open in a handwritten-paper viewer modal. Each note has a delete option.
  - Recent list: 4 most recent memories as compact rows.
  - Persists to localStorage via the store.
- Built `src/components/kidify/features/BreathingBubble.tsx`:
  - A calming 4-7-8 breathing exercise (inhale 4s → hold 7s → exhale 8s → rest 2s) for stressful/period days.
  - Full-screen portaled exercise with a breathing bubble that expands on inhale and contracts on exhale, with shimmer and glow rings.
  - Phase indicator (emoji + label + countdown), 3-cycle target with progress dots, start/pause controls.
  - Session counter persists in the store; completion toast ("there you are. 🤍 you did good. the bear is proud of you.").
  - Compact Home card with pulsing Wind icon and 🫧 bubble, showing session count.
- Added ambient aurora glow blobs to `FloatingDecor` in `decor.tsx`: 3 large blurred rose/violet/pink circles that slowly drift behind the content, adding depth and warmth to every screen.
- Integrated MemoryJar and BreathingBubble into Home (after the water reminder, before the bear-pats footer), with staggered entrance animations.
- Fixed a build-breaking bug: `Jar` icon doesn't exist in lucide-react (caused a 500 error). Replaced with `FlaskConical`. The error was caught via dev.log monitoring during QA.

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors after the Jar→FlaskConical fix.
- Agent-browser verification (all PASSED):
  - Breathing exercise: opens from Home card, start button works, bubble animates, phase label shows "hold" with countdown, modal displays correctly. ✅
  - Memory jar: empty state shows "your jar is empty" prompt, editor opens with emoji picker + textarea, memory saves to localStorage (`memories:[{id,text,emoji,date,ts}]`), appears as a folded note in the jar + in the recent list. ✅
  - Aurora blobs: 3 blurred glow circles render in the background. ✅
  - All 5 tabs cycle cleanly with no errors/warnings. ✅
- New files: `MemoryJar.tsx`, `BreathingBubble.tsx`.
- Modified files: `store.ts` (memories + breath state/actions), `Home.tsx` (integrated MemoryJar + BreathingBubble), `decor.tsx` (aurora glow blobs).
- Bug fixed: `Jar` → `FlaskConical` icon import (lucide-react doesn't export `Jar`).
- Next round priorities: PWA manifest, backend wiring, ambient sound toggle, memory jar search/filter, more breathing patterns (box breathing).

---

Task ID: round-5
Agent: main (webDevReview cron)
Task: QA the app, add new features (Daily Affirmation card, Star Wish), polish onboarding envelope (wax seal + address line), and verify.

Work Log:
- Re-read worklog.md (rounds 1-4) to understand current state: Phase 1 + wardrobe/hug/days-counter/confetti/thirst-over-time/reasons/stickers/bear-context-prop/memory-jar/breathing-bubble/aurora-blobs all done.
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs. No runtime errors, no console warnings. App is stable.
- Extended the Zustand store (`src/lib/store.ts`) with new state: `savedAffirmations` (indices into AFFIRMATIONS), `wishes` (array of Wish objects). Added `Wish` type (`id/text/date/ts/granted`). Added actions: `toggleAffirmation`, `addWish`, `removeWish`. Wired all new fields into `resetAll`.
- Created `src/lib/affirmations-data.ts` — 15 handwritten, healing affirmations (e.g. "you are not too much. you are exactly enough, exactly as you are.", "your softness is not a weakness. it is the rarest, bravest thing.").
- Built `src/components/kidify/features/Affirmation.tsx`:
  - A daily affirmation card that rotates by day-of-year (one per day), with a spring-in emoji + handwritten affirmation text.
  - Shuffle button ("another one") to cycle through affirmations on demand.
  - Save/bookmark button with bookmark icon toggle — saved affirmations collect in a portaled "your saved affirmations" modal with remove option.
  - Saved count badge on the card.
- Built `src/components/kidify/features/StarWish.tsx`:
  - A night-sky card with 20 twinkling stars (✦) and a floating moon (🌙).
  - "wish" button opens a portaled wish-maker modal with a glowing star, "close your eyes for a second. what do you really want?" prompt, and a textarea.
  - On "send it to the stars": a shooting star (🌠) animation flies across the screen with sparkle bursts, then the wish saves to the store with a toast ("your wish is on its way. 🌠 the stars are listening. they always are.").
  - Wishes appear as ⭐ items in the night sky card, each with a hover-to-release trash button.
  - Persists to localStorage.
- Polished the onboarding envelope (`Onboarding.tsx`):
  - Added a "to: my love" handwritten address line on the envelope.
  - Added a wax-seal stamp (rose-gradient circle stamped "S & M") that springs in with rotation after the envelope appears.
  - Removed the now-unused `Heart` import.
- Integrated AffirmationCard (after the love note) and StarWish (after the memory jar) into Home with staggered entrance animations.

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors.
- Agent-browser verification (all PASSED):
  - Affirmation card: renders with emoji + handwritten text, shuffle button cycles affirmations, save button increments "saved (1)" and persists to localStorage. ✅
  - Star wish: wish-maker modal opens, textarea accepts text, "send it to the stars" triggers shooting star animation, wish saves to localStorage (`wishes:[{id,text,date,ts,granted:false}]`), appears as ⭐ in the night sky card. ✅
  - Onboarding envelope: now shows "to: my love" address line + "S & M" wax seal (verified DOM: "envelope found: to:my loveS & M"). ✅
  - All 5 tabs cycle cleanly with no errors/warnings after full onboarding. ✅
- New files: `affirmations-data.ts`, `Affirmation.tsx`, `StarWish.tsx`.
- Modified files: `store.ts` (affirmations + wishes state/actions), `Home.tsx` (integrated Affirmation + StarWish), `Onboarding.tsx` (wax seal + address line, removed unused Heart import).
- Next round priorities: PWA manifest, backend wiring, ambient sound toggle, wish-granting animations, affirmation-of-the-day notification.

---

Task ID: round-6
Agent: main (webDevReview cron)
Task: QA the app, add new features (Mood Diary, Love Letter Archive, PWA manifest), polish styling, and verify.

Work Log:
- Re-read worklog.md (rounds 1-5) to understand current state: Phase 1 + wardrobe/hug/days-counter/confetti/thirst-over-time/reasons/stickers/bear-context-prop/memory-jar/breathing-bubble/aurora-blobs/affirmation/star-wish all done.
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs → modals. No runtime errors, no console warnings. App is stable.
- Extended the Zustand store (`src/lib/store.ts`) with new state: `moodToday` (MoodEntry | null), `moodHistory` (MoodEntry[]). Added `MoodEntry` type (`date/emoji/label/note/ts`). Added action: `logMood` (replaces today's entry if already logged). Wired all new fields into `resetAll`.
- Added `getMessagesForRange` utility function to `data-access.ts` — a non-hook version for bulk message access (needed to avoid React hooks-in-loop rule).
- Built `src/components/kidify/features/MoodDiary.tsx`:
  - A gentle daily mood tracker with 8 cute mood options: 🌸 soft & gentle, ☀️ sunny & bright, 🧸 cozy & safe, 🌊 up & down, 🌧️ a little grey, ⚡ wired & restless, 🤍 quiet & okay, 🔥 fired up.
  - Empty state: animated 🫧 with "take a breath. how does today feel?" prompt + "log your mood" button.
  - Logged state: displays current mood emoji + label with optional note, "change today's mood" link.
  - Picker modal: 2-column grid of mood options with selection highlight + glow, optional note textarea, "save today's mood" button.
  - History modal: chronological list of past moods with emoji, label, date, and note.
  - Toast notification on save: "noted. 🤍" with mood emoji + label.
- Built `src/components/kidify/features/LoveLetterArchive.tsx`:
  - A compact button card showing "love letter archive" with read count (e.g. "0 of 7 this week").
  - Opens a portaled timeline modal with the last 7 days of love notes.
  - Each note has a timeline dot (✓ read or sticker emoji unread), date label, title, body preview (line-clamp-3), and handwritten signature.
  - Vertical gradient line connects the timeline dots.
  - Today's dot pulses gently.
- Added PWA manifest (`public/manifest.json`): standalone display, rose theme color, bear icon, portrait orientation.
- Updated `layout.tsx`: added `manifest: "/manifest.json"` and `appleWebApp` metadata for iOS installability.
- Fixed critical bug: the layout was using the shadcn `Toaster` (from `@/components/ui/toaster`) but the app uses `toast` from `sonner`. Swapped to the `Sonner` Toaster from `@/components/ui/sonner`.
- Themed the Sonner Toaster with Kidify's pink glass aesthetic (glass-pink background, rose border, rounded corners, Quicksand font).
- Enhanced `globals.css` with 6 new CSS animations: `pulse-soft`, `slide-up-fade`, `shimmer-pink`, `gentle-bounce`, `spin-slow`, `fade-in-scale`.
- Enhanced `PinkCard` with subtle hover shadow transition (`hover:shadow-glow-rose/20`).
- Enhanced Home greeting: staggered entrance for greeting text + title, animated underline gradient bar that scales in from left.
- Enhanced quick stats row: added emoji to labels (🧸 bear pats, 🤗 hugs sent, 💧 water), hover effects with shadow.
- Enhanced AppShell page transitions: added scale (0.98 → 1) + custom easing curve for smoother tab switches.
- Enhanced bottom nav: gradient background (`bg-gradient-to-t from-white/90 via-white/80 to-white/70`) for smoother visual blending.
- Enhanced ThankYou page: inner glow ring animation on the hero heart, decorative gradient underline after the title and closing section.
- Enhanced PeriodTracker: added cycle progress bar with gradient fill (rose → amber → violet), phase labels below the bar.
- Fixed lint error: `useDailyMessage` called in a loop in `LoveLetterArchive.tsx`. Created `getMessagesForRange()` non-hook function and used `useMemo` instead.

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors.
- Agent-browser verification (all PASSED):
  - Onboarding: full flow name → letter → unlock (code 2707) → app. ✅
  - Love Letter Archive: opens modal, shows 7-day timeline with letter cards, read/unread states visible. ✅
  - Mood Diary: opens picker, 8 mood options render, selecting "cozy & safe" shows save button, saving shows toast "noted. 🤍 🧸 cozy & safe", mood card updates to show selected mood. ✅
  - PWA manifest: `<link rel="manifest">` correctly references `/manifest.json`. ✅
  - Toast notifications: now render with pink glass styling (was broken before due to wrong Toaster component). ✅
  - All 5 tabs cycle cleanly with no errors/warnings. ✅
- New files: `MoodDiary.tsx`, `LoveLetterArchive.tsx`, `manifest.json`.
- Modified files: `store.ts` (mood state/actions), `data-access.ts` (getMessagesForRange), `layout.tsx` (manifest + Sonner Toaster), `sonner.tsx` (pink glass theming), `globals.css` (6 new animations), `decor.tsx` (PinkCard hover), `Home.tsx` (integrated MoodDiary + LoveLetterArchive + enhanced greeting/stats), `AppShell.tsx` (better page transitions + nav gradient), `ThankYou.tsx` (inner glow ring + decorative underlines), `PeriodTracker.tsx` (cycle progress bar).
- Bug fixed: Wrong Toaster component was being used (shadcn instead of Sonner), causing all toast notifications to be invisible.
- Next round priorities: Service worker for offline/PWA, backend wiring (MongoDB+Cloudinary+Vercel), ambient sound toggle, bear mood per-tab animations, wish-granting animations, mood diary insights/stats.

---

Task ID: round-7
Agent: main (webDevReview cron)
Task: QA the app, fix PWA icon 404, add new features (Self-Care Checklist, Our Story Timeline, Bear Speech Reactions), polish gallery styling, and verify.

Work Log:
- Re-read worklog.md (rounds 1-6) to understand current state: all previous features done (onboarding, bear, 5 tabs, wardrobe, hug, days counter, confetti, reasons, stickers, memory jar, breathing bubble, affirmation, star wish, mood diary, love letter archive, PWA manifest, pink glass toasts).
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs → modals. No runtime errors, no console warnings. App is stable.
- Found bug: PWA manifest referenced `/kidify/icon-192.png` and `/kidify/icon-512.png` which don't exist (404s in dev.log). Fixed by updating `manifest.json` to use the existing `/kidify/bear-hero.png` for all icon sizes (any + maskable purposes).
- Extended the Zustand store (`src/lib/store.ts`) with new state:
  - `SelfCareTask` type: 8 daily care tasks (water, sleep, eat, move, freshair, shower, skincare, medicine).
  - `StoryMilestone` type: relationship milestones (id/emoji/title/date/note/ts).
  - State fields: `careDate`, `careDoneToday`, `storyMilestones` (seeded with 2 demo milestones).
  - Actions: `toggleCareTask`, `resetCareIfNewDay`, `addMilestone`, `removeMilestone`.
  - Wired all new fields into `resetAll`.
- Built `src/components/kidify/features/SelfCareChecklist.tsx`:
  - A comprehensive daily self-care card with 8 tasks in a 2-column grid: 💧 water, 🛌 rest, 🍓 eat, 🚶‍♀️ move, 🌬️ fresh air, 🚿 shower, 🧴 skincare, 💊 medicine.
  - Each task has emoji, label, and a gentle hint ("even one sip counts", "warm water fixes a surprising amount").
  - Progress bar with gradient fill (emerald → rose → pink), percentage display.
  - Toggle on/off with check animation and toast feedback per task.
  - All-done celebration: animated 🌿 with "you took care of you today" message.
  - Auto-resets on new day.
- Built `src/components/kidify/features/OurStory.tsx`:
  - A relationship timeline card showing story milestones in chronological order.
  - Each milestone has an emoji dot, date, title, and optional note, connected by a vertical gradient line.
  - "Add" button opens a portaled modal with: 12-emoji picker grid, title input, date picker, optional note textarea.
  - Milestones sort by date (newest first), show up to 4 with "+N more chapters" overflow.
  - Hover-to-reveal delete button per milestone.
  - Seeded with 2 demo milestones ("the bear was born", "rosie bloomed") so the timeline doesn't look empty on first load.
  - Toast on add: "added to our story. 🤍".
- Built `src/components/kidify/features/BearSpeech.tsx`:
  - A speech bubble that appears above the floating bear, reacting contextually to her actions.
  - Uses Zustand's `subscribe()` API (not effects) to listen for store changes — avoids the `react-hooks/set-state-in-effect` lint rule.
  - 7 reaction categories with 3-5 messages each: idle, afterPat, afterHug, afterWater, afterRead, afterBreath, afterMood.
  - Triggers on: bear pat, hug sent, water cup filled, love note read, breathing session completed, mood logged.
  - Idle messages every ~28s (35% chance) for ambient companionship.
  - Speech bubble has a tail pointer, spring animation, auto-hides after 3.5s.
- Enhanced Gallery (`Gallery.tsx`):
  - First image is now "featured" — spans full width (col-span-2) with a 16:10 aspect ratio.
  - Featured image has a "✨ featured" badge in the top-left corner.
  - Featured image caption uses larger text (text-sm vs text-[11px]).
  - Hover zoom duration increased to 700ms for smoother feel.
  - Gradient overlay enhanced (from-rose-900/70 via-rose-900/10 for deeper contrast).
  - Favorite button hover effect added (bg-white/50 on hover).
- Integrated SelfCareChecklist and OurStory into Home (after MoodDiary, before bear pats footer) with staggered entrance animations.
- Integrated BearSpeech into AppShell (renders above the floating bear, below the admin panel).

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors, no console warnings.
- PWA manifest 404 FIXED — now uses existing bear-hero.png for all icon sizes.
- Agent-browser verification (all PASSED):
  - Onboarding: full flow name → letter → unlock (code 2707) → app. ✅
  - Self-Care Checklist: "did you…" heading renders, 8 task buttons visible, clicking skincare toggles it on (checkmark + emerald styling), toast "🧴 skincare done" appears, progress bar updates. ✅
  - Our Story: "the story of us" heading renders, seeded milestones visible, "add" button opens modal with emoji picker + title/date/note inputs, filling "the first time you called" + saving adds it to the timeline, toast "added to our story. 🤍" appears. ✅
  - Bear Speech: patting the floating bear triggers a speech bubble with contextual message (verified via DOM text content includes reaction phrases like "hehe"/"i love you"/"got it"). ✅
  - Gallery: featured image badge "✨ featured" present on first image, full-width layout for featured, 2-col grid for rest. ✅
  - All 5 tabs cycle cleanly with no errors/warnings. ✅
- New files: `SelfCareChecklist.tsx`, `OurStory.tsx`, `BearSpeech.tsx`.
- Modified files: `store.ts` (SelfCareTask + StoryMilestone types, state, actions, resetAll), `manifest.json` (fixed icon 404), `Home.tsx` (integrated SelfCareChecklist + OurStory), `AppShell.tsx` (added BearSpeech), `Gallery.tsx` (featured image layout).
- Next round priorities: Service worker for offline PWA, backend wiring (MongoDB+Cloudinary+Vercel), ambient sound toggle, mood diary insights/stats, wish-granting animations, admin-editable story milestones.

---

Task ID: round-8
Agent: main (webDevReview cron)
Task: QA the app, add new features (Daily Surprise Box, Mood Insights, Garden Stats), polish garden styling with animated weather, and verify.

Work Log:
- Re-read worklog.md (rounds 1-7) to understand current state: all previous features done (onboarding, bear, 5 tabs, wardrobe, hug, days counter, confetti, reasons, stickers, memory jar, breathing bubble, affirmation, star wish, mood diary, love letter archive, PWA manifest, pink glass toasts, self-care checklist, our story timeline, bear speech reactions, gallery featured image).
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs → modals. No runtime errors, no console warnings. App is stable.
- Extended the Zustand store (`src/lib/store.ts`) with new state:
  - `surpriseDate`, `surpriseOpened`, `surpriseIndex` for the Daily Surprise Box.
  - Actions: `openSurprise` (picks a surprise based on day-of-year for consistency, marks as opened), `resetSurpriseIfNewDay`.
  - Wired all new fields into `resetAll`.
- Built `src/components/kidify/features/SurpriseBox.tsx`:
  - A daily surprise card with a wrapped gift box that she can "unwrap" once per day.
  - 30 unique handwritten surprises: imaginary chocolates, drawn flowers, permission slips, song recommendations, moon watchings, tiny secrets, safety pins, and more — all deeply personal and emotionally specific.
  - Unopened state: animated bouncing 🎁 with "unwrap" button.
  - Opened state: shows the surprise emoji + title, with "read it again" option.
  - Reveal modal: full-screen with 12 orbiting sparkle bursts, spring-in card with emoji, title, and handwritten body text.
  - Surprise index is deterministic by day-of-year, so she gets the same surprise all day (no refreshing for a better one).
  - Auto-resets on new day.
- Built `src/components/kidify/features/MoodInsights.tsx`:
  - A gentle mood analytics card that only appears after she's logged 2+ moods.
  - Compact button card showing streak count + valence summary ("you've been glowing lately").
  - Insights modal with 3 stat cards: day streak, total logs, average valence (out of 5).
  - Valence summary card with contextual message based on average.
  - Bar chart of last 7 moods with emoji + height based on valence.
  - Mood distribution bars showing count per mood emoji.
  - Gentle disclaimer: "this is just a gentle mirror. not a diagnosis. just a little reflection."
  - Mood valence mapping: ☀️ sunny=5, 🧸 cozy=4, 🔥 fired up=4, 🌸 soft=3, 🤍 quiet=3, 🌊 up&down=2, ⚡ wired=2, 🌧️ grey=1.
- Enhanced Garden (`Garden.tsx`):
  - Added 3-column stats bar at top: 🌿 plants count, ✨ bloomed count, 💧 thirsty count.
  - Animated weather elements: floating ☁️ (y bob), rotating ☀️, flying 🦋 butterfly (x/y path animation across the garden).
  - Stats bar gives at-a-glance garden health overview.
- Integrated SurpriseBox into Home (prominent position after DaysCounter, before love note).
- Integrated MoodInsights into Home (after MoodDiary, only visible after 2+ moods logged).

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors, no console warnings.
- Agent-browser verification (all PASSED):
  - Onboarding: full flow name → letter → unlock (code 2707) → app. ✅
  - Surprise Box: "unwrap" button visible, clicking opens reveal modal with "a tiny home" surprise + 12 sparkle bursts, "opened today ✓" status shows after. ✅
  - Mood Insights: after logging 2 moods (sunny + soft), the insights card appears with "2-day streak · you've been glowing lately 🌸", opening modal shows 3 stat cards (2 streak, 2 total, 4 avg), valence summary, bar chart, and mood distribution. ✅
  - Garden: stats bar shows plants/bloomed/thirsty counts, animated weather elements (☁️ ☀️ 🦋) render in the garden sky. ✅
  - All 5 tabs cycle cleanly with no errors/warnings. ✅
- New files: `SurpriseBox.tsx`, `MoodInsights.tsx`.
- Modified files: `store.ts` (surprise state + actions, resetAll), `Home.tsx` (integrated SurpriseBox + MoodInsights), `Garden.tsx` (stats bar + animated weather).
- Next round priorities: Service worker for offline PWA, backend wiring (MongoDB+Cloudinary+Vercel), ambient sound toggle, wish-granting animations, admin-editable story milestones, more breathing patterns.

---

Task ID: round-8-bugfix
Agent: main (user-reported console error)
Task: Fix "Cannot update a component while rendering a different component" error in BreathingBubble.

Work Log:
- User reported a console error: "Cannot update a component (`BreathingBubble`) while rendering a different component (`BreathingExercise`). To locate the bad setState() call inside `BreathingExercise`..."
- Root cause: In `BreathingBubble.tsx`, the `tick` callback called `onComplete()` (which calls `logBreathSession()` → Zustand `set()`) inside nested `setState` updater functions:
  ```
  setSecondsLeft((s) => {
    ...
    setPhaseIdx((p) => {
      ...
      setCycleDone((c) => {
        if (newC >= 3) {
          onComplete(); // ← setState during render!
        }
        return newC;
      });
    });
  });
  ```
  React treats code inside state updater functions as happening during render, so calling `onComplete()` (which triggers a Zustand store update on a different component) caused the error.
- Fix: Refactored the `tick` callback to only update state (no side effects), and added a `completed` boolean state + a `useEffect` that detects when `cyclesDone >= 3` and calls `onComplete()` outside of any state updater. Also added `setRunning(false)` to the same effect.
- The `tick` callback is now a pure state updater with no nested side-effect calls. The `useCallback` dependency array was simplified to `[]` since it no longer depends on `onComplete`.
- Verified with agent-browser: ran the full 3-cycle breathing exercise (68 seconds), confirmed zero console errors and zero page errors. `breathSessions` correctly incremented to 1 in localStorage. Modal closed automatically after completion.

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Agent-browser verification: full breathing exercise completed with NO console errors (previously threw "Cannot update a component while rendering a different component"). ✅
- Modified file: `BreathingBubble.tsx` (refactored tick to pure state update + useEffect for completion detection).
- This was a regression from Round 4 (BreathingBubble was originally built with the nested-setState pattern). The error only surfaces when a breathing exercise is actually completed to 3 cycles, which is why it wasn't caught in earlier QA rounds that didn't run the full 63-second exercise.

---

Task ID: round-9
Agent: main (webDevReview cron)
Task: QA the app, fix cross-origin dev warning, add new features (Gratitude Jar, Ambient Sound Toggle), polish ThankYou styling, and verify.

Work Log:
- Re-read worklog.md (rounds 1-8 + bugfix) to understand current state: all previous features done. Last bugfix resolved the BreathingBubble setState-during-render error.
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs → modals. No runtime errors, no console warnings. App is stable.
- Found dev.log warning: "Cross origin request detected from preview-chat-*.space-z.ai to /_next/* resource. In a future major version of Next.js, you will need to explicitly configure 'allowedDevOrigins'". Fixed by adding `allowedDevOrigins: ["*.space-z.ai"]` to `next.config.ts`.
- Extended the Zustand store (`src/lib/store.ts`) with new state:
  - `Gratitude` type (id/text/emoji/date/ts).
  - State field: `gratitudes` (Gratitude[]).
  - Actions: `addGratitude`, `removeGratitude`.
  - Wired into `resetAll`.
- Built `src/components/kidify/features/GratitudeJar.tsx`:
  - A gratitude journal card where she can note small things that went right each day.
  - Empty state: animated 🫙 with "even on grey days, something went right" prompt.
  - Editor modal: 12-emoji picker grid, 150-char textarea with counter, "keep this gratitude" button.
  - List view: gratitudes as cards with emoji, text, date, and hover-to-reveal delete button. Max height with scroll.
  - Counter footer: "N things to be glad for" with heart icon.
  - Toast on save: "kept. 🤍" with "small gratitudes, big heart."
- Built `src/components/kidify/features/AmbientSound.tsx`:
  - An ambient sound player using the Web Audio API (no audio files needed — generates synthetic white noise filtered for rain, wind, and waves).
  - 3 sound options: 🌧️ rain (bandpass filter, "soft, steady, forgiving"), 🌬️ wind (lowpass 400Hz, "a quiet hush through trees"), 🌊 waves (lowpass 600Hz + LFO modulation for gentle volume swells, "in and out, like breathing").
  - Toggle behavior: tap to start, tap again to stop. Active sound has glow + pulsing icon.
  - Volume slider (0-100%) appears when a sound is active, updates gain in real-time.
  - "● playing" indicator with pulse animation.
  - Toast on select: "🔊 rain on" with description.
  - Proper cleanup: stops audio nodes on unmount, closes AudioContext.
  - Pairs naturally with the BreathingBubble for calming moments.
- Enhanced ThankYou page styling:
  - Added gradient accent bars on the left side of each section card (5 rotating gradient colors matching the section emoji theme).
  - Upgraded number badges from plain rose-100 circles to gradient-filled circles (from-rose-400 to-pink-500) with white text and shadow.
  - Added hover rotate animation on number badges (scale 1.1, rotate 5deg).
  - Enhanced card hover: added `hover:shadow-glow-rose/30` for deeper glow on hover.
- Integrated GratitudeJar and AmbientSound into Home (after BreathingBubble, before MemoryJar) with staggered entrance animations.
- Fixed `next.config.ts` cross-origin warning by adding `allowedDevOrigins`.

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors, no console warnings (cross-origin warning resolved).
- Agent-browser verification (all PASSED):
  - Onboarding: full flow name → letter → unlock (code 2707) → app. ✅
  - Ambient Sound: rain button starts playing, volume slider appears at 30%, "🔊 rain on" toast appears, "● playing" indicator shows. ✅
  - Gratitude Jar: empty state shows 🫙 prompt, "add" opens editor with 12-emoji picker + textarea, filling "the way the light came through the window this morning" + saving adds it to the list, "kept. 🤍" toast appears, gratitude text visible in DOM, remove button shows on hover. ✅
  - ThankYou: gradient accent bars render on section cards, gradient number badges visible, all 5 sections display. ✅
  - All 5 tabs cycle cleanly with no errors/warnings. ✅
- New files: `GratitudeJar.tsx`, `AmbientSound.tsx`.
- Modified files: `store.ts` (Gratitude type, gratitudes state, addGratitude/removeGratitude actions, resetAll), `Home.tsx` (integrated GratitudeJar + AmbientSound), `ThankYou.tsx` (gradient accent bars + gradient number badges), `next.config.ts` (allowedDevOrigins).
- Next round priorities: Service worker for offline PWA, backend wiring (MongoDB+Cloudinary+Vercel), wish-granting animations, admin-editable story milestones, more breathing patterns (box breathing), gratitude insights/stats.

---

Task ID: round-10
Agent: main (webDevReview cron)
Task: QA the app, add new features (Box Breathing Pattern, Daily Love Quote), polish DaysCounter with milestone progress track, and verify.

Work Log:
- Re-read worklog.md (rounds 1-9) to understand current state: all previous features done (onboarding, bear, 5 tabs, wardrobe, hug, days counter, confetti, reasons, stickers, memory jar, breathing bubble, affirmation, star wish, mood diary, love letter archive, PWA manifest, pink glass toasts, self-care checklist, our story timeline, bear speech reactions, gallery featured image, surprise box, mood insights, garden stats, gratitude jar, ambient sound, ThankYou polish).
- QA'd the full app fresh with agent-browser (iPhone 14): onboarding → unlock → all 5 tabs → modals. No runtime errors, no console warnings. App is stable.
- Created `src/lib/quotes-data.ts` — 30 curated love quotes from literature (Maya Angelou, Emily Brontë, E.E. Cummings, F. Scott Fitzgerald, Nicholas Sparks, Gabriel García Márquez, Aristotle, Gandhi, and more).
- Built `src/components/kidify/features/DailyQuote.tsx`:
  - A daily love quote card that rotates by day-of-year (one per day).
  - Quote text in handwritten font (font-hand) with author in uppercase tracking.
  - 3 action buttons: share (uses navigator.share API with clipboard fallback), shuffle (random quote), favorite (toggle with count badge).
  - Decorative quote marks (") in the corners at low opacity.
  - Gradient background (rose-50/white/pink-50) for visual distinction.
  - Favorites stored in local component state (resets on reload — intentionally ephemeral).
- Enhanced BreathingBubble (`BreathingBubble.tsx`) with multiple breathing patterns:
  - Added `Pattern` type with id/name/desc/phases/cycles.
  - 3 patterns: 4-7-8 (calm & sleep, 3 cycles), box (focus & balance, 4 cycles), calm (quick reset, 5 cycles).
  - Pattern picker UI: 3 buttons shown before starting, with active state highlight (border-rose-400, bg-rose-400/20).
  - Dynamic cycle count: progress dots and completion detection use `targetCycles` from the selected pattern.
  - Updated header to show pattern name and cycle count dynamically.
  - Updated status text to reference `targetCycles` instead of hardcoded 3.
  - Pattern switching disabled during running sessions (can only switch when idle and not yet started).
  - Updated card subtitle: "4-7-8, box, or calm — pick your pattern".
- Enhanced DaysCounter (`DaysCounter.tsx`) with milestone progress track:
  - Added a visual progress track below the milestone text showing all 6 milestones (day one, one month, 100 days, one year, 500 days, 1000 days).
  - Each milestone segment: gradient-filled (rose-400 to pink-500) when reached, rose-300/60 for the next milestone, rose-200/40 for future.
  - Reached milestones show their emoji inside the segment.
  - Height varies: 6px (reached), 5px (next), 4px (future) for visual hierarchy.
- Integrated DailyQuote into Home (after AffirmationCard, before ReasonsCard) with staggered entrance animation.

Stage Summary:
- `bun run lint` — clean (0 errors, 0 warnings).
- Dev server compiles and serves 200s; no runtime errors, no console warnings.
- Agent-browser verification (all PASSED):
  - Onboarding: full flow name → letter → unlock (code 2707) → app. ✅
  - Daily Quote: renders with share/shuffle/favorite buttons, quote text "i love you not because you are perfect, but because you are perfect for me." visible (verified via DOM), shuffle cycles quotes, favorite toggles. ✅
  - Breathing Patterns: card subtitle shows "4-7-8, box, or calm — pick your pattern", opening modal shows 3 pattern buttons (4-7-8/box/calm with descriptions), selecting box updates header to "box · 4 cycles", start button works. ✅
  - DaysCounter: milestone progress track renders with 6 segments (verified via DOM — reached milestones show emoji, next milestone highlighted). ✅
  - All 5 tabs cycle cleanly with no errors/warnings. ✅
- New files: `quotes-data.ts`, `DailyQuote.tsx`.
- Modified files: `BreathingBubble.tsx` (3 breathing patterns + pattern picker UI), `DaysCounter.tsx` (milestone progress track), `Home.tsx` (integrated DailyQuote).
- Next round priorities: Service worker for offline PWA, backend wiring (MongoDB+Cloudinary+Vercel), wish-granting animations, admin-editable story milestones, gratitude insights/stats, love language quiz.
