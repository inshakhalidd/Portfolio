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

export default function UploadTab({ tasks, onAddUpload }) {
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLogo, setIsLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [guideline, setGuideline] = useState(null);

  async function handleFile(f) {
    setFile(f);
    setResult(null);
    setGuideline(null);
    setError(null);
    setPreview(f ? await fileToDataUrl(f) : null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setGuideline(null);
    try {
      const task = tasks.find((t) => t.id === taskId);
      const critique = await analyzeDesign(file, task);
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
      setResult(critique);
      setGuideline(brand_guideline);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-tab animate-in">
      <form className="panel-card upload-form" onSubmit={submit}>
        <label className="dropzone" style={preview ? { padding: 12 } : {}}>
          <input
            type="file"
            accept="image/png,image/jpeg"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            <div className="upload-preview">
              <img src={preview} alt="preview" />
            </div>
          ) : (
            <div className="dropzone-empty">
              <span className="dropzone-title">Drop a design or click to browse</span>
              <span className="dropzone-sub mono">PNG · JPG</span>
            </div>
          )}
        </label>
        <span className="upload-filename">{file ? file.name : 'No file selected yet.'}</span>

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
          <span>This is a logo — also generate a starting brand guideline</span>
        </label>

        <button className="btn btn-primary" type="submit" disabled={!file || loading}>
          {loading ? 'Analysing…' : 'Run critique'}
        </button>
        <span className="research-status">
          {error || 'Scored locally against the five criteria in your checklist — free, no API key.'}
        </span>
      </form>

      <div className="upload-result">
        {result ? (
          <>
            <CritiqueCard critique={result} />
            {guideline && <BrandGuidelineCard guideline={guideline} />}
          </>
        ) : (
          <div className="empty-state">Upload a design to get free, local structured feedback.</div>
        )}
      </div>
    </div>
  );
}
