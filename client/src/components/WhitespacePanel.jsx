const CHECK_LABELS = {
  margins: 'Margins are consistent and intentional',
  breathingRoom: 'Elements have breathing room — nothing feels cramped',
  grouping: 'Related elements are grouped; unrelated elements are separated',
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
    <div className="subpanel whitespace-panel">
      <div className="subpanel-title">Whitespace check</div>
      <ul className="whitespace-checks">
        {Object.entries(CHECK_LABELS).map(([key, label]) => (
          <li key={key}>
            <label className="check-row">
              <input
                type="checkbox"
                checked={data.checks[key]}
                onChange={() => toggleCheck(key)}
              />
              {label}
            </label>
          </li>
        ))}
      </ul>
      {!data.confirmed ? (
        <button
          type="button"
          className="btn btn-primary"
          disabled={!allChecked}
          onClick={confirm}
        >
          Confirm whitespace pass
        </button>
      ) : (
        <div className="confirmed-badge">Whitespace confirmed ✓</div>
      )}
      {!allChecked && (
        <div className="hint-warning">Check all three before confirming.</div>
      )}
    </div>
  );
}
