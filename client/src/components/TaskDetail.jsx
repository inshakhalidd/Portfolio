import { useState } from 'react';
import ChecklistItem from './ChecklistItem.jsx';
import { CATEGORY_LABELS, newSubtask } from '../lib/taskTemplates.js';

export default function TaskDetail({ task, onUpdate }) {
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('standard');
  const [editingId, setEditingId] = useState(null);

  const doneCount = task.subtasks.filter((s) => s.done).length;
  const pct = task.subtasks.length ? Math.round((doneCount / task.subtasks.length) * 100) : 0;

  function setSubtasks(nextSubtasks) {
    onUpdate(task.id, { subtasks: nextSubtasks });
  }

  function toggleSubtask(id, done) {
    setSubtasks(task.subtasks.map((s) => (s.id === id ? { ...s, done } : s)));
  }

  function updateSubtaskData(id, dataOrFn) {
    setSubtasks(
      task.subtasks.map((s) => {
        if (s.id !== id) return s;
        const nextData = typeof dataOrFn === 'function' ? dataOrFn(s.data) : dataOrFn;
        return { ...s, data: nextData };
      })
    );
  }

  function renameSubtask(id, title) {
    const t = title.trim();
    setEditingId(null);
    if (!t) return;
    setSubtasks(task.subtasks.map((s) => (s.id === id ? { ...s, title: t } : s)));
  }

  function deleteSubtask(id) {
    setSubtasks(task.subtasks.filter((s) => s.id !== id));
  }

  function moveSubtask(id, dir) {
    const idx = task.subtasks.findIndex((s) => s.id === id);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= task.subtasks.length) return;
    const next = [...task.subtasks];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setSubtasks(next);
  }

  function addSubtask(e) {
    e.preventDefault();
    const t = newTitle.trim();
    if (!t) return;
    setSubtasks([...task.subtasks, newSubtask(t, newType)]);
    setNewTitle('');
    setNewType('standard');
  }

  return (
    <div className="task-detail">
      <div className="task-detail-header">
        <h2>{task.title}</h2>
        <div className="task-meta">
          <span className="badge">{CATEGORY_LABELS[task.category]}</span>
          {task.tags?.map((tag) => (
            <span className="badge" key={tag}>
              {tag.replace('_', ' ')}
            </span>
          ))}
          {task.completedAt && <span className="badge badge-done">completed</span>}
        </div>
        <div className="progress-bar large">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-label">
          {doneCount} / {task.subtasks.length} steps done
        </div>
      </div>

      <ul className="checklist">
        {task.subtasks.map((subtask, idx) => {
          const previousAllDone = task.subtasks.slice(0, idx).every((s) => s.done);
          const locked = !subtask.done && !previousAllDone;
          return (
            <ChecklistItem
              key={subtask.id}
              subtask={subtask}
              index={idx}
              locked={locked}
              isEditing={editingId === subtask.id}
              onToggle={(done) => toggleSubtask(subtask.id, done)}
              onDataChange={(d) => updateSubtaskData(subtask.id, d)}
              onRename={(title) => renameSubtask(subtask.id, title)}
              onDelete={() => deleteSubtask(subtask.id)}
              onMove={(dir) => moveSubtask(subtask.id, dir)}
              canMoveUp={idx > 0}
              canMoveDown={idx < task.subtasks.length - 1}
            />
          );
        })}
      </ul>

      <form className="add-subtask-form" onSubmit={addSubtask}>
        <input
          className="input"
          placeholder="Add a subtask..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <select className="select" value={newType} onChange={(e) => setNewType(e.target.value)}>
          <option value="standard">Standard</option>
          <option value="research">Research</option>
          <option value="whitespace">Whitespace</option>
        </select>
        <button className="btn" type="submit">
          Add
        </button>
      </form>
    </div>
  );
}
