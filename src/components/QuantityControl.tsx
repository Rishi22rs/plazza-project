import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme/theme';

type Props = { name: string; quantity: number; maxQty: number; disabled: boolean; onChange: (delta: 1 | -1) => void };

/** No pressed opacity/ripple: state changes provide feedback without a fade. */
export function QuantityControl({ name, quantity, maxQty, disabled, onChange }: Props) {
  if (!quantity) return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Add ${name} to cart`} accessibilityState={{ disabled }} disabled={disabled} onPress={() => onChange(1)} style={styles.add}>
      <Text style={styles.addText}>{disabled ? 'Loading…' : 'ADD'}</Text>
    </Pressable>
  );
  return (
    <View style={styles.stepper}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${name} quantity`} disabled={disabled} onPress={() => onChange(-1)} style={styles.target}><Text style={styles.symbol}>−</Text></Pressable>
      <Text accessibilityLiveRegion="polite" accessibilityLabel={`${quantity} ${name} in cart`} style={styles.quantity}>{quantity}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={quantity >= maxQty ? `Maximum ${maxQty} ${name} reached` : `Increase ${name} quantity`} accessibilityState={{ disabled: disabled || quantity >= maxQty }} disabled={disabled || quantity >= maxQty} onPress={() => onChange(1)} style={styles.target}><Text style={[styles.symbol, quantity >= maxQty && styles.capped]}>+</Text></Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  add: { minWidth: 80, minHeight: 48, borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 11, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  addText: { fontSize: 16, fontFamily: theme.fonts.bold, color: theme.colors.primary },
  stepper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 12 },
  target: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  symbol: { fontSize: 23, color: 'white' },
  capped: { color: '#FFD0EC' },
  quantity: { fontSize: 16, fontFamily: theme.fonts.bold, color: 'white', paddingHorizontal: 2 },
});
