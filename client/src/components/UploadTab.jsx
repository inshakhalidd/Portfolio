import { useState } from 'react';
import { CATEGORY_LABELS } from '../lib/taskTemplates.js';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve({ dataUrl, base64 });
    };
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
          <div className="critique-section-title">Strengths</div>
          <ul>
            {critique.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="critique-section-title">Improve</div>
          <ul>
            {critique.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function UploadTab({ tasks, onAddUpload }) {
  const [taskId, setTaskId] = useState(tasks[0]?.id ?? '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleFile(f) {
    setFile(f);
    setResult(null);
    setError(null);
    if (f) {
      const { dataUrl } = await fileToBase64(f);
      setPreview(dataUrl);
    } else {
      setPreview(null);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { dataUrl, base64 } = await fileToBase64(file);
      const task = tasks.find((t) => t.id === taskId);

      const res = await fetch('/api/rate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mediaType: file.type,
          taskTitle: task?.title,
          category: task?.category,
          context,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Rating failed');

      const uploadId = onAddUpload({
        taskId: taskId || null,
        dataUrl,
        mediaType: file.type,
        filename: file.name,
        tags: task?.tags ?? [],
        category: task?.category ?? 'general',
        critique: json.critique,
      });
      setResult(json.critique);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
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

        <label className="label">Context for the critique (optional)</label>
        <textarea
          className="textarea"
          rows={2}
          placeholder="Anything the critic should know — brief, audience, constraints..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />

        <button className="btn btn-primary" type="submit" disabled={!file || loading}>
          {loading ? 'Rating...' : 'Rate this design'}
        </button>
        {error && <div className="hint-warning">{error}</div>}
      </form>

      <div className="upload-result">
        {result ? (
          <CritiqueCard critique={result} />
        ) : (
          <div className="empty-state">Upload a design to get structured feedback.</div>
        )}
      </div>
    </div>
  );
}
