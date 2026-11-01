/** Cart stores IDs and quantities; the catalog remains the source of prices. */
export type Cart = Readonly<Record<string, number>>;

export function changeQuantity(cart: Cart, id: string, delta: number, maxQty: number): Cart {
  const next = Math.max(0, Math.min(maxQty, (cart[id] ?? 0) + delta));
  const updated = { ...cart };
  if (next === 0) delete updated[id];
  else updated[id] = next;
  return updated;
}

export function decodeCart(value: unknown, limits: Readonly<Record<string, number>>): Cart {
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('items' in value) || !value.items || typeof value.items !== 'object' || Array.isArray(value.items)) return {};
  const result: Record<string, number> = {};
  for (const [id, quantity] of Object.entries(value.items)) {
    const limit = Object.hasOwn(limits, id) ? limits[id] : undefined;
    if (limit && typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0) result[id] = Math.min(quantity, limit);
  }
  return result;
}
