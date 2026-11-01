/** All money inside the bill engine is integer paise, avoiding floating-point drift. */
export type CouponCode = 'FLAT50' | 'SAVE10' | 'FREEDEL' | 'FIRST100';
export type CouponContext = { itemTotal: number; first100Used: boolean };
type Rule = { title: string; description: string; validate: (context: CouponContext) => string | null; discount: (total: number) => number; freeDelivery?: boolean };

/** Adding another promotion changes this registry, not bill or screen logic. */
export const couponRules: Record<CouponCode, Rule> = {
  FLAT50: { title: 'Save ₹50 with FLAT50', description: '₹50 off on medicines worth ₹300 or more', validate: ({ itemTotal }) => itemTotal < 30000 ? 'FLAT50 needs an item total of at least ₹300.' : null, discount: () => 5000 },
  SAVE10: { title: 'Save 10% with SAVE10', description: '10% off, up to ₹100', validate: () => null, discount: total => Math.min(Math.round(total / 10), 10000) },
  FREEDEL: { title: 'Free delivery with FREEDEL', description: 'Waive the delivery fee on your order', validate: () => null, discount: () => 0, freeDelivery: true },
  FIRST100: { title: 'Save ₹100 with FIRST100', description: 'First order offer · minimum item total ₹200', validate: ({ itemTotal, first100Used }) => first100Used ? 'FIRST100 has already been used.' : itemTotal < 20000 ? 'FIRST100 needs an item total of at least ₹200.' : null, discount: () => 10000 },
};
export const couponCodes = Object.keys(couponRules) as CouponCode[];
export const isCouponCode = (value: unknown): value is CouponCode => typeof value === 'string' && Object.hasOwn(couponRules, value);

export function couponError(code: CouponCode, context: CouponContext): string | null {
  if (context.itemTotal <= 0) return 'Add medicines before applying a coupon.';
  return couponRules[code].validate(context);
}

/** Delivery threshold uses the subtotal BEFORE a coupon is deducted. */
export function calculateBill(itemTotal: number, coupon: CouponCode | null, first100Used: boolean) {
  const baseDelivery = itemTotal > 0 && itemTotal < 49900 ? 4000 : 0;
  const validCoupon = coupon && !couponError(coupon, { itemTotal, first100Used }) ? coupon : null;
  const rule = validCoupon ? couponRules[validCoupon] : null;
  const discount = Math.min(itemTotal, rule?.discount(itemTotal) ?? 0);
  const delivery = rule?.freeDelivery ? 0 : baseDelivery;
  return { itemTotal, discount, baseDelivery, delivery, grandTotal: itemTotal - discount + delivery, savings: discount + baseDelivery - delivery };
}

export const formatMoney = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

/** Featured offer is the eligible rule with the greatest actual bill saving. */
export function bestCoupon(context: CouponContext): CouponCode | null {
  return couponCodes.filter(code => !couponError(code, context)).sort((a, b) =>
    calculateBill(context.itemTotal, b, context.first100Used).savings - calculateBill(context.itemTotal, a, context.first100Used).savings
  )[0] ?? null;
}

export type PromotionState = {
  items: Readonly<Record<string, number>>;
  coupon: CouponCode | null;
  first100Used: boolean;
  notice: { id: number; text: string } | null;
};
export const withNotice = (state: PromotionState, text: string): PromotionState => ({ ...state, notice: { id: (state.notice?.id ?? 0) + 1, text } });

/** Revalidate on every quantity change/removal, including when cart becomes empty. */
export function reconcilePromotion(state: PromotionState, itemTotal: number): PromotionState {
  if (!state.coupon) return state;
  const reason = couponError(state.coupon, { itemTotal, first100Used: state.first100Used });
  return reason ? withNotice({ ...state, coupon: null }, `Coupon removed: ${reason}`) : state;
}

/** The only transition that consumes FIRST100. Applying/removing never consumes it. */
export function completeMockOrder(state: PromotionState, itemTotal: number): PromotionState {
  if (!Object.keys(state.items).length) return state;
  const valid = reconcilePromotion(state, itemTotal);
  return withNotice({ ...valid, items: {}, coupon: null, first100Used: valid.first100Used || valid.coupon === 'FIRST100' }, 'Order placed! Your cart has been cleared.');
}
