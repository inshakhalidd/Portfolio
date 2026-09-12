import { useState } from 'react';
import { CATEGORY_LABELS } from '../lib/taskTemplates.js';
import { analyzeDesign } from '../lib/designAnalysis.js';

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function CritiqueCard({ critique }) {
  return (
    <div className="critique-card">
      <div className="critique-score">{critique.overall_score}/10</div>
      <p className="critique-summary">{critique.summary}</p>

      <div className="critique-section highlight">
        <div className="critique-section-title">
          Whitespace <span className="badge">{critique.whitespace.score}/10</span>
        </div>
        <p>{critique.whitespace.notes}</p>
      </div>

      <div className="critique-section highlight">
        <div className="critique-section-title">
          Research & reference <span className="badge">{critique.research_and_reference.score}/10</span>
        </div>
        <p>{critique.research_and_reference.notes}</p>
      </div>

      <div className="critique-section">
        <div className="critique-section-title">Composition</div>
        <p>{critique.composition}</p>
      </div>
      <div className="critique-section">
        <div className="critique-section-title">Color</div>
        <p>{critique.color}</p>
      </div>
      <div className="critique-section">
        <div className="critique-section-title">Typography</div>
        <p>{critique.typography}</p>
      </div>

      <div className="critique-columns">
        <div>
          <div className="critique-section-title">Pros</div>
          <ul>
            {critique.pros.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="critique-section-title">Cons</div>
          <ul>
            {critique.cons.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="critique-section steps-section">
        <div className="critique-section-title">Steps to improve</div>
        <ol className="steps-list">
          {critique.steps.map((s, i) => (
            <li key={i}>{s.replace(/^Step \d+:\s*/, '')}</li>
          ))}
        </ol>
      </div>

      <div className="critique-section">
        <div className="critique-section-title">Visual research</div>
        <p className="visual-research-hint">
          Real search links, built from this task's category and tags — not fabricated results.
        </p>
        <ul className="visual-research-list">
          {critique.visual_research.map((r, i) => (
            <li key={i}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function UploadTab({ tasks, onAddUpload }) {
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleFile(f) {
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(f ? await fileToDataUrl(f) : null);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      const task = tasks.find((t) => t.id === taskId);
      const critique = await analyzeDesign(file, task);

      onAddUpload({
        taskId: taskId || null,
        dataUrl,
        mediaType: file.type,
        filename: file.name,
        tags: task?.tags ?? [],
        category: task?.category ?? 'general',
        critique,
      });
      setResult(critique);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-tab-page">
      <h1 className="page-title">Upload</h1>
      <div className="upload-tab">
      <form className="upload-form" onSubmit={submit}>
        <label className="label">Task</label>
        <select className="select" value={taskId} onChange={(e) => setTaskId(e.target.value)}>
          <option value="">— none —</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({CATEGORY_LABELS[t.category]})
            </option>
          ))}
        </select>

        <label className="label">Design file (PNG/JPG)</label>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {preview && (
          <div className="upload-preview">
            <img src={preview} alt="preview" />
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={!file || loading}>
          {loading ? 'Analyzing...' : 'Rate this design'}
        </button>
        {error && <div className="hint-warning">{error}</div>}
      </form>

      <div className="upload-result">
        {result ? (
          <CritiqueCard critique={result} />
        ) : (
          <div className="empty-state">Upload a design to get free, local structured feedback.</div>
        )}
      </div>
      </div>
    </div>
  );
}
