import { useState } from 'react';

export default function ResearchPanel({ data, onChange }) {
  const [linkDraft, setLinkDraft] = useState('');

  function addLink() {
    const url = linkDraft.trim();
    if (!url) return;
    onChange({ ...data, links: [...data.links, url] });
    setLinkDraft('');
  }

  function removeLink(idx) {
    onChange({ ...data, links: data.links.filter((_, i) => i !== idx) });
  }

  function onImageFiles(files) {
    const remaining = 5 - data.images.length;
    const picked = Array.from(files).slice(0, Math.max(0, remaining));
    picked.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        onChange((prevData) => ({ ...prevData, images: [...prevData.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(idx) {
    onChange({ ...data, images: data.images.filter((_, i) => i !== idx) });
  }

  const hasContent = data.notes.trim() || data.links.length > 0 || data.images.length > 0;

  return (
    <div className="subpanel research-panel">
      <div className="subpanel-title">Research</div>

      <label className="label small">Reference links</label>
      <div className="link-row">
        <input
          className="input"
          placeholder="https://..."
          value={linkDraft}
          onChange={(e) => setLinkDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
        />
        <button type="button" className="btn" onClick={addLink}>
          Add
        </button>
      </div>
      {data.links.length > 0 && (
        <ul className="link-list">
          {data.links.map((link, idx) => (
            <li key={idx}>
              <a href={link} target="_blank" rel="noreferrer">
                {link}
              </a>
              <button className="icon-btn" onClick={() => removeLink(idx)}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="label small">Notes</label>
      <textarea
        className="textarea"
        rows={3}
        placeholder="What are you learning from these references?"
        value={data.notes}
        onChange={(e) => onChange({ ...data, notes: e.target.value })}
      />

      <label className="label small">Pinned reference images (up to 5)</label>
      <input
        type="file"
        accept="image/png,image/jpeg"
        multiple
        disabled={data.images.length >= 5}
        onChange={(e) => e.target.files && onImageFiles(e.target.files)}
      />
      {data.images.length > 0 && (
        <div className="ref-image-grid">
          {data.images.map((src, idx) => (
            <div className="ref-image" key={idx}>
              <img src={src} alt={`reference ${idx + 1}`} />
              <button className="icon-btn ref-image-remove" onClick={() => removeImage(idx)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {!hasContent && (
        <div className="hint-warning">
          Add at least one link, note, or reference image before checking this off.
        </div>
      )}
    </div>
  );
}
