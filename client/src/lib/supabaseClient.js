import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// Only construct a real client when both env vars are present — lets the
// app fail with one clear message instead of a cryptic client-library error
// when someone forgets to set them.
export const supabase = supabaseConfigured ? createClient(url, anonKey) : null;
