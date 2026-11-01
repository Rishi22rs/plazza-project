import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, FlatList, Keyboard, Linking, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../cart/CartProvider';
import { catalog } from '../catalog/catalog';
import { FloatingCart } from '../components/FloatingCart';
import { EmptyState } from '../components/EmptyState';
import { MedicineCard } from '../components/MedicineCard';
import { MobileContent } from '../components/MobileContent';
import { PermissionPanel } from '../components/PermissionPanel';
import { usePermissions } from '../permissions/PermissionProvider';
import { useMedicineSearch } from '../search/useMedicineSearch';
import { theme } from '../theme/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const search = useMedicineSearch();
  const cart = useCart();
  const { coordinates, locating, permissions } = usePermissions();
  const deliveryLabel = coordinates ?? (locating ? 'Finding your location…' : permissions.location === 'granted' ? 'Location unavailable' : 'Location not set');
  // Keep touch controls readable on narrow phones or with enlarged system text.
  // FlatList requires remounting when numColumns changes, hence its matching key.
  const columns = width < 360 || fontScale > 1.3 ? 1 : 2;
  const cardWidth = (Math.min(width, 600) - 36 - 16) / 2;
  const products = search.loading ? [] : search.empty ? catalog : search.results;

  const submit = () => {
    search.remember(); // Record intentional submission, not every partial keystroke.
    Keyboard.dismiss();
  };

  return (
    <View style={styles.screen}>
      {/* A single virtualized list owns scrolling; do not nest it in ScrollView.
          The header is an element, not an inline component function that would
          remount the input (and lose focus) on every keystroke. */}
      <FlatList
        key={columns}
        numColumns={columns}
        data={products}
        extraData={cart.items}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        columnWrapperStyle={columns === 2 ? [styles.grid, styles.row] : undefined}
        ListHeaderComponent={
          <>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
              <MobileContent>
                <View style={styles.locationRow}>
                  <View style={styles.locationIcon} accessible={false}><Ionicons name="rocket-sharp" size={28} color="#777777" /></View>
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
                    value={search.query} onChangeText={search.setQuery}
                    editable={search.ready}
                    onSubmitEditing={submit}
                    autoCapitalize="none" autoCorrect={false} returnKeyType="search"
                    style={styles.searchInput}
                  />
                  {search.query !== '' && <Pressable accessibilityRole="button" accessibilityLabel="Clear medicine search" onPress={() => search.setQuery('')} style={styles.clear}><Ionicons name="close" size={22} color={theme.colors.textSecondary} /></Pressable>}
                </View>
                <View style={styles.category}><Ionicons name="medical-outline" size={25} color="white" accessible={false} /><Text style={styles.categoryText}>Pharmacy</Text></View>
              </MobileContent>
            </View>
            <MobileContent>
              <PermissionPanel />
              {search.storageError && <Text style={styles.warning}>{search.storageError}</Text>}
              {cart.error && <Text style={styles.warning}>{cart.error}</Text>}
              <View style={styles.content}>
                {search.recent.length > 0 && <>
                  <Text style={styles.description}>Recent searches</Text>
                  <View style={styles.recent}>
                    {search.recent.map(term => <Pressable key={term.toLowerCase()} accessibilityRole="button" accessibilityLabel={`Search again for ${term}`} onPress={() => { search.setQuery(term); search.remember(term); }} style={styles.chip}><Text style={styles.chipText}>{term}</Text></Pressable>)}
                  </View>
                </>}
                <View style={styles.headingRow}>
                  <Text style={styles.heading} accessibilityRole="header">{search.empty ? 'Browse medicines' : 'Search results'}</Text>
                  {!search.loading && <Text style={styles.description} accessibilityLiveRegion="polite">{products.length} medicines</Text>}
                </View>
                {search.empty && <Text style={styles.description}>Search by medicine name or salt.</Text>}
                <View style={{ height: 20 }} />
              </View>
            </MobileContent>
          </>
        }
        ListFooterComponent={<Pressable accessibilityRole="link" accessibilityLabel="Medicine illustrations by Icons8" onPress={() => { void Linking.openURL('https://icons8.com/icons').catch(() => {}); }} style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12 }}><Text style={styles.description}>Medicine illustrations by Icons8</Text></Pressable>}
        ListEmptyComponent={
          <MobileContent>
            {search.loading ? <View style={styles.feedback}><ActivityIndicator color={theme.colors.purple} accessibilityLabel="Searching medicines" /><Text style={styles.description}>Searching medicines…</Text></View>
              : <EmptyState icon="search-outline" title="No medicines found" description="Try another medicine name or salt." />}
          </MobileContent>
        }
        renderItem={({ item }) => {
          const card = <MedicineCard medicine={item} quantity={cart.items[item.id] ?? 0} ready={cart.ready} imageHeight={columns === 2 ? cardWidth - 40 : Math.min(width - 76, 220)} onChange={delta => { cart.change(item.id, delta); if (delta === 1) search.remember(); }} />;
          // Explicit half widths prevent a final odd card from stretching full row.
          return columns === 2 ? <View style={{ width: cardWidth }}>{card}</View> : <MobileContent>{card}</MobileContent>;
        }}
      />
      <FloatingCart count={cart.count} imageUrl={catalog.find(item => cart.items[item.id] > 0)?.imageUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.white },
  list: { paddingBottom: 130 },
  row: { gap: 16 },
  grid: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 18 },
  recent: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 14 },
  chip: { minHeight: 48, justifyContent: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#F1F4F8' },
  chipText: { color: theme.colors.purple, fontSize: 14 },
  clear: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  headingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  feedback: { paddingVertical: 24, alignItems: 'center', gap: 12 },
  warning: { fontSize: 13, lineHeight: 20, color: '#9D3434', marginTop: 8 },
  header: { backgroundColor: theme.colors.purple },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  locationIcon: { padding: 12, borderRadius: 14, backgroundColor: theme.colors.surface },
  // flex: 1 + minWidth: 0 lets text fit its column instead of pushing the row wide.
  locationText: { flex: 1, minWidth: 0, gap: 3 },
  locationTitle: { fontSize: 20, fontFamily: theme.fonts.bold, color: theme.colors.white },
  locationDescription: { fontSize: 14, color: theme.colors.white },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: 56, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, backgroundColor: theme.colors.search },
  // No fixed height or maxFontSizeMultiplier: the input can grow with font size.
  searchInput: { flex: 1, minWidth: 0, fontSize: 16, fontFamily: theme.fonts.regular, paddingVertical: 16, color: theme.colors.text },
  category: { alignSelf: 'flex-start', minWidth: 100, alignItems: 'center', gap: 6, paddingTop: 24, paddingBottom: 12, borderBottomWidth: 3, borderBottomColor: theme.colors.white },
  categoryText: { color: theme.colors.white, fontSize: 14, fontWeight: '600' },
  content: { paddingTop: 28 },
  heading: { fontSize: 24, fontFamily: theme.fonts.bold, color: theme.colors.text },
  description: { marginTop: 8, fontSize: 16, fontFamily: theme.fonts.regular, lineHeight: 24, color: theme.colors.textSecondary },
});
