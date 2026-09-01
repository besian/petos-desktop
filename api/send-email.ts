// Vercel serverless function (Node runtime). Sends real email via Resend,
// keeping the API key server-side — the client (src/lib/email.ts) only
// ever talks to this endpoint.
import { Resend } from 'resend';

interface ApiRequest {
  method?: string;
  body: unknown;
}
interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Email is not configured on the server yet (missing RESEND_API_KEY).' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
    to?: unknown; subject?: unknown; html?: unknown; replyTo?: unknown;
  };
  const to = typeof body.to === 'string' ? body.to.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const html = typeof body.html === 'string' ? body.html : '';
  const replyTo = typeof body.replyTo === 'string' && body.replyTo.trim() ? body.replyTo.trim() : undefined;

  if (!to || !subject || !html) {
    res.status(400).json({ error: 'Missing to/subject/html' });
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || 'PetOS <onboarding@resend.dev>';

  try {
    const { error } = await resend.emails.send({ from, to, subject, html, replyTo });
    if (error) {
      console.error('[send-email] resend error:', error.message);
      res.status(502).json({ error: error.message });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send-email] request failed:', err);
    res.status(502).json({ error: 'Email request failed. Please try again.' });
  }
}
