// Free, local, heuristic design critique — no external API calls.
// Runs entirely in the browser via <canvas> pixel analysis, scored and worded
// against real fundamentals (whitespace, contrast, balance, palette control)
// the way a design lead would talk through a file. It measures pixels, not
// intent — it can't read type or judge taste — so treat it as a fast first
// pass, not the final word.

import { CATEGORY_LABELS } from './taskTemplates.js';
import { buildVisualResearchLinks } from './visualResearch.js';
import { targetsFor } from './ratingTargets.js';
import { searchKeywordsFor } from './ratingKeywords.js';

const MAX_DIM = 260; // downscale for speed; heuristics don't need full res
const BG_DISTANCE_THRESHOLD = 42; // RGB distance under which a pixel counts as "background"
const MARGIN_BAND = 0.08; // outer 8% of width/height counts as margin

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export async function loadImageData(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

export function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function estimateBackground(data, w, h) {
  // sample the outer margin band, quantize, take the most common color
  const buckets = new Map();
  const bandW = Math.max(1, Math.round(w * MARGIN_BAND));
  const bandH = Math.max(1, Math.round(h * MARGIN_BAND));

  function sample(x, y) {
    const i = (y * w + x) * 4;
    const key = `${data[i] >> 4}_${data[i + 1] >> 4}_${data[i + 2] >> 4}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < bandH; y++) sample(x, y);
    for (let y = h - bandH; y < h; y++) sample(x, y);
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < bandW; x++) sample(x, y);
    for (let x = w - bandW; x < w; x++) sample(x, y);
  }
  let bestKey = null;
  let bestCount = -1;
  for (const [key, count] of buckets) {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  }
  const [r, g, b] = bestKey.split('_').map((n) => Number(n) * 16 + 8);
  return { r, g, b };
}

export function analyzePixels(imageData) {
  const { data, width: w, height: h } = imageData;
  const bg = estimateBackground(data, w, h);

  const isBg = new Uint8Array(w * h);
  let bgCount = 0;
  const colorBuckets = new Map();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const idx = y * w + x;
      const bg_ = colorDistance(r, g, b, bg.r, bg.g, bg.b) < BG_DISTANCE_THRESHOLD;
      isBg[idx] = bg_ ? 1 : 0;
      if (bg_) {
        bgCount++;
      } else {
        const key = `${r >> 5}_${g >> 5}_${b >> 5}`;
        colorBuckets.set(key, (colorBuckets.get(key) || 0) + 1);
      }
    }
  }

  const total = w * h;
  const whitespacePct = bgCount / total;

  // margin bleed: % of margin-band pixels that are non-background
  const bandW = Math.max(1, Math.round(w * MARGIN_BAND));
  const bandH = Math.max(1, Math.round(h * MARGIN_BAND));
  let marginTotal = 0;
  let marginContent = 0;
  const edgeContent = { top: 0, bottom: 0, left: 0, right: 0 };
  const edgeTotal = { top: 0, bottom: 0, left: 0, right: 0 };
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < bandH; y++) {
      marginTotal++;
      edgeTotal.top++;
      if (!isBg[y * w + x]) {
        marginContent++;
        edgeContent.top++;
      }
    }
    for (let y = h - bandH; y < h; y++) {
      marginTotal++;
      edgeTotal.bottom++;
      if (!isBg[y * w + x]) {
        marginContent++;
        edgeContent.bottom++;
      }
    }
  }
  for (let y = bandH; y < h - bandH; y++) {
    for (let x = 0; x < bandW; x++) {
      marginTotal++;
      edgeTotal.left++;
      if (!isBg[y * w + x]) {
        marginContent++;
        edgeContent.left++;
      }
    }
    for (let x = w - bandW; x < w; x++) {
      marginTotal++;
      edgeTotal.right++;
      if (!isBg[y * w + x]) {
        marginContent++;
        edgeContent.right++;
      }
    }
  }
  const marginBleedPct = marginContent / Math.max(1, marginTotal);
  const bleedingEdges = Object.entries(edgeContent)
    .filter(([edge, count]) => count / Math.max(1, edgeTotal[edge]) > 0.15)
    .map(([edge]) => edge);

  // column/row density profiles -> gap counting for "grouping" sense
  function countGaps(profile) {
    let gaps = 0;
    let inGap = false;
    let gapLen = 0;
    const minGapLen = Math.max(2, Math.round(profile.length * 0.03));
    for (const density of profile) {
      if (density < 0.03) {
        gapLen++;
        if (!inGap && gapLen >= minGapLen) {
          gaps++;
          inGap = true;
        }
      } else {
        inGap = false;
        gapLen = 0;
      }
    }
    return gaps;
  }
  const colDensity = new Array(w).fill(0);
  const rowDensity = new Array(h).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isBg[y * w + x]) {
        colDensity[x] += 1 / h;
        rowDensity[y] += 1 / w;
      }
    }
  }
  const gapCount = countGaps(colDensity) + countGaps(rowDensity);

  // quadrant balance
  const quads = [0, 0, 0, 0]; // TL, TR, BL, BR
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (isBg[y * w + x]) continue;
      const qi = (x < w / 2 ? 0 : 1) + (y < h / 2 ? 0 : 2);
      quads[qi]++;
    }
  }
  const nonBgTotal = total - bgCount || 1;
  const quadShares = quads.map((q) => q / nonBgTotal);
  const meanShare = 0.25;
  const quadVariance =
    quadShares.reduce((sum, s) => sum + (s - meanShare) ** 2, 0) / quadShares.length;

  // palette: dominant non-bg color clusters covering the bulk of content
  const sorted = [...colorBuckets.entries()].sort((a, b) => b[1] - a[1]);
  let cumulative = 0;
  let paletteSize = 0;
  for (const [, count] of sorted) {
    if (cumulative / nonBgTotal >= 0.85) break;
    cumulative += count;
    paletteSize++;
  }

  // contrast: luminance spread among non-bg pixels
  let lumMin = 255;
  let lumMax = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (isBg[idx]) continue;
      const i = idx * 4;
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < lumMin) lumMin = lum;
      if (lum > lumMax) lumMax = lum;
    }
  }
  const contrastSpread = nonBgTotal > 1 ? lumMax - lumMin : 0;

  return {
    whitespacePct,
    marginBleedPct,
    bleedingEdges,
    gapCount,
    quadVariance,
    paletteSize: paletteSize || 1,
    contrastSpread,
  };
}

function researchScoreFor(task) {
  if (!task) {
    return {
      score: 4,
      notes:
        'No task linked to this upload, so there is no research trail to check. Attach uploads to a task and fill in its research subtask for a real assessment here.',
    };
  }
  const researchSubtask = task.subtasks.find((s) => s.type === 'research');
  if (!researchSubtask) {
    return {
      score: 4,
      notes: 'The linked task has no research subtask, so this can\'t be evaluated from process data.',
    };
  }
  const d = researchSubtask.data;
  let score = 3;
  const bits = [];
  if (d.notes.trim().length > 40) {
    score += 2;
    bits.push('solid written notes');
  } else if (d.notes.trim().length > 0) {
    score += 1;
    bits.push('brief notes');
  }
  if (d.links.length >= 3) {
    score += 2;
    bits.push(`${d.links.length} reference links`);
  } else if (d.links.length >= 1) {
    score += 1;
    bits.push(`${d.links.length} reference link${d.links.length > 1 ? 's' : ''}`);
  }
  if (d.images.length >= 3) {
    score += 2;
    bits.push(`${d.images.length} pinned reference images`);
  } else if (d.images.length >= 1) {
    score += 1;
    bits.push(`${d.images.length} pinned reference image`);
  }
  score = clamp(score, 1, 10);
  const notes = bits.length
    ? `Research subtask shows ${bits.join(', ')} — that's a real trail back to reference, keep it up.`
    : 'The research subtask on this task is still empty — nothing to ground this design in yet.';
  return { score, notes };
}

function paletteScoreFor(paletteSize, targets) {
  if (paletteSize <= 1) return 5; // near-monochrome is ambiguous in any category
  const diff = Math.abs(paletteSize - targets.idealPaletteSize);
  if (diff <= 1) return 9;
  if (paletteSize <= targets.paletteToleranceHigh) return 7;
  return 4;
}

export async function analyzeDesign(file, task) {
  const imageData = await loadImageData(file);
  const m = analyzePixels(imageData);
  const category = task?.category || 'general';
  const categoryLabel = CATEGORY_LABELS[category] || 'design';
  const targets = targetsFor(category);

  const whitespacePct100 = m.whitespacePct * 100;
  const whitespaceCoreScore = clamp(
    10 - Math.abs(whitespacePct100 - targets.idealWhitespacePct) / 6,
    1,
    10
  );
  const marginScore = clamp(10 - (m.marginBleedPct * 100) / targets.marginDivisor, 1, 10);
  const groupingScore =
    m.gapCount === 0 ? 4 : m.gapCount <= 2 ? 7 : m.gapCount <= 5 ? 9 : 6;
  const whitespaceScore = Math.round(
    (whitespaceCoreScore * 0.45 + marginScore * 0.35 + groupingScore * 0.2) * 10
  ) / 10;

  const whitespaceNotesParts = [
    `For a ${categoryLabel.toLowerCase()}, we'd expect roughly ${targets.idealWhitespacePct}% open space (whitespace — the empty areas with nothing in them). Yours measures about ${whitespacePct100.toFixed(0)}%.`,
  ];
  if (m.bleedingEdges.length) {
    whitespaceNotesParts.push(
      `Content runs right up to the ${m.bleedingEdges.join(' and ')} edge${m.bleedingEdges.length > 1 ? 's' : ''} — there's barely any margin (empty space around the outside) there.`
    );
  } else {
    whitespaceNotesParts.push('Good news: the margin (empty space around the outside) holds up on all four edges.');
  }
  whitespaceNotesParts.push(
    m.gapCount <= 1
      ? 'Everything reads as one packed block — there\'s no visible gap between different groups of elements.'
      : 'There\'s a visible gap between different groups of elements, which helps the eye sort them apart.'
  );

  const research = researchScoreFor(task);

  const paletteScore = paletteScoreFor(m.paletteSize, targets);
  const colorNote =
    m.paletteSize <= 1
      ? 'This reads as almost one single color (near-monochrome) — that might be on purpose, but double-check it isn\'t flattening the design.'
      : `We're picking up about ${m.paletteSize} main colors. For a ${categoryLabel.toLowerCase()}, ${targets.idealPaletteSize} is a comfortable target — ${m.paletteSize <= targets.paletteToleranceHigh ? 'you\'re in a reasonable range.' : 'that\'s more colors than usual for this category, which can look busy.'}`;

  const contrastScore = clamp((m.contrastSpread / 255) * 10, 1, 10);
  const contrastNote =
    m.contrastSpread < 60
      ? ' Contrast (how much your text/shapes stand out from their background) is low — things may be hard to make out.'
      : ' Contrast (how much your text/shapes stand out from their background) looks healthy — things should stand out clearly.';

  const compositionScore = clamp(10 - m.quadVariance * 220, 1, 10);
  const compositionNote =
    compositionScore >= 7
      ? 'Composition (how the visual weight is spread across the frame) is fairly even across all four corners.'
      : 'Composition (how the visual weight is spread across the frame) skews heavily toward one corner — check if that\'s on purpose or just imbalance.';

  const typographyScore = clamp((contrastScore + paletteScore) / 2, 1, 10);
  const typographyNote =
    'We can\'t actually read your letters (this only looks at pixels, not text) — but as a stand-in: ' +
    (contrastScore >= 6
      ? 'contrast looks strong enough that type should stay readable.'
      : 'contrast is a bit low in places, which can make small type hard to read — worth a second look by eye.');

  const overall =
    whitespaceScore * 0.3 +
    research.score * 0.25 +
    compositionScore * 0.15 +
    (paletteScore * 0.5 + contrastScore * 0.5) * 0.15 +
    typographyScore * 0.15;

  // Each dimension carries an easy, concrete fix — used to build the ranked
  // "steps to improve" list and per-dimension search keywords below (worst
  // dimension first). Same scoring inputs every time -> same output every
  // time: nothing here depends on randomness or hidden style preference.
  const dimensions = [
    {
      key: 'whitespace',
      score: whitespaceScore,
      pro: 'Whitespace and margins are working well — the layout has room to breathe.',
      con: 'Whitespace/margins are cramped for this category, which reads as unfinished.',
      step: m.bleedingEdges.length
        ? `Add breathing room on the ${m.bleedingEdges.join(' and ')} edge${m.bleedingEdges.length > 1 ? 's' : ''} — pull content in until there's a clear gap from the frame border.`
        : 'Group related elements tighter together and add a bit more empty space between different groups — right now it reads as one dense block.',
    },
    {
      key: 'research',
      score: research.score,
      pro: 'Clear research trail behind this piece — it looks grounded in real reference.',
      con: 'Not enough reference/research backing this piece yet.',
      step: 'Open the task\'s Research step and pin 2-3 real examples you like, plus a sentence on what you\'re borrowing from each.',
    },
    {
      key: 'composition',
      score: compositionScore,
      pro: 'Balanced composition — visual weight is spread evenly across the frame.',
      con: 'Composition feels lopsided — most of the visual weight sits in one corner.',
      step: 'Move your heaviest element (logo, headline, photo) closer to the center, or add a smaller counterweight in the opposite corner.',
    },
    {
      key: 'color',
      score: paletteScore,
      pro: 'Cohesive, controlled color palette for this category — it doesn\'t compete with itself.',
      con: 'The number of colors is off-target for this category, competing for attention.',
      step: `Pick ${targets.idealPaletteSize} main colors, then use everything else only as small accents — try deleting one color entirely and see if it still works.`,
    },
    {
      key: 'contrast',
      score: contrastScore,
      pro: 'Good contrast — text and key elements stand out clearly.',
      con: 'Low contrast between elements and their background hurts legibility.',
      step: 'Darken your text or lighten its background (or the reverse) until you could read it from across the room.',
    },
  ];

  const pros = dimensions.filter((d) => d.score >= 7.5).map((d) => d.pro);
  const cons = dimensions.filter((d) => d.score <= 5).map((d) => d.con);
  if (!pros.length) pros.push('Nothing stands out as a clear strength yet — keep iterating.');
  if (!cons.length) cons.push('No major red flags from this pass.');

  const weakestFirst = [...dimensions].sort((a, b) => a.score - b.score);
  const weakest3 = weakestFirst.slice(0, 3);
  const steps = weakest3.map((d, i) => `Step ${i + 1}: ${d.step}`);
  const keyword_ideas = weakest3.map((d) => ({
    dimension: d.key,
    keywords: searchKeywordsFor(d.key, categoryLabel),
  }));

  const visualResearch = buildVisualResearchLinks(
    categoryLabel,
    task?.tags,
    weakestFirst[0]?.key
  );

  return {
    overall_score: Math.round(overall * 10) / 10,
    summary:
      `Reviewed against what actually matters for a ${categoryLabel.toLowerCase()}: whitespace, ` +
      'balance, color control, and contrast — all measured directly from your file, not guessed. ' +
      'It can\'t read actual letters, so give typography a final look yourself.',
    whitespace: { score: whitespaceScore, notes: whitespaceNotesParts.join(' ') },
    research_and_reference: research,
    composition: compositionNote,
    color: colorNote + contrastNote,
    typography: typographyNote,
    pros,
    cons,
    steps,
    keyword_ideas,
    visual_research: visualResearch,
  };
}
