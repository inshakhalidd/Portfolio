import { useState } from 'react';
import { CATEGORY_LABELS } from '../lib/taskTemplates.js';
import { analyzeDesign } from '../lib/designAnalysis.js';
import { buildBrandGuideline } from '../lib/brandGuideline.js';
import CritiqueCard from './CritiqueCard.jsx';
import BrandGuidelineCard from './BrandGuidelineCard.jsx';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadTab({ tasks, onAddUpload, lastResearchPack }) {
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? '');
  const [entries, setEntries] = useState([]); // { file, preview }
  const [isLogo, setIsLogo] = useState(false);
  const [useResearchPack, setUseResearchPack] = useState(false);
  const [refNotes, setRefNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]); // { filename, preview, critique?, guideline?, error? }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    setResults([]);
    setError(null);
    if (!files.length) {
      setEntries([]);
      return;
    }
    const withPreviews = await Promise.all(
      files.map(async (file) => ({ file, preview: await fileToDataUrl(file) }))
    );
    setEntries(withPreviews);
  }

  function removeEntry(index) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  async function submit(e) {
    e.preventDefault();
    if (!entries.length) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setProgress({ done: 0, total: entries.length });

    const task = tasks.find((t) => t.id === taskId);
    const trimmedNotes = refNotes.trim();
    const extraRef =
      trimmedNotes || (useResearchPack && lastResearchPack)
        ? { notes: trimmedNotes, pack: useResearchPack ? lastResearchPack : null }
        : undefined;
    const newResults = [];
    for (const { file, preview } of entries) {
      try {
        const critique = await analyzeDesign(file, task, extraRef);
        const brand_guideline = isLogo ? await buildBrandGuideline(file, task) : null;
        if (brand_guideline) critique.brand_guideline = brand_guideline;

        await onAddUpload(
          {
            taskId: taskId || null,
            mediaType: file.type,
            filename: file.name,
            tags: task?.tags ?? [],
            category: task?.category ?? 'general',
            critique,
          },
          file
        );
        newResults.push({ filename: file.name, preview, critique, guideline: brand_guideline });
      } catch (err) {
        newResults.push({ filename: file.name, preview, error: err.message });
      }
      setProgress((p) => ({ done: p.done + 1, total: p.total }));
    }

    setResults(newResults);
    setEntries([]);
    setLoading(false);
    setProgress(null);
  }

  const brandName = tasks.find((t) => t.id === taskId)?.title;

  return (
    <div className="upload-tab animate-in">
      <form className="panel-card upload-form" onSubmit={submit}>
        <label className="dropzone" style={entries.length ? { padding: 12 } : {}}>
          <input
            type="file"
            accept="image/png,image/jpeg"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {entries.length ? (
            <div className="upload-preview-grid">
              {entries.map((entry, i) => (
                <div className="upload-preview-thumb" key={i}>
                  <img src={entry.preview} alt={entry.file.name} />
                  <button
                    type="button"
                    className="upload-preview-remove"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeEntry(i);
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="dropzone-empty">
              <span className="dropzone-title">Drop designs or click to browse</span>
              <span className="dropzone-sub mono">PNG · JPG · multiple files supported</span>
            </div>
          )}
        </label>
        <span className="upload-filename">
          {entries.length
            ? `${entries.length} file${entries.length > 1 ? 's' : ''} selected`
            : 'No files selected yet.'}
        </span>

        <label className="label">Belongs to task</label>
        <select className="select" value={taskId} onChange={(e) => setTaskId(e.target.value)}>
          <option value="">— none —</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({CATEGORY_LABELS[t.category]})
            </option>
          ))}
        </select>

        <label className="checkbox-row">
          <input type="checkbox" checked={isLogo} onChange={(e) => setIsLogo(e.target.checked)} />
          <span>These are logos — also generate a starting brand guideline for each</span>
        </label>

        <div className="attach-ref-block">
          <span className="label small">Attach a reference (optional)</span>
          {lastResearchPack && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={useResearchPack}
                onChange={(e) => setUseResearchPack(e.target.checked)}
              />
              <span>
                Use your latest research from the Research tab
                {lastResearchPack.source_filename ? ` (from ${lastResearchPack.source_filename})` : ''} —
                {' '}
                {(lastResearchPack.keywords || []).slice(0, 3).join(', ') || 'no keywords'}
              </span>
            </label>
          )}
          <textarea
            className="textarea"
            rows={2}
            placeholder="Or type reference notes — what you're comparing this against, what you borrowed…"
            value={refNotes}
            onChange={(e) => setRefNotes(e.target.value)}
          />
          <span className="research-status" style={{ marginTop: 0 }}>
            Optional — when attached, it's factored into the Research &amp; reference score below,
            even without linking a task.
          </span>
        </div>

        <button className="btn btn-primary" type="submit" disabled={!entries.length || loading}>
          {loading
            ? `Analysing ${progress ? `${progress.done}/${progress.total}` : '…'}`
            : entries.length > 1
              ? `Run critique on ${entries.length} files`
              : 'Run critique'}
        </button>
        <span className="research-status">
          {error || 'Scored locally against the five criteria in your checklist — free, no API key.'}
        </span>
      </form>

      <div className="upload-result">
        {results.length ? (
          results.map((r, i) => (
            <details className="upload-result-item" key={i} open={results.length === 1 || i === 0}>
              <summary>
                <span className="upload-result-filename">{r.filename}</span>
                {r.critique && <span className="gallery-card-score mono">{r.critique.overall_score}/10</span>}
                {r.error && <span className="hint-warning" style={{ margin: 0 }}>{r.error}</span>}
              </summary>
              {r.critique && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 14 }}>
                  <CritiqueCard critique={r.critique} />
                  {r.guideline && (
                    <BrandGuidelineCard guideline={r.guideline} brandName={brandName || r.filename} logoUrl={r.preview} />
                  )}
                </div>
              )}
            </details>
          ))
        ) : (
          <div className="empty-state">Upload one or more designs to get free, local structured feedback.</div>
        )}
      </div>
    </div>
  );
}
