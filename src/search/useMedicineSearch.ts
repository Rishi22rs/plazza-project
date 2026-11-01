import { useEffect, useState } from 'react';

import { catalog } from '../catalog/catalog';
import { usePersistentState } from '../storage/usePersistentState';
import { decodeHistory, normalizeQuery, rememberSearch, searchMedicines } from './searchLogic';

const EMPTY_HISTORY: string[] = [];
const encodeHistory = (searches: string[]) => ({ version: 1, searches });

export function useMedicineSearch() {
  const [query, setQuery] = useState('');
  const [settledQuery, setSettledQuery] = useState('');
  const history = usePersistentState('plazza:recent-searches', EMPTY_HISTORY, decodeHistory, encodeHistory);
  const normalized = normalizeQuery(query);

  useEffect(() => {
    // Local filtering is cheap; debounce avoids flashing result sets for every
    // keystroke. Cleanup prevents an older timer from publishing a stale query.
    const timer = setTimeout(() => setSettledQuery(normalized), 180);
    return () => clearTimeout(timer);
  }, [normalized]);

  const loading = normalized !== '' && normalized !== settledQuery;
  const results = loading ? [] : searchMedicines(catalog, normalized);
  const remember = (term = query) => {
    if (history.ready) history.setValue(previous => rememberSearch(previous, term));
  };

  return { query, setQuery, loading, results, empty: normalized === '', recent: history.value, ready: history.ready, storageError: history.error, remember };
}
