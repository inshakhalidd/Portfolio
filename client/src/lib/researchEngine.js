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

  return {
    mode: 'free',
    audience_note,
    positioning_angle,
    keywords,
    palette,
    links,
  };
}
