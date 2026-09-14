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

Data (tasks, subtasks, uploads) persists to `localStorage` in the browser.

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
