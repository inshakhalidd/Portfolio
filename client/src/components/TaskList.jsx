import { CATEGORY_LABELS } from '../lib/taskTemplates.js';
import CategoryPill from './CategoryPill.jsx';

function progressOf(task) {
  if (!task.subtasks.length) return 0;
  return Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100);
}

export default function TaskList({ tasks, selectedId, onSelect, onDelete, search, onSearchChange }) {
  return (
    <>
      <div className="task-search-wrap">
        <input
          className="input"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="task-list-scroll">
        {tasks.length === 0 && (
          <div className="empty-state small">No tasks match that search.</div>
        )}
        {tasks.map((task) => {
          const pct = progressOf(task);
          return (
            <div
              key={task.id}
              className={`task-list-row ${selectedId === task.id ? 'active' : ''}`}
              onClick={() => onSelect(task.id)}
            >
              <div className="task-list-row-top">
                <span className="task-list-row-title">{task.title}</span>
                <span className="task-list-row-pct mono">{pct}%</span>
              </div>
              <div className="task-list-row-top">
                <CategoryPill tintKey={task.category} label={CATEGORY_LABELS[task.category]} />
                {task.completedAt && <span className="badge badge-done">done</span>}
                <span style={{ flex: 1 }} />
                <button
                  className="icon-btn task-list-delete"
                  title="Delete task"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${task.title}"?`)) onDelete(task.id);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
