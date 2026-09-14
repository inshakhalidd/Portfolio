// Builds real, working search-engine URLs for visual inspiration — never
// fabricated links to specific posts/images, just genuine search pages.

function pinterestSearch(query) {
  return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
}

function dribbbleSearch(query) {
  return `https://dribbble.com/search/shots?q=${encodeURIComponent(query)}`;
}

function behanceSearch(query) {
  return `https://www.behance.net/search/projects?search=${encodeURIComponent(query)}`;
}

function fontsInUseSearch(query) {
  return `https://fontsinuse.com/search?q=${encodeURIComponent(query)}`;
}

function areNaSearch(query) {
  return `https://www.are.na/search?q=${encodeURIComponent(query)}`;
}

export function buildVisualResearchLinks(categoryLabel, tags = [], focusKeyword) {
  const tagWords = tags.map((t) => t.replace(/_/g, ' '));
  const baseQuery = [categoryLabel, ...tagWords].filter(Boolean).join(' ');
  const focusQuery = focusKeyword ? `${baseQuery} ${focusKeyword}`.trim() : baseQuery;

  return [
    {
      label: `Pinterest — "${baseQuery} inspiration"`,
      url: pinterestSearch(`${baseQuery} design inspiration`),
    },
    {
      label: `Dribbble — "${baseQuery}"`,
      url: dribbbleSearch(baseQuery),
    },
    {
      label: `Behance — "${focusQuery}"`,
      url: behanceSearch(focusQuery),
    },
    {
      label: `Fonts In Use — "${baseQuery}"`,
      url: fontsInUseSearch(baseQuery),
    },
    {
      label: `Are.na — "${focusQuery}"`,
      url: areNaSearch(focusQuery),
    },
  ];
}
