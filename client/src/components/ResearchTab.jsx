import { useState } from 'react';
import { CATEGORY_LABELS, CLIENT_TAGS, detectCategory } from '../lib/taskTemplates.js';
import { extractBriefText } from '../lib/briefFile.js';
import { API_BASE } from '../lib/apiBase.js';
import Icon from './Icon.jsx';

function Moodboard({ pack }) {
  return (
    <div className="moodboard">
      <div className="moodboard-section">
        <div className="critique-section-title">Palette</div>
        <div className="palette-row">
          {(pack.palette || []).map((p, i) => (
            <div className="palette-swatch" key={i} title={p.reasoning}>
              <div className="palette-swatch-color" style={{ background: p.hex }} />
              <div className="palette-swatch-hex">{p.hex}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="moodboard-section">
        <div className="critique-section-title">Moodboard keywords</div>
        <div className="keyword-chips">
          {(pack.keywords || []).map((k, i) => (
            <span className="badge keyword-chip" key={i}>
              {k}
            </span>
          ))}
        </div>
      </div>

      <div className="moodboard-section">
        <div className="critique-section-title">Reference links</div>
        <ul className="visual-research-list">
          {(pack.links || []).map((l, i) => (
            <li key={i}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.url}
              </a>
              <div className="link-description">{l.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ResearchTab({ tasks, onCreateTask, onAttachToTask }) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('general');
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [tags, setTags] = useState([]);
  const [brief, setBrief] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pack, setPack] = useState(null);
  const [attachTaskId, setAttachTaskId] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const tasksWithResearch = tasks.filter((t) => t.subtasks.some((s) => s.type === 'research'));

  function handleTopicChange(value) {
    setTopic(value);
    if (!categoryTouched && value.trim()) {
      setCategory(detectCategory(value));
    }
  }

  function toggleTag(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function run(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPack(null);
    setActionMessage(null);
    try {
      let fileText = '';
      if (file) fileText = await extractBriefText(file);
      const combinedBrief = [brief.trim(), fileText.trim()].filter(Boolean).join('\n\n');

      const res = await fetch(`${API_BASE}/api/auto-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, brief: combinedBrief, category }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Research failed.');
      setPack(json.pack);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function createTask() {
    const title = topic.trim() || `${CATEGORY_LABELS[category]} research`;
    onCreateTask(title, category, tags, pack);
    setActionMessage(`Created "${title}" with this research pre-filled into its Research step.`);
  }

  function attachToTask() {
    if (!attachTaskId) return;
    onAttachToTask(attachTaskId, pack);
    const task = tasks.find((t) => t.id === attachTaskId);
    setActionMessage(`Added this research to "${task?.title}"'s Research step.`);
  }

  return (
    <div className="research-tab-page">
      <h1 className="page-title">Research</h1>

      <div className="upload-tab">
        <form className="upload-form" onSubmit={run}>
          <label className="label">Design idea / brand name</label>
          <input
            className="input"
            placeholder='e.g. "GlowUp skincare Instagram launch"'
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value)}
          />

          <label className="label">Category</label>
          <select
            className="select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCategoryTouched(true);
            }}
          >
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <label className="label small">Client tags (used if you create a task from this)</label>
          <div className="tag-picker">
            {CLIENT_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`chip ${tags.includes(tag) ? 'chip-active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag.replace('_', ' ')}
              </button>
            ))}
          </div>

          <label className="label">Brand outline / brief (optional)</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Audience, tone, goals, anything relevant..."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />

          <label className="label small">Or upload a brief (.txt or .pdf)</label>
          <input
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || (!topic.trim() && !brief.trim() && !file)}
          >
            {loading ? 'Researching...' : 'Run research'}
          </button>
          {error && <div className="hint-warning">{error}</div>}
        </form>

        <div className="upload-result">
          {pack ? (
            <div className="critique-card">
              <Moodboard pack={pack} />

              <div className="research-actions">
                <button className="btn btn-primary" onClick={createTask}>
                  <Icon name="plus" size={15} />
                  Create task from this research
                </button>

                {tasksWithResearch.length > 0 && (
                  <div className="attach-row">
                    <select
                      className="select"
                      value={attachTaskId}
                      onChange={(e) => setAttachTaskId(e.target.value)}
                    >
                      <option value="">Attach to existing task...</option>
                      {tasksWithResearch.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                    <button className="btn" onClick={attachToTask} disabled={!attachTaskId}>
                      Attach
                    </button>
                  </div>
                )}

                {actionMessage && (
                  <div className="auto-research-success">{actionMessage}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Describe a design idea or brand outline to get reference links, moodboard
              keywords, and a starting color palette.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
