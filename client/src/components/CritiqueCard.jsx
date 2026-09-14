export default function CritiqueCard({ critique }) {
  return (
    <div className="critique-card">
      <div className="critique-score">{critique.overall_score}/10</div>
      <p className="critique-summary">{critique.summary}</p>

      <div className="critique-section highlight">
        <div className="critique-section-title">
          Whitespace <span className="badge">{critique.whitespace.score}/10</span>
        </div>
        <p>{critique.whitespace.notes}</p>
      </div>

      <div className="critique-section highlight">
        <div className="critique-section-title">
          Research & reference <span className="badge">{critique.research_and_reference.score}/10</span>
        </div>
        <p>{critique.research_and_reference.notes}</p>
      </div>

      <div className="critique-section">
        <div className="critique-section-title">Composition</div>
        <p>{critique.composition}</p>
      </div>
      <div className="critique-section">
        <div className="critique-section-title">Color</div>
        <p>{critique.color}</p>
      </div>
      <div className="critique-section">
        <div className="critique-section-title">Typography</div>
        <p>{critique.typography}</p>
      </div>

      <div className="critique-columns">
        <div>
          <div className="critique-section-title">Pros</div>
          <ul>
            {critique.pros.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="critique-section-title">Cons</div>
          <ul>
            {critique.cons.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="critique-section steps-section">
        <div className="critique-section-title">Steps to improve</div>
        <ol className="steps-list">
          {critique.steps.map((s, i) => (
            <li key={i}>{s.replace(/^Step \d+:\s*/, '')}</li>
          ))}
        </ol>
      </div>

      {critique.keyword_ideas?.length > 0 && (
        <div className="critique-section">
          <div className="critique-section-title">Search these to fix it</div>
          <p className="visual-research-hint">
            Paste any of these into Pinterest, Google, or Dribbble to find help with that specific problem.
          </p>
          <div className="keyword-ideas-groups">
            {critique.keyword_ideas.map((group, i) => (
              <div className="keyword-ideas-group" key={i}>
                <span className="keyword-ideas-label">{group.dimension}</span>
                <div className="keyword-chips">
                  {group.keywords.map((k, j) => (
                    <span className="badge keyword-chip" key={j}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="critique-section">
        <div className="critique-section-title">Visual research</div>
        <p className="visual-research-hint">
          Real search links, built from this task's category and tags — not fabricated results.
        </p>
        <ul className="visual-research-list">
          {critique.visual_research.map((r, i) => (
            <li key={i}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
