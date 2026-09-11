# Studio Tracker

A task-tracking app for design work: break a high-level task ("make portfolio",
"design Instagram posts for GlowUp") into an ordered subtask checklist, work
through it one step at a time, and get AI-rated feedback on uploaded designs.

## Structure

- `client/` — React + Vite single-page app (tasks, dashboard, upload, gallery)
- `server/` — small Express API with one endpoint, `/api/rate-design`, that
  calls the Claude API (vision) to critique an uploaded design image. A
  backend is required here only because the Anthropic API key must not be
  exposed in the browser.

## Setup

```bash
npm install
cp server/.env.example server/.env   # add your ANTHROPIC_API_KEY
npm run dev                          # runs server (:8787) + client (:5173)
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
4. **Upload + rating** — upload a PNG/JPG tied to a task; Claude returns a
   structured critique (overall score, whitespace notes, research/reference
   notes, composition, color, typography, strengths/improvements) rendered
   as a feedback card.
5. **Dashboard** — active/completed task counts, per-task progress, recent
   uploads, and an average-rating trend sparkline.
6. **Gallery** — all uploaded designs, filterable by category/tag, searchable
   by task/filename.

Data (tasks, subtasks, uploads) persists to `localStorage` in the browser.
