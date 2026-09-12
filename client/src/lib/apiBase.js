// In dev, Vite proxies /api to the local Express server (see vite.config.js),
// so a relative path works. In production the static site and the API server
// are deployed as separate services with different hostnames, so VITE_API_URL
// (baked in at build time) points requests at the right host.
const raw = import.meta.env.VITE_API_URL;
export const API_BASE = raw ? (raw.startsWith('http') ? raw : `https://${raw}`) : '';
