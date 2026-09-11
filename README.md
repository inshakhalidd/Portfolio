# Studio Tracker

A task-tracking app for design work: break a high-level task ("make portfolio",
"design Instagram posts for GlowUp") into an ordered subtask checklist, work
through it one step at a time, and get feedback on uploaded designs.

## Structure

- `client/` — React + Vite single-page app (tasks, dashboard, upload, gallery).
  Runs standalone — everything except auto-research works with no backend.
- `server/` — a small Express server with a single endpoint,
  `/api/auto-research`, used only by the optional auto-research feature (see
  below). Not required for the rest of the app.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173. This starts both the client and the server; the
server runs fine with no API key — only the auto-research button needs one
(see below).

## Features

1. **Task input + auto checklist** — click **+ Add Task**, type a task, the
   app detects a category (portfolio / social post / brand identity /
   general) and generates an ordered subtask checklist. Edit, reorder, add,
   or delete subtasks freely.
2. **Research & whitespace as first-class steps** — these subtask types open
   a structured sub-panel (reference links/notes/images for research; a
   margins/breathing-room/grouping checklist for whitespace) and can't be
   checked off empty.
3. **Ordered checklist** — subtasks lock until the previous ones are done;
   progress bar per task.
4. **Auto-research assistant** — on the Research sub-panel, click
   **Auto-research**, give it a topic/brand name and/or a short brief (or
   upload a `.txt`/`.pdf` brand outline — parsed client-side), and it calls
   Claude with the web search tool to find real reference links, 4-6
   moodboard keywords, and a suggested hex palette with reasoning. Results
   merge into the existing Reference Links + Notes fields — nothing is
   locked, edit or delete anything it adds. **Requires `ANTHROPIC_API_KEY`**
   in `server/.env` (copy `server/.env.example`) — without one, the button
   shows a clear error and everything else in the app still works.
5. **Upload + rating** — upload a PNG/JPG tied to a task and get a structured
   critique card (overall score, whitespace, research/reference, composition,
   color, typography, strengths/improvements). Rating runs entirely in the
   browser via `client/src/lib/designAnalysis.js`, **no API key needed**:
   - **Whitespace/margins/grouping** are measured directly from the image's
     pixels (background-color estimation, margin-band bleed detection, gap
     analysis) — genuinely computed, not guessed.
   - **Research & reference** is scored from the actual research subtask data
     on the linked task (notes length, link count, pinned reference images) —
     so it reflects your real process, not the image.
   - **Composition/color/typography** are lighter heuristics (quadrant
     balance, dominant-color clustering, luminance contrast). They're a rough
     sanity check, not real visual understanding — the summary text says so.
6. **Dashboard** — tinted stat cards (active/completed tasks, avg. rating)
   with sparklines and week-over-week % change, a weekly-completions bar
   chart, and a completion-rate donut.
7. **Gallery** — all uploaded designs, filterable by category/tag, searchable
   by task/filename. Cards and tag pills are color-tinted by client category
   (wellness = blue, beauty/skincare = pink, portfolio = lavender,
   food/snacks = green).

Data (tasks, subtasks, uploads) persists to `localStorage` in the browser.
