import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AppState } from 'react-native';

import { locate, openAppSettings, readPermission, requestPermission } from './permissionService';
import type { PermissionKind, PermissionState } from './permissionState';
import { shouldRequestLocationOnStartup } from './permissionState';
import { hasPromptedNotifications, markNotificationsPrompted } from './promptHistory';

type Permissions = Record<PermissionKind, PermissionState>;
type PermissionContextValue = {
  permissions: Permissions;
  busy: boolean;
  coordinates: string | null;
  locating: boolean;
  locationError: string | null;
  actionError: string | null;
  request: (kind: PermissionKind) => void;
  openSettings: () => void;
  retryLocation: () => void;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

/**
 * Mounted above tabs so navigation does not restart first-launch requests.
 * Android is the source of truth: we never persist a permission boolean that
 * could become stale when the user revokes access in Settings.
 */
export function PermissionProvider({ children }: PropsWithChildren) {
  const [permissions, setPermissions] = useState<Permissions>({ location: 'checking', notifications: 'checking' });
  const [busy, setBusy] = useState(true);
  const [locationResult, setLocationResult] = useState<{ revision: number; coordinates: string | null; error: string | null } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [locationRevision, setLocationRevision] = useState(0);
  // Derive loading and visibility from the latest request identity. No stale
  // coordinates are displayed after revocation or while a retry is running.
  const currentResult = permissions.location === 'granted' && locationResult?.revision === locationRevision ? locationResult : null;
  const coordinates = currentResult?.coordinates ?? null;
  const locationError = currentResult?.error ?? null;
  const locating = permissions.location === 'granted' && currentResult === null;
  const mounted = useRef(false);
  const initialRequestStarted = useRef(false);
  // Serialize startup, manual requests and resume refreshes. System dialogs may
  // themselves produce AppState events; overlapping dialogs must never occur.
  const queue = useRef<Promise<void>>(Promise.resolve());

  const enqueue = useCallback((operation: () => Promise<void>) => {
    queue.current = queue.current.then(async () => {
      if (!mounted.current) return;
      setBusy(true);
      try {
        await operation();
      } catch {
        if (mounted.current) setActionError('Could not update permissions. Please try again.');
      } finally {
        if (mounted.current) setBusy(false);
      }
    });
  }, []);

  const synchronize = useCallback(async (firstLaunch: boolean) => {
    const next: Permissions = {
      location: await readPermission('location'),
      notifications: await readPermission('notifications'),
    };
    // Android's notifications module can report denied before the first prompt.
    // A separate local attempt marker disambiguates that case without treating
    // saved data as proof of an OS grant. Location is also requested after a
    // retryable denial on cold start, as requested; never when granted/blocked.
    if (firstLaunch) {
      for (const kind of ['location', 'notifications'] as const) {
        const firstNotificationRequest = kind === 'notifications'
          && next[kind] === 'denied' && !(await hasPromptedNotifications());
        const retryLocationOnStartup = kind === 'location' && shouldRequestLocationOnStartup(next[kind]);
        if (next[kind] === 'undetermined' || firstNotificationRequest || retryLocationOnStartup) {
          if (kind === 'notifications') await markNotificationsPrompted();
          next[kind] = await requestPermission(kind);
        }
      }
    }
    if (mounted.current) {
      setPermissions(next);
      // Also retry GPS on resume if permission was already granted but device
      // location services changed while the app was in the background.
      setLocationRevision(value => value + 1);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!initialRequestStarted.current) {
      initialRequestStarted.current = true;
      enqueue(() => synchronize(true));
    }
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', nextState => {
      if (previousState !== 'active' && nextState === 'active') {
        // Read only on return: never reopen a permission dialog from a resume.
        enqueue(() => synchronize(false));
      }
      previousState = nextState;
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [enqueue, synchronize]);

  useEffect(() => {
    let cancelled = false;
    if (permissions.location !== 'granted') return;

    void locate().then(value => {
      if (!cancelled) setLocationResult({ revision: locationRevision, coordinates: value, error: null });
    }).catch((error: unknown) => {
      if (!cancelled) setLocationResult({ revision: locationRevision, coordinates: null, error: error instanceof Error ? error.message : 'Location unavailable. Please retry.' });
    });
    // A late GPS result must not restore coordinates after permission revocation
    // or overwrite a newer lookup. Cleanup invalidates this particular request.
    return () => { cancelled = true; };
  }, [permissions.location, locationRevision]);

  const request = (kind: PermissionKind) => enqueue(async () => {
    setActionError(null);
    if (kind === 'notifications') await markNotificationsPrompted();
    const result = await requestPermission(kind);
    await synchronize(false);
    if (result === 'error' && mounted.current) {
      setActionError('Could not request permission. Please try again.');
    }
  });

  const openSettings = () => {
    setActionError(null);
    void openAppSettings().catch(() => {
      if (mounted.current) setActionError('Could not open Settings. Open this app’s permissions in Android Settings.');
    });
  };

  return (
    <PermissionContext.Provider value={{ permissions, busy, coordinates, locating, locationError, actionError, request, openSettings, retryLocation: () => setLocationRevision(value => value + 1) }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) throw new Error('usePermissions must be used inside PermissionProvider');
  return context;
}
