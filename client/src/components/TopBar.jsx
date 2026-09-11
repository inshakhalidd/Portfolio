import Icon from './Icon.jsx';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function TopBar({ search, onSearchChange, onAddTask }) {
  return (
    <header className="topbar">
      <div className="topbar-date">{dateFormatter.format(new Date())}</div>

      <div className="topbar-search">
        <Icon name="search" size={16} />
        <input
          className="topbar-search-input"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <button className="icon-round-btn" aria-label="Notifications" title="Notifications">
        <Icon name="bell" size={18} />
      </button>

      <button className="btn btn-primary add-task-btn" onClick={onAddTask}>
        <Icon name="plus" size={16} />
        Add Task
      </button>
    </header>
  );
}
