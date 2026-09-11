import { CATEGORY_LABELS } from '../lib/taskTemplates.js';

function progressOf(task) {
  if (!task.subtasks.length) return 0;
  return Math.round((task.subtasks.filter((s) => s.done).length / task.subtasks.length) * 100);
}

export default function TaskList({ tasks, selectedId, onSelect, onDelete }) {
  if (!tasks.length) {
    return <div className="empty-state small">No tasks yet.</div>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const pct = progressOf(task);
        return (
          <li
            key={task.id}
            className={`task-list-item ${selectedId === task.id ? 'active' : ''}`}
            onClick={() => onSelect(task.id)}
          >
            <div className="task-list-item-row">
              <span className="task-title">{task.title}</span>
              <button
                className="icon-btn"
                title="Delete task"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${task.title}"?`)) onDelete(task.id);
                }}
              >
                ×
              </button>
            </div>
            <div className="task-meta">
              <span className="badge">{CATEGORY_LABELS[task.category]}</span>
              {task.completedAt && <span className="badge badge-done">done</span>}
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
