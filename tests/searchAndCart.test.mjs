import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { searchMedicines, rememberSearch, decodeHistory } from '../src/search/searchLogic.ts';
import { changeQuantity, decodeCart } from '../src/cart/cartLogic.ts';

const catalog = JSON.parse(readFileSync(new URL('../src/catalog/catalog.json', import.meta.url), 'utf8'));

test('search matches medicine names and salts with case/space normalization', () => {
  assert.deepEqual(searchMedicines(catalog, '  DOLO  650 ').map(x => x.id), ['m1']);
  assert.deepEqual(searchMedicines(catalog, 'paracetamol').map(x => x.id), ['m1', 'm2', 'm7', 'm12']);
  assert.deepEqual(searchMedicines(catalog, 'not-a-medicine'), []);
  assert.deepEqual(searchMedicines(catalog, '   '), []);
});
test('recent searches deduplicate, move to newest and cap at five', () => {
  assert.deepEqual(rememberSearch(['Dolo', 'Pan'], '  dolo '), ['dolo', 'Pan']);
  assert.deepEqual(rememberSearch(['a', 'b', 'c', 'd', 'e'], 'f'), ['f', 'a', 'b', 'c', 'd']);
  assert.deepEqual(rememberSearch(['Dolo'], ' '), ['Dolo']);
});
test('history decoding rejects wrong versions and sanitizes invalid entries', () => {
  assert.deepEqual(decodeHistory(null), []);
  assert.deepEqual(decodeHistory({ version: 2, searches: ['Dolo'] }), []);
  assert.deepEqual(decodeHistory({ version: 1, searches: ['Dolo', null, ' dolo ', 42, 'Pan'] }), ['Dolo', 'Pan']);
});
test('rapid quantity updates cap at maxQty and decrementing one removes item', () => {
  let cart = {};
  for (let i = 0; i < 10; i++) cart = changeQuantity(cart, 'm3', 1, 2);
  assert.deepEqual(cart, { m3: 2 });
  const old = cart;
  cart = changeQuantity(cart, 'm3', -1, 2);
  assert.deepEqual(old, { m3: 2 }); // updates must not mutate previous state
  assert.deepEqual(changeQuantity(cart, 'm3', -1, 2), {});
});
test('cart restoration rejects unknown IDs and invalid quantities and clamps limits', () => {
  assert.deepEqual(decodeCart({ version: 1, items: { m1: 100, m2: -1, m3: 1.5, fake: 1 } }, { m1: 5, m2: 5, m3: 2 }), { m1: 5 });
  assert.deepEqual(decodeCart({ version: 99, items: { m1: 1 } }, { m1: 5 }), {});
  assert.deepEqual(decodeCart({ version: 1, items: [] }, { m1: 5 }), {});
});
