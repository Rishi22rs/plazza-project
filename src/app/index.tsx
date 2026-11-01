import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { MobileContent } from '../components/MobileContent';
import { PermissionPanel } from '../components/PermissionPanel';
import { usePermissions } from '../permissions/PermissionProvider';
import { theme } from '../theme/theme';

export default function HomeScreen() {
  // This is temporary local input state, not catalog/search business logic.
  // Later, the search feature will consume this value and provide real results.
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const { coordinates, locating, permissions } = usePermissions();
  const deliveryLabel = coordinates ?? (locating ? 'Finding your location…' : permissions.location === 'granted' ? 'Location unavailable' : 'Location not set');

  return (
    <View style={styles.screen}>
      {/* Scroll the whole page so short phones and large text remain usable.
          Keyboard taps should reach controls instead of only dismissing input. */}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <MobileContent>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon} accessible={false}>
                <Ionicons name="rocket-sharp" size={28} color="#777777" />
              </View>
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>Delivering to</Text>
                <Text style={styles.locationDescription} accessibilityLiveRegion="polite">{deliveryLabel}</Text>
              </View>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={27} color={theme.colors.text} accessible={false} />
              <TextInput
                accessibilityLabel="Search medicines by name or salt"
                placeholder="Search for medicines and more..."
                placeholderTextColor={theme.colors.textSecondary}
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                style={styles.searchInput}
              />
            </View>
            {/* This label is not a fake category button: Pharmacy is the only
                catalog required by this assignment. Extra categories are deferred. */}
            <View style={styles.category}>
              <Ionicons name="medical-outline" size={25} color="white" accessible={false} />
              <Text style={styles.categoryText}>Pharmacy</Text>
            </View>
          </MobileContent>
        </View>
        <MobileContent>
          <PermissionPanel />
          <View style={styles.content}>
            <Text style={styles.heading} accessibilityRole="header">Find your medicines</Text>
            <Text style={styles.description}>Search by medicine name or salt.</Text>
            <EmptyState
              icon="search-outline"
              title="Your medicines, one search away"
              description="Search for the medicines you need by name or salt."
            />
          </View>
        </MobileContent>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.white },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  header: { backgroundColor: theme.colors.purple },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  locationIcon: { padding: 12, borderRadius: 14, backgroundColor: theme.colors.surface },
  // flex: 1 + minWidth: 0 lets text fit its column instead of pushing the row wide.
  locationText: { flex: 1, minWidth: 0, gap: 3 },
  locationTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.white },
  locationDescription: { fontSize: 14, color: theme.colors.white },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: 56, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, backgroundColor: theme.colors.search },
  // No fixed height or maxFontSizeMultiplier: the input can grow with font size.
  searchInput: { flex: 1, minWidth: 0, fontSize: 16, paddingVertical: 16, color: theme.colors.text },
  category: { alignSelf: 'flex-start', minWidth: 100, alignItems: 'center', gap: 6, paddingTop: 24, paddingBottom: 12, borderBottomWidth: 3, borderBottomColor: theme.colors.white },
  categoryText: { color: theme.colors.white, fontSize: 14, fontWeight: '600' },
  content: { paddingTop: 28 },
  heading: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  description: { marginTop: 8, fontSize: 16, lineHeight: 24, color: theme.colors.textSecondary },
});
