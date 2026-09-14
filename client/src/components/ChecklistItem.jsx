import { useState } from 'react';
import ResearchPanel from './ResearchPanel.jsx';
import WhitespacePanel from './WhitespacePanel.jsx';

function canComplete(subtask) {
  if (subtask.type === 'research') {
    const d = subtask.data;
    return Boolean(d.notes.trim() || d.links.length > 0 || d.images.length > 0);
  }
  if (subtask.type === 'whitespace') {
    return Boolean(subtask.data.confirmed);
  }
  return true;
}

export default function ChecklistItem({
  subtask,
  index,
  locked,
  isEditing,
  onToggle,
  onDataChange,
  onRename,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
  taskTitle,
  taskCategory,
  taskTags,
}) {
  const [open, setOpen] = useState(subtask.type !== 'standard' && !subtask.done);
  const [titleDraft, setTitleDraft] = useState(subtask.title);

  const hasPanel = subtask.type === 'research' || subtask.type === 'whitespace';
  const blocked = locked || (!subtask.done && !canComplete(subtask));

  function handleToggle() {
    if (locked) return;
    if (!subtask.done && !canComplete(subtask)) {
      setOpen(true);
      return;
    }
    onToggle(!subtask.done);
  }

  return (
    <li className={`checklist-item ${subtask.done ? 'done' : ''} ${locked ? 'locked' : ''}`}>
      <div className="checklist-item-row">
        <input
          type="checkbox"
          checked={subtask.done}
          disabled={locked}
          onChange={handleToggle}
          title={locked ? 'Complete previous steps first' : ''}
        />
        {isEditing ? (
          <input
            className="input inline-edit"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => onRename(titleDraft)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            autoFocus
          />
        ) : (
          <span className="checklist-item-title" onClick={() => hasPanel && setOpen(!open)}>
            {subtask.title}
            {subtask.type === 'research' && <span className="type-tag">research</span>}
            {subtask.type === 'whitespace' && <span className="type-tag">whitespace</span>}
          </span>
        )}

        <div className="checklist-item-actions">
          {canMoveUp && (
            <button className="icon-btn" onClick={() => onMove(-1)} title="Move up">
              ↑
            </button>
          )}
          {canMoveDown && (
            <button className="icon-btn" onClick={() => onMove(1)} title="Move down">
              ↓
            </button>
          )}
          {hasPanel && (
            <button className="icon-btn" onClick={() => setOpen(!open)} title="Toggle detail">
              {open ? '▾' : '▸'}
            </button>
          )}
          <button className="icon-btn" onClick={onDelete} title="Delete subtask">
            ×
          </button>
        </div>
      </div>

      {blocked && !subtask.done && !locked && (
        <div className="hint-warning inline">Fill this in before checking it off.</div>
      )}

      {open && subtask.type === 'research' && (
        <ResearchPanel
          data={subtask.data}
          onChange={onDataChange}
          taskTitle={taskTitle}
          category={taskCategory}
          tags={taskTags}
        />
      )}
      {open && subtask.type === 'whitespace' && (
        <WhitespacePanel data={subtask.data} onChange={onDataChange} />
      )}
    </li>
  );
}
