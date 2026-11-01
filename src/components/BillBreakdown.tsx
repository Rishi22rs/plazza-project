import { StyleSheet, Text, View } from 'react-native';

import { useCart } from '../cart/CartProvider';
import { formatMoney } from '../cart/promotions';
import { theme } from '../theme/theme';

/** Render calculated values only. Delivery and discount rules live in the engine. */
export function BillBreakdown() {
  const { bill } = useCart();
  return <View style={styles.card}>
    <Text style={styles.heading}>Bill details</Text>
    <View style={styles.row}><Text style={styles.label}>Item total</Text><Text style={styles.value}>{formatMoney(bill.itemTotal)}</Text></View>
    <View style={styles.row}><Text style={styles.label}>Discount</Text><Text style={styles.discount}>−{formatMoney(bill.discount)}</Text></View>
    <View style={styles.row}><Text style={styles.label}>Delivery fee</Text><Text style={bill.delivery ? styles.value : styles.discount}>{bill.delivery ? formatMoney(bill.delivery) : 'FREE'}</Text></View>
    <View style={[styles.row, styles.total]}><Text style={styles.heading}>Grand total</Text><Text style={styles.heading}>{formatMoney(bill.grandTotal)}</Text></View>
    {bill.baseDelivery > 0 && bill.delivery > 0 && <Text style={styles.note}>Free delivery on an item total of ₹499 or more.</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 20, padding: 18, gap: 17, marginTop: 18 },
  heading: { fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  label: { fontFamily: theme.fonts.regular, fontSize: 15, color: theme.colors.textSecondary },
  value: { fontFamily: theme.fonts.regular, fontSize: 15, color: theme.colors.text },
  discount: { fontFamily: theme.fonts.bold, fontSize: 15, color: '#008B68' },
  total: { borderTopWidth: 1, borderTopColor: '#EFEFEF', paddingTop: 16 },
  note: { fontFamily: theme.fonts.regular, color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
});
