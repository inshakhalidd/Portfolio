// Category detection + subtask templates for auto-generated checklists.

export const CATEGORIES = {
  PORTFOLIO: 'portfolio',
  SOCIAL_POST: 'social_post',
  BRAND_IDENTITY: 'brand_identity',
  GENERAL: 'general',
};

export const CLIENT_TAGS = ['wellness', 'beauty_skincare', 'food_snacks', 'intern_work', 'portfolio'];

const KEYWORD_MAP = [
  { category: CATEGORIES.PORTFOLIO, keywords: ['portfolio', 'case study', 'showcase'] },
  {
    category: CATEGORIES.BRAND_IDENTITY,
    keywords: ['brand identity', 'branding', 'logo', 'style guide', 'brand kit', 'identity'],
  },
  {
    category: CATEGORIES.SOCIAL_POST,
    keywords: ['instagram', 'social', 'post', 'carousel', 'story', 'reel', 'campaign'],
  },
];

export function detectCategory(title) {
  const t = title.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keywords.some((kw) => t.includes(kw))) return entry.category;
  }
  return CATEGORIES.GENERAL;
}

let idCounter = 0;
function makeId() {
  idCounter += 1;
  return `st_${Date.now()}_${idCounter}`;
}

function baseSubtask(title, type = 'standard', extra = {}) {
  return {
    id: makeId(),
    title,
    type, // 'standard' | 'research' | 'whitespace'
    done: false,
    ...extra,
  };
}

function researchData() {
  return { links: [], notes: '', images: [] };
}

function whitespaceData() {
  return {
    confirmed: false,
    checks: {
      margins: false,
      breathingRoom: false,
      grouping: false,
    },
  };
}

const TEMPLATES = {
  [CATEGORIES.PORTFOLIO]: [
    ['Curate past work', 'standard'],
    ['Select brand identity pieces', 'standard'],
    ['Select intern work samples', 'standard'],
    ['Research: portfolio layout inspiration', 'research'],
    ['Write case study write-ups', 'standard'],
    ['Whitespace check: layout & sequencing', 'whitespace'],
    ['Finalize layout / sequencing', 'standard'],
  ],
  [CATEGORIES.SOCIAL_POST]: [
    ['Research: references & trends', 'research'],
    ['Build moodboard', 'standard'],
    ['Lock color codes', 'standard'],
    ['Choose typography', 'standard'],
    ['Layout draft', 'standard'],
    ['Whitespace check', 'whitespace'],
    ['Final export', 'standard'],
  ],
  [CATEGORIES.BRAND_IDENTITY]: [
    ['Research: brand & competitor references', 'research'],
    ['Build moodboard', 'standard'],
    ['Logo exploration', 'standard'],
    ['Lock color codes', 'standard'],
    ['Typography system', 'standard'],
    ['Whitespace check', 'whitespace'],
    ['Style guide assembly', 'standard'],
    ['Final export', 'standard'],
  ],
  [CATEGORIES.GENERAL]: [
    ['Research: references & inspiration', 'research'],
    ['Concept sketch', 'standard'],
    ['Layout draft', 'standard'],
    ['Whitespace check', 'whitespace'],
    ['Final export', 'standard'],
    ['Review'],
  ],
};

export function generateSubtasks(category) {
  const template = TEMPLATES[category] || TEMPLATES[CATEGORIES.GENERAL];
  return template.map(([title, type]) => {
    const sub = baseSubtask(title, type || 'standard');
    if (sub.type === 'research') sub.data = researchData();
    if (sub.type === 'whitespace') sub.data = whitespaceData();
    return sub;
  });
}

export function newSubtask(title, type = 'standard') {
  const sub = baseSubtask(title, type);
  if (type === 'research') sub.data = researchData();
  if (type === 'whitespace') sub.data = whitespaceData();
  return sub;
}

export const CATEGORY_LABELS = {
  [CATEGORIES.PORTFOLIO]: 'Portfolio',
  [CATEGORIES.SOCIAL_POST]: 'Social Post',
  [CATEGORIES.BRAND_IDENTITY]: 'Brand Identity',
  [CATEGORIES.GENERAL]: 'General',
};

export const CATEGORY_DESCRIPTIONS = {
  [CATEGORIES.PORTFOLIO]: 'Curating and sequencing past work into a cohesive showcase — case studies, layout, and storytelling.',
  [CATEGORIES.SOCIAL_POST]: 'A single post or short series for a client’s social feed — fast-turnaround, on-brand, trend-aware.',
  [CATEGORIES.BRAND_IDENTITY]: 'Building or extending a brand system — logo, color, typography, and the rules that hold it together.',
  [CATEGORIES.GENERAL]: 'Anything that doesn’t fit the other categories yet — a plain research → draft → export flow.',
};

export const SUBTASK_TYPE_DESCRIPTIONS = {
  standard: 'A regular step — check it off once you’ve done it. No extra info required.',
  research: 'Gather references before you design: add links, notes, or reference images. Can’t be checked off empty.',
  whitespace: 'A spacing pass — confirm margins, breathing room, and grouping are working before you move on.',
};
