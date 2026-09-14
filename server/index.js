import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const WEB_SEARCH_TOOL = {
  type: 'web_search_20260209',
  name: 'web_search',
  max_uses: 6,
};

const SUBMIT_TOOL = {
  name: 'submit_research_pack',
  description: 'Submit the finished design research pack.',
  input_schema: {
    type: 'object',
    properties: {
      audience_note: {
        type: 'string',
        description:
          '2-3 plain-language sentences on who this design needs to catch: age range, platform behavior, taste cues, inferred from the topic/brief/category.',
      },
      positioning_angle: {
        type: 'string',
        description:
          'One or two sentences on what would make this stand out versus generic examples in its category — a specific angle, not just "here are some references".',
      },
      links: {
        type: 'array',
        description: '4-8 real reference links found via web_search, each with a 1-line description.',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['url', 'description'],
        },
      },
      keywords: {
        type: 'array',
        description: '4-6 moodboard keywords/descriptors.',
        items: { type: 'string' },
      },
      palette: {
        type: 'array',
        description: '4-6 suggested starting hex colors with reasoning.',
        items: {
          type: 'object',
          properties: {
            hex: { type: 'string' },
            reasoning: { type: 'string' },
          },
          required: ['hex', 'reasoning'],
        },
      },
    },
    required: ['audience_note', 'positioning_angle', 'links', 'keywords', 'palette'],
  },
};

async function callModel(messages) {
  return anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4096,
    tools: [WEB_SEARCH_TOOL, SUBMIT_TOOL],
    tool_choice: { type: 'auto' },
    messages,
  });
}

function findSubmitBlock(response) {
  return response.content.find((b) => b.type === 'tool_use' && b.name === 'submit_research_pack');
}

app.post('/api/auto-research', async (req, res) => {
  try {
    if (!anthropic) {
      return res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY.' });
    }
    const { topic, brief, category, freePack } = req.body;
    if (!topic?.trim() && !brief?.trim()) {
      return res.status(400).json({ error: 'topic or brief is required.' });
    }

    const freePackContext = freePack
      ? `\n\nA free, rule-based pass already produced a starting point — sharpen and replace it with ` +
        `something genuinely more current and specific, don't just repeat it:\n` +
        `Audience note: ${freePack.audience_note}\n` +
        `Positioning: ${freePack.positioning_angle}\n` +
        `Keywords: ${(freePack.keywords || []).join(', ')}`
      : '';

    const userText =
      `Design research request.\n` +
      `Topic/brand: ${topic?.trim() || '(see brief)'}\n` +
      `Category: ${category || 'general'}\n` +
      `Brief: ${brief?.trim() || '(none provided)'}${freePackContext}\n\n` +
      `Search the web for current design inspiration, competitor/reference examples, and trends ` +
      `relevant to this category. Then call submit_research_pack exactly once with: a plain-language ` +
      `audience_note (who this needs to catch — age range, platform behavior, taste cues), a ` +
      `positioning_angle (what would make this stand out versus generic examples in its category, not ` +
      `just a list of references), 4-8 reference links you actually found via web_search (each with a ` +
      `1-line description of what's useful about it), 4-6 moodboard keywords/descriptors, and a ` +
      `suggested starting color palette of 4-6 hex codes with a short reasoning for each. Do not invent ` +
      `URLs — only include links returned by web_search.`;

    const messages = [{ role: 'user', content: userText }];

    let response = await callModel(messages);
    let submitBlock = findSubmitBlock(response);

    if (!submitBlock) {
      messages.push({ role: 'assistant', content: response.content });
      messages.push({
        role: 'user',
        content: 'Now call submit_research_pack with your findings, using only real links found via web_search.',
      });
      response = await callModel(messages);
      submitBlock = findSubmitBlock(response);
    }

    if (!submitBlock) {
      return res.status(502).json({ error: 'Model did not return a structured research pack.' });
    }
    res.json({ pack: { ...submitBlock.input, mode: 'ai' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Auto-research failed.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, autoResearch: Boolean(anthropic) }));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
