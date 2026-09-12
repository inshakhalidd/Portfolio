import { useState } from 'react';
import Icon from './Icon.jsx';
import { extractBriefText } from '../lib/briefFile.js';
import { API_BASE } from '../lib/apiBase.js';

function formatPackIntoNotes(pack) {
  const lines = [`Auto-research (${new Date().toLocaleDateString()}):`];
  if (pack.keywords?.length) {
    lines.push(`Keywords: ${pack.keywords.join(', ')}`);
  }
  if (pack.palette?.length) {
    lines.push(
      `Palette: ${pack.palette.map((p) => `${p.hex} (${p.reasoning})`).join('; ')}`
    );
  }
  return lines.join('\n');
}

function AutoResearch({ taskTitle, category, data, onChange }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(taskTitle || '');
  const [brief, setBrief] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPack, setLastPack] = useState(null);

  async function run(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLastPack(null);
    try {
      let fileText = '';
      if (file) fileText = await extractBriefText(file);
      const combinedBrief = [brief.trim(), fileText.trim()].filter(Boolean).join('\n\n');

      const res = await fetch(`${API_BASE}/api/auto-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, brief: combinedBrief, category }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Auto-research failed.');

      const pack = json.pack;
      const existingUrls = new Set(data.links);
      const newLinks = (pack.links || [])
        .map((l) => l.url)
        .filter((url) => url && !existingUrls.has(url));
      const linkNotes = (pack.links || [])
        .map((l) => `${l.url} — ${l.description}`)
        .join('\n');

      const notesAddition = [formatPackIntoNotes(pack), linkNotes && `\n${linkNotes}`]
        .filter(Boolean)
        .join('\n');

      onChange({
        ...data,
        links: [...data.links, ...newLinks],
        notes: data.notes ? `${data.notes}\n\n${notesAddition}` : notesAddition,
      });
      setLastPack(pack);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auto-research">
      <button
        type="button"
        className="btn auto-research-toggle"
        onClick={() => setOpen(!open)}
      >
        <Icon name="sparkle" size={15} />
        Auto-research
      </button>

      {open && (
        <form className="auto-research-form" onSubmit={run}>
          <label className="label small">Topic / brand</label>
          <input
            className="input"
            placeholder="e.g. GlowUp skincare"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <label className="label small">Short brief (optional)</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Audience, tone, anything the brand outline should cover..."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />

          <label className="label small">Or upload a brand outline/brief (.txt or .pdf)</label>
          <input
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || (!topic.trim() && !brief.trim() && !file)}
          >
            {loading ? 'Researching...' : 'Run auto-research'}
          </button>
          {error && <div className="hint-warning">{error}</div>}
          {lastPack && !error && (
            <div className="auto-research-success">
              Added {lastPack.links?.length ?? 0} links and a keyword/palette summary to your notes below — edit freely.
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default function ResearchPanel({ data, onChange, taskTitle, category }) {
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

      <AutoResearch taskTitle={taskTitle} category={category} data={data} onChange={onChange} />

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
