function scoreBarColor(score) {
  if (score >= 8) return 'var(--ok)';
  if (score >= 7) return 'var(--accent)';
  return 'var(--warn)';
}

const SECTION_LABELS = {
  whitespace: 'Whitespace',
  research_and_reference: 'Research & reference',
  composition: 'Composition',
  color: 'Color',
  typography: 'Typography',
};

function sectionsFrom(critique) {
  return [
    { name: SECTION_LABELS.whitespace, score: critique.whitespace.score, note: critique.whitespace.notes },
    {
      name: SECTION_LABELS.research_and_reference,
      score: critique.research_and_reference.score,
      note: critique.research_and_reference.notes,
    },
    { name: SECTION_LABELS.composition, score: null, note: critique.composition },
    { name: SECTION_LABELS.color, score: null, note: critique.color },
    { name: SECTION_LABELS.typography, score: null, note: critique.typography },
  ];
}

export default function CritiqueCard({ critique }) {
  const sections = sectionsFrom(critique);

  return (
    <>
      <div className="critique-card">
        <div className="critique-top-row">
          <div className="critique-score">{critique.overall_score}</div>
          <div className="critique-summary-col">
            <span className="critique-summary-label">Overall · out of 10</span>
            <p className="critique-summary">{critique.summary}</p>
          </div>
        </div>

        <div className="critique-sections">
          {sections.map((s, i) => (
            <div className="critique-section" key={i}>
              <div className="critique-section-row">
                <span className="critique-section-title">{s.name}</span>
                {s.score !== null && (
                  <span className="critique-section-score mono">{s.score}/10</span>
                )}
              </div>
              {s.score !== null && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${s.score * 10}%`, background: scoreBarColor(s.score) }}
                  />
                </div>
              )}
              <p>{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="critique-columns">
        <div className="critique-pros-cons">
          <span className="critique-pros-cons-title pros">Working</span>
          <ul>
            {critique.pros.map((s, i) => (
              <li key={i}>
                <span className="pcmark pros">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="critique-pros-cons">
          <span className="critique-pros-cons-title cons">Needs work</span>
          <ul>
            {critique.cons.map((s, i) => (
              <li key={i}>
                <span className="pcmark cons">−</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="steps-section">
        <span className="panel-card-header-title">Steps to improve</span>
        <ol className="steps-list">
          {critique.steps.map((s, i) => (
            <li key={i}>
              <span className="step-num mono">{i + 1}</span>
              <span className="step-text">{s.replace(/^Step \d+:\s*/, '')}</span>
            </li>
          ))}
        </ol>
      </div>

      {critique.keyword_ideas?.length > 0 && (
        <div className="visual-research-section">
          <span className="panel-card-header-title">Search these to fix it</span>
          <p className="visual-research-hint">
            Paste any of these into Pinterest, Google, or Dribbble to find help with that specific problem.
          </p>
          <div className="keyword-ideas-groups">
            {critique.keyword_ideas.map((group, i) => (
              <div key={i}>
                <span className="keyword-ideas-label">{group.dimension}</span>
                <div className="keyword-chips" style={{ marginTop: 6 }}>
                  {group.keywords.map((k, j) => (
                    <span className="keyword-chip" key={j}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="visual-research-section">
        <span className="panel-card-header-title">Visual research</span>
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
    </>
  );
}
