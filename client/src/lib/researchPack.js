// Shared helpers for merging an auto-research "pack" (links + keywords +
// palette, from the /api/auto-research backend) into a research subtask's
// editable data, used by both the inline per-task Auto-research control and
// the standalone Research tab.

export function formatPackIntoNotes(pack) {
  const lines = [`Auto-research (${new Date().toLocaleDateString()}):`];
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
