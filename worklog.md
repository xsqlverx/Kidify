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
5. **Garden persistence timing** — plants should re-become thirsty after ~12h (currently stay watered within a session).
6. **PWA / installability** — add manifest + service worker so it feels like a real app on her phone.
7. **More bear accessories & reactions** — the bear could react differently per tab (e.g. hold a watering can in the garden).
