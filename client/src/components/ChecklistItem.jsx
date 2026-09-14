import { useState } from 'react';
import ResearchPanel from './ResearchPanel.jsx';
import WhitespacePanel from './WhitespacePanel.jsx';
import { SUBTASK_TYPE_DESCRIPTIONS } from '../lib/taskTemplates.js';

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
  const [showInfo, setShowInfo] = useState(false);

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

  const boxClass = subtask.done ? 'done' : locked ? 'locked' : '';

  return (
    <div className="step-row-wrap">
      <div className={`step-row ${open ? 'expanded' : ''} ${locked ? 'locked' : ''} ${subtask.done ? 'done' : ''}`}>
        <button
          type="button"
          className={`step-box ${boxClass}`}
          disabled={locked}
          onClick={handleToggle}
          title={locked ? 'Complete previous steps first' : ''}
        >
          {subtask.done ? '✓' : ''}
        </button>

        {isEditing ? (
          <input
            className="input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => onRename(titleDraft)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            autoFocus
          />
        ) : (
          <div className="step-body" onClick={() => hasPanel && setOpen(!open)}>
            <span className={`step-title ${subtask.done ? 'done' : ''}`}>{subtask.title}</span>
          </div>
        )}

        {locked && <span className="step-badge locked">locked</span>}
        {!locked && subtask.type === 'research' && <span className="step-badge">research</span>}
        {!locked && subtask.type === 'whitespace' && <span className="step-badge">whitespace</span>}
        <button
          type="button"
          className={`icon-btn step-info-toggle ${showInfo ? 'active' : ''}`}
          onClick={() => setShowInfo(!showInfo)}
          title="What is this step?"
        >
          ?
        </button>

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
          <button type="button" className="step-toggle-btn" onClick={() => setOpen(!open)}>
            {open ? 'Hide' : 'Open'}
          </button>
        )}
        <button className="icon-btn" onClick={onDelete} title="Delete subtask">
          ×
        </button>
      </div>

      {showInfo && (
        <div className="step-info">{subtask.description || SUBTASK_TYPE_DESCRIPTIONS[subtask.type]}</div>
      )}

      {blocked && !subtask.done && !locked && (
        <div className="hint-warning">Fill this in before checking it off.</div>
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
    </div>
  );
}
