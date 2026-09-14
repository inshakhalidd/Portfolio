// Category-aware scoring targets for the local pixel-based rating. A social
// post is judged against a denser, punchier norm than a portfolio piece; a
// brand identity file is held to tighter palette discipline. These are the
// only place category changes what "good" means — the pixel math itself
// (client/src/lib/designAnalysis.js) stays identical for every category.

export const CATEGORY_TARGETS = {
  portfolio: {
    idealWhitespacePct: 58, // portfolios read as more polished with generous air
    marginDivisor: 5, // stricter — edge bleed reads as unfinished here
    idealPaletteSize: 3,
    paletteToleranceHigh: 4,
  },
  social_post: {
    idealWhitespacePct: 40, // social content can run denser and still work
    marginDivisor: 8, // looser — safe-area bleed is more forgivable
    idealPaletteSize: 4,
    paletteToleranceHigh: 6, // punchier palettes are more at home here
  },
  brand_identity: {
    idealWhitespacePct: 50,
    marginDivisor: 6,
    idealPaletteSize: 3, // identity systems reward strict palette discipline
    paletteToleranceHigh: 4,
  },
  general: {
    idealWhitespacePct: 50,
    marginDivisor: 6,
    idealPaletteSize: 4,
    paletteToleranceHigh: 5,
  },
};

export function targetsFor(category) {
  return CATEGORY_TARGETS[category] || CATEGORY_TARGETS.general;
}
