import { useState } from 'react';
import { CATEGORY_LABELS, CLIENT_TAGS, detectCategory } from '../lib/taskTemplates.js';
import { useResearchRunner } from '../lib/useResearchRunner.js';

function Moodboard({ pack }) {
  return (
    <div className="panel-card moodboard-panel">
      <div className="moodboard-title-block">
        <span className={`badge mode-badge mode-${pack.mode}`}>
          {pack.mode === 'ai' ? 'AI-boosted' : 'Free research'}
        </span>
      </div>

      {pack.audience_note && (
        <div className="moodboard-section">
          <span className="critique-section-title">Who this needs to catch</span>
          <p className="moodboard-prose">{pack.audience_note}</p>
        </div>
      )}

      {pack.positioning_angle && (
        <div className="moodboard-section">
          <span className="critique-section-title">Positioning angle</span>
          <p className="moodboard-prose">{pack.positioning_angle}</p>
        </div>
      )}

      {pack.focus_points?.length > 0 && (
        <div className="moodboard-section">
          <span className="critique-section-title">Focus points from your brief</span>
          <ul className="steps-list">
            {pack.focus_points.map((f, i) => (
              <li key={i}>
                <span className="step-num mono">{i + 1}</span>
                <span className="step-text">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="moodboard-section">
        <span className="critique-section-title">Palette</span>
        <div className="palette-row">
          {(pack.palette || []).map((p, i) => (
            <div className="palette-swatch" key={i} title={p.reasoning}>
              <div className="palette-swatch-color" style={{ background: p.hex }} />
              <span className="palette-swatch-hex mono">{p.hex}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="moodboard-section">
        <span className="critique-section-title">Moodboard keywords</span>
        <div className="keyword-chips">
          {(pack.keywords || []).map((k, i) => (
            <span className="keyword-chip" key={i}>
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ResearchTab({ tasks, onCreateTask, onAttachToTask }) {
  const [category, setCategory] = useState('general');
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [tags, setTags] = useState([]);
  const [attachTaskId, setAttachTaskId] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const runner = useResearchRunner({});

  const tasksWithResearch = tasks.filter((t) => t.subtasks.some((s) => s.type === 'research'));

  function handleTopicChange(value) {
    runner.setTopic(value);
    if (!categoryTouched && value.trim()) {
      setCategory(detectCategory(value));
    }
  }

  function toggleTag(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function run(e) {
    e.preventDefault();
    setActionMessage(null);
    await runner.run(category, tags);
  }

  async function boost() {
    setActionMessage(null);
    await runner.boost(category);
  }

  function createTask() {
    const title = runner.topic.trim() || `${CATEGORY_LABELS[category]} research`;
    onCreateTask(title, category, tags, runner.pack);
    setActionMessage(`Created "${title}" with this research pre-filled into its Research step.`);
  }

  function attachToTask() {
    if (!attachTaskId) return;
    onAttachToTask(attachTaskId, runner.pack);
    const task = tasks.find((t) => t.id === attachTaskId);
    setActionMessage(`Added this research to "${task?.title}"'s Research step.`);
  }

  return (
    <div className="research-page animate-in">
      <div className="panel-card research-form-panel">
        <div className="research-form-grid">
          <label>
            <span className="label">Topic or brand</span>
            <input
              className="input"
              placeholder='e.g. "GlowUp skincare Instagram launch"'
              value={runner.topic}
              onChange={(e) => handleTopicChange(e.target.value)}
            />
          </label>
          <label>
            <span className="label">Category</span>
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
          </label>
        </div>

        <label>
          <span className="label small">Client tags (used if you create a task from this)</span>
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
        </label>

        <label>
          <span className="label">Brief</span>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Who is it for, what should it feel like?"
            value={runner.brief}
            onChange={(e) => runner.setBrief(e.target.value)}
          />
        </label>

        <label>
          <span className="label small">Or upload a brief (.txt or .pdf)</span>
          <input
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={(e) => runner.setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="research-actions-row">
          <button
            className="btn btn-primary"
            onClick={run}
            disabled={runner.loading || (!runner.topic.trim() && !runner.brief.trim() && !runner.file)}
          >
            {runner.loading ? 'Building…' : 'Build moodboard'}
          </button>
          {runner.pack?.mode === 'free' && runner.aiAvailable && (
            <button className="btn auto-research-boost" onClick={boost} disabled={runner.boosting}>
              {runner.boosting ? 'Boosting…' : 'Boost with AI'}
            </button>
          )}
          <span className="research-status">{runner.error}</span>
        </div>
      </div>

      {runner.pack && (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Moodboard pack={runner.pack} />

          <div className="panel-card refs-panel">
            <div className="panel-card-header">
              <span className="panel-card-header-title">References</span>
            </div>
            {(runner.pack.links || []).map((l, i) => (
              <div className="ref-row" key={i}>
                <a href={l.url} target="_blank" rel="noreferrer">
                  {l.url}
                </a>
                <span className="link-description">{l.description}</span>
              </div>
            ))}
          </div>

          <div className="research-actions-row">
            <button className="btn btn-primary" onClick={createTask}>
              Create a new task from this
            </button>
            {tasksWithResearch.length > 0 && (
              <>
                <select
                  className="select"
                  value={attachTaskId}
                  onChange={(e) => setAttachTaskId(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="">Attach to existing task...</option>
                  {tasksWithResearch.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <button className="btn" onClick={attachToTask} disabled={!attachTaskId}>
                  Attach to existing task
                </button>
              </>
            )}
          </div>
          {actionMessage && <div className="auto-research-success">{actionMessage}</div>}
        </div>
      )}

      {!runner.pack && (
        <div className="empty-state">
          Describe a design idea or brand outline to get an audience note, positioning angle,
          reference links, moodboard keywords, and a starting color palette — instantly, for
          free.
        </div>
      )}
    </div>
  );
}
