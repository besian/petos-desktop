import { supabase } from './supabase';
import type { ChatMessage } from '../db/types';

export type ThreadType = ChatMessage['threadType'];
export type SenderRole = ChatMessage['sender'];

function messageFromRow(r: Record<string, unknown>): ChatMessage {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    threadType: r.thread_type as ThreadType,
    threadId: r.thread_id as string,
    sender: r.sender as SenderRole,
    body: r.body as string,
    createdAt: r.created_at as string,
  };
}

export async function fetchMessages(ownerId: string, threadType: ThreadType, threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('thread_type', threadType)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) { console.error('[petos] fetchMessages:', error.message); return []; }
  return (data ?? []).map(messageFromRow);
}

export async function sendMessage(input: { ownerId: string; threadType: ThreadType; threadId: string; sender: SenderRole; body: string }): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('messages').insert({
    owner_id: input.ownerId, thread_type: input.threadType, thread_id: input.threadId, sender: input.sender, body: input.body,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Subscribes to new messages on one thread; returns an unsubscribe function. */
export function subscribeToThread(ownerId: string, threadType: ThreadType, threadId: string, onInsert: (m: ChatMessage) => void): () => void {
  const channel = supabase
    .channel(`messages:${ownerId}:${threadType}:${threadId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${threadId},owner_id=eq.${ownerId},thread_type=eq.${threadType}` },
      (payload) => onInsert(messageFromRow(payload.new as Record<string, unknown>))
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
