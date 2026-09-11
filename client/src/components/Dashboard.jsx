import { CATEGORY_LABELS } from '../lib/taskTemplates.js';

function taskProgress(task) {
  if (!task.subtasks.length) return 0;
  return Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100);
}

export default function Dashboard({ tasks, uploads }) {
  const completed = tasks.filter((t) => t.completedAt);
  const active = tasks.filter((t) => !t.completedAt);
  const rated = uploads.filter((u) => u.critique);
  const avgRating = rated.length
    ? (rated.reduce((sum, u) => sum + (u.critique.overall_score || 0), 0) / rated.length).toFixed(1)
    : null;

  const recentUploads = [...uploads].slice(0, 6);

  // simple trend: chronological (oldest first) list of ratings
  const trend = [...rated]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((u) => u.critique.overall_score);

  return (
    <div className="dashboard">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completed.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{active.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgRating ?? '—'}</div>
          <div className="stat-label">Avg. rating</div>
        </div>
      </div>

      {trend.length > 1 && (
        <div className="trend-row">
          <div className="subpanel-title">Rating trend</div>
          <div className="sparkline">
            {trend.map((score, i) => (
              <div
                key={i}
                className="sparkline-bar"
                style={{ height: `${(score / 10) * 100}%` }}
                title={`${score}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-columns">
        <div>
          <div className="subpanel-title">Active tasks</div>
          {active.length === 0 && <div className="empty-state small">Nothing active.</div>}
          <ul className="dashboard-task-list">
            {active.map((t) => (
              <li key={t.id}>
                <div className="task-list-item-row">
                  <span>{t.title}</span>
                  <span className="badge">{CATEGORY_LABELS[t.category]}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${taskProgress(t)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="subpanel-title">Recent uploads</div>
          {recentUploads.length === 0 && (
            <div className="empty-state small">No uploads yet.</div>
          )}
          <div className="recent-uploads-grid">
            {recentUploads.map((u) => (
              <div className="recent-upload-card" key={u.id}>
                <img src={u.dataUrl} alt={u.filename} />
                <div className="recent-upload-meta">
                  {u.critique ? (
                    <span className="badge badge-done">{u.critique.overall_score}/10</span>
                  ) : (
                    <span className="badge">unrated</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
