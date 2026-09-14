// Free, local "research around an image" engine for the Research tab.
// Instead of typing a topic/brief, you upload a reference or post image
// and this pulls real colors and style traits out of its pixels (same
// approach as designAnalysis.js / brandGuideline.js), then combines that
// with the same curated audience/positioning/link content the text-based
// engine uses. No network call, no API key, deterministic.

import { CATEGORY_LABELS } from './taskTemplates.js';
import { loadImageData, estimateBackground, colorDistance, analyzePixels } from './designAnalysis.js';
import { CATEGORY_AUDIENCE, CATEGORY_POSITIONING, CATEGORY_KEYWORDS, TAG_KEYWORDS, pickManySeeded } from './researchBank.js';
import { buildVisualResearchLinks } from './visualResearch.js';

const BG_DISTANCE_THRESHOLD = 42;

function toHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function extractDominantColors(imageData, bg, maxColors) {
  const { data, width: w, height: h } = imageData;
  const buckets = new Map();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (colorDistance(r, g, b, bg.r, bg.g, bg.b) < BG_DISTANCE_THRESHOLD) continue;
      const key = `${r >> 4}_${g >> 4}_${b >> 4}`;
      const entry = buckets.get(key);
      if (entry) entry.count++;
      else buckets.set(key, { count: 1, r: (r >> 4) * 16 + 8, g: (g >> 4) * 16 + 8, b: (b >> 4) * 16 + 8 });
    }
  }
  return [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, maxColors);
}

// Turns measured pixel stats into plain style words — not a taste
// judgement, just a description of what's actually in the file.
function styleKeywordsFrom(m) {
  const words = [];
  const whitespacePct100 = m.whitespacePct * 100;
  if (whitespacePct100 >= 55) words.push('minimal', 'airy negative space');
  else if (whitespacePct100 <= 25) words.push('dense layout', 'maximalist');

  if (m.paletteSize <= 2) words.push('near-monochrome', 'restrained palette');
  else if (m.paletteSize >= 6) words.push('colorful', 'vibrant palette');

  if (m.contrastSpread >= 180) words.push('high-contrast', 'bold');
  else if (m.contrastSpread <= 80) words.push('soft contrast', 'muted');

  if (m.gapCount <= 1) words.push('tightly grouped');
  else if (m.gapCount >= 5) words.push('clearly separated sections');

  return words;
}

export async function buildImageResearchPack(file, category, tags = []) {
  const imageData = await loadImageData(file);
  const bg = estimateBackground(imageData.data, imageData.width, imageData.height);
  const m = analyzePixels(imageData);
  const dominant = extractDominantColors(imageData, bg, 5);

  const total = dominant.reduce((sum, c) => sum + c.count, 0) || 1;
  const roleNames = ['Primary', 'Secondary', 'Accent', 'Accent', 'Accent'];
  const palette = dominant.length
    ? dominant.map((c, i) => ({ hex: toHex(c), role: roleNames[i] || 'Accent', share: Math.round((c.count / total) * 100) }))
    : [{ hex: toHex(bg), role: 'Primary', share: 100 }];

  const cat = CATEGORY_AUDIENCE[category] ? category : 'general';
  const categoryLabel = CATEGORY_LABELS[cat];
  const topicLabel = file.name.replace(/\.[^.]+$/, '') || categoryLabel;

  const styleWords = styleKeywordsFrom(m);
  const curatedPool = [...CATEGORY_KEYWORDS[cat], ...tags.flatMap((t) => TAG_KEYWORDS[t] || [])];
  const seed = palette.map((p) => p.hex).join('') || topicLabel;
  const curatedKeywords = pickManySeeded(seed, curatedPool, 4);
  const keywords = [...new Set([...styleWords, ...curatedKeywords])].slice(0, 8);

  const links = buildVisualResearchLinks(categoryLabel, tags, styleWords[0]).map((l) => ({
    url: l.url,
    description: l.label,
  }));

  return {
    mode: 'image',
    source_filename: file.name,
    audience_note: CATEGORY_AUDIENCE[cat](topicLabel),
    positioning_angle: CATEGORY_POSITIONING[cat](topicLabel),
    style_keywords: styleWords,
    keywords,
    palette,
    links,
  };
}
