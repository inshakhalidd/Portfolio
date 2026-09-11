const TINT_BY_TAG = {
  wellness: 'blue',
  beauty_skincare: 'pink',
  portfolio: 'lavender',
  food_snacks: 'green',
  intern_work: 'neutral',
};

export function tintForTags(tags = []) {
  for (const tag of tags) {
    if (TINT_BY_TAG[tag]) return TINT_BY_TAG[tag];
  }
  return 'neutral';
}
