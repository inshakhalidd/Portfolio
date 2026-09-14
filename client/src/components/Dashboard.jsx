import { weeklyCounts, weeklyAverages, lastChangePct } from '../lib/timeseries.js';

function sparklinePoints(values, max) {
  const safeMax = max > 0 ? max : 1;
  const n = values.length;
  if (n < 2) return '';
  return values
    .map((v, i) => {
      const x = (i / (n - 1)) * 100;
      const y = 30 - (Math.max(0, v) / safeMax) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function Sparkline({ values, max, colorVar }) {
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="stat-sparkline">
      <polyline
        points={sparklinePoints(values, max)}
        fill="none"
        stroke={`var(${colorVar})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TintStatCard({ bg, border, labelColor, label, value, values, max, colorVar, delta, deltaClass }) {
  return (
    <div className="stat-card-tint" style={{ background: `var(${bg})`, borderColor: `var(${border})` }}>
      <span className="stat-card-label" style={{ color: `var(${labelColor})` }}>
        {label}
      </span>
      <div className="stat-card-tint-row">
        <span className="stat-card-value">{value}</span>
        <Sparkline values={values} max={max} colorVar={colorVar} />
      </div>
      <span className={`stat-card-delta ${deltaClass}`}>{delta}</span>
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

  const createdBuckets = weeklyCounts(tasks.map((t) => new Date(t.createdAt)), 8);
  const completedBuckets = weeklyCounts(
    completed.map((t) => new Date(t.completedAt)).filter(Boolean),
    8
  );
  const ratingBuckets = weeklyAverages(
    rated.map((u) => ({ date: new Date(u.createdAt), value: u.critique.overall_score })),
    8
  );

  const createdChange = lastChangePct(createdBuckets, 'count');
  const completedChange = lastChangePct(completedBuckets, 'count');
  const ratingChange = lastChangePct(ratingBuckets, 'value');

  const totalSteps = tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
  const doneSteps = tasks.reduce((sum, t) => sum + t.subtasks.filter((s) => s.done).length, 0);
  const rate = totalSteps ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const weekMax = Math.max(1, ...completedBuckets.map((b) => b.count));

  function deltaText(pct) {
    if (pct === null) return 'no trend yet';
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs last week`;
  }
  function deltaClass(pct) {
    if (pct === null) return 'delta-neutral';
    return pct >= 0 ? 'delta-ok' : 'delta-warn';
  }

  return (
    <div className="dashboard animate-in">
      <div className="stat-row">
        <TintStatCard
          bg="--accentSoft"
          border="--accentLine"
          labelColor="--ink2"
          label="Active tasks"
          value={active.length}
          values={createdBuckets.map((b) => b.count)}
          max={Math.max(1, ...createdBuckets.map((b) => b.count))}
          colorVar="--accent"
          delta={deltaText(createdChange)}
          deltaClass={deltaClass(createdChange)}
        />
        <TintStatCard
          bg="--greenSoft"
          border="--line"
          labelColor="--ink2"
          label="Completed tasks"
          value={completed.length}
          values={completedBuckets.map((b) => b.count)}
          max={weekMax}
          colorVar="--green"
          delta={deltaText(completedChange)}
          deltaClass={deltaClass(completedChange)}
        />
        <TintStatCard
          bg="--lavSoft"
          border="--line"
          labelColor="--ink2"
          label="Avg. design rating"
          value={avgRating !== null ? avgRating.toFixed(1) : '—'}
          values={ratingBuckets.map((b) => b.value ?? 0)}
          max={10}
          colorVar="--lav"
          delta={deltaText(ratingChange)}
          deltaClass={deltaClass(ratingChange)}
        />
      </div>

      <div className="chart-row">
        <div className="panel-card chart-panel">
          <div className="chart-panel-title-row">
            <span className="panel-card-header-title">Weekly completions</span>
            <span className="chart-panel-sub">last {completedBuckets.length} weeks</span>
          </div>
          <div className="bar-chart">
            {completedBuckets.map((b, i) => (
              <div className="bar-chart-col" key={i}>
                <span className="bar-chart-value mono">{b.count}</span>
                <div
                  className={`bar-chart-bar ${i === completedBuckets.length - 1 ? 'current' : ''}`}
                  style={{ height: `${Math.max(2, (b.count / weekMax) * 130)}px` }}
                />
                <span className="bar-chart-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card chart-panel">
          <span className="panel-card-header-title">Completion rate</span>
          <div className="donut-row">
            <div
              className="donut-circle"
              style={{
                background: `conic-gradient(var(--accent) 0 ${rate}%, var(--line2) ${rate}% 100%)`,
              }}
            >
              <div className="donut-center">
                <span className="donut-value">{rate}%</span>
              </div>
            </div>
            <div className="donut-legend">
              <div className="donut-legend-row">
                <span className="donut-legend-dot" style={{ background: 'var(--accent)' }} />
                <span className="donut-legend-label">Steps cleared</span>
                <span className="donut-legend-value mono">{doneSteps}</span>
              </div>
              <div className="donut-legend-row">
                <span
                  className="donut-legend-dot"
                  style={{ background: 'var(--line2)', border: '1px solid var(--line)' }}
                />
                <span className="donut-legend-label">Steps remaining</span>
                <span className="donut-legend-value mono">{totalSteps - doneSteps}</span>
              </div>
              <div className="donut-legend-row">
                <span className="donut-legend-dot" style={{ background: 'var(--ok)' }} />
                <span className="donut-legend-label">Tasks finished</span>
                <span className="donut-legend-value mono">
                  {completed.length}/{tasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
