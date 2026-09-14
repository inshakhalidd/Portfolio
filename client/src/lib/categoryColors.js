// Single source of truth for category/tag -> color mapping, using the CSS
// custom properties defined in styles.css (--lav/--blue/--pink/--green plus
// their *Soft backgrounds). Covers both task categories (portfolio,
// social_post, brand_identity, general) and client tags (wellness,
// beauty_skincare, food_snacks, portfolio, intern_work) with one table.

const COLOR_VAR = {
  portfolio: '--lav',
  social_post: '--blue',
  brand_identity: '--pink',
  general: '--ink2',
  wellness: '--blue',
  beauty_skincare: '--pink',
  food_snacks: '--green',
  intern_work: '--ink2',
};

const SOFT_VAR = {
  portfolio: '--lavSoft',
  social_post: '--blueSoft',
  brand_identity: '--pinkSoft',
  general: '--panel2',
  wellness: '--blueSoft',
  beauty_skincare: '--pinkSoft',
  food_snacks: '--greenSoft',
  intern_work: '--panel2',
};

export function categoryColorVar(key) {
  return `var(${COLOR_VAR[key] || COLOR_VAR.general})`;
}

export function categorySoftVar(key) {
  return `var(${SOFT_VAR[key] || SOFT_VAR.general})`;
}

export function categoryPillStyle(key) {
  return {
    color: categoryColorVar(key),
    background: categorySoftVar(key),
    borderColor: categoryColorVar(key),
  };
}

// Picks the first client tag with a known color, else 'general'.
export function tintKeyForTags(tags = []) {
  return tags.find((t) => COLOR_VAR[t]) || 'general';
}
