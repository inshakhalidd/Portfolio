const PAGE_META = {
  Home: { sub: 'Your studio at a glance' },
  Tasks: { sub: 'Steps unlock in order' },
  Research: { sub: 'Moodboard builder' },
  Dashboard: { sub: 'Last 8 weeks' },
  Upload: { sub: 'Get a structured critique' },
  Gallery: { sub: 'Every design you have uploaded' },
};

function greetingTitle() {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `${part}, Insha`;
}

export default function TopBar({ tab, theme, onToggleTheme, onAddTask }) {
  const title = tab === 'Home' ? greetingTitle() : tab;
  const sub = PAGE_META[tab]?.sub || '';

  return (
    <header className="header">
      <div className="header-titles">
        <h1 className="header-title">{title}</h1>
        <span className="header-sub">{sub}</span>
      </div>
      <div className="header-spacer" />
      <button className="theme-toggle" onClick={onToggleTheme}>
        <span className="theme-toggle-knob" />
        <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
      </button>
      <button className="btn btn-primary" onClick={onAddTask}>
        Add task
      </button>
    </header>
  );
}
