import { petsDef, petColors, invDefs, ownerAddr } from '../data';

export interface SearchResult {
  type: 'Pet' | 'Client' | 'Invoice';
  title: string;
  sub: string;
  initial: string;
  dot: string;
  key: string;
}

interface SearchAllEntry extends SearchResult {
  go: 'client' | string; // 'client' or an invoice number
}

function buildSearchAll(): SearchAllEntry[] {
  const all: SearchAllEntry[] = [];
  petsDef.forEach(([id, name, breed, owner]) => {
    all.push({ type: 'Pet', title: name, sub: breed + ' · ' + owner, initial: name[0], dot: petColors[id], key: 'pet-' + id, go: 'client' });
  });
  const owners = [...new Set(petsDef.map((p) => p[3]))];
  owners.forEach((owner) => {
    const pet = petsDef.find((p) => p[3] === owner)!;
    all.push({ type: 'Client', title: owner, sub: pet[1] + '’s owner · ' + (ownerAddr[owner] || 'London'), initial: owner[0], dot: 'var(--fg-secondary)', key: 'client-' + owner, go: 'client' });
  });
  Object.entries(invDefs).forEach(([no, d]) => {
    const amt = d.items.reduce((s, it) => s + parseFloat(it.amount.replace('£', '')), 0);
    all.push({ type: 'Invoice', title: no, sub: d.client + ' · £' + amt.toFixed(2), initial: '#', dot: 'var(--fg-tertiary)', key: 'inv-' + no, go: no });
  });
  return all;
}

export function searchFor(query: string): SearchAllEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = buildSearchAll();
  return all.filter((r) => (r.title + ' ' + r.sub + ' ' + r.type).toLowerCase().includes(q)).slice(0, 7);
}
