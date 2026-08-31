import type { DB } from '../db/types';

export interface SearchResult {
  type: 'Pet' | 'Client' | 'Invoice';
  title: string;
  sub: string;
  initial: string;
  color: string;
  key: string;
  to: string;
}

export function searchDB(db: DB, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all: SearchResult[] = [];
  const clientById = new Map(db.clients.map((c) => [c.id, c]));

  for (const pet of db.pets) {
    const owner = clientById.get(pet.clientId);
    all.push({ type: 'Pet', title: pet.name, sub: `${pet.breed}${owner ? ' · ' + owner.name : ''}`, initial: pet.name[0], color: pet.color, key: 'pet-' + pet.id, to: `/clients/${pet.clientId}` });
  }
  for (const client of db.clients) {
    all.push({ type: 'Client', title: client.name, sub: `${client.addressLine1} · ${client.addressLine2}`, initial: client.name[0], color: 'var(--fg-secondary)', key: 'client-' + client.id, to: `/clients/${client.id}` });
  }
  for (const inv of db.invoices) {
    const client = clientById.get(inv.clientId);
    const amt = inv.items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
    all.push({ type: 'Invoice', title: inv.id, sub: `${client ? client.name : 'Unknown'} · £${amt.toFixed(2)}`, initial: '#', color: 'var(--fg-tertiary)', key: 'inv-' + inv.id, to: `/payments/${inv.id}` });
  }
  return all.filter((r) => (r.title + ' ' + r.sub + ' ' + r.type).toLowerCase().includes(q)).slice(0, 8);
}
