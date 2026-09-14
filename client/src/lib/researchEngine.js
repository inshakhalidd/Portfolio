// The default, always-available research engine: zero network calls, zero
// cost. Combines curated per-category/per-tag content (researchBank.js)
// with the entered topic deterministically — same input always produces
// the same pack. This is what runs the moment someone clicks "Run
// research"; the AI-boosted path (server/index.js) only ever replaces or
// sharpens this, never gates it.

import { CATEGORY_LABELS } from './taskTemplates.js';
import {
  CATEGORY_AUDIENCE,
  CATEGORY_POSITIONING,
  CATEGORY_KEYWORDS,
  TAG_KEYWORDS,
  CATEGORY_PALETTES,
  TAG_PALETTES,
  pickSeeded,
  pickManySeeded,
} from './researchBank.js';
import { buildVisualResearchLinks } from './visualResearch.js';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'this', 'that', 'these', 'those', 'is',
  'are', 'was', 'were', 'be', 'been', 'being', 'to', 'of', 'in', 'on', 'at', 'by', 'it', 'its',
  'as', 'we', 'our', 'you', 'your', 'their', 'they', 'them', 'i', 'me', 'my', 'if', 'so', 'than',
  'then', 'also', 'into', 'about', 'from', 'will', 'would', 'should', 'can', 'could', 'just',
  'like', 'more', 'most', 'some', 'any', 'all', 'need', 'needs', 'needed', 'want', 'wants',
  'wanted', 'get', 'gets', 'make', 'makes', 'making', 'has', 'have', 'had', 'do', 'does', 'did',
  'not', 'no', 'yes', 'very', 'really', 'client', 'clients', 'brand', 'design', 'designer', 'project',
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

const FOCUS_ANGLE = {
  portfolio: (t) => `Make sure "${t}" is clearly visible in your strongest piece, not buried in the middle.`,
  social_post: (t) => `Lead with "${t}" in the first two seconds of the scroll — that's the hook.`,
  brand_identity: (t) => `Build the visual system around "${t}" so it reads consistently across every touchpoint.`,
  general: (t) => `Keep "${t}" front and center — don't let it get diluted by extra elements.`,
};

// Pulls the most-repeated meaningful words out of a brief and turns each
// into a one-line "what to focus on" note, anchored to the task category.
// Purely local word-frequency counting — no network call, deterministic.
export function extractFocusPoints(brief, category) {
  const terms = tokenize(brief);
  if (!terms.length) return [];
  const freq = new Map();
  for (const t of terms) freq.set(t, (freq.get(t) || 0) + 1);
  const ranked = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const angle = FOCUS_ANGLE[category] || FOCUS_ANGLE.general;
  return ranked.slice(0, 5).map(angle);
}

export function buildFreeResearchPack(topic, brief, category, tags = []) {
  const cat = CATEGORY_AUDIENCE[category] ? category : 'general';
  const topicLabel = topic?.trim() || CATEGORY_LABELS[cat];
  const seed = [topic, brief, cat, ...tags].filter(Boolean).join('|') || cat;

  const audience_note = CATEGORY_AUDIENCE[cat](topicLabel);
  const positioning_angle = CATEGORY_POSITIONING[cat](topicLabel);

  const keywordPool = [
    ...CATEGORY_KEYWORDS[cat],
    ...tags.flatMap((t) => TAG_KEYWORDS[t] || []),
  ];
  const keywords = pickManySeeded(seed, keywordPool, 6);

  const matchedTagPalette = tags.map((t) => TAG_PALETTES[t]).find(Boolean);
  const palette = matchedTagPalette || pickSeeded(seed, CATEGORY_PALETTES[cat]);

  const links = buildVisualResearchLinks(CATEGORY_LABELS[cat], tags, keywords[0]).map((l) => ({
    url: l.url,
    description: l.label,
  }));

  const focus_points = brief?.trim() ? extractFocusPoints(brief, cat) : [];

  return {
    mode: 'free',
    audience_note,
    positioning_angle,
    keywords,
    focus_points,
    palette,
    links,
  };
}
