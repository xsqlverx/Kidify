# 🐻 Kidify — Backend Setup Guide

This file contains **copy-paste-ready prompts** to feed into ChatGPT / Claude so you can stand up the
MongoDB + Cloudinary + Vercel backend for Kidify without thinking. Work through each section top to
bottom. Do NOT skip the environment variable step — the app will not boot without it.

> The frontend prototype currently runs on **mock data + localStorage**. Once the backend is live,
> you'll swap the mock calls for real API routes. The swap points are clearly marked in the code with
> `// TODO: REPLACE MOCK` comments.

---

## 0. What we are building (context for the AI)

Paste this at the very top of your ChatGPT / Claude session so it understands the project:

```
I am building "Kidify," a personal, mobile-first Next.js (App Router) web app for my long-distance
girlfriend. It is a private, deeply romantic space. The app has these data needs:

1. Daily handtyped messages — short love notes, one shown per day, queued by date. I (admin) write
   them in advance. She sees the one matching today's date (and can re-read past ones, never future).
2. Intimate gallery — private photos I upload through a hidden admin panel. Photos are stored in
   Cloudinary, metadata in MongoDB.
3. Period tracker — she logs her cycle start dates; we compute predictions. Stored per-user.
4. Water reminder — her daily water intake count. Stored per-user (can also be localStorage only).
5. Mini-garden — plants she waters/grows. Can be localStorage only, no backend needed.
6. Thank You section — static content I edit occasionally via admin.
7. Admin panel — a hidden route where I post new daily messages, upload gallery photos, and edit
   the Thank You content. Must be protected by an admin secret (a long random string in env).

Tech: Next.js (App Router) on Vercel, MongoDB (Atlas free tier), Cloudinary for image storage.
Single user app (just her). No real auth system needed — a numeric unlock code gates the app,
and the admin panel uses a secret token in the Authorization header.

Please help me set this up step by step. Ask me clarifying questions only if truly necessary;
otherwise give me the exact commands and code.
```

---

## 1. MongoDB Atlas Setup

```
Walk me through creating a free MongoDB Atlas cluster for a personal Next.js app.
I need:
- The exact clicks to create an M0 (free) cluster.
- How to create a database user (username + password) with read/write access.
- How to add a network access rule. IMPORTANT: I am deploying on Vercel, so I cannot whitelist
  fixed IPs. Tell me the correct way to allow access from Vercel (0.0.0.0/0 with explanation of
  the security trade-off, OR the Vercel IP ranges approach).
- How to get the connection string in the format:
  mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
- Recommend a database name (e.g. "kidify").

Give me the final connection string template and tell me exactly which part is the password I must
URL-encode if it contains special characters like @, :, /, etc. Provide a tiny Node one-liner to
URL-encode a password safely.
```

---

## 2. Cloudinary Setup

```
Walk me through setting up Cloudinary for a Next.js app that needs to store private intimate photos.
I need:
- The exact clicks to create a free Cloudinary account and find my Cloud name, API key, and API secret.
- Whether I should use unsigned uploads or signed uploads given that uploads only happen from the
  admin panel (server-side). Recommend signed/server-side uploads for security.
- How to create an "upload preset" if needed, or confirm I don't need one for server-side signed uploads.
- How to fetch image URLs with transformations (e.g. resize to width 800, auto format, quality auto).
- How to delete an image by public_id from the server.

Then give me:
1. A ready-to-use Node/Next.js server-side upload function using cloudinary npm package that takes a
   Buffer or base64 string and returns { public_id, secure_url, width, height }.
2. A ready-to-use delete function.
3. A helper to build an optimized <img src> URL with transformation params.

Show me the exact environment variables I need to set:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
```

---

## 3. Vercel Project + Environment Variables

```
I have a Next.js App Router app in a GitHub repo. Walk me through deploying it to Vercel and setting
environment variables. I need:
- The exact steps to import the repo into Vercel.
- Where to add environment variables in the Vercel dashboard (Settings > Environment Variables).
- The full list of env vars I need to add, with example values:

  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kidify?retryWrites=true&w=majority
  CLOUDINARY_CLOUD_NAME=your-cloud-name
  CLOUDINARY_API_KEY=123456789
  CLOUDINARY_API_SECRET=xxxxxxxxxxxx
  ADMIN_SECRET=a-long-random-string-at-least-32-chars   (for protecting the admin API)
  UNLOCK_CODE=2707   (the 4-digit code Shifa types to unlock the app)
  ADMIN_NOTIFY_WEBHOOK=<a Discord/Telegram/Slack webhook URL for the failsafe alert>

- Confirm which of these must be set for Production, Preview, AND Development environments.
- Tell me how to generate a secure random ADMIN_SECRET on macOS / Linux with a one-liner.
- Tell me how to create a Discord webhook URL (step by step) so the "5 wrong unlock attempts"
  failsafe can ping me.
```

---

## 4. MongoDB Schema Design (Mongoose)

```
Design a Mongoose schema for the Kidify app with these collections. The app is single-user
(it's just for my girlfriend) but design it so a single userId field can be added later if needed.

Collections:
1. DailyMessage
   - date: String (YYYY-MM-DD) — the day this message is "active", unique
   - title: String
   - body: String
   - signature: String (default "— always, me")
   - createdAt, updatedAt
2. GalleryImage
   - publicId: String (Cloudinary public_id), unique
   - url: String (Cloudinary secure_url)
   - caption: String (optional)
   - order: Number (for manual sorting)
   - createdAt
3. PeriodLog
   - startDate: Date (ISO) — the day a period started
   - note: String (optional, e.g. "cramps")
   - createdAt
4. ThankYouContent
   - a single document (singleton) with fields: intro, sections (array of {heading, body}), updatedAt
5. UnlockAttempt (for the failsafe log)
   - timestamp, attempts count, ip (optional), triggered: Boolean

Give me:
- The Mongoose model files (one file per model) with TypeScript interfaces.
- A recommended folder structure: src/lib/models/*.ts and src/lib/mongodb.ts (connection helper
  that caches the connection across hot reloads in dev and across serverless invocations in prod).
- The exact `npm install mongoose` command.
- A health-check API route at /api/health that returns { ok: true, db: "connected"|"error" } so I
  can verify the DB is reachable after deploying.
```

