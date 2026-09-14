// Free, local "starting brand guideline" generator for logo uploads.
// Pulls real colors out of the uploaded file via pixel analysis (same
// approach as designAnalysis.js) and pairs that with deterministic,
// generic best-practice rules — clear space, minimum size, do's/don'ts,
// and a suggested type pairing. No network call, no API key, same input
// always produces the same output.

import { CATEGORY_LABELS } from './taskTemplates.js';
import { loadImageData, estimateBackground, colorDistance } from './designAnalysis.js';

const BG_DISTANCE_THRESHOLD = 42;

const FONT_PAIRINGS = [
  { heading: 'Inter', body: 'Inter', mood: 'Clean, modern, neutral — a safe fit for most brands.' },
  { heading: 'Playfair Display', body: 'Source Sans Pro', mood: 'Editorial and elegant — suits premium or lifestyle brands.' },
  { heading: 'Poppins', body: 'Nunito Sans', mood: 'Friendly and rounded — suits wellness or approachable brands.' },
  { heading: 'Archivo Black', body: 'Archivo', mood: 'Bold and confident — suits youth or streetwear brands.' },
  { heading: 'Cormorant Garamond', body: 'Lato', mood: 'Refined and classic — suits beauty or skincare brands.' },
  { heading: 'Space Grotesk', body: 'IBM Plex Sans', mood: 'Technical and sharp — suits tech or startup brands.' },
];

function seededIndex(seed, len) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % len;
}

function toHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function relativeLuminance({ r, g, b }) {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function contrastRatio(c1, c2) {
  const l1 = relativeLuminance(c1) + 0.05;
  const l2 = relativeLuminance(c2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
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

export async function buildBrandGuideline(file, task) {
  const imageData = await loadImageData(file);
  const bg = estimateBackground(imageData.data, imageData.width, imageData.height);
  const dominant = extractDominantColors(imageData, bg, 5);

  const total = dominant.reduce((sum, c) => sum + c.count, 0) || 1;
  const roleNames = ['Primary', 'Secondary', 'Accent', 'Accent', 'Accent'];
  const palette = dominant.map((c, i) => ({
    hex: toHex(c),
    role: roleNames[i] || 'Accent',
    share: Math.round((c.count / total) * 100),
  }));

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const primary = dominant[0] || bg;
  const onWhite = contrastRatio(primary, white);
  const onBlack = contrastRatio(primary, black);
  const backgroundNote =
    onWhite >= onBlack
      ? 'Your primary color reads best on a light or white background — use a reversed (white) version of the logo on dark backgrounds.'
      : 'Your primary color reads best on a dark or black background — use a reversed (white/light) version of the logo on light backgrounds.';

  const seed = palette.map((p) => p.hex).join('') || 'logo';
  const typography = FONT_PAIRINGS[seededIndex(seed, FONT_PAIRINGS.length)];

  const categoryLabel = CATEGORY_LABELS[task?.category] || 'this brand';

  return {
    palette: palette.length ? palette : [{ hex: toHex(bg), role: 'Primary', share: 100 }],
    backgroundNote,
    typography,
    clearSpace:
      'Keep empty space around the logo at least equal to the height of its tallest letter or icon, on every side — don’t let text or other graphics crowd it.',
    minSize:
      'Don’t shrink the logo below about 24px tall on screen, or 0.5in tall in print — fine details start to blur out below that.',
    dos: [
      'Use the primary-color version on light backgrounds, and a reversed white version on dark or busy backgrounds.',
      'Keep the logo’s proportions locked — always scale width and height together, never stretch one axis.',
      'Leave the clear space described above so it never touches or overlaps other text or images.',
    ],
    donts: [
      'Don’t stretch, skew, or rotate the logo.',
      'Don’t recolor it outside the approved palette above.',
      'Don’t place it directly on a busy photo or pattern without a solid-color safe area behind it.',
    ],
    summary: `A starting brand guideline pulled from this logo file for ${categoryLabel.toLowerCase()} — real colors from the image, spacing rules, and a suggested type pairing. Treat it as a first draft to refine by eye, not a finished style guide.`,
  };
}
