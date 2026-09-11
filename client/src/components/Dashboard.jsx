import { CATEGORY_LABELS } from '../lib/taskTemplates.js';
import { weeklyCounts, weeklyAverages, lastChangePct } from '../lib/timeseries.js';
import Icon from './Icon.jsx';

function taskProgress(task) {
  if (!task.subtasks.length) return 0;
  return Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100);
}

function Sparkline({ data, max, tint }) {
  const safeMax = max > 0 ? max : 1;
  return (
    <div className={`sparkline sparkline-${tint}`}>
      {data.map((d, i) => (
        <div
          key={i}
          className="sparkline-bar"
          style={{ height: `${Math.max(6, ((d.count ?? d.value ?? 0) / safeMax) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function ChangeBadge({ pct }) {
  if (pct === null) return <span className="change-badge neutral">—</span>;
  const up = pct >= 0;
  return (
    <span className={`change-badge ${up ? 'up' : 'down'}`}>
      {up ? '+' : ''}
      {pct.toFixed(0)}%
    </span>
  );
}

function StatCard({ tint, label, value, sparklineData, sparklineMax, changePct }) {
  return (
    <div className={`stat-card stat-card-${tint}`}>
      <div className="stat-card-top">
        <span className={`stat-card-label label-${tint}`}>{label}</span>
        <ChangeBadge pct={changePct} />
      </div>
      <div className="stat-card-value">{value}</div>
      <Sparkline data={sparklineData} max={sparklineMax} tint={tint} />
    </div>
  );
}

function WeeklyBarChart({ buckets }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="chart-card">
      <div className="chart-card-title">Weekly completions</div>
      <div className="bar-chart">
        {buckets.map((b, i) => (
          <div className="bar-chart-col" key={i}>
            <div className="bar-chart-track">
              <div
                className="bar-chart-fill"
                style={{ height: `${Math.max(3, (b.count / max) * 100)}%` }}
                title={`${b.count} completed`}
              />
            </div>
            <div className="bar-chart-label">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ pct, label, sublabel }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="chart-card donut-card">
      <div className="chart-card-title">Completion rate</div>
      <div className="donut-wrap">
        <svg width="140" height="140" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--donut-track)" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--accent-purple)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="donut-center">
          <div className="donut-value">{pct.toFixed(0)}%</div>
          <div className="donut-label">{sublabel}</div>
        </div>
      </div>
      <div className="chart-card-title" style={{ marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export default function Dashboard({ tasks, uploads }) {
  const completed = tasks.filter((t) => t.completedAt);
  const active = tasks.filter((t) => !t.completedAt);
  const rated = uploads.filter((u) => u.critique);
  const avgRating = rated.length
    ? rated.reduce((sum, u) => sum + (u.critique.overall_score || 0), 0) / rated.length
    : null;

  const createdBuckets = weeklyCounts(tasks.map((t) => new Date(t.createdAt)));
  const completedBuckets = weeklyCounts(
    completed.map((t) => new Date(t.completedAt)).filter(Boolean)
  );
  const ratingBuckets = weeklyAverages(
    rated.map((u) => ({ date: new Date(u.createdAt), value: u.critique.overall_score }))
  );

  const createdChange = lastChangePct(createdBuckets, 'count');
  const completedChange = lastChangePct(completedBuckets, 'count');
  const ratingChange = lastChangePct(ratingBuckets, 'value');

  const completionRate = tasks.length ? (completed.length / tasks.length) * 100 : 0;

  const recentUploads = [...uploads].slice(0, 6);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stat-row">
        <StatCard
          tint="blue"
          label="Active tasks"
          value={active.length}
          sparklineData={createdBuckets}
          sparklineMax={Math.max(1, ...createdBuckets.map((b) => b.count))}
          changePct={createdChange}
        />
        <StatCard
          tint="pink"
          label="Completed tasks"
          value={completed.length}
          sparklineData={completedBuckets}
          sparklineMax={Math.max(1, ...completedBuckets.map((b) => b.count))}
          changePct={completedChange}
        />
        <StatCard
          tint="purple"
          label="Avg. rating"
          value={avgRating !== null ? avgRating.toFixed(1) : '—'}
          sparklineData={ratingBuckets}
          sparklineMax={10}
          changePct={ratingChange}
        />
      </div>

      <div className="chart-row">
        <WeeklyBarChart buckets={completedBuckets} />
        <DonutChart
          pct={completionRate}
          label="Completed vs. total tasks"
          sublabel={`${completed.length}/${tasks.length || 0}`}
        />
      </div>

      <div className="dashboard-columns">
        <div>
          <div className="section-title">
            <Icon name="tasks" size={16} /> Active tasks
          </div>
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
          <div className="section-title">
            <Icon name="gallery" size={16} /> Recent uploads
          </div>
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
