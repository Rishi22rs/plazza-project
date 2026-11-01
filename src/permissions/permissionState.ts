/** Small app-facing vocabulary, independent of Expo's permission objects. */
export type PermissionState = 'checking' | 'undetermined' | 'granted' | 'denied' | 'blocked' | 'unavailable' | 'error';
export type PermissionKind = 'location' | 'notifications';

type NativePermission = {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
};

/**
 * A denial alone is not a permanent block. Android may allow another request.
 * canAskAgain is the native signal that determines whether Settings is needed.
 */
export function toPermissionState(permission: NativePermission): PermissionState {
  if (permission.granted) return 'granted';
  if (!permission.canAskAgain) return 'blocked';
  if (permission.status === 'undetermined') return 'undetermined';
  return 'denied';
}

/** Location is requested once on each cold start when the OS permits a prompt.
 * Resume refreshes never use this rule, so dismissing a dialog cannot loop it.
 */
export function shouldRequestLocationOnStartup(state: PermissionState): boolean {
  return state === 'undetermined' || state === 'denied';
}
