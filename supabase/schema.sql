-- Studio Tracker — Supabase schema
-- Run this once in your project's SQL Editor (Supabase Dashboard -> SQL Editor -> New query).
-- Requires Supabase Auth (enabled by default) — every row is scoped to auth.uid().

-- ---------- tasks ----------
-- Subtasks stay as one jsonb array per task (same shape the app already
-- used in localStorage: [{id, title, type, done, data}, ...]) so the
-- checklist logic didn't need to change, just where it's persisted.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'general',
  tags text[] not null default '{}',
  subtasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- ---------- uploads ----------
-- image_path is the Storage object path (bucket "uploads"), not the image
-- itself — the client fetches a signed URL to display it.
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  filename text not null,
  media_type text not null,
  image_path text not null,
  tags text[] not null default '{}',
  category text not null default 'general',
  critique jsonb,
  created_at timestamptz not null default now()
);

alter table public.uploads enable row level security;

create policy "uploads_select_own" on public.uploads
  for select using (auth.uid() = user_id);
create policy "uploads_insert_own" on public.uploads
  for insert with check (auth.uid() = user_id);
create policy "uploads_delete_own" on public.uploads
  for delete using (auth.uid() = user_id);

-- ---------- storage ----------
-- Create a PRIVATE bucket named "uploads" first:
--   Dashboard -> Storage -> New bucket -> name "uploads" -> Public: OFF
-- Then run the policies below. Files are stored at "<user_id>/<filename>",
-- and these policies restrict each user to their own folder.

create policy "uploads_storage_select_own"
  on storage.objects for select
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "uploads_storage_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);
