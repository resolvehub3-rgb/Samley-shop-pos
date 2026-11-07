/**
 * Pure calculation logic for Samly Provision Shop Management
 * Handles inventory unit conversion, line total math, gross profit calculations
 */

export interface ProductUnitConfig {
  unitName: string;
  conversionToBase: number; // e.g. 1 carton = 24 tins -> conversionToBase = 24
  sellingPrice: number;
}

export interface SaleItemDraft {
  productId: string;
  productName: string;
  sellingUnitName: string;
  quantity: number;
  conversionToBase: number;
  unitPrice: number;
  unitCost: number;
}

/**
 * Calculates total base units required for a given quantity in a specific selling unit.
 * Example: 2 cartons where 1 carton = 24 tins -> 48 tins
 */
export function calculateBaseUnits(quantity: number, conversionToBase: number): number {
  if (quantity < 0 || conversionToBase <= 0) return 0;
  return quantity * conversionToBase;
}

/**
 * Calculates line total for a sale item: quantity * unitPrice
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  if (quantity <= 0 || unitPrice < 0) return 0;
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Calculates overall sale total from item line totals
 */
export function calculateSaleTotal(items: { lineTotal: number }[]): number {
  const sum = items.reduce((acc, item) => acc + (item.lineTotal || 0), 0);
  return Math.round(sum * 100) / 100;
}

/**
 * Calculates change due to customer
 */
export function calculateChange(totalAmount: number, amountReceived: number): number {
  if (amountReceived < totalAmount) return 0;
  return Math.round((amountReceived - totalAmount) * 100) / 100;
}

/**
 * Verifies if sufficient stock is available in base units
 */
export function hasSufficientStock(currentStockBase: number, requiredBaseUnits: number): boolean {
  return currentStockBase >= requiredBaseUnits;
}

/**
 * Calculates new stock balance after a movement
 */
export function calculateStockBalance(
  currentStock: number,
  movementType: 'opening_stock' | 'stock_received' | 'stock_sold' | 'damaged' | 'expired' | 'returned' | 'adjustment',
  quantityBase: number
): number {
  switch (movementType) {
    case 'opening_stock':
    case 'stock_received':
    case 'returned':
      return currentStock + quantityBase;
    case 'stock_sold':
    case 'damaged':
    case 'expired':
      return Math.max(0, currentStock - quantityBase);
    case 'adjustment':
      // Direct adjustment replaces or alters
      return quantityBase;
    default:
      return currentStock;
  }
}

/**
 * Calculates gross profit given sale revenue and total purchase cost
 * Gross profit = Revenue - Purchase Cost (only when reliable purchase cost is known)
 */
export function calculateGrossProfit(revenue: number, cost: number): number {
  if (revenue <= 0 || cost < 0) return 0;
  return Math.round((revenue - cost) * 100) / 100;
}
