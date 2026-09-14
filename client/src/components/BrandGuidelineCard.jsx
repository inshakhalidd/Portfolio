export default function BrandGuidelineCard({ guideline }) {
  return (
    <div className="critique-card">
      <div className="critique-top-row">
        <div className="critique-summary-col">
          <span className="critique-summary-label">Starting brand guideline</span>
          <p className="critique-summary">{guideline.summary}</p>
        </div>
      </div>

      <div className="moodboard-section">
        <span className="critique-section-title">Palette (pulled from your file)</span>
        <div className="palette-row">
          {guideline.palette.map((p, i) => (
            <div className="palette-swatch" key={i} title={`${p.role} · ${p.share}% of the design`}>
              <div className="palette-swatch-color" style={{ background: p.hex }} />
              <span className="palette-swatch-hex mono">{p.hex}</span>
              <span className="visual-research-hint" style={{ margin: 0 }}>{p.role}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="critique-sections">
        <div className="critique-section">
          <span className="critique-section-title">Backgrounds</span>
          <p>{guideline.backgroundNote}</p>
        </div>
        <div className="critique-section">
          <span className="critique-section-title">Clear space</span>
          <p>{guideline.clearSpace}</p>
        </div>
        <div className="critique-section">
          <span className="critique-section-title">Minimum size</span>
          <p>{guideline.minSize}</p>
        </div>
        <div className="critique-section">
          <span className="critique-section-title">Suggested typography</span>
          <p>
            <strong>{guideline.typography.heading}</strong> for headings, <strong>{guideline.typography.body}</strong> for
            body text. {guideline.typography.mood}
          </p>
        </div>
      </div>

      <div className="critique-columns">
        <div className="critique-pros-cons">
          <span className="critique-pros-cons-title pros">Do</span>
          <ul>
            {guideline.dos.map((s, i) => (
              <li key={i}>
                <span className="pcmark pros">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="critique-pros-cons">
          <span className="critique-pros-cons-title cons">Don't</span>
          <ul>
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
