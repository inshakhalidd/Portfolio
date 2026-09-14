import { useEffect, useState } from 'react';
import { extractBriefText } from './briefFile.js';
import { API_BASE, checkAiResearchAvailable } from './apiBase.js';
import { buildFreeResearchPack } from './researchEngine.js';

// Shared engine-calling logic behind both the per-task Auto-research
// control and the standalone Research tab. The free engine always runs
// first and never fails; AI-boost is strictly additive.
export function useResearchRunner({ initialTopic = '' } = {}) {
  const [topic, setTopic] = useState(initialTopic);
  const [brief, setBrief] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [error, setError] = useState(null);
  const [pack, setPack] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    checkAiResearchAvailable().then(setAiAvailable);
  }, []);

  async function run(category, tags = []) {
    setLoading(true);
    setError(null);
    setPack(null);
    try {
      let fileText = '';
      if (file) fileText = await extractBriefText(file);
      const combinedBrief = [brief.trim(), fileText.trim()].filter(Boolean).join('\n\n');
      const freePack = buildFreeResearchPack(topic, combinedBrief, category, tags);
      setPack(freePack);
      return freePack;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function boost(category) {
    if (!pack) return null;
    setBoosting(true);
    setError(null);
    try {
      let fileText = '';
      if (file) fileText = await extractBriefText(file);
      const combinedBrief = [brief.trim(), fileText.trim()].filter(Boolean).join('\n\n');

      const res = await fetch(`${API_BASE}/api/auto-research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, brief: combinedBrief, category, freePack: pack }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'AI boost failed.');
      setPack(json.pack);
      return json.pack;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setBoosting(false);
    }
  }

  return {
    topic,
    setTopic,
    brief,
    setBrief,
    file,
    setFile,
    loading,
    boosting,
    error,
    pack,
    aiAvailable,
    run,
    boost,
  };
}
