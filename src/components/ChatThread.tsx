import { useEffect, useRef, useState, type FormEvent } from 'react';
import { st } from '../lib/st';
import { fetchMessages, sendMessage, markThreadRead, subscribeToThread, type SenderRole, type ThreadType } from '../lib/chat';
import type { ChatMessage } from '../db/types';
import { SendIcon, CheckIcon } from './icons';

interface ChatThreadProps {
  ownerId: string;
  threadType: ThreadType;
  threadId: string;
  myRole: SenderRole;
  counterpartName: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

export function ChatThread({ ownerId, threadType, threadId, myRole, counterpartName }: ChatThreadProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMessages(ownerId, threadType, threadId).then((msgs) => {
      if (cancelled) return;
      setMessages(msgs);
      setLoading(false);
      markThreadRead(ownerId, threadType, threadId, myRole);
    });
    const unsubscribe = subscribeToThread(ownerId, threadType, threadId, (m, eventType) => {
      setMessages((prev) => {
        if (eventType === 'UPDATE') return prev.map((p) => (p.id === m.id ? m : p));
        return prev.some((p) => p.id === m.id) ? prev : [...prev, m];
      });
      if (eventType === 'INSERT' && m.sender !== myRole) {
        markThreadRead(ownerId, threadType, threadId, myRole);
      }
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [ownerId, threadType, threadId, myRole]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    const result = await sendMessage({ ownerId, threadType, threadId, sender: myRole, body });
    setSending(false);
    if (!result.ok) { setError(result.error || 'Could not send — please try again.'); return; }
    if (result.message) {
      const sent = result.message;
      setMessages((prev) => (prev.some((p) => p.id === sent.id) ? prev : [...prev, sent]));
    }
    setDraft('');
  };

  let lastDay = '';

  return (
    <div style={st('display:flex;flex-direction:column;height:100%;min-height:0')}>
      <div className="ps" style={st('flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:10px;min-height:0')}>
        {loading ? (
          <div style={st('text-align:center;padding:30px;font-size:13px;color:var(--fg-tertiary)')}>Loading…</div>
        ) : messages.length === 0 ? (
          <div style={st('text-align:center;padding:30px;font-size:13px;color:var(--fg-tertiary)')}>No messages yet — say hello to {counterpartName}.</div>
        ) : (
          messages.map((m) => {
            const mine = m.sender === myRole;
            const day = formatDay(m.createdAt);
            const showDivider = day !== lastDay;
            lastDay = day;
            return (
              <div key={m.id} style={st('display:flex;flex-direction:column;gap:10px')}>
                {showDivider ? (
                  <div style={st('text-align:center;font-size:11px;font-weight:600;color:var(--fg-quaternary);margin:4px 0')}>{day}</div>
                ) : null}
                <div style={st(mine ? 'display:flex;justify-content:flex-end' : 'display:flex;justify-content:flex-start')}>
                  <div style={st(`max-width:76%;display:flex;flex-direction:column;gap:3px;${mine ? 'align-items:flex-end' : 'align-items:flex-start'}`)}>
                    <div style={st(mine
                      ? 'background:var(--brand-primary);color:var(--brand-on-primary);border-radius:14px 14px 4px 14px;padding:10px 13px;font-size:13.5px;line-height:19px;font-weight:500'
                      : 'background:var(--bg-tertiary);color:var(--fg-primary);border-radius:14px 14px 14px 4px;padding:10px 13px;font-size:13.5px;line-height:19px')}
                    >
                      {m.body}
                    </div>
                    <span style={st('display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--fg-quaternary);padding:0 3px')}>
                      {formatTime(m.createdAt)}
                      {mine ? (
                        <span style={st(`display:inline-flex;align-items:center;gap:2px;${m.readAt ? 'color:var(--fg-brand)' : ''}`)}>
                          <CheckIcon size={11} />
                          {m.readAt ? `Read ${formatTime(m.readAt)}` : 'Delivered'}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {error ? <div style={st('padding:0 18px 8px;font-size:12px;color:var(--color-error-700)')}>{error}</div> : null}
      <form onSubmit={onSubmit} style={st('display:flex;align-items:center;gap:8px;padding:12px 14px;border-top:1px solid var(--border-subtle);background:var(--bg-primary);flex:none')}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${counterpartName}…`}
          style={st('flex:1;min-width:0;border:1px solid var(--border-default);background:var(--bg-secondary);border-radius:11px;padding:11px 14px;outline:none;font-family:inherit;font-size:13.5px;color:var(--fg-primary)')}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          style={st(`width:38px;height:38px;border-radius:10px;border:none;background:var(--brand-primary);color:var(--brand-on-primary);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;${sending || !draft.trim() ? 'opacity:.5' : ''}`)}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}
