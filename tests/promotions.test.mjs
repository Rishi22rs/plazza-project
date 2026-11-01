import assert from 'node:assert/strict';
import test from 'node:test';
import { bestCoupon, calculateBill, couponError, reconcilePromotion, completeMockOrder } from '../src/cart/promotions.ts';

const state = (coupon, items = { m4: 2 }) => ({ items, coupon, first100Used: false, notice: null });
test('delivery uses the strict pre-discount ₹499 threshold and empty cart has no fee', () => {
  assert.equal(calculateBill(49899, null, false).delivery, 4000);
  assert.equal(calculateBill(49900, 'FLAT50', false).delivery, 0);
  assert.equal(calculateBill(0, null, false).grandTotal, 0);
});
test('FLAT50 validates minimum at the boundary', () => {
  assert.ok(couponError('FLAT50', { itemTotal: 29999, first100Used: false }));
  assert.equal(calculateBill(30000, 'FLAT50', false).discount, 5000);
});
test('SAVE10 rounds to paise, caps at ₹100, and bill never becomes negative', () => {
  assert.equal(calculateBill(12345, 'SAVE10', false).discount, 1235);
  assert.equal(calculateBill(150000, 'SAVE10', false).discount, 10000);
  assert.equal(calculateBill(1, 'SAVE10', false).discount, 0);
});
test('FREEDEL changes delivery rather than the item discount', () => {
  const bill = calculateBill(3000, 'FREEDEL', false);
  assert.equal(bill.discount, 0);
  assert.equal(bill.delivery, 0);
  assert.equal(bill.grandTotal, 3000);
});
test('FIRST100 validates minimum and previous usage', () => {
  assert.ok(couponError('FIRST100', { itemTotal: 19999, first100Used: false }));
  assert.equal(calculateBill(20000, 'FIRST100', false).discount, 10000);
  assert.ok(couponError('FIRST100', { itemTotal: 20000, first100Used: true }));
});
test('cart changes remove invalid coupons and explain why without consuming FIRST100', () => {
  const result = reconcilePromotion(state('FIRST100'), 15000);
  assert.equal(result.coupon, null);
  assert.equal(result.first100Used, false);
  assert.match(result.notice.text, /Coupon removed.*₹200/);
  assert.equal(reconcilePromotion(state('FLAT50'), 30000).coupon, 'FLAT50');
});
test('checkout clears cart and consumes FIRST100 only when valid and applied', () => {
  const result = completeMockOrder(state('FIRST100'), 30000);
  assert.deepEqual(result.items, {});
  assert.equal(result.coupon, null);
  assert.equal(result.first100Used, true);
  assert.equal(completeMockOrder(state('SAVE10'), 30000).first100Used, false);
  assert.equal(completeMockOrder(state('FIRST100'), 10000).first100Used, false);
});

test('featured coupon considers eligibility, delivery savings and previous use', () => {
  assert.equal(bestCoupon({ itemTotal: 3000, first100Used: false }), 'FREEDEL');
  assert.equal(bestCoupon({ itemTotal: 30000, first100Used: false }), 'FIRST100');
  assert.equal(bestCoupon({ itemTotal: 30000, first100Used: true }), 'FLAT50');
  assert.equal(bestCoupon({ itemTotal: 0, first100Used: false }), null);
});
