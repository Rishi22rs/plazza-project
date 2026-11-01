import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../../cart/CartProvider';
import { formatMoney } from '../../cart/promotions';
import { catalog } from '../../catalog/catalog';
import { BillBreakdown } from '../../components/BillBreakdown';
import { CartItem } from '../../components/CartItem';
import { CouponPanel } from '../../components/CouponPanel';
import { EmptyState } from '../../components/EmptyState';
import { MobileContent } from '../../components/MobileContent';
import { theme } from '../../theme/theme';

/** Screenshot-based composition. Money and coupon decisions stay in the provider. */
export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const selected = catalog.filter(item => (cart.items[item.id] ?? 0) > 0);

  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <MobileContent><View style={styles.titleRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={() => router.navigate('/')} style={styles.back}><Ionicons name="arrow-back" size={26} color={theme.colors.textSecondary} /></Pressable>
      <Text style={styles.title}>Cart</Text>
    </View></MobileContent>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {selected.length > 0 && <View style={styles.guarantee}>
        {/* Decorative rays use native views, not a crop of the reference image. */}
        <View style={styles.rays} pointerEvents="none">{[-65, -30, 15, 55].map(angle => <View key={angle} style={[styles.ray, { transform: [{ rotate: `${angle}deg` }] }]} />)}</View>
        <Text style={styles.guaranteeTitle}>LOWEST PRICE GUARANTEE</Text>
        <Text style={styles.guaranteeCopy}>{cart.bill.savings > 0 ? `You saved ${formatMoney(cart.bill.savings)} on this order` : 'Apply a coupon to save on this order'}</Text>
      </View>}
      <MobileContent>
        {cart.error && <Text style={styles.message}>{cart.error}</Text>}
        {cart.message && <Text accessibilityLiveRegion="polite" style={styles.message}>{cart.message}</Text>}
        {selected.length ? <>
          <View style={styles.itemCard}>
            <View style={styles.orderHeader}><View style={styles.pin}><Ionicons name="bag-handle-outline" size={26} color="#82858A" /></View><View style={styles.orderCopy}><Text style={styles.cardHeading}>Your medicines</Text><Text style={styles.description}>{cart.count} {cart.count === 1 ? 'item' : 'items'}</Text></View></View>
            {selected.map(item => <CartItem key={item.id} medicine={item} />)}
          </View>
          <CouponPanel />
          <BillBreakdown />
          <View style={styles.careCard}><Text style={styles.cardHeading}>Complete Your Care</Text><Text style={styles.description}>Find more medicines for your order.</Text><Pressable accessibilityRole="button" onPress={() => router.navigate('/')} style={styles.browse}><Text style={styles.browseText}>Browse medicines</Text><Ionicons name="chevron-forward" size={20} color={theme.colors.purple} /></Pressable></View>
          <Pressable accessibilityRole="link" accessibilityLabel="Medicine illustrations by Icons8" onPress={() => { void Linking.openURL('https://icons8.com/icons').catch(() => {}); }} style={styles.credit}><Text style={styles.creditText}>Medicine illustrations by Icons8</Text></Pressable>
        </> : <View style={styles.itemCard}>
          <EmptyState icon="bag-outline" title={cart.ready ? 'Your cart is empty' : 'Restoring your cart…'} description="Find the medicines you need and add them to your cart." />
          <Pressable accessibilityRole="button" onPress={() => router.navigate('/')} style={styles.button}><Text style={styles.buttonText}>Find medicines</Text></Pressable>
        </View>}
      </MobileContent>
    </ScrollView>
    {/* A separate flex sibling stays fixed without covering the scroll content.
        Tabs own the bottom system inset, so it must not be counted twice here. */}
    {selected.length > 0 && <View style={styles.checkout}><MobileContent>
      <Text style={styles.checkoutTitle}>Almost there</Text>
      <Text style={styles.checkoutCopy}>{formatMoney(cart.bill.grandTotal)} · {cart.count} {cart.count === 1 ? 'item' : 'items'}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Place mock order for ${formatMoney(cart.bill.grandTotal)}`} disabled={!cart.ready} onPress={cart.placeOrder} style={styles.button}><Text style={styles.buttonText}>Place order</Text></Pressable>
    </MobileContent></View>}
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'white' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  back: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: theme.fonts.regular, fontSize: 22, color: theme.colors.text },
  scroll: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { paddingBottom: 24 },
  guarantee: { backgroundColor: theme.colors.purple, paddingHorizontal: 18, paddingVertical: 16, alignItems: 'center', overflow: 'hidden', gap: 6 },
  guaranteeTitle: { fontFamily: theme.fonts.display, fontSize: 19, textAlign: 'center', color: 'white' },
  guaranteeCopy: { fontFamily: theme.fonts.regular, fontSize: 15, textAlign: 'center', color: 'white' },
  rays: { position: 'absolute', top: -80, left: '50%', width: 1, height: 1 },
  ray: { position: 'absolute', width: 38, height: 360, backgroundColor: '#FFFFFF0D' },
  itemCard: { marginTop: 22, backgroundColor: 'white', borderRadius: 20, padding: 14 },
  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 2 },
  pin: { backgroundColor: '#F5F5F5', width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orderCopy: { flex: 1, gap: 3 },
  cardHeading: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.text },
  description: { fontFamily: theme.fonts.regular, fontSize: 15, lineHeight: 22, color: theme.colors.textSecondary },
  careCard: { marginTop: 18, backgroundColor: 'white', borderRadius: 20, padding: 18, gap: 8 },
  browse: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 8 },
  browseText: { fontFamily: theme.fonts.bold, fontSize: 15, color: theme.colors.purple },
  checkout: { paddingTop: 18, paddingBottom: 14, backgroundColor: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  checkoutTitle: { fontFamily: theme.fonts.bold, fontSize: 23, color: theme.colors.text },
  checkoutCopy: { fontFamily: theme.fonts.regular, fontSize: 15, color: theme.colors.textSecondary, marginTop: 8, marginBottom: 18 },
  button: { minHeight: 56, paddingVertical: 17, paddingHorizontal: 18, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: theme.fonts.bold, color: 'white', fontSize: 17, textAlign: 'center' },
  message: { fontFamily: theme.fonts.regular, paddingTop: 14, color: theme.colors.purple, fontSize: 14, lineHeight: 21 },
  credit: { minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12 },
  creditText: { fontFamily: theme.fonts.regular, color: theme.colors.textSecondary, fontSize: 12 },
});
