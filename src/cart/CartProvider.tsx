import { createContext, useContext, useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { Platform, ToastAndroid } from 'react-native';

import { catalog } from '../catalog/catalog';
import { usePersistentState } from '../storage/usePersistentState';
import { changeQuantity, decodeCart } from './cartLogic';
import type { Cart } from './cartLogic';
import { calculateBill, couponError, isCouponCode, reconcilePromotion, completeMockOrder, withNotice } from './promotions';
import type { CouponCode, PromotionState } from './promotions';

type ShoppingState = PromotionState;
const INITIAL: ShoppingState = { items: {}, coupon: null, first100Used: false, notice: null };
const limits = Object.fromEntries(catalog.map(item => [item.id, item.maxQty]));
const subtotal = (items: Cart) => catalog.reduce((total, item) => total + Math.round(item.price * 100) * (items[item.id] ?? 0), 0);
const notify = withNotice;

/** Auto-removal belongs to state transitions, not a render-time UI effect. */
function reconcile(state: ShoppingState): ShoppingState {
  return reconcilePromotion(state, subtotal(state.items));
}

function restore(value: unknown): ShoppingState {
  if (!value || typeof value !== 'object' || !('version' in value) || (value.version !== 1 && value.version !== 2)) return INITIAL;
  // Migration: previous versions saved only items. Keep those quantities while
  // introducing coupon and first-order-use state in one atomic saved snapshot.
  const items = decodeCart({ version: 1, items: 'items' in value ? value.items : {} }, limits);
  return reconcile({ items, coupon: 'coupon' in value && isCouponCode(value.coupon) ? value.coupon : null, first100Used: 'first100Used' in value && value.first100Used === true, notice: null });
}
const encode = ({ items, coupon, first100Used }: ShoppingState) => ({ version: 2, items, coupon, first100Used });
type CartContextValue = {
  items: Cart; count: number; ready: boolean; error: string | null;
  coupon: CouponCode | null; first100Used: boolean; message: string | null;
  bill: ReturnType<typeof calculateBill>;
  change: (id: string, delta: 1 | -1) => void;
  remove: (id: string) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  placeOrder: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);

/** Shared cart, promotion and usage data persist together, preventing a checkout
 * from clearing items without also recording the one-time coupon as consumed. */
export function CartProvider({ children }: PropsWithChildren) {
  const cart = usePersistentState('plazza:cart', INITIAL, restore, encode);
  const state = cart.value;
  const displayedNotice = useRef(0);
  useEffect(() => {
    if (!state.notice || state.notice.id === displayedNotice.current) return;
    displayedNotice.current = state.notice.id;
    if (Platform.OS === 'android') ToastAndroid.show(state.notice.text, ToastAndroid.LONG);
  }, [state.notice]);

  const change = (id: string, delta: 1 | -1) => {
    if (!cart.ready || !Object.hasOwn(limits, id)) return;
    cart.setValue(previous => reconcile({ ...previous, items: changeQuantity(previous.items, id, delta, limits[id]) }));
  };
  const remove = (id: string) => {
    if (!cart.ready) return;
    cart.setValue(previous => {
      const items = { ...previous.items };
      delete items[id];
      return reconcile({ ...previous, items });
    });
  };
  const applyCoupon = (input: string) => {
    if (!cart.ready) return;
    const code = input.trim().toUpperCase();
    cart.setValue(previous => {
      if (!isCouponCode(code)) return notify(previous, 'Enter a valid coupon code.');
      const reason = couponError(code, { itemTotal: subtotal(previous.items), first100Used: previous.first100Used });
      return reason ? notify(previous, reason) : notify({ ...previous, coupon: code }, `${code} applied.`);
    });
  };
  const removeCoupon = () => {
    if (cart.ready) cart.setValue(previous => notify({ ...previous, coupon: null }, 'Coupon removed.'));
  };
  const placeOrder = () => {
    if (!cart.ready) return;
    cart.setValue(previous => completeMockOrder(previous, subtotal(previous.items)));
  };
  return <CartContext.Provider value={{ items: state.items, count: Object.values(state.items).reduce((sum, qty) => sum + qty, 0), ready: cart.ready, error: cart.error, coupon: state.coupon, first100Used: state.first100Used, message: state.notice?.text ?? null, bill: calculateBill(subtotal(state.items), state.coupon, state.first100Used), change, remove, applyCoupon, removeCoupon, placeOrder }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
