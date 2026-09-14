// Supabase Edge Function (Deno) — a free-tier alternative to server/index.js
// for anyone deploying the frontend on Vercel instead of Render. Mirrors
// server/index.js's logic exactly (same tool schema, same prompt, same
// response shape) so the client needs zero changes beyond VITE_API_URL.
//
// Deploy: supabase functions deploy api --no-verify-jwt
// Set the secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Client env var: VITE_API_URL=https://<project-ref>.supabase.co/functions/v1

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
  });
}

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

async function callModel(messages: unknown[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-5',
      max_tokens: 4096,
      tools: [WEB_SEARCH_TOOL, SUBMIT_TOOL],
      tool_choice: { type: 'auto' },
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }
  return res.json();
}

function findSubmitBlock(response: any) {
  return response.content.find((b: any) => b.type === 'tool_use' && b.name === 'submit_research_pack');
}

async function handleAutoResearch(req: Request) {
  if (!ANTHROPIC_API_KEY) {
    return json({ error: 'Server missing ANTHROPIC_API_KEY.' }, 500);
  }
  const { topic, brief, category, freePack } = await req.json();
  if (!topic?.trim() && !brief?.trim()) {
    return json({ error: 'topic or brief is required.' }, 400);
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

  const messages: unknown[] = [{ role: 'user', content: userText }];

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
    return json({ error: 'Model did not return a structured research pack.' }, 502);
  }
  return json({ pack: { ...submitBlock.input, mode: 'ai' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const path = new URL(req.url).pathname;

  try {
    if (path.endsWith('/health')) {
      return json({ ok: true, autoResearch: Boolean(ANTHROPIC_API_KEY) });
    }
    if (path.endsWith('/auto-research')) {
      if (req.method !== 'POST') return json({ error: 'POST required' }, 405);
      return await handleAutoResearch(req);
    }
    return json({ error: 'Not found' }, 404);
  } catch (err) {
    console.error(err);
    return json({ error: (err as Error).message || 'Auto-research failed.' }, 500);
  }
});
