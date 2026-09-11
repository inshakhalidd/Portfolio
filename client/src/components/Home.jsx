import { CATEGORY_LABELS } from '../lib/taskTemplates.js';
import { weeklyCounts, weeklyAverages, lastChangePct } from '../lib/timeseries.js';
import { tintForTags } from '../lib/tagTint.js';
import Icon from './Icon.jsx';

const USER_NAME = 'Insha';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ tint, label, value, subtext }) {
  return (
    <div className={`stat-card stat-card-${tint}`}>
      <div className={`stat-card-label label-${tint}`}>{label}</div>
      <div className="stat-card-value">{value}</div>
      <div className={`stat-card-subtext subtext-${tint}`}>{subtext}</div>
    </div>
  );
}

export default function Home({ tasks, uploads, onOpenTask, onViewGallery }) {
  const active = tasks.filter((t) => !t.completedAt);
  const completed = tasks.filter((t) => t.completedAt);
  const rated = uploads.filter((u) => u.critique);
  const avgRating = rated.length
    ? rated.reduce((sum, u) => sum + (u.critique.overall_score || 0), 0) / rated.length
    : null;

  const createdBuckets = weeklyCounts(tasks.map((t) => new Date(t.createdAt)));
  const createdThisWeek = createdBuckets[createdBuckets.length - 1]?.count ?? 0;
  const percentDone = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  const ratingBuckets = weeklyAverages(
    rated.map((u) => ({ date: new Date(u.createdAt), value: u.critique.overall_score }))
  );
  const ratingChange = lastChangePct(ratingBuckets, 'value');
  const ratingDelta =
    ratingBuckets.length >= 2 &&
    ratingBuckets[ratingBuckets.length - 1].value !== null &&
    ratingBuckets[ratingBuckets.length - 2].value !== null
      ? ratingBuckets[ratingBuckets.length - 1].value - ratingBuckets[ratingBuckets.length - 2].value
      : null;

  const featuredTask = active[0] || null;
  const previewSubtasks = featuredTask ? featuredTask.subtasks.slice(0, 4) : [];
  const firstIncompleteIdx = previewSubtasks.findIndex((s) => !s.done);

  const recentUploads = uploads.slice(0, 3);

  return (
    <div className="home">
      <div className="home-header">
        <h1 className="page-title home-greeting">
          {greeting()}, {USER_NAME}
        </h1>
      </div>

      <div className="stat-row">
        <StatCard
          tint="blue"
          label="Total tasks"
          value={tasks.length}
          subtext={`+${createdThisWeek} this week`}
        />
        <StatCard
          tint="pink"
          label="Completed"
          value={completed.length}
          subtext={`${percentDone}% done`}
        />
        <StatCard
          tint="purple"
          label="Avg rating"
          value={avgRating !== null ? avgRating.toFixed(1) : '—'}
          subtext={
            ratingDelta === null
              ? 'no trend yet'
              : `${ratingDelta >= 0 ? '+' : ''}${ratingDelta.toFixed(1)} vs last`
          }
        />
      </div>

      {featuredTask ? (
        <div className="active-task-card">
          <div className="active-task-card-title">
            Active task — {CATEGORY_LABELS[featuredTask.category]}
          </div>
          <ul className="active-task-preview">
            {previewSubtasks.map((s, idx) => {
              const isDone = s.done;
              const isCurrent = idx === firstIncompleteIdx;
              const isUpcoming = !isDone && !isCurrent;
              return (
                <li
                  key={s.id}
                  className={`active-task-row ${isUpcoming ? 'upcoming' : ''}`}
                  onClick={() => onOpenTask(featuredTask.id)}
                >
                  <span>{s.title}</span>
                  {isDone && <Icon name="tasks" size={16} className="active-task-check" />}
                  {isCurrent && <span className="badge in-progress-pill">In progress</span>}
                  {isUpcoming && <span className="active-task-empty-box" />}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="empty-state">No active tasks — add one to see it here.</div>
      )}

      <div className="home-recent">
        <div className="section-title">Recent work</div>
        <div className="home-recent-grid">
          {recentUploads.map((u) => {
            const tint = tintForTags(u.tags);
            return (
              <div className="recent-work-card" key={u.id}>
                <div className={`recent-work-thumb tint-${tint}`}>
                  <img src={u.dataUrl} alt={u.filename} />
                </div>
                <div className="recent-work-body">
                  <div className="recent-work-name">{u.filename}</div>
                  {u.tags?.[0] && (
                    <span className={`badge tag-pill tint-${tint}`}>
                      {u.tags[0].replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <button className="recent-work-viewall" onClick={onViewGallery}>
            View all →
          </button>
        </div>
      </div>
    </div>
  );
}
