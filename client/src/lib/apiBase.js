// In dev, Vite proxies /api to the local Express server (see vite.config.js),
// so a relative path works. In production the static site and the API server
// are deployed as separate services with different hostnames, so VITE_API_URL
// (baked in at build time) points requests at the right host.
const raw = import.meta.env.VITE_API_URL;
export const API_BASE = raw ? (raw.startsWith('http') ? raw : `https://${raw}`) : '';

// AI-boosted research is an optional upgrade layered on the free engine —
// never required. This checks whether the backend has a key configured at
// all, so the UI can hide/disable the boost option instead of offering a
// button that will just fail.
export async function checkAiResearchAvailable() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json.autoResearch);
  } catch {
    return false;
  }
}
