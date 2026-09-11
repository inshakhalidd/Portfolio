import { useState } from 'react';
import { CATEGORY_LABELS, CLIENT_TAGS, detectCategory } from '../lib/taskTemplates.js';

export default function TaskInput({ onCreate }) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);

  const preview = title.trim() ? detectCategory(title) : null;

  function toggleTag(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onCreate(t, tags);
    setTitle('');
    setTags([]);
  }

  return (
    <form className="task-input" onSubmit={submit}>
      <label className="label">Task</label>
      <input
        className="input"
        placeholder='e.g. "make portfolio" or "design Instagram posts for GlowUp"'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      {preview && (
        <div className="preview-category">Detected: {CATEGORY_LABELS[preview]}</div>
      )}
      <div className="tag-picker">
        {CLIENT_TAGS.map((tag) => (
          <button
            type="button"
            key={tag}
            className={`chip ${tags.includes(tag) ? 'chip-active' : ''}`}
            onClick={() => toggleTag(tag)}
          >
            {tag.replace('_', ' ')}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" type="submit">
        Generate checklist
      </button>
    </form>
  );
}
