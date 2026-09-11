import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const RATING_TOOL = {
  name: 'submit_design_critique',
  description: 'Submit structured critique of an uploaded design image.',
  input_schema: {
    type: 'object',
    properties: {
      overall_score: {
        type: 'number',
        description: 'Overall rating from 1-10, one decimal allowed.',
      },
      summary: { type: 'string', description: 'One or two sentence overall take.' },
      whitespace: {
        type: 'object',
        properties: {
          score: { type: 'number', description: '1-10' },
          notes: { type: 'string', description: 'Specific feedback on margins, breathing room, grouping/negative space.' },
        },
        required: ['score', 'notes'],
      },
      research_and_reference: {
        type: 'object',
        properties: {
          score: { type: 'number', description: '1-10' },
          notes: { type: 'string', description: 'Evidence (or lack of it) of research/reference use, trend/brand alignment.' },
        },
        required: ['score', 'notes'],
      },
      composition: { type: 'string', description: 'Notes on layout, hierarchy, balance.' },
      color: { type: 'string', description: 'Notes on color choices/palette/contrast.' },
      typography: { type: 'string', description: 'Notes on type choices, pairing, readability.' },
      strengths: { type: 'array', items: { type: 'string' } },
      improvements: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'overall_score',
      'summary',
      'whitespace',
      'research_and_reference',
      'composition',
      'color',
      'typography',
      'strengths',
      'improvements',
    ],
  },
};

app.post('/api/rate-design', async (req, res) => {
  try {
    if (!anthropic) {
      return res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY.' });
    }
    const { imageBase64, mediaType, taskTitle, category, context } = req.body;
    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: 'imageBase64 and mediaType are required.' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1500,
      tools: [RATING_TOOL],
      tool_choice: { type: 'tool', name: 'submit_design_critique' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageBase64 },
            },
            {
              type: 'text',
              text: `You are a sharp, encouraging but honest design critic reviewing work from a graphic designer. ` +
                `Task: "${taskTitle || 'Untitled'}" (category: ${category || 'general'}). ` +
                (context ? `Additional context from the designer: ${context}. ` : '') +
                `This designer's two weakest areas are 1) whitespace/breathing room and 2) grounding work in research/reference. ` +
                `Give extra scrutiny and specificity on those two dimensions. Then critique composition, color, and typography. ` +
                `Call the submit_design_critique tool with your structured critique.`,
            },
          ],
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === 'tool_use');
    if (!toolUse) {
      return res.status(502).json({ error: 'No structured critique returned.' });
    }
    res.json({ critique: toolUse.input });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Rating failed.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`Server listening on :${PORT}`));
