import { StyleSheet, Text, View } from 'react-native';

import { useCart } from '../cart/CartProvider';
import { bestCoupon, calculateBill } from '../cart/promotions';
import type { Medicine } from '../catalog/catalog';
import { QuantityControl } from './QuantityControl';
import { MedicineImage } from './MedicineImage';
import { theme } from '../theme/theme';

type Props = { medicine: Medicine; quantity: number; ready: boolean; imageHeight?: number; onChange: (delta: 1 | -1) => void };
export function MedicineCard({ medicine, quantity, ready, imageHeight = 132, onChange }: Props) {
  const { coupon, bill, first100Used } = useCart();
  const best = bestCoupon({ itemTotal: bill.itemTotal, first100Used });
  const bestSaving = best ? calculateBill(bill.itemTotal, best, first100Used).savings : 0;
  const offerLabel = coupon && quantity > 0
    ? coupon === 'FREEDEL' ? 'Free delivery applied'
      : bill.savings === bestSaving ? 'Best offer applied' : `${coupon} applied`
    : 'Offers available';
  // Only infer forms explicitly present in the name; the brief supplies no pack
  // sizes or MRP, so those must not be invented to imitate the screenshot.
  const form = /syrup/i.test(medicine.name) ? 'Syrup' : /spray/i.test(medicine.name) ? 'Spray' : /gel/i.test(medicine.name) ? 'Gel' : 'Medicine';
  return <View style={styles.card}>
    <View style={styles.imageBox}>
      <View style={styles.imageClip}><MedicineImage url={medicine.imageUrl} height={imageHeight} /></View>
      <View style={styles.footer}>
        {!quantity && <Text style={styles.pack}>{form}</Text>}
        <View style={styles.control}><QuantityControl name={medicine.name} quantity={quantity} maxQty={medicine.maxQty} disabled={!ready} onChange={onChange} /></View>
      </View>
    </View>
    <View style={styles.formBadge}><Text style={styles.formText}>{form}</Text></View>
    <Text style={styles.name}>{medicine.name}</Text>
    <Text style={styles.salt}>{medicine.salt}</Text>
    {medicine.rx && <View style={styles.rxRow}><Text style={styles.rxBadge}>℞</Text><Text style={styles.rxText}>Prescription required</Text></View>}
    <Text style={styles.price}>₹{Number.isInteger(medicine.price) ? medicine.price : medicine.price.toFixed(2)}</Text>
    {/* The teal badge matches the visual reference, but its wording reflects
        real cart promotion state. An available offer is not an applied saving. */}
    <View style={styles.offerBadge}><Text style={styles.offerText}>{offerLabel}</Text></View>
    {quantity >= medicine.maxQty && <Text style={styles.limit}>Maximum {medicine.maxQty} per order</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { paddingBottom: 32 },
  imageBox: { borderWidth: 1, borderColor: '#CCD1D5', borderRadius: 14, marginBottom: 14 },
  imageClip: { overflow: 'hidden', borderTopLeftRadius: 13, borderTopRightRadius: 13 },
  control: { marginTop: -7, marginBottom: -1 },
  footer: { backgroundColor: '#F1F4F8', paddingLeft: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', minHeight: 40, borderBottomLeftRadius: 13, borderBottomRightRadius: 13 },
  pack: { flex: 1, fontFamily: theme.fonts.bold, fontSize: 12, color: '#222222', paddingVertical: 8 },
  formBadge: { alignSelf: 'flex-start', backgroundColor: '#F1F4F8', borderColor: '#D9DDE2', borderWidth: 1, paddingHorizontal: 5, paddingVertical: 4, borderRadius: 4, marginBottom: 8 },
  formText: { fontFamily: theme.fonts.bold, color: '#2F4D71', fontSize: 11 },
  name: { fontFamily: theme.fonts.regular, fontSize: 16, lineHeight: 22, color: '#161616', marginBottom: 2 },
  salt: { fontFamily: theme.fonts.regular, fontSize: 13, lineHeight: 18, color: theme.colors.textSecondary, marginBottom: 4 },
  rxRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 5 },
  rxBadge: { backgroundColor: theme.colors.primary, color: 'white', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2, overflow: 'hidden', fontSize: 13 },
  rxText: { flexShrink: 1, fontFamily: theme.fonts.regular, fontSize: 11, color: '#555555' },
  price: { fontFamily: theme.fonts.bold, fontSize: 20, lineHeight: 25, color: '#111111', marginBottom: 6 },
  offerBadge: { alignSelf: 'flex-start', borderColor: '#1D8291', borderWidth: 1, borderRadius: 4, backgroundColor: '#EAFBFC', paddingHorizontal: 4, paddingVertical: 3 },
  offerText: { fontFamily: theme.fonts.bold, color: '#126878', fontSize: 12, lineHeight: 15 },
  limit: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.purple, marginTop: 6 },
});
