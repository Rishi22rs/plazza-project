import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

/**
 * Read first, write second: otherwise the initial empty state could overwrite a
 * saved cart/history before hydration finishes. Callers disable edits until ready.
 * decode validates unknown JSON and supplies version-specific fallback behavior.
 */
export function usePersistentState<T>(key: string, initial: T, decode: (value: unknown) => T, encode: (value: T) => unknown) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const writes = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    void AsyncStorage.getItem(key).then(raw => {
      const restored = raw === null ? initial : decode(JSON.parse(raw) as unknown);
      if (!cancelled) setValue(restored);
    }).catch(() => {
      if (!cancelled) setError('Saved data could not be restored. You can continue with an empty list.');
    }).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
    // initial/decode/encode are module-level stable values at each call site.
  }, [key, initial, decode]);

  useEffect(() => {
    if (!ready) return;
    // Serialize writes so an older async write cannot finish after a newer one.
    const json = JSON.stringify(encode(value));
    let cancelled = false;
    writes.current = writes.current.then(() => AsyncStorage.setItem(key, json)).catch(() => {
      if (!cancelled) setError('Changes could not be saved on this device.');
    });
    return () => { cancelled = true; };
  }, [key, ready, value, encode]);

  return { value, setValue, ready, error };
}
