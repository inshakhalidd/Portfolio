# Studio Tracker

A task-tracking app for design work: break a high-level task ("make portfolio",
"design Instagram posts for GlowUp") into an ordered subtask checklist, work
through it one step at a time, research before you design, and get feedback
on uploaded designs — all free by default, with an optional AI boost layered
on top where it genuinely adds value.

## Structure

- `client/` — React + Vite single-page app (Home, Tasks, Research, Dashboard,
  Upload, Gallery). Fully functional standalone — every feature works with
  zero backend and zero API key.
- `server/` — a small Express server with one endpoint, `/api/auto-research`,
  used only by the optional "Boost with AI" upgrade (see Research below).
  Never required — the app detects whether a key is configured and hides the
  boost option otherwise.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173. This starts both the client and the server; the
server runs fine with no API key — only the "Boost with AI" buttons need one.

## Features

1. **Home** — a dashboard-style landing page: task/completion/rating stats,
   your in-progress tasks, a "start with research" prompt, and your latest
   critique.
2. **Task input + auto checklist** — click **Add task**, type a task, the app
   detects a category (portfolio / social post / brand identity / general)
   and generates an ordered subtask checklist. Edit, reorder, add, or delete
   subtasks freely.
3. **Research & whitespace as first-class steps** — these subtask types open
   a structured sub-panel (reference links/notes/images for research; a
   spacing checklist for whitespace) and can't be checked off empty.
4. **Ordered checklist** — subtasks lock until the previous ones are done;
   progress bar per task.
5. **Research, free by default** — both the per-task Auto-research control
   and the standalone **Research** tab run a rule-based engine entirely in
   the browser, instantly, with no network call: a plain-language audience
   note, a positioning angle, a category+tag-matched color palette, keywords,
   and real Pinterest/Dribbble/Behance/Fonts In Use/Are.na search links (real
   search pages, never fabricated results). From the Research tab you can
   **create a new task** pre-filled with that research, or **attach it** to
   an existing task's Research step.
   - **Optional AI boost**: if `ANTHROPIC_API_KEY` is set in `server/.env`
     (copy `server/.env.example`), a "Boost with AI" button appears that
     sharpens the same pack via Claude + the web search tool. Every result is
     labeled **Free research** or **AI-boosted** so you always know which
     produced it. Without a key, the button simply doesn't appear — the free
     tier is never a degraded fallback.
6. **Upload + rating, category-aware and free** — upload a PNG/JPG tied to a
   task and get a structured critique, entirely local
   (`client/src/lib/designAnalysis.js`), no API key, no cost:
   - **Whitespace/margins/grouping**, **composition**, and **color** are
     measured directly from the image's pixels and judged against norms for
     the task's actual category (a social post is judged denser/punchier than
     a portfolio piece; a brand identity file is held to stricter palette
     discipline) — same pixel math for every category, different target.
   - **Research & reference** is scored from the actual research subtask data
     on the linked task, so it reflects your real process, not the image.
   - Every note is plain language, with quick explainers for any jargon
     ("contrast (how much your text stands out from its background)").
   - Output includes **pros/cons**, numbered **steps to improve**, per-weak-
     dimension **search keywords** to paste into Pinterest/Google/Dribbble,
     and real **visual research** links — all free, all deterministic (same
     image + category always scores the same).
7. **Dashboard** — tinted stat cards with sparklines and week-over-week %
   change, a weekly-completions bar chart, and a completion-rate donut with
   legend.
8. **Gallery** — every uploaded design, filterable by category/tag chips,
   searchable by task/filename, cards tinted by client category. Click a card
   to open its full critique in a modal, with a **Go to task** button that
   jumps straight to the linked task.
9. **Light/dark theme** — toggle in the header. Not persisted on purpose —
   every reload starts fresh in dark mode.

10. **Accounts** — the app is behind email/password sign-in (Supabase Auth).
    Each person's tasks and uploads are private to them.

Data (tasks, subtasks, uploads) is stored in a Supabase Postgres database and
Supabase Storage — see **Database setup (Supabase)** below. Without Supabase
configured, the app shows a "not configured" screen instead of the sign-in
form; it does not fall back to local-only storage.

## Database setup (Supabase)

Studio Tracker uses Supabase for three things: **Auth** (email/password
sign-up/sign-in), **Postgres** (tasks + uploads, with row-level security so
each user only ever sees their own rows), and **Storage** (a private bucket
for uploaded design files, also locked to the owning user).

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
   (the free tier is enough — no credit card required to create a project).
