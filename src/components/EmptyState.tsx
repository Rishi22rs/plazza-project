import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';

type EmptyStateProps = {
  // Deriving the icon name type catches spelling mistakes during type checking.
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
};

/** Presentation only: the screen decides when this state should be shown. */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon} accessible={false}>
        <Ionicons name={icon} size={36} color={theme.colors.purple} />
      </View>
      <Text style={styles.title} accessibilityRole="header">{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  icon: { padding: 20, borderRadius: 28, backgroundColor: theme.colors.primarySoft },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  description: { fontSize: 16, lineHeight: 24, color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 340 },
});
