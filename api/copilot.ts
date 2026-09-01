// Vercel serverless function (Node runtime, auto-detected from this file's
// location under /api). Keeps the Anthropic API key server-side — the
// client (src/lib/copilot.ts) only ever talks to this endpoint, never to
// Anthropic directly.
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

// Minimal structural types for the Vercel Node request/response — avoids
// pulling in @vercel/node just for typings.
interface ApiRequest {
  method?: string;
  body: unknown;
}
interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

const ResultRowSchema = z.object({
  color: z.string().describe('A hex color, e.g. "#4A6C8C" — reuse the color given for that pet/walker in the data snapshot if there is one, otherwise pick any reasonable color.'),
  initial: z.string().describe('1-2 letters shown in an avatar badge.'),
  name: z.string(),
  sub: z.string().describe('A short detail line, e.g. an amount, a status, or a time.'),
});

const CopilotResponseSchema = z.object({
  text: z.string().describe("The chat reply shown to the business owner. 1-3 sentences, friendly, concrete."),
  rows: z.array(ResultRowSchema).nullable().describe('Up to 5 rows to list specific pets/clients/walkers/invoices the answer refers to. Null if the answer is a single fact with nothing to list.'),
});

const SYSTEM_PROMPT = `You are PetOS Copilot, embedded in a dog-walking business management app. The owner will ask you questions about their business. You will be given a JSON snapshot of their current data (pets, clients, team, today's and this week's walks, outstanding invoices, pending reports).

Answer ONLY using facts present in the snapshot — never invent pets, clients, amounts, or walks that aren't in it. If the snapshot doesn't contain what's needed to answer, say so plainly rather than guessing. Keep the reply short (1-3 sentences) and concrete — real names and numbers, not generic advice. When the answer refers to specific pets, clients, walkers, or invoices, also populate "rows" (max 5) so the app can show them as a list; otherwise use rows: null.`;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Copilot is not configured on the server yet (missing ANTHROPIC_API_KEY).' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as { question?: unknown; snapshot?: unknown };
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question) {
    res.status(400).json({ error: 'Missing question' });
    return;
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.beta.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Business data snapshot (JSON):\n${JSON.stringify(body.snapshot ?? {})}\n\nQuestion: ${question}` },
      ],
      output_format: betaZodOutputFormat(CopilotResponseSchema),
    });

    if (!response.parsed_output) {
      res.status(502).json({ error: 'Copilot could not produce a valid response.' });
      return;
    }
    res.status(200).json(response.parsed_output);
  } catch (err) {
    console.error('[copilot] request failed:', err);
    res.status(502).json({ error: 'Copilot request failed. Please try again.' });
  }
}
