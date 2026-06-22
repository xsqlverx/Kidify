# Kidify — Backend Integration Guide for AI

> **READ THIS ENTIRE FILE BEFORE WRITING A SINGLE LINE OF CODE.**
> This is the only source of truth for how the backend connects to this app.
> Do not guess. Do not invent file paths. Do not rename anything.
> If something is unclear, **ask the human** (see Section 6).

---

## 0. Golden Rules (read first, always)

1. **Do NOT rename, move, or refactor existing frontend files.** The frontend is done and tested. Your job is to wire up the backend underneath it without breaking the UI.
2. **Do NOT change the Zustand store interface.** `src/lib/store.ts` has ~40 actions with exact signatures. You may add new actions, but never change existing ones.
3. **Do NOT touch `src/components/kidify/`** unless you're replacing a mock call with a real API call inside an admin component. The UI components are final.
4. **Do NOT use Prisma for this.** The project has Prisma + SQLite configured by default, but this app needs **MongoDB** (per the human's decision). Do not "fix" the Prisma schema — ignore it. Use the native MongoDB driver or Mongoose.
5. **Do NOT add authentication.** This is a single-user app. The unlock code gates the app; the admin panel uses a secret token in the Authorization header. No login system, no sessions, no JWT.
6. **Do NOT deploy anything.** The human deploys. You write code locally.
7. **If you're unsure whether something is mock data or real, check `src/lib/data-access.ts`.** That file is the single swap point.

---

## 1. What this app is (context)

Kidify is a deeply personal, mobile-first Next.js web app for the developer's long-distance girlfriend. VERY pink, cute, princess aesthetic. It's a private little world — no social features, no sharing, no multi-user.

**The app has two "users":**
- **Her** (the girlfriend) — uses the app, sees the content, logs her data
- **Him** (the developer) — posts content via a hidden admin panel (7 taps on the bear)

**No real auth.** The app is gated by a 4-digit numeric unlock code. The admin panel is gated by a secret token.

**Current state:** Frontend is 100% complete. All data is mock + localStorage. Your job is to replace the mock data with real API calls to MongoDB + Cloudinary.

---

## 2. The Stack (already decided — do not change)

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Already running |
| Database | MongoDB Atlas (free M0 tier) | Human's choice — NOT Prisma/SQLite |
| Image storage | Cloudinary | For gallery photos |
| Hosting | Vercel | Human will deploy |
| State | Zustand + localStorage | Already done — keep it |
| API | Next.js Route Handlers (`/app/api/`) | Already available |

**Do NOT suggest alternatives.** The human has chosen this stack.

---

## 3. The Roadmap (work in this exact order)

### Phase 1: Environment Setup
- [ ] Help the human set up MongoDB Atlas (Section 4)
- [ ] Help the human set up Cloudinary (Section 5)
- [ ] Create `.env.local` with all required variables
- [ ] Verify the env vars load with a test script

### Phase 2: Database Connection
- [ ] Install `mongodb` package: `bun add mongodb`
- [ ] Create `src/lib/mongodb.ts` — a single MongoDB client singleton
- [ ] Test the connection with a simple script

### Phase 3: API Routes (one at a time, test each)
- [ ] `POST /api/unlock/verify` — verify unlock code + log failsafe
- [ ] `GET /api/messages/[date]` — get daily message by date
- [ ] `GET /api/messages/range?from=X&to=Y` — get range for archive
- [ ] `POST /api/messages` — admin: post a message (protected)
- [ ] `DELETE /api/messages/[date]` — admin: delete a message (protected)
- [ ] `GET /api/gallery` — get all gallery images
- [ ] `POST /api/gallery` — admin: upload image to Cloudinary + save metadata (protected)
- [ ] `DELETE /api/gallery/[id]` — admin: delete image (protected)
- [ ] `GET /api/thankyou` — get Thank You content
- [ ] `PUT /api/thankyou` — admin: edit Thank You content (protected)

### Phase 4: Wire Frontend to Backend
- [ ] Replace mock calls in `src/lib/data-access.ts`
- [ ] Replace admin actions in `src/components/kidify/features/Admin.tsx`
- [ ] Replace unlock code check in `src/components/kidify/Onboarding.tsx`
- [ ] Test every flow end-to-end

### Phase 5: Failsafe Webhook (optional but recommended)
- [ ] `POST /api/unlock/failsafe` — fires Discord/Slack webhook on 5 wrong attempts

---

## 4. MongoDB Atlas Setup (Phase 1)

### Walk the human through:
1. Go to mongodb.com/atlas → sign up (free)
2. Create an **M0 (free)** cluster — pick the closest region
3. Create a database user: **username + password** (save these!)
4. Network access: **add `0.0.0.0/0`** (required for Vercel — explain this is safe for a personal app with no sensitive data, but the human should set a strong DB password)
5. Get the connection string: `mongodb+srv://USER:PASSWORD@cluster0.XXXXX.mongodb.net/?retryWrites=true&w=majority`

### Then add to `.env.local`:
```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.XXXXX.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=kidify
```

**Ask the human for:** the full connection string (they'll paste it after creating the cluster).

---

## 5. Cloudinary Setup (Phase 1)

### Walk the human through:
1. Go to cloudinary.com → sign up (free)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. (Optional) Create an upload preset called `kidify-gallery` with unsigned uploads

### Then add to `.env.local`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Ask the human for:** the Cloud Name, API Key, and API Secret.

---

## 6. Questions to Ask the Human (DO NOT GUESS THESE)

Before you start coding, ask the human these questions one at a time. Do not proceed until you have answers.

### Q1: "What is your 4-digit unlock code?"
> Currently hardcoded as `"2707"` in `src/components/kidify/Onboarding.tsx` line 15.
> This will move to `process.env.UNLOCK_CODE`. The human needs to confirm the code.
> **If they say "keep 2707"** → use `2707` in the env var.

### Q2: "What is your admin secret token?"
> This is a long random string that protects the admin API routes. The admin panel sends it in the `Authorization` header.
> Suggest: `openssl rand -hex 32` to generate one.
> It goes in `ADMIN_SECRET` env var.

### Q3: "Do you want a failsafe webhook (Discord/Slack) on 5 wrong unlock attempts?"
> Currently the failsafe just locks for 5 minutes client-side.
> If yes, ask for the webhook URL (Discord: Channel Settings → Integrations → Webhooks).
> It goes in `FAILSAFE_WEBHOOK_URL` env var (optional).

### Q4: "What's your MongoDB connection string?"
> After they set up Atlas (Section 4). They'll paste `mongodb+srv://...`

### Q5: "What's your Cloudinary cloud name, API key, and API secret?"
> After they set up Cloudinary (Section 5). Three separate values.

### Q6: "Should I keep the localStorage data as a fallback/offline cache?"
> Currently everything persists to localStorage. When the backend is live, decide:
> - **Option A:** Keep localStorage as a read cache (show cached data while API loads, sync on write)
> - **Option B:** Remove localStorage for backend-backed data, keep it only for truly local stuff (bear name, garden, pats)
> **Recommend Option B** — simpler, avoids sync bugs. But ask the human.

### Q7: "Is the anniversary date fixed, or should she set it herself?"
> Currently she sets it via `DaysCounter`. If the human wants it fixed, it goes in the DB or env var.

---

## 7. Exact Swap Points (where mock meets real)

These are the ONLY files you need to modify. **Do not touch anything else.**

### Swap Point 1: `src/lib/data-access.ts`
**This is the main file.** It currently returns mock data. Replace each function with a real API call.

#### Current (mock):
```typescript
export function useDailyMessage(dayOffset: number = 0): DailyMessage {
  const custom = useAdmin((s) => s.customMessages);
  const base = dayOffset === 0 ? getDailyMessage() : getMessageForOffset(dayOffset);
  const override = custom.find((m) => m.date === base.date);
  return override ?? base;
}
```

#### Target (real):
```typescript
// Use TanStack Query (already installed) to fetch from /api/messages/[date]
import { useQuery } from "@tanstack/react-query";

export function useDailyMessage(dayOffset: number = 0): DailyMessage {
  const date = /* compute date from offset */;
  const { data } = useQuery({
    queryKey: ["message", date],
    queryFn: () => fetch(`/api/messages/${date}`).then(r => r.json()),
  });
  return data ?? /* fallback to mock while loading */;
}
```

**IMPORTANT:** The function signatures MUST stay identical. The UI calls `useDailyMessage(0)`, `useDailyMessage(-1)`, etc. Don't break that.

#### Functions to replace:
| Function | Current source | Target |
|----------|---------------|--------|
| `useDailyMessage(dayOffset)` | mock + admin localStorage | `GET /api/messages/[date]` |
| `getMessagesForRange(from, to)` | mock | `GET /api/messages/range?from=X&to=Y` |
| `useGalleryImages()` | mock + admin localStorage | `GET /api/gallery` |
| `useThankYou()` | mock + admin localStorage | `GET /api/thankyou` |

**Keep the mock data as a fallback** while loading (so the UI doesn't flash empty). Use TanStack Query's `placeholderData` or return the mock if the API hasn't responded yet.

---

### Swap Point 2: `src/lib/admin-store.ts`
**This entire file can be deleted** once the backend is live. The admin data (customMessages, customGallery, customThankYou) moves to MongoDB.

But **do NOT delete it until the API routes are working.** Instead, replace each action with an API call:

| Action | Target API |
|--------|-----------|
| `addMessage(m)` | `POST /api/messages` |
| `removeMessage(date)` | `DELETE /api/messages/[date]` |
| `addGalleryImage(img)` | `POST /api/gallery` (with Cloudinary upload) |
| `removeGalleryImage(id)` | `DELETE /api/gallery/[id]` |
| `setThankYou(t)` | `PUT /api/thankyou` |
| `resetThankYou()` | `PUT /api/thankyou` (with default content) |

---

### Swap Point 3: `src/components/kidify/Onboarding.tsx`
Line 15: `const DEMO_UNLOCK_CODE = "2707";`

Replace the client-side check with a server call:
```typescript
// Current (line ~80):
if (code === DEMO_UNLOCK_CODE) { ... }

// Target:
const res = await fetch("/api/unlock/verify", {
  method: "POST",
  body: JSON.stringify({ code }),
});
const { success, locked } = await res.json();
if (success) { ... }
```

**The failsafe logic (5 attempts → 5 min lock) should move server-side too.** The current `registerWrongAttempt()` in the store can stay as a client-side counter, but the lock should be verified server-side to prevent tampering.

---

### Swap Point 4: `src/components/kidify/features/Admin.tsx`
The admin components (`MessagesAdmin`, `GalleryAdmin`, `ThankYouAdmin`) currently call `useAdmin` actions. Replace those with `fetch()` calls to the API routes.

**Every admin API call must include the admin secret:**
```typescript
fetch("/api/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
  },
  body: JSON.stringify(message),
});
```

Wait — `NEXT_PUBLIC_ADMIN_SECRET` would expose the secret to the client. **Don't do that.** Instead, the admin panel should prompt for the secret once (when unlocking via 7 taps), store it in sessionStorage (NOT localStorage — clears on tab close), and send it with every admin request. The server verifies it against `ADMIN_SECRET` env var.

**Ask the human:** "Should the admin secret be entered once per session (sessionStorage) or saved permanently (localStorage)?"

---

## 8. What STAYS in localStorage (do not move to backend)

These are local-only — they don't need a backend:

| Feature | Why local |
|---------|----------|
| Bear name, mood, accessory | Personalization, instant load |
| Bear pats count | Trivial, no sync needed |
| Garden plants + coins | Game state, local is fine |
| Water cups today | Resets daily, local is fine |
| Hugs sent | Counter, local is fine |
| Sticker collection | Daily task tracking, local |
| Mood diary + history | **Could go to backend** — ask human (Q6) |
| Memory jar | **Could go to backend** — ask human |
| Gratitude jar | **Could go to backend** — ask human |
| Wishes | **Could go to backend** — ask human |
| Story milestones | **Could go to backend** — ask human |
| Period logs | **Could go to backend** — ask human (recommended: yes, so she doesn't lose data on phone switch) |
| Breathing sessions | Counter, local is fine |
| Self-care checklist | Resets daily, local is fine |
| Affirmations saved | Local is fine |
| Favorites (gallery) | **Should go to backend** if gallery is backend |
| Read messages | Local is fine |

**Rule of thumb:** If it's something she'd be sad to lose on a phone switch, put it in the backend. If it's a daily counter that resets, keep it local.

---

## 9. MongoDB Collections (suggested schema)

```javascript
// Database: kidify

// Collection: messages
{
  date: "2024-12-25",        // YYYY-MM-DD (unique index)
  title: "merry christmas, my love",
  body: "the full message text...",
  signature: "— always, me",
  sticker: "🎄",             // emoji
  createdAt: ISODate,
}

// Collection: gallery
{
  _id: ObjectId,
  cloudinaryId: "kidify-gallery/abc123",  // for deletion
  url: "https://res.cloudinary.com/...",
  caption: "the day the sky matched your cheeks",
  date: "2024-08-12",        // YYYY-MM-DD
  createdAt: ISODate,
}

// Collection: thankyou
{
  _id: "singleton",          // always one document
  intro: "this page exists because...",
  sections: [
    { heading: "for the way you stay", body: "..." },
    // ...
  ],
  updatedAt: ISODate,
}

// Collection: periodLogs (optional — see Q6)
{
  date: "2024-12-01",        // YYYY-MM-DD
  note: "optional note",
  createdAt: ISODate,
}

// Collection: userData (optional — for memories, moods, etc.)
// Or separate collections per type. Ask the human.
```

**Do NOT create indexes until you've tested basic CRUD.** Add `date` unique index on `messages` later.

---

## 10. API Route Templates

Create these in `src/app/api/`. Use Next.js Route Handlers (App Router).

### Template: `src/app/api/messages/[date]/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  const db = await getDb();
  const message = await db.collection("messages").findOne({ date: params.date });
  if (!message) {
    // fall back to... what? Ask human. For now, return 404.
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(message);
}
```

### Template: Admin-protected route
```typescript
import { NextRequest, NextResponse } from "next/server";

function requireAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;
  // ... handle POST
}
```

---

## 11. MongoDB Connection File

Create `src/lib/mongodb.ts`:
```typescript
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "kidify";

if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev, use a global variable to preserve connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
```

**Do NOT use Prisma.** Ignore `src/lib/db.ts` and `prisma/schema.prisma`. They exist from the template but are NOT used by this app.

---

## 12. Cloudinary Upload (for gallery)

Install: `bun add cloudinary`

Create `src/lib/cloudinary.ts`:
```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

In the gallery upload route (`src/app/api/gallery/route.ts`), use `cloudinary.uploader.upload()` with the file buffer. Save the returned `secure_url` and `public_id` to MongoDB.

**Do NOT upload to Cloudinary from the client.** Always go through the API route so the secret stays server-side.

---

## 13. Anti-Hallucination Checklist

Before you write any code, verify these things. **If you can't verify, ask the human.**

- [ ] The file you're about to edit **actually exists** at that path. Use `ls` to check.
- [ ] The function you're about to modify **has the exact signature** you think it does. Read the file first.
- [ ] The env var you're about to use **is in `.env.local`**. If not, add it and tell the human.
- [ ] The package you're about to import **is installed**. Check `package.json`. If not, `bun add` it.
- [ ] The API route you're calling from the client **exists**. If not, create it first.

**Common hallucinations to avoid:**
- ❌ "I'll use `src/lib/db.ts`" → No. That's Prisma. Use a new `src/lib/mongodb.ts`.
- ❌ "I'll add a User model to the Prisma schema" → No. No Prisma. No users. Single-user app.
- ❌ "I'll use NextAuth for the admin panel" → No. Secret token in Authorization header.
- ❌ "I'll create a login page" → No. There's no login. The unlock code is the only gate.
- ❌ "I'll move the store to the database" → No. The Zustand store stays. Only swap the data-access functions.
- ❌ "I'll add a `src/app/api/auth/` route" → No. No auth routes.
- ❌ "I'll use `getServerSession`" → No. No NextAuth.
- ❌ "I'll refactor the components to use React Query everywhere" → No. Only wrap the data-access hooks in React Query. Don't touch components.
- ❌ "I'll rename `useDailyMessage` to `useMessage`" → NO. The name stays. Components depend on it.

---

## 14. Testing Checklist (after each phase)

After Phase 2 (DB connection):
- [ ] `bun run dev` starts without errors
- [ ] A test script can connect to MongoDB and insert + read a document

After Phase 3 (each API route):
- [ ] `curl localhost:3000/api/messages/2024-12-25` returns JSON
- [ ] Admin routes return 401 without the secret
- [ ] Admin routes return 200 with the correct secret

After Phase 4 (frontend wired):
- [ ] `bun run lint` passes
- [ ] Onboarding flow works (name → letter → unlock → app)
- [ ] Today's love note loads from the database
- [ ] Admin can post a message and it shows on the home tab
- [ ] Admin can upload a gallery image and it shows in the gallery
- [ ] Admin can edit Thank You content and it shows
- [ ] No console errors in the browser
- [ ] `bun run lint` still passes

**If any of these fail, fix before moving on. Do not proceed to the next phase with broken code.**

---

## 15. What NOT to do (common AI mistakes)

1. **Do NOT create a `src/app/api/health/route.ts`** unless the human asks. Unnecessary.
2. **Do NOT add CORS headers.** Same-origin only. Vercel handles this.
3. **Do NOT add rate limiting.** Single-user app. The failsafe handles unlock spam.
4. **Do NOT add input validation with Zod** unless the human asks. Keep it simple. Basic checks are fine.
5. **Do NOT create a separate `src/lib/types.ts`.** Types live in `src/lib/mock-data.ts` and `src/lib/store.ts`. Import from there.
6. **Do NOT change the Tailwind config or styling.** The app is styled. Don't touch it.
7. **Do NOT add a dark mode toggle.** The app is intentionally light/pink only.
8. **Do NOT add internationalization.** English only.
9. **Do NOT add analytics.** Private app.
10. **Do NOT add a service worker or PWA offline mode** unless the human asks. (It has a manifest already.)

---

## 16. Env Var Summary (final `.env.local`)

```bash
# MongoDB
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.XXXXX.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=kidify

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App secrets
UNLOCK_CODE=2707                    # the 4-digit code (ask human)
ADMIN_SECRET=                       # generate with: openssl rand -hex 32

# Optional
FAILSAFE_WEBHOOK_URL=               # Discord/Slack webhook (optional)
```

**Never commit `.env.local`.** It's in `.gitignore` already.

---

## 17. Quick Reference: File Map

```
src/
├── app/
│   ├── api/                        ← CREATE route handlers here
│   │   ├── unlock/verify/route.ts
│   │   ├── messages/[date]/route.ts
│   │   ├── messages/range/route.ts
│   │   ├── messages/route.ts       (POST = admin create)
│   │   ├── gallery/route.ts        (GET + POST)
│   │   ├── gallery/[id]/route.ts   (DELETE)
│   │   └── thankyou/route.ts       (GET + PUT)
│   ├── layout.tsx                  ← DO NOT TOUCH (fonts, metadata)
│   ├── page.tsx                    ← DO NOT TOUCH (entry point)
│   └── globals.css                 ← DO NOT TOUCH (styling)
├── lib/
│   ├── store.ts                    ← DO NOT TOUCH (Zustand store)
│   ├── admin-store.ts              ← REPLACE actions with API calls
│   ├── data-access.ts              ← MAIN SWAP POINT (replace mocks)
│   ├── mock-data.ts                ← KEEP as fallback
│   ├── mongodb.ts                  ← CREATE (DB connection)
│   ├── cloudinary.ts               ← CREATE (image upload)
│   ├── db.ts                       ← IGNORE (Prisma, not used)
│   └── utils.ts                    ← DO NOT TOUCH
├── components/
│   ├── kidify/
│   │   ├── features/
│   │   │   ├── Admin.tsx           ← SWAP admin actions to API calls
│   │   │   ├── Onboarding.tsx      ← SWAP unlock check to API call
│   │   │   └── (everything else)   ← DO NOT TOUCH
│   │   └── (ui components)         ← DO NOT TOUCH
│   └── ui/                         ← DO NOT TOUCH (shadcn)
└── app/
    └── page.tsx                    ← DO NOT TOUCH

prisma/                             ← IGNORE (not used)
public/                             ← DO NOT TOUCH (static assets)
```

---

## 18. Final note for the AI

This app is a love letter. It's not a SaaS. It's not a portfolio piece. It's a private gift. Treat it accordingly:

- **Keep it simple.** Don't over-engineer. Two collections and five API routes is enough.
- **Keep it private.** No analytics, no tracking, no public endpoints.
- **Keep it soft.** Error messages should be gentle, not technical. If MongoDB is down, the app should show "having a quiet moment, try again" not "MongoDB connection error ECONNREFUSED".
- **Ask, don't guess.** When in doubt, ask the human. They'd rather answer a question than debug a hallucination.

Go slow. Test each step. Ask questions. You've got this. 🤍
