import { useMemo, useState } from 'react';
import { CATEGORY_LABELS } from '../lib/taskTemplates.js';

export default function Gallery({ tasks, uploads }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');

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

  return (
    <div className="gallery">
      <div className="gallery-controls">
        <input
          className="input"
          placeholder="Search by task or filename..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select className="select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
          <option value="all">All tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No designs match.</div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((u) => {
            const task = taskById[u.taskId];
            return (
              <div className="gallery-card" key={u.id}>
                <img src={u.dataUrl} alt={u.filename} />
                <div className="gallery-card-body">
                  <div className="gallery-card-title">{task?.title || u.filename}</div>
                  <div className="task-meta">
                    <span className="badge">{CATEGORY_LABELS[u.category] || u.category}</span>
                    {(u.tags || []).map((tag) => (
                      <span className="badge" key={tag}>
                        {tag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  {u.critique && (
                    <div className="gallery-card-score">{u.critique.overall_score}/10</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
