import { useMemo, useState } from 'react';
import { CATEGORY_LABELS } from '../lib/taskTemplates.js';
import { categorySoftVar, tintKeyForTags } from '../lib/categoryColors.js';
import CategoryPill from './CategoryPill.jsx';
import CritiqueCard from './CritiqueCard.jsx';
import Modal from './Modal.jsx';

export default function Gallery({ tasks, uploads, onGoToTask }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  const taskById = useMemo(() => Object.fromEntries(tasks.map((t) => [t.id, t])), [tasks]);

  const allTags = useMemo(() => {
    const set = new Set();
    uploads.forEach((u) => (u.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [uploads]);

  const filtered = uploads.filter((u) => {
    const task = taskById[u.taskId];
    const label = task?.title || u.filename;
    if (query && !label.toLowerCase().includes(query.toLowerCase())) return false;
    if (categoryFilter !== 'all' && u.category !== categoryFilter) return false;
    if (tagFilter !== 'all' && !(u.tags || []).includes(tagFilter)) return false;
    return true;
  });

  const openUpload = openId ? uploads.find((u) => u.id === openId) : null;
  const openTask = openUpload ? taskById[openUpload.taskId] : null;

  return (
    <div className="gallery-page animate-in">
      <div className="gallery-toolbar">
        <input
          className="input gallery-search-input"
          placeholder="Search task or filename…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="gallery-filter-group">
          <button
            className={`chip ${categoryFilter === 'all' ? 'chip-active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All categories
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`chip ${categoryFilter === key ? 'chip-active' : ''}`}
              onClick={() => setCategoryFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="gallery-filter-group">
          <button
            className={`chip ${tagFilter === 'all' ? 'chip-active' : ''}`}
            onClick={() => setTagFilter('all')}
          >
            All tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`chip ${tagFilter === tag ? 'chip-active' : ''}`}
              onClick={() => setTagFilter(tag)}
            >
              #{tag.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="gallery-spacer" />
        <span className="gallery-count mono">
          {filtered.length} of {uploads.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No designs match.</div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((u) => {
            const task = taskById[u.taskId];
            const tintKey = tintKeyForTags(u.tags);
            return (
              <div className="gallery-card" key={u.id} onClick={() => setOpenId(u.id)}>
                <div className="gallery-thumb" style={{ background: categorySoftVar(tintKey) }}>
                  <img src={u.dataUrl} alt={u.filename} />
                </div>
                <div className="gallery-card-body">
                  <span className="gallery-card-title">{task?.title || u.filename}</span>
                  <div className="gallery-card-meta-row">
                    <CategoryPill tintKey={u.category} label={CATEGORY_LABELS[u.category] || u.category} />
                    <span className="gallery-spacer" />
                    <span className="gallery-card-score mono">
                      {u.critique ? `${u.critique.overall_score}/10` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openUpload && (
        <Modal title={openTask?.title || openUpload.filename} onClose={() => setOpenId(null)}>
          {openUpload.critique ? (
            <>
              <CritiqueCard critique={openUpload.critique} />
              {openTask && (
                <button
                  className="btn btn-primary modal-goto-task"
                  onClick={() => {
                    setOpenId(null);
                    onGoToTask(openTask.id);
                  }}
                >
                  Go to task
                </button>
              )}
            </>
          ) : (
            <div className="empty-state small">No critique recorded for this upload.</div>
          )}
        </Modal>
      )}
    </div>
  );
}
