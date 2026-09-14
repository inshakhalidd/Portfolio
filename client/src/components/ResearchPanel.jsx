import { useState } from 'react';
import Icon from './Icon.jsx';
import { mergePackIntoResearchData } from '../lib/researchPack.js';
import { useResearchRunner } from '../lib/useResearchRunner.js';

function AutoResearch({ taskTitle, category, tags, data, onChange }) {
  const [open, setOpen] = useState(false);
  const runner = useResearchRunner({ initialTopic: taskTitle || '' });

  async function handleRun(e) {
    e.preventDefault();
    const freePack = await runner.run(category, tags);
    if (freePack) onChange(mergePackIntoResearchData(data, freePack));
  }

  async function handleBoost() {
    const boosted = await runner.boost(category);
    if (boosted) onChange(mergePackIntoResearchData(data, boosted));
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
        <form className="auto-research-form" onSubmit={handleRun}>
          <label className="label small">Topic / brand</label>
          <input
            className="input"
            placeholder="e.g. GlowUp skincare"
            value={runner.topic}
            onChange={(e) => runner.setTopic(e.target.value)}
          />

          <label className="label small">Short brief (optional)</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Audience, tone, anything the brand outline should cover..."
            value={runner.brief}
            onChange={(e) => runner.setBrief(e.target.value)}
          />

          <label className="label small">Or upload a brand outline/brief (.txt or .pdf)</label>
          <input
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={(e) => runner.setFile(e.target.files?.[0] ?? null)}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={runner.loading || (!runner.topic.trim() && !runner.brief.trim() && !runner.file)}
          >
            {runner.loading ? 'Researching...' : 'Run research (free)'}
          </button>
          {runner.error && <div className="hint-warning">{runner.error}</div>}

          {runner.pack && (
            <div className="auto-research-success">
              <span className={`badge mode-badge mode-${runner.pack.mode}`}>
                {runner.pack.mode === 'ai' ? 'AI-boosted' : 'Free research'}
              </span>{' '}
              Added to your notes below — edit freely.
              {runner.pack.mode === 'free' && runner.aiAvailable && (
                <button
                  type="button"
                  className="btn auto-research-boost"
                  onClick={handleBoost}
                  disabled={runner.boosting}
                >
                  <Icon name="sparkle" size={13} />
                  {runner.boosting ? 'Boosting...' : 'Boost with AI'}
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default function ResearchPanel({ data, onChange, taskTitle, category, tags }) {
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
    <div className="subpanel">
      <AutoResearch taskTitle={taskTitle} category={category} tags={tags} data={data} onChange={onChange} />

      <div className="research-expand-grid">
        <div className="research-expand-col">
          <span className="subpanel-title">Reference links</span>
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
          <div className="link-row">
            <input
              className="input"
              placeholder="Paste a link…"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
            />
            <button type="button" className="btn" onClick={addLink}>
              Add
            </button>
          </div>
        </div>

        <div className="research-expand-col">
          <span className="subpanel-title">Notes</span>
          <textarea
            className="textarea"
            rows={5}
            placeholder="What are you borrowing, and what are you avoiding?"
            value={data.notes}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
          />
        </div>

        <div className="research-expand-col">
          <span className="subpanel-title">Pinned images (up to 5)</span>
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
        </div>
      </div>

      {!hasContent && (
        <div className="hint-warning" style={{ margin: '12px 0 0' }}>
          Add at least one link, note, or reference image before checking this off.
        </div>
      )}
    </div>
  );
}
