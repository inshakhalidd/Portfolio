const CHECK_LABELS = {
  margins: ['Outer margins equal on all sides', 'Nothing sits closer than 5% of the shortest edge.'],
  breathingRoom: ['Breathing room around the focal element', 'Nothing feels cramped or crowded.'],
  grouping: ['Related items closer than unrelated ones', 'Proximity does the grouping, not boxes.'],
};

export default function WhitespacePanel({ data, onChange }) {
  const allChecked = Object.values(data.checks).every(Boolean);

  function toggleCheck(key) {
    const checks = { ...data.checks, [key]: !data.checks[key] };
    const stillAllChecked = Object.values(checks).every(Boolean);
    onChange({ ...data, checks, confirmed: stillAllChecked ? data.confirmed : false });
  }

  function confirm() {
    onChange({ ...data, confirmed: true });
  }

  return (
    <div className="subpanel">
      <p className="whitespace-intro">
        Before you call it finished, check the spacing decisions one by one.
      </p>
      <div className="whitespace-grid">
        {Object.entries(CHECK_LABELS).map(([key, [title, note]]) => {
          const on = data.checks[key];
          return (
            <div className="whitespace-card" key={key} onClick={() => toggleCheck(key)}>
              <button type="button" className={`step-box ${on ? 'done' : ''}`}>
                {on ? '✓' : ''}
              </button>
              <div className="whitespace-card-body">
                <span className={`whitespace-card-title ${on ? 'done' : ''}`}>{title}</span>
                <span className="whitespace-card-note">{note}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="whitespace-progress-row">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.round(
                (Object.values(data.checks).filter(Boolean).length / 3) * 100
              )}%`,
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink3)' }}>
          {Object.values(data.checks).filter(Boolean).length}/3
        </span>
      </div>
      {!data.confirmed ? (
        <button
          type="button"
          className="btn btn-primary"
          disabled={!allChecked}
          onClick={confirm}
          style={{ marginTop: 12 }}
        >
          Confirm whitespace pass
        </button>
      ) : (
        <div className="confirmed-badge" style={{ marginTop: 12 }}>
          Whitespace confirmed ✓
        </div>
      )}
      {!allChecked && (
        <div className="hint-warning" style={{ margin: '8px 0 0' }}>
          Check all three before confirming.
        </div>
      )}
    </div>
  );
}
