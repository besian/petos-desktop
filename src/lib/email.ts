export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}
export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `Email failed (${res.status})` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the email service.' };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function textToHtml(s: string): string {
  return escapeHtml(s).split('\n').join('<br>');
}

/** Wraps body HTML in a small branded card, consistent across every email PetOS sends. */
export function emailShell(bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;padding:32px 16px;background:#F6F5F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1A1A1A;">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px 30px;border:1px solid #E7E5DF;">
<div style="font-size:13px;font-weight:700;letter-spacing:.02em;color:#127A63;margin-bottom:18px;">PetOS</div>
${bodyHtml}
</div>
</body></html>`;
}

/** Renders a free-text message (e.g. from a "Message this person" box) as an email body. */
export function messageEmailHtml(greeting: string, messageText: string, signOff: string): string {
  return emailShell(`
<p style="font-size:15px;line-height:23px;margin:0 0 14px;">${escapeHtml(greeting)}</p>
<p style="font-size:15px;line-height:23px;margin:0 0 14px;">${textToHtml(messageText)}</p>
<p style="font-size:15px;line-height:23px;margin:0;">${escapeHtml(signOff)}</p>
`);
}
