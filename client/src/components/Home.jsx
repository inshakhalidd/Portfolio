import { CATEGORY_LABELS } from '../lib/taskTemplates.js';
import { weeklyCounts, lastChangePct } from '../lib/timeseries.js';
import CategoryPill from './CategoryPill.jsx';

function progressOf(task) {
  if (!task.subtasks.length) return 0;
  return Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100);
}

export default function Home({ tasks, uploads, onOpenTask, onGoTasks, onNewMoodboard, onAddTask, onGoUpload }) {
  const active = tasks.filter((t) => !t.completedAt);
  const completed = tasks.filter((t) => t.completedAt);
  const rated = uploads.filter((u) => u.critique);
  const avgRating = rated.length
    ? rated.reduce((sum, u) => sum + (u.critique.overall_score || 0), 0) / rated.length
    : null;

  const totalSteps = tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
  const doneSteps = tasks.reduce((sum, t) => sum + t.subtasks.filter((s) => s.done).length, 0);
  const rate = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const completedBuckets = weeklyCounts(
    completed.map((t) => new Date(t.completedAt)).filter(Boolean)
  );
  const completedChange = lastChangePct(completedBuckets, 'count');

  const recentActive = active.slice(0, 4);
  const latestUpload = uploads[0];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-card-label">Active tasks</span>
          <span className="stat-card-value">{active.length}</span>
          <span className="stat-card-delta delta-neutral">of {tasks.length} total</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Completed</span>
          <span className="stat-card-value">{completed.length}</span>
          <span className={`stat-card-delta ${completedChange !== null && completedChange >= 0 ? 'delta-ok' : 'delta-neutral'}`}>
            {completedChange === null ? 'no trend yet' : `${completedChange >= 0 ? '+' : ''}${completedChange.toFixed(0)}% vs last week`}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Steps cleared</span>
          <span className="stat-card-value">
            {doneSteps}/{totalSteps}
          </span>
          <span className="stat-card-delta delta-neutral">{rate}% completion rate</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Avg. rating</span>
          <span className="stat-card-value">{avgRating !== null ? avgRating.toFixed(1) : '—'}</span>
          <span className="stat-card-delta delta-neutral">
            {rated.length ? `across ${rated.length} upload${rated.length > 1 ? 's' : ''}` : 'no uploads yet'}
          </span>
        </div>
      </div>

      <div className="home-columns">
        <div className="panel-card">
          <div className="panel-card-header">
            <span className="panel-card-header-title">In progress</span>
            <span style={{ flex: 1 }} />
            <button className="panel-link-btn" onClick={onGoTasks}>
              All tasks
            </button>
          </div>
          {recentActive.length === 0 && (
            <div className="empty-state small">Nothing in progress — add a task to get started.</div>
          )}
          {recentActive.map((t) => {
            const pct = progressOf(t);
            const doneCount = t.subtasks.filter((s) => s.done).length;
            return (
              <div className="task-row" key={t.id} onClick={() => onOpenTask(t.id)}>
                <div className="task-row-top">
                  <span className="task-row-title">{t.title}</span>
                  <CategoryPill tintKey={t.category} label={CATEGORY_LABELS[t.category]} />
                </div>
                <div className="task-row-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="task-row-steplabel mono">
                    {doneCount}/{t.subtasks.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="home-side">
          <div className="home-cta-card">
            <span className="home-cta-title">Start with research</span>
            <span className="home-cta-text">
              Build a moodboard first — palette, keywords and references — then spin it into a
              task with the checklist pre-filled.
            </span>
            <div className="home-cta-actions">
              <button className="btn btn-primary" onClick={onNewMoodboard}>
                New moodboard
              </button>
              <button className="btn" onClick={onAddTask}>
                Add task
              </button>
            </div>
          </div>

          <div className="home-critique-card">
            <span className="home-critique-label">Latest critique</span>
            {latestUpload?.critique ? (
              <div className="home-critique-row">
                <div className="home-critique-score mono">{latestUpload.critique.overall_score}</div>
                <div className="home-critique-meta">
                  <span className="home-critique-meta-title">{latestUpload.filename}</span>
                  <span className="home-critique-meta-note">
                    {latestUpload.critique.pros?.[0] || latestUpload.critique.summary}
                  </span>
                </div>
              </div>
            ) : (
              <span className="home-critique-meta-note">No designs rated yet.</span>
            )}
            <button className="btn" onClick={onGoUpload}>
              Upload a new design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