2. Open the **SQL Editor** in your new project, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `tasks` and `uploads` tables with row-level security policies.
3. Go to **Storage** → **New bucket**, name it `uploads`, and leave it
   **private** (not public). The storage policies in `schema.sql` restrict
   each user to their own `<user_id>/...` folder inside it.
4. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon/public** key.
5. In `client/`, copy `.env.example` to `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   (Never commit `.env` — it's already gitignored.) `VITE_API_URL` in the
   same file is unrelated to this — it's only for the optional AI-boost
   research backend described further down.
6. Run `npm run dev` (or redeploy, if hosted) — you'll land on a sign-in
   screen. Sign up with an email/password; by default Supabase requires
   confirming via email before you can sign in.

When deploying (e.g. to Vercel), set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as environment variables on the hosting platform,
the same way as `VITE_API_URL` below.

## Deploying it live (not as an Artifact)

This is a real two-part app (a static frontend + a small backend for the
optional AI-boost feature), so it needs actual hosting rather than a
single-file preview. `render.yaml` in the repo root is a ready-to-use
[Render](https://render.com) Blueprint that deploys both pieces together:

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect this repo (`inshakhalidd/Portfolio`) and pick the branch.
4. Render reads `render.yaml` and proposes two services:
   - `studio-tracker-web` — static site (the React app)
   - `studio-tracker-api` — the Express server (only used for the AI boost)
5. Before deploying, set the `ANTHROPIC_API_KEY` env var on
   `studio-tracker-api` in the Render dashboard (Blueprint intentionally
   leaves it blank — never commit a key). Skip it entirely if you don't want
   the AI boost live; every other feature works fully without it.
6. Click **Apply** — Render builds and deploys both services, and wires the
   frontend's `VITE_API_URL` to the backend's URL automatically.

Free-tier note: Render's free web services spin down after inactivity, so
the first AI-boost request after a quiet period may take ~30s to wake the
server. The static site has no such cold start, and nothing else in the app
touches the backend at all.

**Other platforms:** the same repo works on Vercel, Netlify, or Railway —
just point them at `client/` for a static build (`npm run build`, output
`dist/`) and, if you want the AI boost, `server/` as a separate Node service
(`npm start`, with `ANTHROPIC_API_KEY` set) — then set `VITE_API_URL` on the
frontend to the backend's deployed URL.

### Free forever, no credit card: Vercel + Supabase

Both Vercel's Hobby plan and Supabase's Free plan work with no card on file,
no trial period, no spend risk. `supabase/functions/api/index.ts` is a
ready-to-use Edge Function — the exact same logic as `server/index.js`, just
running on Deno instead of Node — for anyone who'd rather use Supabase than
Render for the optional AI-boost backend.

**1. Frontend on Vercel** (does everything except the AI boost — nothing else needs Supabase):

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, import `inshakhalidd/Portfolio`.
2. Set **Root Directory** to `client`. Vercel auto-detects the Vite framework preset (build `npm run build`, output `dist`) — no other config needed.
3. Before the first deploy (or after, then redeploy), go to **Settings →
   Environment Variables** and add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` from the **Database setup (Supabase)** section
   above — the app needs these to show anything but a "not configured" screen.
4. Click **Deploy**. You'll get a URL like `https://portfolio-xyz.vercel.app` in under a minute.

That gives you the full app — accounts, task checklists, the free research
engine, the free category-aware rating, dashboard, gallery, theme toggle —
with just the one Supabase project and no other backend.

**2. Optional: Supabase for the AI boost** (skip this if you don't want it):

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (free tier).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) locally, then from the repo root:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   supabase functions deploy api --no-verify-jwt
   ```
   (`--no-verify-jwt` is required — the client calls this function without a
   Supabase auth token.)
3. Your function is now live at
   `https://<project-ref>.supabase.co/functions/v1/api`.
4. Back in Vercel → your project → **Settings → Environment Variables**, add
   `VITE_API_URL` = `https://<project-ref>.supabase.co/functions/v1`, then
   redeploy (Vercel → Deployments → ⋯ → Redeploy) so the build picks it up.

Both platforms' free tiers have no cold-start spin-down the way Render's
does — Vercel serves the static site instantly, and Supabase Edge Functions
start in milliseconds.
