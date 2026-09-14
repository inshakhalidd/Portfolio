import { useState } from 'react';
import { downloadBrandGuidelinePdf } from '../lib/brandGuidelinePdf.js';

async function resolveLogoDataUrl(logoUrl) {
  if (!logoUrl) return null;
  if (logoUrl.startsWith('data:')) return logoUrl;
  const res = await fetch(logoUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function BrandGuidelineCard({ guideline, brandName, logoUrl }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const primary = guideline.palette[0]?.hex || '#8a6dfa';

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const logoDataUrl = await resolveLogoDataUrl(logoUrl);
      await downloadBrandGuidelinePdf({ guideline, brandName, logoDataUrl });
    } catch {
      setError('Could not build the PDF — try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="brandguide-card">
      <div className="brandguide-stripe" style={{ background: primary }} />

      <div className="brandguide-header">
        <div>
          <span className="brandguide-kicker">Starting brand guideline</span>
          <p className="brandguide-summary">{guideline.summary}</p>
        </div>
        <div className="brandguide-header-actions">
          <button className="btn btn-primary" type="button" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Building PDF…' : 'Download PDF'}
          </button>
          {error && <span className="hint-warning" style={{ margin: 0 }}>{error}</span>}
        </div>
      </div>

      <div className="brandguide-block">
        <span className="brandguide-block-title">Palette</span>
        <div className="brandguide-palette-grid">
          {guideline.palette.map((p, i) => (
            <div className="brandguide-swatch" key={i}>
              <div className="brandguide-swatch-color" style={{ background: p.hex }} />
              <div className="brandguide-swatch-meta">
                <span className="brandguide-swatch-role">{p.role}</span>
                <span className="brandguide-swatch-hex mono">{p.hex.toUpperCase()}</span>
                <span className="brandguide-swatch-share mono">{p.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="brandguide-grid">
        <div className="brandguide-block">
          <span className="brandguide-block-title">Typography</span>
          <div className="brandguide-type-row">
            <span className="brandguide-type-aa" style={{ fontWeight: 700 }}>Aa</span>
            <div className="brandguide-type-meta">
              <span className="brandguide-type-label">Headings</span>
              <span className="brandguide-type-name">{guideline.typography.heading}</span>
            </div>
          </div>
          <div className="brandguide-type-row">
            <span className="brandguide-type-aa">Aa</span>
            <div className="brandguide-type-meta">
              <span className="brandguide-type-label">Body text</span>
              <span className="brandguide-type-name">{guideline.typography.body}</span>
            </div>
          </div>
          <p className="brandguide-note">{guideline.typography.mood}</p>
        </div>

        <div className="brandguide-block">
          <span className="brandguide-block-title">Usage rules</span>
          <div className="brandguide-rule">
            <span className="brandguide-rule-label">Backgrounds</span>
            <p>{guideline.backgroundNote}</p>
          </div>
          <div className="brandguide-rule">
            <span className="brandguide-rule-label">Clear space</span>
            <p>{guideline.clearSpace}</p>
          </div>
          <div className="brandguide-rule">
            <span className="brandguide-rule-label">Minimum size</span>
            <p>{guideline.minSize}</p>
          </div>
        </div>
      </div>

      <div className="brandguide-grid">
        <div className="brandguide-block">
          <span className="brandguide-block-title dos">Do</span>
          <ul className="brandguide-list">
            {guideline.dos.map((s, i) => (
              <li key={i}>
                <span className="pcmark pros">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="brandguide-block">
          <span className="brandguide-block-title donts">Don't</span>
          <ul className="brandguide-list">
            {guideline.donts.map((s, i) => (
              <li key={i}>
                <span className="pcmark cons">−</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
