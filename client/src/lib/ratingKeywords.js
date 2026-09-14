// Free, rule-based search phrases per weak rating dimension — no API call.
// Deterministic: same dimension + category always returns the same list.

const PHRASES_BY_DIMENSION = {
  whitespace: [
    'generous whitespace examples',
    'clean minimal layout inspiration',
    'breathing room design layout',
    'negative space design examples',
  ],
  research: [
    'mood board examples',
    'design reference board',
    'brand research inspiration board',
    'competitor teardown examples',
  ],
  composition: [
    'balanced composition design',
    'visual hierarchy layout examples',
    'focal point design composition',
    'rule of thirds layout design',
  ],
  color: [
    'cohesive color palette examples',
    'limited color palette design',
    'color harmony design inspiration',
    'restrained accent color design',
  ],
  contrast: [
    'high contrast typography examples',
    'legible text contrast design',
    'accessible color contrast design',
    'text legibility design tips',
  ],
};

export function searchKeywordsFor(dimensionKey, categoryLabel) {
  const pool = PHRASES_BY_DIMENSION[dimensionKey] || [];
  const catWord = categoryLabel.toLowerCase();
  return pool.slice(0, 4).map((phrase) => `${catWord} ${phrase}`);
}
