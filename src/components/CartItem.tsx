import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useCart } from '../cart/CartProvider';
import { formatMoney } from '../cart/promotions';
import type { Medicine } from '../catalog/catalog';
import { theme } from '../theme/theme';
import { MedicineImage } from './MedicineImage';
import { QuantityControl } from './QuantityControl';

export function CartItem({ medicine }: { medicine: Medicine }) {
  const cart = useCart();
  const quantity = cart.items[medicine.id];
  return <View style={styles.row}>
    <View style={styles.picture}><MedicineImage url={medicine.imageUrl} height={82} /></View>
    <View style={styles.body}>
    <View style={styles.details}>
      <Text style={styles.name}>{medicine.name}</Text><Text style={styles.salt}>{medicine.salt}</Text>
      {medicine.rx && <Text style={styles.rx}>℞ Prescription required</Text>}
      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${medicine.name} from cart`} onPress={() => cart.remove(medicine.id)} style={styles.remove}><Text style={styles.removeText}>Remove</Text></Pressable>
    </View>
    <View style={styles.actions}>
      <QuantityControl name={medicine.name} quantity={quantity} maxQty={medicine.maxQty} disabled={!cart.ready} onChange={delta => cart.change(medicine.id, delta)} />
      <Text style={styles.price}>{formatMoney(Math.round(medicine.price * 100) * quantity)}</Text>
      {quantity >= medicine.maxQty && <Text style={styles.limit}>Max {medicine.maxQty} per order</Text>}
    </View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 18, marginTop: 18, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  picture: { width: 80, borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 14, overflow: 'hidden' },
  body: { flex: 1, minWidth: 0, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 },
  details: { flexBasis: 95, flexGrow: 1, flexShrink: 1, gap: 6 },
  name: { fontFamily: theme.fonts.bold, fontSize: 16, lineHeight: 22, color: theme.colors.text },
  salt: { fontFamily: theme.fonts.regular, fontSize: 14, lineHeight: 20, color: theme.colors.textSecondary },
  rx: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.primary },
  actions: { flexBasis: 112, flexGrow: 1, alignItems: 'flex-end', gap: 8 },
  price: { fontFamily: theme.fonts.bold, fontSize: 17, color: theme.colors.text },
  limit: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.purple },
  remove: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  removeText: { fontFamily: theme.fonts.regular, fontSize: 12, color: theme.colors.textSecondary },
});
