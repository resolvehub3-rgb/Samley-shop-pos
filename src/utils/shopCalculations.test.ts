import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBaseUnits,
  calculateLineTotal,
  calculateSaleTotal,
  calculateChange,
  hasSufficientStock,
  calculateStockBalance,
  calculateGrossProfit,
} from './shopCalculations';

test('calculateBaseUnits converts correctly', () => {
  // e.g. 1 carton of milk has 24 tins. Buying 2 cartons = 48 tins
  assert.equal(calculateBaseUnits(2, 24), 48);
  // 1 crate of eggs has 30 eggs. Buying 3 crates = 90 eggs
  assert.equal(calculateBaseUnits(3, 30), 90);
  // 1 individual tin = 1 base unit
  assert.equal(calculateBaseUnits(5, 1), 5);
  // invalid inputs
  assert.equal(calculateBaseUnits(-1, 24), 0);
  assert.equal(calculateBaseUnits(2, 0), 0);
});

test('calculateLineTotal calculates unit price times quantity', () => {
  // 3 tins of milk @ GH₵ 8.50 = GH₵ 25.50
  assert.equal(calculateLineTotal(3, 8.5), 25.5);
  // 2 cartons @ GH₵ 190.00 = GH₵ 380.00
  assert.equal(calculateLineTotal(2, 190), 380);
  assert.equal(calculateLineTotal(0, 50), 0);
});

test('calculateSaleTotal sums line totals accurately', () => {
  const items = [
    { lineTotal: 25.5 },
    { lineTotal: 380.0 },
    { lineTotal: 14.5 },
  ];
  assert.equal(calculateSaleTotal(items), 420.0);
});

test('calculateChange calculates change due to customer', () => {
  // Total 185, customer paid 200 -> change 15
  assert.equal(calculateChange(185, 200), 15);
  // Exact payment
  assert.equal(calculateChange(185, 185), 0);
  // Underpayment returns 0 change
  assert.equal(calculateChange(185, 100), 0);
});

test('hasSufficientStock validates inventory', () => {
  assert.equal(hasSufficientStock(50, 48), true);
  assert.equal(hasSufficientStock(48, 48), true);
  assert.equal(hasSufficientStock(40, 48), false);
});

test('calculateStockBalance manages inventory movements', () => {
  // Stock received: 10 + 20 = 30
  assert.equal(calculateStockBalance(10, 'stock_received', 20), 30);
  // Stock sold: 30 - 5 = 25
  assert.equal(calculateStockBalance(30, 'stock_sold', 5), 25);
  // Damaged stock: 25 - 2 = 23
  assert.equal(calculateStockBalance(25, 'damaged', 2), 23);
  // Prevent negative balance
  assert.equal(calculateStockBalance(3, 'stock_sold', 10), 0);
});

test('calculateGrossProfit calculates revenue minus cost', () => {
  // Sale of 100 GHS with cost 70 GHS = 30 GHS profit
  assert.equal(calculateGrossProfit(100, 70), 30);
  assert.equal(calculateGrossProfit(100, 100), 0);
  assert.equal(calculateGrossProfit(0, 50), 0);
});
