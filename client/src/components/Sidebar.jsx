import Icon from './Icon.jsx';

const NAV = [
  { key: 'Tasks', icon: 'tasks', label: 'Tasks' },
  { key: 'Dashboard', icon: 'dashboard', label: 'Dashboard' },
  { key: 'Upload', icon: 'upload', label: 'Upload' },
  { key: 'Gallery', icon: 'gallery', label: 'Gallery' },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-mark" title="Studio Tracker">
        ST
      </div>
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`sidebar-item ${active === item.key ? 'active' : ''}`}
            onClick={() => onSelect(item.key)}
            aria-label={item.label}
          >
            <Icon name={item.icon} />
            <span className="sidebar-tooltip">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
