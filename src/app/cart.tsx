import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { MobileContent } from '../components/MobileContent';
import { theme } from '../theme/theme';

/** The empty-cart screen is intentional; we do not simulate cart data or totals. */
export default function CartScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <MobileContent>
          <View style={styles.titleRow}>
            {/* A direct route is predictable even when Cart was opened first.
                back() would depend on whether navigation history exists. */}
            <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={() => router.navigate('/')} style={styles.back}>
              <Ionicons name="arrow-back" size={26} color={theme.colors.textSecondary} />
            </Pressable>
            <Text style={styles.title} accessibilityRole="header">Cart</Text>
          </View>
        </MobileContent>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <MobileContent>
          <View style={styles.card}>
            <EmptyState icon="bag-outline" title="Your cart is empty" description="Find the medicines you need and add them to your cart." />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate('/')}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Find medicines</Text>
            </Pressable>
          </View>
        </MobileContent>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.white },
  header: { backgroundColor: theme.colors.white },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  back: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 22, color: theme.colors.text },
  // flexGrow fills tall devices while ScrollView handles short screens/large text.
  scroll: { flexGrow: 1, paddingVertical: 28, backgroundColor: theme.colors.surface },
  card: { backgroundColor: theme.colors.white, borderRadius: 20, padding: 20 },
  button: { minHeight: 56, paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: theme.colors.primary },
  buttonText: { fontSize: 16, fontWeight: '700', color: theme.colors.white, textAlign: 'center' },
});
