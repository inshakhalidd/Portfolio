// Curated, hand-written content banks the free research engine draws from.
// No network calls, no fabricated "specific" results — just real design
// knowledge organized by task category (and refined further by client tag
// when one is given), combined deterministically with the entered topic.

export const CATEGORY_AUDIENCE = {
  portfolio: (topic) =>
    `Whoever looks at "${topic}" is hiring or commissioning, comparing you against other portfolios open in nearby tabs. They skim in seconds for range and judgment, not just pretty pictures — so lead with your strongest, most resolved piece first, and make sure it reads on both a laptop and a phone.`,
  social_post: (topic) =>
    `This needs to stop a thumb mid-scroll. The audience for "${topic}" sees it in a crowded feed, decides in under two seconds whether to keep scrolling, and mostly views it on a small screen — so the hook has to land instantly and stay legible at thumbnail size.`,
  brand_identity: (topic) =>
    `A "${topic}" identity has to work everywhere at once — business card, storefront sign, app icon, single-color print — so it needs to survive extreme scaling, not just look good on a laptop screen. Most people won't consciously notice the identity if it's done right; they'll just trust the brand a little more.`,
  general: (topic) =>
    `Think about the one person who will actually look at "${topic}" and what they need to walk away knowing or feeling. Match the tone and density to where they'll see it, and keep the goal to one clear job rather than several competing ones.`,
};

export const CATEGORY_POSITIONING = {
  portfolio: (topic) =>
    `Most portfolios in this space default to a dense grid of everything someone has ever made. "${topic}" stands out more by showing fewer pieces with real process behind them — the thinking, not just the output — than by showing more work.`,
  social_post: (topic) =>
    `Generic examples in this category lean on stock-photo gloss and a centered logo. "${topic}" can stand out with one honest, specific detail — a real texture, a real hand, a real moment — instead of another polished-but-forgettable tile.`,
  brand_identity: (topic) =>
    `Most identities in this category converge on the same 2-3 "safe" moves for the industry. Find the one attribute of "${topic}" that's actually true and nobody else in the category is using yet, and build the system around that instead of the category default.`,
  general: (topic) =>
    `Before making it prettier, check whether "${topic}" is actually saying something specific. A plain layout with one clear, true claim beats a decorated layout with a vague one.`,
};

export const CATEGORY_KEYWORDS = {
  portfolio: [
    'case study narrative',
    'generous whitespace',
    'editorial grid',
    'project sequencing',
    'process documentation',
    'confident type hierarchy',
    'restrained palette',
    'full-bleed imagery',
  ],
  social_post: [
    'thumb-stopping hook',
    'high-contrast crop',
    'single claim per slide',
    'safe-area captioning',
    'bold color block',
    'authentic texture',
    'brand-consistent grid',
    'scroll-stopping color',
  ],
  brand_identity: [
    'clear-space rules',
    'mark at small scale',
    'two-family type system',
    'flexible color tints',
    'application mockups',
    'monochrome fallback',
    'distinct silhouette',
    'systemized spacing',
  ],
  general: [
    'clear hierarchy',
    'consistent spacing scale',
    'readable measure',
    'purposeful color',
    'one entry point',
    'balanced composition',
  ],
};

export const TAG_KEYWORDS = {
  wellness: ['calm palette', 'soft light', 'organic shapes', 'breathing room'],
  beauty_skincare: ['soft-focus product shots', 'skin-tone-safe palette', 'minimal packaging cues', 'clean typography'],
  food_snacks: ['appetite appeal', 'shelf-ready contrast', 'flavor cue color', 'tactile texture'],
  intern_work: ['clear labeling', 'safe conventional layout', 'legible at a glance'],
  portfolio: ['confident sequencing', 'restrained accent color'],
};

export const CATEGORY_PALETTES = {
  portfolio: [
    [
      { hex: '#F6F3EC', reasoning: 'warm off-white ground, lets work breathe' },
      { hex: '#1E1B16', reasoning: 'near-black ink for confident type' },
      { hex: '#8B6F5C', reasoning: 'warm neutral accent, used sparingly' },
    ],
    [
      { hex: '#FAFAFA', reasoning: 'clean neutral ground' },
      { hex: '#2A2A2E', reasoning: 'charcoal for body text and structure' },
      { hex: '#7C6FF0', reasoning: 'single lavender accent for links/CTAs' },
    ],
  ],
  social_post: [
    [
      { hex: '#151515', reasoning: 'near-black base makes color pop on a feed' },
      { hex: '#F4F1EA', reasoning: 'warm off-white for text/captions' },
      { hex: '#E8574F', reasoning: 'high-contrast accent for the hook element' },
    ],
    [
      { hex: '#FFF7ED', reasoning: 'warm cream ground, stands out from typical white posts' },
      { hex: '#26313A', reasoning: 'deep blue-gray for confident text' },
      { hex: '#F2A65A', reasoning: 'warm accent that reads well at thumbnail size' },
    ],
  ],
  brand_identity: [
    [
      { hex: '#0F172A', reasoning: 'deep primary for the wordmark' },
      { hex: '#F8FAFC', reasoning: 'clean secondary for reversed applications' },
      { hex: '#38BDF8', reasoning: 'single accent tint, usable at low opacity too' },
    ],
    [
      { hex: '#1B1B1B', reasoning: 'primary ink, works in single color print' },
      { hex: '#FDFCFB', reasoning: 'paper-like secondary' },
      { hex: '#C9A227', reasoning: 'accent tint for premium feel, used as a highlight only' },
    ],
  ],
  general: [
    [
      { hex: '#FAFAFA', reasoning: 'neutral ground that won\'t fight the content' },
      { hex: '#242424', reasoning: 'near-black for readable body text' },
      { hex: '#5B8CFF', reasoning: 'single accent for actions/links' },
    ],
  ],
};

export const TAG_PALETTES = {
  wellness: [
    { hex: '#EAF3F0', reasoning: 'soft sage ground, feels calm not clinical' },
    { hex: '#2F4F4F', reasoning: 'deep teal for trustworthy text' },
    { hex: '#7FB3A8', reasoning: 'muted mint accent' },
  ],
  beauty_skincare: [
    { hex: '#FDF1EE', reasoning: 'soft blush ground' },
    { hex: '#3A2E2C', reasoning: 'warm near-black for text' },
    { hex: '#D98C7B', reasoning: 'skin-tone-safe accent, not overly saturated' },
  ],
  food_snacks: [
    { hex: '#FFF4E0', reasoning: 'warm cream, reads as appetizing' },
    { hex: '#3D2B1F', reasoning: 'rich brown for grounded contrast' },
    { hex: '#E8622C', reasoning: 'appetite-triggering warm accent' },
  ],
};

function hashSeed(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

export function pickSeeded(seedStr, array) {
  if (!array.length) return null;
  const idx = hashSeed(seedStr) % array.length;
  return array[idx];
}

export function pickManySeeded(seedStr, array, count) {
  if (!array.length) return [];
  const seed = hashSeed(seedStr);
  const arr = [...array];
  const picked = [];
  let s = seed;
  while (picked.length < Math.min(count, arr.length)) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % arr.length;
    picked.push(arr.splice(idx, 1)[0]);
  }
  return picked;
}
