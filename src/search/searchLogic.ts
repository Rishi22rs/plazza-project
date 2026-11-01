import type { Medicine } from '../catalog/catalog';

/** Whitespace/case normalization is shared by filtering and history deduplication. */
export const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

export function searchMedicines(items: readonly Medicine[], query: string): readonly Medicine[] {
  const term = normalizeQuery(query);
  if (!term) return []; // Empty input is its own UI state, not a no-results failure.
  return items.filter(item => normalizeQuery(item.name).includes(term) || normalizeQuery(item.salt).includes(term));
}

/** A repeated search moves to the front; only five intentional searches survive. */
export function rememberSearch(history: readonly string[], query: string): string[] {
  const clean = query.trim().replace(/\s+/g, ' ');
  if (!clean) return [...history];
  return [clean, ...history.filter(item => normalizeQuery(item) !== normalizeQuery(clean))].slice(0, 5);
}

export function decodeHistory(value: unknown): string[] {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('searches' in value) || !Array.isArray(value.searches)) return [];
  // Validate unknown saved data before using it; keep the saved newest-first order.
  return value.searches.filter((item): item is string => typeof item === 'string').reduceRight<string[]>((history, item) => rememberSearch(history, item), []);
}
