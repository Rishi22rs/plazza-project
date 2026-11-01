import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../cart/CartProvider';
import { bestCoupon, couponCodes, couponError, couponRules } from '../cart/promotions';
import type { CouponCode } from '../cart/promotions';
import { theme } from '../theme/theme';

/** Same purple/white coupon composition as the reference, with real brief rules. */
export function CouponPanel() {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const insets = useSafeAreaInsets();
  const context = { itemTotal: cart.bill.itemTotal, first100Used: cart.first100Used };
  const featured = cart.coupon ?? bestCoupon(context) ?? 'SAVE10';
  const apply = (candidate: CouponCode) => { cart.applyCoupon(candidate); setOpen(false); };

  return <>
    <View style={styles.card}>
      <View style={styles.banner}><Text style={styles.bannerTitle}>Save more with coupons</Text><Ionicons name="pricetags" size={30} color="#F59CCF" accessible={false} /></View>
      <View style={styles.offer}>
        <Ionicons name="pricetag" size={30} color="#00A77A" accessible={false} />
        <View style={styles.copy}><Text style={styles.title}>{couponRules[featured].title}</Text><Text style={styles.description}>{couponRules[featured].description}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={cart.coupon ? `Remove ${cart.coupon}` : `Apply ${featured}`} disabled={!cart.ready} onPress={() => cart.coupon ? cart.removeCoupon() : apply(featured)} style={styles.apply}><Text style={styles.applyText}>{cart.coupon ? 'REMOVE' : 'APPLY'}</Text></Pressable>
      </View>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.all}><Text style={styles.allText}>View all coupons</Text></Pressable>
    </View>
    <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close coupon list" onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Available coupons</Text><Pressable accessibilityRole="button" accessibilityLabel="Close coupons" onPress={() => setOpen(false)} style={styles.close}><Ionicons name="close" size={25} /></Pressable></View>
          <View style={styles.codeRow}><TextInput accessibilityLabel="Coupon code" value={code} onChangeText={setCode} autoCapitalize="characters" autoCorrect={false} placeholder="Enter coupon code" style={styles.input} /><Pressable accessibilityRole="button" onPress={() => { cart.applyCoupon(code); setOpen(false); }} style={styles.apply}><Text style={styles.applyText}>APPLY</Text></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {couponCodes.map(candidate => {
              const reason = couponError(candidate, context);
              return <View key={candidate} style={styles.couponRow}>
                <Text style={styles.title}>{candidate}</Text><Text style={styles.description}>{couponRules[candidate].description}</Text>
                {reason && <Text style={styles.reason}>{reason}</Text>}
                <Pressable accessibilityRole="button" accessibilityLabel={`Apply ${candidate}`} accessibilityState={{ disabled: Boolean(reason) }} disabled={Boolean(reason)} onPress={() => apply(candidate)} style={styles.apply}><Text style={[styles.applyText, reason && styles.disabled]}>{cart.coupon === candidate ? 'APPLIED' : 'APPLY'}</Text></Pressable>
              </View>;
            })}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 16, marginTop: 18, overflow: 'hidden' },
  banner: { backgroundColor: theme.colors.purple, paddingHorizontal: 14, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerTitle: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 19, color: 'white' },
  offer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: 18 },
  copy: { flexGrow: 1, flexShrink: 1, flexBasis: 150, gap: 6 },
  title: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.text },
  description: { fontFamily: theme.fonts.regular, fontSize: 14, lineHeight: 21, color: theme.colors.textSecondary },
  apply: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, borderColor: '#A38BBC', borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  applyText: { fontFamily: theme.fonts.bold, fontSize: 13, color: '#9473B2' },
  all: { minHeight: 52, alignItems: 'center', justifyContent: 'center', padding: 12 },
  allText: { fontFamily: theme.fonts.bold, color: theme.colors.purple, fontSize: 15 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' },
  sheet: { maxHeight: '85%', padding: 18, backgroundColor: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sheetTitle: { fontFamily: theme.fonts.bold, fontSize: 22, flexShrink: 1 },
  close: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  codeRow: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  input: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 12, fontSize: 16, fontFamily: theme.fonts.regular },
  couponRow: { paddingVertical: 18, gap: 10, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  reason: { fontFamily: theme.fonts.regular, color: '#9B4444', fontSize: 13 },
  disabled: { color: '#777777' },
});
