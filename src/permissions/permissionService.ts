import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { toPermissionState } from './permissionState';
import type { PermissionKind, PermissionState } from './permissionState';

/** Native APIs live here so UI and lifecycle code do not depend on SDK details. */
export async function readPermission(kind: PermissionKind): Promise<PermissionState> {
  // This assignment targets Android. A browser preview must not request a
  // browser location permission or pretend it represents Android OS settings.
  if (Platform.OS !== 'android') return 'unavailable';
  try {
    const response = kind === 'location'
      ? await Location.getForegroundPermissionsAsync()
      : await Notifications.getPermissionsAsync();
    return toPermissionState(response);
  } catch {
    // SDK/native failures are different from a user's denial.
    return 'error';
  }
}

export async function requestPermission(kind: PermissionKind): Promise<PermissionState> {
  const current = await readPermission(kind);
  if (current !== 'undetermined' && current !== 'denied') return current;

  try {
    if (kind === 'notifications') {
      // Android 13+ needs a notification channel before requesting permission.
      // This creates a local channel only: no push token or backend is involved.
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order updates',
        importance: AndroidImportance.DEFAULT,
      });
      return toPermissionState(await Notifications.requestPermissionsAsync());
    }
    // Foreground only: no background tracking or reverse geocoding is required.
    return toPermissionState(await Location.requestForegroundPermissionsAsync());
  } catch {
    return 'error';
  }
}

export const openAppSettings = () => Linking.openSettings();

/**
 * One coordinate lookup, never continuous tracking. A timeout keeps a missing
 * emulator GPS fix from leaving the UI stuck indefinitely. The native request
 * cannot be cancelled here; the caller ignores late results after cleanup.
 */
export async function locate(): Promise<string> {
  if (!(await Location.hasServicesEnabledAsync())) {
    throw new Error('Location access is allowed, but device location services are off. Turn them on to get coordinates.');
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // A recent OS fix avoids waiting for GPS unnecessarily. Reject old or very
    // imprecise cached positions rather than presenting them as current data.
    const cached = await Location.getLastKnownPositionAsync({ maxAge: 60000, requiredAccuracy: 1000 });
    if (cached) {
      return `${cached.coords.latitude.toFixed(4)}, ${cached.coords.longitude.toFixed(4)}`;
    }
    const position = await Promise.race([
      // A one-shot high-accuracy request can use GPS when the emulator's network
      // provider has no fix. This still does not subscribe to continuous tracking.
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Location access is allowed, but no coordinates were received. Check device GPS or set a location in the emulator, then try again.')), 20000);
      }),
    ]);
    return `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
  } finally {
    clearTimeout(timer);
  }
}
