import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePermissions } from '../permissions/PermissionProvider';
import type { PermissionKind } from '../permissions/permissionState';
import { theme } from '../theme/theme';

/** The brief requires this debug banner even though it is absent in references. */
export function PermissionPanel() {
  const { permissions, busy, request, openSettings, locationError, actionError, retryLocation } = usePermissions();

  return (
    <View style={styles.panel}>
      <Text style={styles.debug} accessibilityLiveRegion="polite">
        Permissions · Location: {permissions.location} · Notifications: {permissions.notifications}
      </Text>
      {(['location', 'notifications'] as const).map((kind: PermissionKind) => {
        const status = permissions[kind];
        if (status === 'granted' || status === 'checking') return null;
        const title = kind === 'location' ? 'Location' : 'Notifications';
        const blocked = status === 'blocked';
        return (
          <View key={kind} style={styles.section}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>
              {status === 'unavailable' ? 'Available in the Android app.'
                : blocked ? `${title} access is blocked. Enable it in App Settings.`
                : status === 'error' ? `Could not check ${title.toLowerCase()} access. Please retry.`
                : kind === 'location' ? 'Allow location to display your delivery coordinates. You can still browse.'
                : 'Allow notifications for order updates. You can still browse.'}
            </Text>
            {status !== 'unavailable' && (
              <Pressable accessibilityRole="button" accessibilityLabel={blocked ? `Open App Settings for ${title.toLowerCase()}` : `Allow ${title.toLowerCase()}`}
                disabled={busy} accessibilityState={{ disabled: busy }}
                onPress={() => blocked ? openSettings() : request(kind)} style={styles.button}>
                <Text style={styles.buttonText}>{busy ? 'Please wait…' : blocked ? 'Open App Settings' : 'Try again'}</Text>
              </Pressable>
            )}
          </View>
        );
      })}
      {locationError && (
        <View style={styles.section}>
          <Text style={styles.title}>Location allowed · Coordinates unavailable</Text>
          <Text style={styles.description} accessibilityLiveRegion="polite">{locationError}</Text>
          <Pressable accessibilityRole="button" onPress={retryLocation} style={styles.button}>
            <Text style={styles.buttonText}>Try getting coordinates again</Text>
          </Pressable>
        </View>
      )}
      {actionError && <Text accessibilityRole="alert" style={styles.description}>{actionError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: 16, padding: 12, gap: 8, backgroundColor: theme.colors.blueSoft, borderRadius: 12 },
  debug: { fontSize: 12, lineHeight: 18, color: theme.colors.purple },
  section: { gap: 6 },
  title: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  description: { fontSize: 14, lineHeight: 21, color: theme.colors.textSecondary },
  // Pressable intentionally has no active-opacity animation, as requested.
  button: { alignSelf: 'flex-start', minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: theme.colors.purple, borderRadius: 10 },
  buttonText: { fontSize: 14, fontWeight: '600', color: theme.colors.purple },
});
