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
    ['Curate past work', 'standard', 'Pick the pieces that best represent your range and skill level — quality over quantity.'],
    ['Select brand identity pieces', 'standard', 'Choose 1-3 brand identity projects that show your range with logo, color, and type systems.'],
    ['Select intern work samples', 'standard', 'Pull in intern/agency work you can showcase, with permission to display it if needed.'],
    ['Research: portfolio layout inspiration', 'research', 'Look at how other designers sequence and present their portfolios — grid, scroll, case-study structure.'],
    ['Write case study write-ups', 'standard', 'For each project, write a short brief/process/result summary so viewers understand the work, not just see it.'],
    ['Whitespace check: layout & sequencing', 'whitespace', 'Confirm spacing between pieces and sections reads cleanly and the sequencing has a clear flow.'],
    ['Finalize layout / sequencing', 'standard', 'Lock the final order and layout of pieces before publishing or exporting.'],
  ],
  [CATEGORIES.SOCIAL_POST]: [
    ['Research: references & trends', 'research', 'Look at what’s currently performing well for similar brands/content on this platform.'],
    ['Build moodboard', 'standard', 'Pull together visual references — colors, imagery, type styles — to guide the post’s look.'],
    ['Lock color codes', 'standard', 'Pick the exact hex/brand colors for this post and stick to them.'],
    ['Choose typography', 'standard', 'Decide which fonts/weights you’ll use for headline and body text.'],
    ['Layout draft', 'standard', 'Rough out the composition — where text, imagery, and logo sit.'],
    ['Whitespace check', 'whitespace', 'Confirm margins and spacing don’t feel cramped or unbalanced on the final canvas size.'],
    ['Final export', 'standard', 'Export at the right dimensions/format for the platform you’re posting to.'],
  ],
  [CATEGORIES.BRAND_IDENTITY]: [
    ['Research: brand & competitor references', 'research', 'Study the client’s competitors and category to find what visual space is open for this brand.'],
    ['Build moodboard', 'standard', 'Collect visual direction — color, texture, imagery, type — that captures the intended brand feel.'],
    ['Logo exploration', 'standard', 'Sketch/draft multiple logo directions before narrowing down.'],
    ['Lock color codes', 'standard', 'Finalize the brand’s exact color palette with hex/CMYK values.'],
    ['Typography system', 'standard', 'Choose primary/secondary typefaces and define how they’re used (headers, body, etc).'],
    ['Whitespace check', 'whitespace', 'Confirm logo clear-space and layout spacing follow consistent rules across applications.'],
    ['Style guide assembly', 'standard', 'Document the logo usage, colors, type, and spacing rules into one reference file.'],
    ['Final export', 'standard', 'Export all final brand assets (logo files, color swatches, style guide) in the formats the client needs.'],
  ],
  [CATEGORIES.GENERAL]: [
    ['Research: references & inspiration', 'research', 'Gather references and inspiration before you start designing.'],
    ['Concept sketch', 'standard', 'Rough out one or more initial directions before committing to a final layout.'],
    ['Layout draft', 'standard', 'Build out the working draft of the design based on your concept.'],
    ['Whitespace check', 'whitespace', 'Confirm margins, spacing, and grouping feel balanced before finalizing.'],
    ['Final export', 'standard', 'Export the finished file in the format the client/project needs.'],
    ['Review', 'standard', 'Do a final pass — check for typos, alignment issues, and overall consistency.'],
  ],
};

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
