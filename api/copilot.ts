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

// Every action kind the owner can trigger by chatting with Copilot. Each
// carries a human-readable `summary` — that's what's shown to the owner
// with Confirm/Cancel buttons; the app never executes anything until they
// tap Confirm, and resolves entity names against the *live* database
// (not this snapshot) at that point, so exact-name matching here matters.
const AddWalkAction = z.object({
  kind: z.literal('add_walk'),
  summary: z.string().describe('One-line confirmation summary, e.g. "Book Milo with Molos, tomorrow at 12:00 (30 min)".'),
  petName: z.string().describe('Exact pet name as it appears in the snapshot.'),
  walkerName: z.string().nullable().describe('Exact team member name as it appears in the snapshot, or null to leave unassigned.'),
  date: z.string().describe('ISO date yyyy-mm-dd, resolved from any relative reference ("tomorrow", "next Monday") using the snapshot\'s "today" value.'),
  time: z.string().describe('24-hour "HH:MM".'),
  durationMin: z.union([z.literal(30), z.literal(45), z.literal(60)]).describe('Walk length in minutes; default 60 if not specified.'),
  repeatWeekly: z.boolean().describe('True only if the owner asked for a recurring/weekly walk.'),
});

const CancelWalkAction = z.object({
  kind: z.literal('cancel_walk'),
  summary: z.string(),
  petName: z.string(),
  date: z.string().describe('ISO date yyyy-mm-dd of the walk to cancel.'),
  time: z.string().nullable().describe('24-hour "HH:MM" if known, to disambiguate multiple walks that day.'),
});

const RescheduleWalkAction = z.object({
  kind: z.literal('reschedule_walk'),
  summary: z.string(),
  petName: z.string(),
  fromDate: z.string().describe('ISO date yyyy-mm-dd of the existing walk.'),
  fromTime: z.string().nullable(),
  toDate: z.string().describe('ISO date yyyy-mm-dd to move it to.'),
  toTime: z.string().nullable().describe('New time, or null to keep the same time.'),
});

const AddInvoiceAction = z.object({
  kind: z.literal('add_invoice'),
  summary: z.string(),
  clientName: z.string().describe('Exact client name as it appears in the snapshot.'),
  petName: z.string().nullable().describe('Exact pet name, if the owner mentioned one; otherwise null.'),
  description: z.string().describe('Line item description, e.g. "Dog walking — 4 walks".'),
  amount: z.number().describe('Total amount in pounds as a plain number, e.g. 72 for £72.00.'),
  dueInDays: z.number().describe('Days until due; default 14 if not specified.'),
  sendNow: z.boolean().describe('True only if the owner explicitly asked to send it now rather than just create a draft.'),
});

const MarkInvoicePaidAction = z.object({
  kind: z.literal('mark_invoice_paid'),
  summary: z.string(),
  clientName: z.string().describe('Exact client name as it appears in the snapshot.'),
  amount: z.number().nullable().describe('Approximate amount, if the owner mentioned one, to disambiguate between several unpaid invoices.'),
});

const AddClientAction = z.object({
  kind: z.literal('add_client'),
  summary: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
});

const AddPetAction = z.object({
  kind: z.literal('add_pet'),
  summary: z.string(),
  name: z.string(),
  breed: z.string().nullable(),
  clientName: z.string().describe('Exact EXISTING client name from the snapshot that this pet belongs to.'),
  plan: z.union([z.literal('Weekly'), z.literal('Fortnightly'), z.literal('Monthly')]),
});

const AddTeamMemberAction = z.object({
  kind: z.literal('add_team_member'),
  summary: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  area: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
});

const ActionSchema = z.discriminatedUnion('kind', [
  AddWalkAction, CancelWalkAction, RescheduleWalkAction,
  AddInvoiceAction, MarkInvoicePaidAction,
  AddClientAction, AddPetAction, AddTeamMemberAction,
]);

const CopilotResponseSchema = z.object({
  text: z.string().describe("The chat reply shown to the business owner. 1-3 sentences, friendly, concrete."),
  rows: z.array(ResultRowSchema).nullable().describe('Up to 5 rows to list specific pets/clients/walkers/invoices the answer refers to. Null if the answer is a single fact with nothing to list, or when "action" is set.'),
  action: ActionSchema.nullable().describe('A single proposed change to the schedule, invoices, clients, pets, or team — ONLY when the owner\'s latest message clearly asked to create or change something, and only one action per reply. The app shows "summary" with Confirm/Cancel buttons and does NOT perform it until the owner confirms, so never say in "text" that it has already happened — phrase it as a proposal ("I\'ll ..."), not a completed fact. Null for plain questions, or when required details are missing (ask a clarifying question in "text" instead of guessing).'),
});

const SYSTEM_PROMPT = `You are PetOS Copilot, embedded in a dog-walking business management app. The owner will ask you questions about their business, or ask you to make changes. You will be given a JSON snapshot of their current data (pets, clients, team, today's and this week's walks, outstanding invoices, pending reports).

Answer ONLY using facts present in the snapshot — never invent pets, clients, amounts, or walks that aren't in it. If the snapshot doesn't contain what's needed to answer, say so plainly rather than guessing. Keep the reply short (1-3 sentences) and concrete — real names and numbers, not generic advice. When the answer refers to specific pets, clients, walkers, or invoices, also populate "rows" (max 5) so the app can show them as a list; otherwise use rows: null.

You can also PROPOSE changes (booking/cancelling/rescheduling a walk, creating an invoice or marking one paid, adding a client/pet/team member) via the "action" field — but you never perform them yourself. The app shows your proposal to the owner with Confirm/Cancel buttons, and only calls the real database write if they tap Confirm. So:
- Set "action" only when the LATEST message is clearly a request to create or change something, not a question.
- Only ever propose ONE action per reply.
- Use the EXACT name for any pet/client/team member that already exists in the snapshot (for add_pet/add_invoice, this means the *client* they belong to must already exist there — don't invent a new client inline).
- cancel_walk and reschedule_walk can only reference a walk that's actually visible in walksToday/walksThisWeek — if the owner refers to a date outside that window, don't propose an action; say you can't see that far ahead and to use the Schedule page.
- Resolve any relative date/time ("tomorrow", "next Tuesday", "noon") into an ISO date (yyyy-mm-dd, using the snapshot's "today") and 24-hour time.
- If required details are missing or ambiguous (e.g. which pet, which day), leave "action" null and ask a short clarifying question in "text" instead of guessing.
- Phrase "text" as a proposal awaiting confirmation ("I'll book Milo with Molos tomorrow at 12:00 — confirm below."), never as something already done.`;

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
