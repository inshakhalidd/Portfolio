# Studio Tracker

A task-tracking app for design work: break a high-level task ("make portfolio",
"design Instagram posts for GlowUp") into an ordered subtask checklist, work
through it one step at a time, and get feedback on uploaded designs.

## Structure

- `client/` — React + Vite single-page app (tasks, dashboard, upload, gallery).
  That's the whole app — no backend, no API keys, no cost.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Features

1. **Task input + auto checklist** — type a task, the app detects a category
   (portfolio / social post / brand identity / general) and generates an
   ordered subtask checklist. Edit, reorder, add, or delete subtasks freely.
2. **Research & whitespace as first-class steps** — these subtask types open
   a structured sub-panel (reference links/notes/images for research; a
   margins/breathing-room/grouping checklist for whitespace) and can't be
   checked off empty.
3. **Ordered checklist** — subtasks lock until the previous ones are done;
   progress bar per task.
4. **Upload + rating** — upload a PNG/JPG tied to a task and get a structured
   critique card (overall score, whitespace, research/reference, composition,
   color, typography, strengths/improvements). Rating runs entirely in the
   browser via `client/src/lib/designAnalysis.js`:
   - **Whitespace/margins/grouping** are measured directly from the image's
     pixels (background-color estimation, margin-band bleed detection, gap
     analysis) — genuinely computed, not guessed.
   - **Research & reference** is scored from the actual research subtask data
     on the linked task (notes length, link count, pinned reference images) —
     so it reflects your real process, not the image.
   - **Composition/color/typography** are lighter heuristics (quadrant
     balance, dominant-color clustering, luminance contrast). They're a rough
     sanity check, not real visual understanding — the summary text says so.
   
   This is a deliberate tradeoff: no AI vision call means no API key and no
   per-upload cost, at the price of critique depth. Swapping in a real vision
   model later just means replacing `analyzeDesign()`'s implementation — the
   rest of the app (upload flow, critique card, gallery, dashboard stats)
   already expects its current output shape.
5. **Dashboard** — active/completed task counts, per-task progress, recent
   uploads, and an average-rating trend sparkline.
6. **Gallery** — all uploaded designs, filterable by category/tag, searchable
   by task/filename.

Data (tasks, subtasks, uploads) persists to `localStorage` in the browser.
