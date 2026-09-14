const NAV = [
  { key: 'Home', label: 'Home' },
  { key: 'Tasks', label: 'Tasks' },
  { key: 'Research', label: 'Research' },
  { key: 'Dashboard', label: 'Dashboard' },
  { key: 'Upload', label: 'Upload' },
  { key: 'Gallery', label: 'Gallery' },
];

export default function Sidebar({ active, onSelect, activeTaskCount, galleryCount, completionRate, onSignOut }) {
  const counts = {
    Tasks: activeTaskCount,
    Gallery: galleryCount,
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-mark-row">
        <div className="sidebar-mark">S</div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">Studio Tracker</span>
          <span className="sidebar-brand-sub">Design workspace</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => {
          const on = active === item.key;
          const count = counts[item.key];
          return (
            <button
              key={item.key}
              className={`sidebar-item ${on ? 'active' : ''}`}
              onClick={() => onSelect(item.key)}
            >
              <span className="sidebar-item-dot" />
              <span className="sidebar-item-label">{item.label}</span>
              {count !== undefined && <span className="sidebar-item-count">{count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-week">
        <div className="sidebar-week-title">This week</div>
        <div className="sidebar-week-body">
          <div className="sidebar-week-toprow">
            <span>Completion rate</span>
            <span className="mono">{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
        <button type="button" className="panel-link-btn sidebar-signout" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
