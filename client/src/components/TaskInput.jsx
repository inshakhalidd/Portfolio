import { useEffect, useState } from 'react';
import { CATEGORIES, CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, CLIENT_TAGS, detectCategory } from '../lib/taskTemplates.js';

export default function TaskInput({ onCreate }) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState(CATEGORIES.GENERAL);
  const [categoryTouched, setCategoryTouched] = useState(false);

  useEffect(() => {
    if (!categoryTouched && title.trim()) {
      setCategory(detectCategory(title));
    }
  }, [title, categoryTouched]);

  function toggleTag(tag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onCreate(t, tags, category);
    setTitle('');
    setTags([]);
    setCategory(CATEGORIES.GENERAL);
    setCategoryTouched(false);
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

      <label className="label">Category</label>
      <select
        className="select"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setCategoryTouched(true);
        }}
      >
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <div className="preview-category">{CATEGORY_DESCRIPTIONS[category]}</div>

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
