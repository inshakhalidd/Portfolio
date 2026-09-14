// Shared helpers for merging a research "pack" (audience note, positioning
// angle, links, keywords, palette, mode) into a research subtask's editable
// data, used by both the inline per-task Auto-research control and the
// standalone Research tab.

export function formatPackIntoNotes(pack) {
  const lines = [
    `Research (${new Date().toLocaleDateString()}, ${pack.mode === 'ai' ? 'AI-boosted' : 'free'}):`,
  ];
  if (pack.audience_note) {
    lines.push(`Audience: ${pack.audience_note}`);
  }
  if (pack.positioning_angle) {
    lines.push(`Positioning: ${pack.positioning_angle}`);
  }
  if (pack.keywords?.length) {
    lines.push(`Keywords: ${pack.keywords.join(', ')}`);
  }
  if (pack.palette?.length) {
    lines.push(`Palette: ${pack.palette.map((p) => `${p.hex} (${p.reasoning})`).join('; ')}`);
  }
  return lines.join('\n');
}

export function mergePackIntoResearchData(data, pack) {
  const existingUrls = new Set(data.links);
  const newLinks = (pack.links || [])
    .map((l) => l.url)
    .filter((url) => url && !existingUrls.has(url));
  const linkNotes = (pack.links || []).map((l) => `${l.url} — ${l.description}`).join('\n');

  const notesAddition = [formatPackIntoNotes(pack), linkNotes && `\n${linkNotes}`]
    .filter(Boolean)
    .join('\n');

  return {
    ...data,
    links: [...data.links, ...newLinks],
    notes: data.notes ? `${data.notes}\n\n${notesAddition}` : notesAddition,
  };
}
