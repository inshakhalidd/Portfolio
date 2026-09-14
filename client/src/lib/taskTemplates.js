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

function baseSubtask(title, type = 'standard', description, extra = {}) {
  return {
    id: makeId(),
    title,
    type, // 'standard' | 'research' | 'whitespace'
    description: description || SUBTASK_TYPE_DESCRIPTIONS[type] || '',
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
    ['Curate past work', 'standard', 'Pick your best pieces. Quality over quantity.'],
    ['Select brand identity pieces', 'standard', 'Choose 1-3 branding projects that show off logo and color work.'],
    ['Select intern work samples', 'standard', 'Add any intern or agency work you’re allowed to show.'],
    ['Research: portfolio layout inspiration', 'research', 'Look at how other designers lay out their portfolios.'],
    ['Write case study write-ups', 'standard', 'Write a short blurb for each project — what it was, what you did.'],
    ['Whitespace check: layout & sequencing', 'whitespace', 'Check the spacing between pieces looks clean and the order flows.'],
    ['Finalize layout / sequencing', 'standard', 'Lock in the final order and layout.'],
  ],
  [CATEGORIES.SOCIAL_POST]: [
    ['Research: references & trends', 'research', 'See what’s trending for similar posts right now.'],
    ['Build moodboard', 'standard', 'Collect colors, images, and styles you like for this post.'],
    ['Lock color codes', 'standard', 'Pick the exact colors and stick to them.'],
    ['Choose typography', 'standard', 'Pick which fonts you’ll use for the text.'],
    ['Layout draft', 'standard', 'Rough out where the text, image, and logo go.'],
    ['Whitespace check', 'whitespace', 'Check the spacing doesn’t feel cramped.'],
    ['Final export', 'standard', 'Save/export at the right size for the platform.'],
  ],
  [CATEGORIES.BRAND_IDENTITY]: [
    ['Research: brand & competitor references', 'research', 'Look at competitors to see what visual space is open.'],
    ['Build moodboard', 'standard', 'Collect colors, textures, and images that match the brand feel.'],
    ['Logo exploration', 'standard', 'Sketch a few logo ideas before picking one.'],
    ['Lock color codes', 'standard', 'Finalize the exact brand colors (hex/CMYK).'],
    ['Typography system', 'standard', 'Pick the main and secondary fonts, and when to use each.'],
    ['Whitespace check', 'whitespace', 'Check logo spacing and layout stay consistent everywhere.'],
    ['Style guide assembly', 'standard', 'Put the logo, colors, and fonts into one reference doc.'],
    ['Final export', 'standard', 'Export all final brand files for the client.'],
  ],
  [CATEGORIES.GENERAL]: [
    ['Research: references & inspiration', 'research', 'Collect a few references before you start designing.'],
    ['Concept sketch', 'standard', 'Rough out one or two ideas before committing to one.'],
    ['Layout draft', 'standard', 'Build a working draft based on your concept.'],
    ['Whitespace check', 'whitespace', 'Check the spacing feels balanced, not cramped.'],
    ['Final export', 'standard', 'Export the finished file.'],
    ['Review', 'standard', 'Do one last check for typos and alignment issues.'],
  ],
};

const TITLE_DESCRIPTIONS = Object.fromEntries(
  Object.values(TEMPLATES)
    .flat()
    .map(([title, , description]) => [title, description])
    .filter(([, description]) => description)
);

export function descriptionFor(title, type) {
  return TITLE_DESCRIPTIONS[title] || SUBTASK_TYPE_DESCRIPTIONS[type] || '';
}

export function generateSubtasks(category) {
  const template = TEMPLATES[category] || TEMPLATES[CATEGORIES.GENERAL];
  return template.map(([title, type, description]) => {
    const sub = baseSubtask(title, type || 'standard', description);
    if (sub.type === 'research') sub.data = researchData();
    if (sub.type === 'whitespace') sub.data = whitespaceData();
    return sub;
  });
}

export function newSubtask(title, type = 'standard') {
  const sub = baseSubtask(title, type, TITLE_DESCRIPTIONS[title]);
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
  [CATEGORIES.PORTFOLIO]: 'Putting your past work together into one showcase.',
  [CATEGORIES.SOCIAL_POST]: 'A single post (or short set of posts) for a client’s social feed.',
  [CATEGORIES.BRAND_IDENTITY]: 'Building a brand’s look — logo, colors, and fonts.',
  [CATEGORIES.GENERAL]: 'Anything else — a simple research, draft, export flow.',
};

export const SUBTASK_TYPE_DESCRIPTIONS = {
  standard: 'A regular step. Just check it off once it’s done.',
  research: 'Add a link, note, or image before you can check this off.',
  whitespace: 'Confirm the spacing looks right before you can check this off.',
};
