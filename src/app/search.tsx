import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Linking, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../cart/CartProvider';
import { catalog } from '../catalog/catalog';
import { EmptyState } from '../components/EmptyState';
import { FloatingCart } from '../components/FloatingCart';
import { MedicineCard } from '../components/MedicineCard';
import { MobileContent } from '../components/MobileContent';
import { useMedicineSearch } from '../search/useMedicineSearch';
import { theme } from '../theme/theme';

/** Dedicated route owns typing/history. Home only links here, so there is a
 * single live reader/writer of recent-search storage, not two competing hooks. */
export default function SearchScreen() {
  const search = useMedicineSearch();
  const cart = useCart();
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const columns = width < 360 || fontScale > 1.3 ? 1 : 2;
  const cardWidth = (Math.min(width, 600) - 52) / 2;
  const products = search.loading ? [] : search.empty ? catalog : search.results;

  useEffect(() => {
    if (search.ready) input.current?.focus();
  }, [search.ready]);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const submit = () => { search.remember(); Keyboard.dismiss(); };
  const goBack = () => { Keyboard.dismiss(); if (router.canGoBack()) router.back(); else router.replace('/'); };

  return <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
    {/* Pinned pale-blue header follows the reference search screen. The input
        stays outside FlatList so changing grid columns cannot remount it. */}
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <MobileContent><View style={styles.field}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={goBack} style={styles.iconButton}><Ionicons name="arrow-back" size={25} color={theme.colors.textSecondary} /></Pressable>
        <TextInput ref={input} editable={search.ready} accessibilityLabel="Search medicines by name or salt" placeholder="Search for medicines and more..." placeholderTextColor={theme.colors.textSecondary} value={search.query} onChangeText={search.setQuery} onSubmitEditing={submit} autoCorrect={false} autoCapitalize="none" returnKeyType="search" style={styles.input} />
        {search.query !== '' && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => { search.setQuery(''); input.current?.focus(); }} style={styles.iconButton}><Ionicons name="close" size={21} color={theme.colors.textSecondary} /></Pressable>}
      </View></MobileContent>
    </View>
    <FlatList
      key={columns}
      data={products}
      numColumns={columns}
      keyExtractor={item => item.id}
      extraData={cart.items}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.list}
      columnWrapperStyle={columns === 2 ? styles.gridRow : undefined}
      ListHeaderComponent={<MobileContent>
        {search.storageError && <Text style={styles.message}>{search.storageError}</Text>}
        {cart.error && <Text style={styles.message}>{cart.error}</Text>}
        {search.recent.length > 0 && <View style={styles.history}>
          <Text style={styles.historyTitle}>Recent searches</Text>
          <View style={styles.chips}>{search.recent.map(term => <Pressable key={term.toLowerCase()} accessibilityRole="button" accessibilityLabel={`Search again for ${term}`} onPress={() => { search.setQuery(term); search.remember(term); Keyboard.dismiss(); }} style={styles.chip}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} /><Text style={styles.chipText}>{term}</Text>
          </Pressable>)}</View>
        </View>}
        <View style={styles.resultHeader}><Text style={styles.heading} accessibilityRole="header">{search.empty ? 'Browse medicines' : 'Search results'}</Text>{!search.loading && <Text accessibilityLiveRegion="polite" style={styles.resultCount}>{products.length} medicines</Text>}</View>
      </MobileContent>}
      ListEmptyComponent={<MobileContent>{search.loading ? <View style={styles.loading}><ActivityIndicator color={theme.colors.purple} accessibilityLabel="Searching medicines" /><Text style={styles.message}>Searching medicines…</Text></View> : <EmptyState icon="search-outline" title="No medicines found" description="Try another medicine name or salt." />}</MobileContent>}
      ListFooterComponent={<Pressable accessibilityRole="link" accessibilityLabel="Medicine illustrations by Icons8" onPress={() => { void Linking.openURL('https://icons8.com/icons').catch(() => {}); }} style={styles.credit}><Text style={styles.resultCount}>Medicine illustrations by Icons8</Text></Pressable>}
      renderItem={({ item }) => {
        const card = <MedicineCard medicine={item} quantity={cart.items[item.id] ?? 0} ready={cart.ready} imageHeight={columns === 2 ? cardWidth - 40 : Math.min(width - 76, 220)} onChange={delta => { cart.change(item.id, delta); if (delta === 1) search.remember(); }} />;
        return columns === 2 ? <View style={{ width: cardWidth }}>{card}</View> : <MobileContent>{card}</MobileContent>;
      }}
    />
    {/* Search has no tabs; reserve its own system gesture inset for the pill. */}
    {!keyboardVisible && <View pointerEvents="box-none" style={[styles.cartAnchor, { bottom: insets.bottom }]}><FloatingCart count={cart.count} imageUrl={catalog.find(item => cart.items[item.id] > 0)?.imageUrl} /></View>}
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: theme.colors.blueSoft, paddingBottom: 14 },
  field: { flexDirection: 'row', alignItems: 'center', minHeight: 56, borderWidth: 1, borderColor: '#DEDEDE', borderRadius: 14, backgroundColor: theme.colors.search, paddingRight: 4 },
  iconButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minWidth: 0, fontFamily: theme.fonts.regular, fontSize: 16, paddingVertical: 16, color: theme.colors.text },
  list: { paddingBottom: 130 },
  gridRow: { width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 18, gap: 16 },
  history: { paddingTop: 22, gap: 10 },
  historyTitle: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F2F4F7', borderRadius: 12, maxWidth: '100%' },
  chipText: { flexShrink: 1, fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textSecondary },
  resultHeader: { paddingTop: 26, paddingBottom: 24, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  heading: { fontFamily: theme.fonts.bold, fontSize: 23, color: theme.colors.text },
  resultCount: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.textSecondary },
  message: { marginTop: 12, fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.textSecondary },
  loading: { padding: 28, alignItems: 'center' },
  credit: { minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center' },
  cartAnchor: { position: 'absolute', left: 0, right: 0, height: 0 },
});