---

## 5. Next.js API Routes (Server-side)

```
Generate Next.js App Router route handlers (route.ts files) for the Kidify admin + read APIs.
All admin routes must check the Authorization header against process.env.ADMIN_SECRET and return
401 if missing/wrong. Use this header format: Authorization: Bearer <ADMIN_SECRET>.

Routes:
GET  /api/health                 -> { ok, db }
GET  /api/messages               -> today's message + recent past messages
GET  /api/messages/:date         -> a specific day's message
POST /api/admin/messages         -> create/update a daily message { date, title, body, signature }
GET  /api/gallery                -> list all gallery images sorted by order
POST /api/admin/gallery          -> upload image (multipart or base64) -> Cloudinary -> save metadata
DELETE /api/admin/gallery/:id    -> delete from Cloudinary + MongoDB
GET  /api/period                 -> all period logs for the user
POST /api/period                 -> log a new period start { date, note? }
DELETE /api/period/:id           -> delete a log
GET  /api/thankyou               -> the singleton ThankYouContent
PUT  /api/admin/thankyou         -> update ThankYouContent
POST /api/unlock/verify          -> { code } -> verify against UNLOCK_CODE env; track attempts;
                                     if 5 fails, fire ADMIN_NOTIFY_WEBHOOK and return locked

Give me each route as a separate code block with the file path as a comment at the top.
Use Next.js 16 App Router conventions (export async function GET/POST/etc, NextRequest/NextResponse).
Include the Cloudinary upload + delete helpers inline or imported from src/lib/cloudinary.ts.
Include the Mongoose connection helper imported from src/lib/mongodb.ts.
```

---

## 6. Failsafe Alert (the "5 wrong attempts" feature)

```
For the Kidify unlock failsafe: when Shifa enters the wrong unlock code 5 times in a row, I (admin)
must be notified immediately. Design this:

- Track consecutive failed attempts. A successful unlock resets the counter to 0.
- Use an in-memory + MongoDB hybrid: store a `UnlockAttempt` doc with the current count and a
  `triggered` flag so it survives serverless cold starts.
- On the 5th failure, POST to the ADMIN_NOTIFY_WEBHOOK (Discord webhook) a message like:
  "🚨 Kidify: 5 wrong unlock attempts just now. Someone may be trying to get in."
- After triggering, lock the app for 5 minutes (return a `lockedUntil` timestamp) so brute force
  is slowed down.

Give me the full /api/unlock/verify route handler implementing all of this, plus a small Discord
webhook sender helper. Tell me how to create the Discord webhook and what URL format to put in
ADMIN_NOTIFY_WEBHOOK.
```

---

## 7. Verifying Everything Works

```
Give me a checklist to verify the Kidify backend is fully wired up after deploying to Vercel:

1. Visit https://<my-app>.vercel.app/api/health -> should return {"ok":true,"db":"connected"}.
2. Use curl to POST a daily message via the admin route with the ADMIN_SECRET bearer token.
3. Use curl to GET /api/messages and confirm the message comes back.
4. Use curl to upload a test image to /api/admin/gallery and confirm a Cloudinary URL is returned.
5. Use curl to GET /api/gallery and confirm the image is listed.
6. Test the failsafe: POST /api/unlock/verify with a wrong code 5 times and confirm the Discord
   webhook fires.

Give me the exact curl commands with placeholders like $ADMIN_SECRET and $BASE_URL so I can run
them from my terminal. Also tell me how to read Vercel function logs (vercel logs / dashboard)
if something fails.
```

---

## 8. Connecting the Frontend (after backend is live)

Once the above is done, come back to this file and run this prompt:

```
My Kidify backend is live at <BASE_URL> with these endpoints: <paste the list from section 5>.
My frontend currently uses mock data and localStorage. Help me refactor these specific swap points
to call the real API instead:

- src/lib/mock-data.ts -> replace DailyMessage fetch with GET /api/messages
- src/components/kidify/features/Gallery.tsx -> replace local array with GET /api/gallery
- src/components/kidify/features/Admin.tsx -> wire POST /api/admin/messages, POST /api/admin/gallery,
  PUT /api/admin/thankyou using the ADMIN_SECRET stored in a password prompt (never committed)
- src/components/kidify/Onboarding.tsx unlock step -> call POST /api/unlock/verify

Give me a small typed API client (src/lib/api.ts) using fetch with a base URL from
NEXT_PUBLIC_API_URL, and refactor each swap point. Keep the localStorage persistence for the
bear's name and garden (those stay client-side).
```

---

## ✅ Done checklist

- [ ] MongoDB Atlas cluster created, connection string saved
- [ ] Cloudinary account created, cloud name + key + secret saved
- [ ] Vercel project imported from GitHub
- [ ] All 7 env vars added to Vercel (Production + Preview + Development)
- [ ] `npm install mongoose cloudinary` (or the Next.js equivalents) installed locally
- [ ] `/api/health` returns `{"ok":true,"db":"connected"}` on the live URL
- [ ] Discord webhook created and tested
- [ ] Failsafe tested (5 wrong attempts fires the webhook)

Once this checklist is complete, the backend is ready and pingable, and you can move on to
connecting the real APIs in the frontend.
