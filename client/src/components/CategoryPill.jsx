import { categoryPillStyle } from '../lib/categoryColors.js';

export default function CategoryPill({ tintKey, label }) {
  return (
    <span className="cat-pill" style={categoryPillStyle(tintKey)}>
      {label}
    </span>
  );
}
