import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../../cart/CartProvider';
import { catalog } from '../../catalog/catalog';
import { FloatingCart } from '../../components/FloatingCart';
import { MedicineCard } from '../../components/MedicineCard';
import { MobileContent } from '../../components/MobileContent';
import { PermissionPanel } from '../../components/PermissionPanel';
import { usePermissions } from '../../permissions/PermissionProvider';
import { SearchEntry } from '../../components/SearchEntry';
import { theme } from '../../theme/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const cart = useCart();
  const { coordinates, locating, permissions } = usePermissions();
  const deliveryLabel = coordinates ?? (locating ? 'Finding your location…' : permissions.location === 'granted' ? 'Location unavailable' : 'Location not set');
  // Keep touch controls readable on narrow phones or with enlarged system text.
  // FlatList requires remounting when numColumns changes, hence its matching key.
  const columns = width < 360 || fontScale > 1.3 ? 1 : 2;
  const cardWidth = (Math.min(width, 600) - 36 - 16) / 2;
  const products = catalog;


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
                <SearchEntry />
                <View style={styles.category}><Ionicons name="medical-outline" size={25} color="white" accessible={false} /><Text style={styles.categoryText}>Pharmacy</Text></View>
              </MobileContent>
            </View>
            <MobileContent>
              <PermissionPanel />
              {cart.error && <Text style={styles.warning}>{cart.error}</Text>}
              <View style={styles.content}>
                <View style={styles.headingRow}>
                  <Text style={styles.heading} accessibilityRole="header">Browse medicines</Text>
                  <Text style={styles.description}>{products.length} medicines</Text>
                </View>
                <Text style={styles.description}>Find medicines and health essentials.</Text>
                <View style={{ height: 20 }} />
              </View>
            </MobileContent>
          </>
        }
        ListFooterComponent={<Pressable accessibilityRole="link" accessibilityLabel="Medicine illustrations by Icons8" onPress={() => { void Linking.openURL('https://icons8.com/icons').catch(() => {}); }} style={{ minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12 }}><Text style={styles.description}>Medicine illustrations by Icons8</Text></Pressable>}
        renderItem={({ item }) => {
          const card = <MedicineCard medicine={item} quantity={cart.items[item.id] ?? 0} ready={cart.ready} imageHeight={columns === 2 ? cardWidth - 40 : Math.min(width - 76, 220)} onChange={delta => cart.change(item.id, delta)} />;
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
  headingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  warning: { fontSize: 13, lineHeight: 20, color: '#9D3434', marginTop: 8 },
  header: { backgroundColor: theme.colors.purple },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  locationIcon: { padding: 12, borderRadius: 14, backgroundColor: theme.colors.surface },
  // flex: 1 + minWidth: 0 lets text fit its column instead of pushing the row wide.
  locationText: { flex: 1, minWidth: 0, gap: 3 },
  locationTitle: { fontSize: 20, fontFamily: theme.fonts.bold, color: theme.colors.white },
  locationDescription: { fontSize: 14, color: theme.colors.white },
  category: { alignSelf: 'flex-start', minWidth: 100, alignItems: 'center', gap: 6, paddingTop: 24, paddingBottom: 12, borderBottomWidth: 3, borderBottomColor: theme.colors.white },
  categoryText: { color: theme.colors.white, fontSize: 14, fontWeight: '600' },
  content: { paddingTop: 28 },
  heading: { fontSize: 24, fontFamily: theme.fonts.bold, color: theme.colors.text },
  description: { marginTop: 8, fontSize: 16, fontFamily: theme.fonts.regular, lineHeight: 24, color: theme.colors.textSecondary },
});
