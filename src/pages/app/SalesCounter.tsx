import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Receipt,
  CheckCircle,
  AlertCircle,
  Coins,
  CreditCard,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  ActiveSession,
  getProducts,
  processSale,
} from '../../services/shopService';
import { Product, SellingUnit, Sale } from '../../types/database';
import {
  calculateLineTotal,
  calculateSaleTotal,
  calculateChange,
  calculateBaseUnits,
  hasSufficientStock,
} from '../../utils/shopCalculations';
import { hasOperationalAccess } from '../../utils/subscriptionRules';

interface SalesCounterProps {
  session: ActiveSession;
  navigate: (route: string) => void;
}

interface CartItem {
  productId: string;
  productName: string;
  sellingUnitName: string;
  conversionToBase: number;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  availableStockBase: number;
}

export const SalesCounter: React.FC<SalesCounterProps> = ({ session, navigate }) => {
  const shop = session.shop;
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Selected product being added to cart
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<SellingUnit | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Payment section
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money'>('cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Status & modal states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Check subscription operational access
  const access = hasOperationalAccess({
    status: shop?.subscription_status || 'trialing',
    trialStartedAt: shop?.trial_started_at || null,
    trialEndsAt: shop?.trial_ends_at || null,
    subscriptionEndsAt: shop?.subscription_ends_at || null,
  });

  useEffect(() => {
    if (!shop) return;
    loadProducts();
  }, [shop?.id]);

  const loadProducts = async () => {
    if (!shop) return;
    const prods = await getProducts(shop.id);
    setProducts(prods);
  };

  // Filter products by name or barcode
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  // When user selects a product to add
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    // Find default selling unit or create one based on base_unit
    const defaultUnit =
      prod.selling_units?.find((u) => u.is_default) ||
      prod.selling_units?.[0] || {
        id: 'base-unit',
        product_id: prod.id,
        shop_id: prod.shop_id,
        unit_name: prod.base_unit,
        conversion_to_base: 1,
        selling_price: prod.selling_price,
        is_default: true,
        created_at: '',
      };
    setSelectedUnit(defaultUnit);
    setItemQuantity(1);
    setError(null);
  };

  // Add line item to cart
  const handleAddToCart = () => {
    if (!selectedProduct || !selectedUnit) return;
    setError(null);

    const qty = Number(itemQuantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid positive quantity.');
      return;
    }

    const conversion = Number(selectedUnit.conversion_to_base) || 1;
    const requiredBaseUnits = calculateBaseUnits(qty, conversion);

    // Calculate current quantity of this product already in cart
    const existingInCartBase = cart
      .filter((item) => item.productId === selectedProduct.id)
      .reduce((acc, item) => acc + item.quantity * item.conversionToBase, 0);

    const totalNeededBase = existingInCartBase + requiredBaseUnits;

    // Check available stock
    if (!hasSufficientStock(selectedProduct.current_stock, totalNeededBase)) {
      setError(
        `Insufficient stock for "${selectedProduct.name}". Available: ${selectedProduct.current_stock} ${selectedProduct.base_unit}, needed: ${totalNeededBase}.`
      );
      return;
    }

    // Add or merge into cart
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === selectedProduct.id &&
        item.sellingUnitName === selectedUnit.unit_name
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += qty;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          sellingUnitName: selectedUnit.unit_name,
          conversionToBase: conversion,
          quantity: qty,
          unitPrice: Number(selectedUnit.selling_price),
          unitCost: Number(selectedProduct.purchase_cost) * conversion,
          availableStockBase: selectedProduct.current_stock,
        },
      ]);
    }

    // Reset selection for rapid next entry
    setSelectedProduct(null);
    setSelectedUnit(null);
    setItemQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    const updated = cart.filter((_, idx) => idx !== index);
    setCart(updated);
  };

  const handleClearCart = () => {
    setCart([]);
    setError(null);
  };

  // Math calculations
  const cartWithTotals = cart.map((item) => ({
    ...item,
    lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
  }));

  const overallSaleTotal = calculateSaleTotal(cartWithTotals);
  const numAmountReceived = Number(amountReceived) || 0;
  const changeDue = calculateChange(overallSaleTotal, numAmountReceived);

  // Exact amount preset helper
  const handlePayExact = () => {
    setAmountReceived(overallSaleTotal.toFixed(2));
  };

  // Complete Sale Execution
  const handleCompleteSale = async () => {
    setError(null);

    if (!shop) return;
    if (!access.allowed) {
      setError('Subscription has expired. Please renew to process sales.');
      return;
    }

    if (cart.length === 0) {
      setError('Please add at least one product to the counter transaction.');
      return;
    }

    if (numAmountReceived < overallSaleTotal) {
      setError(
        `Amount received (GH₵${numAmountReceived.toFixed(2)}) is less than total due (GH₵${overallSaleTotal.toFixed(2)}).`
      );
      return;
    }

    setSubmitting(true);

    const result = await processSale({
      shopId: shop.id,
      items: cartWithTotals,
      amountReceived: numAmountReceived,
      paymentMethod,
      notes: notes.trim() || undefined,
      userId: session.user.id,
    });

    setSubmitting(false);

    if (!result.success || !result.sale) {
      setError(result.error || 'Failed to complete sale transaction.');
      return;
    }

    // Success! Show receipt modal & reload products
    setCompletedSale(result.sale);
    setCart([]);
    setAmountReceived('');
    setNotes('');
    loadProducts();
  };

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#123B2A]/10 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
                Shop Counter POS
              </span>
              <span className="text-xs text-[#123B2A]/60">·</span>
              <span className="text-xs font-medium text-[#123B2A]">
                Operator: {session.user.full_name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
              Sales Processing Terminal
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/sales-history')}
              className="px-3.5 py-2 text-xs font-semibold border border-[#123B2A]/20 bg-white rounded-lg hover:bg-[#F7F5EE]"
            >
              Past Sales History
            </button>
            <button
              onClick={() => navigate('/app/products')}
              className="px-3.5 py-2 text-xs font-semibold bg-[#123B2A] text-white rounded-lg hover:bg-[#1b523b]"
            >
              + Register Product
            </button>
          </div>
        </div>

        {/* Operational Access Warning */}
        {!access.allowed && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-xs text-red-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
              <span>
                <strong>Subscription Expired:</strong> Sales completion is paused. Renew your monthly license to process customer transactions.
              </span>
            </div>
            <button
              onClick={() => navigate('/app/subscription')}
              className="px-3 py-1 bg-[#123B2A] text-white font-semibold rounded hover:bg-[#1b523b]"
            >
              Renew GH₵300
            </button>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Grid: Left = Product Finder & Selection; Right = Cart & Payment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Catalog Search & Fast Product Entry */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search Input */}
            <div className="bg-white p-4 rounded-xl border border-[#123B2A]/10 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title or barcode (e.g. Milk, Rice, Eggs, Oil)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                />
              </div>

              {/* Product quick grid */}
              <div className="mt-3 max-h-60 overflow-y-auto divide-y divide-[#123B2A]/5">
                {products.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#123B2A]/70">
                    <div>No products in catalog yet.</div>
                    <button
                      onClick={() => navigate('/app/products')}
                      className="mt-2 text-xs font-bold underline text-[#123B2A]"
                    >
                      Click here to add your first product
                    </button>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#123B2A]/60">
                    No matching products found for "{searchQuery}".
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const isSelected = selectedProduct?.id === prod.id;
                    const isOutOfStock = prod.current_stock <= 0;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => !isOutOfStock && handleSelectProduct(prod)}
                        className={`p-2.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#123B2A] text-white'
                            : isOutOfStock
                            ? 'opacity-50 cursor-not-allowed bg-gray-50'
                            : 'hover:bg-[#F7F5EE]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs">{prod.name}</div>
                          <div
                            className={`text-[11px] font-mono ${
                              isSelected ? 'text-white/80' : 'text-[#123B2A]/60'
                            }`}
                          >
                            Stock: {prod.current_stock} {prod.base_unit}
                            {prod.category && ` · ${prod.category.name}`}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-xs font-mono">
                            GH₵ {Number(prod.selling_price).toFixed(2)}
                          </div>
                          {isOutOfStock ? (
                            <span className="text-[10px] text-red-600 font-bold uppercase">
                              Out of Stock
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] ${
                                isSelected ? 'text-[#C5A15A]' : 'text-[#123B2A]/60'
                              }`}
                            >
                              Tap to select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Product Configuration Box (Unit & Qty) */}
            {selectedProduct && (
              <div className="bg-white p-5 rounded-xl border-2 border-[#123B2A] shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#123B2A]/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A15A]">
                      Configure Selling Unit & Quantity
                    </span>
                    <h3 className="text-sm font-bold text-[#123B2A]">{selectedProduct.name}</h3>
                  </div>
                  <div className="text-right text-xs font-mono text-[#123B2A]/70">
                    Available: <span className="font-bold text-[#123B2A]">{selectedProduct.current_stock}</span> {selectedProduct.base_unit}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Selling unit selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Selling Unit Format
                    </label>
                    <select
                      value={selectedUnit?.id || ''}
                      onChange={(e) => {
                        const unit = selectedProduct.selling_units?.find(
                          (u) => u.id === e.target.value
                        );
                        if (unit) setSelectedUnit(unit);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-white text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                    >
                      {selectedProduct.selling_units && selectedProduct.selling_units.length > 0 ? (
                        selectedProduct.selling_units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.unit_name} ({u.conversion_to_base} {selectedProduct.base_unit}) — GH₵ {Number(u.selling_price).toFixed(2)}
                          </option>
                        ))
                      ) : (
                        <option value="base">
                          {selectedProduct.base_unit} (Single) — GH₵ {Number(selectedProduct.selling_price).toFixed(2)}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Quantity input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Quantity to Sell
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono font-bold text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtotal preview */}
                <div className="flex items-center justify-between pt-3 border-t border-[#123B2A]/10 text-xs">
                  <div className="text-[#123B2A]/70">
                    Calculated Line Total:{' '}
                    <span className="font-mono font-bold text-[#123B2A]">
                      GH₵ {calculateLineTotal(itemQuantity, Number(selectedUnit?.selling_price || selectedProduct.selling_price)).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="px-3 py-1.5 border border-[#123B2A]/20 text-[#123B2A] rounded text-xs hover:bg-[#F7F5EE]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="px-4 py-1.5 bg-[#123B2A] text-white rounded text-xs font-semibold hover:bg-[#1b523b] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Counter Sale</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Active Counter Cart & Checkout */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#123B2A]/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#123B2A]/10">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#C5A15A]" />
                <h2 className="text-sm font-bold text-[#123B2A]">Current Counter Cart</h2>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#123B2A]/60">
                <div className="w-10 h-10 rounded-full bg-[#F7F5EE] text-[#123B2A]/40 flex items-center justify-center mx-auto mb-2">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>Counter is currently empty.</div>
                <div className="text-[11px] text-[#123B2A]/50 mt-1">
                  Select products from the left to begin entering customer items.
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {cartWithTotals.map((item, index) => (
                  <div
                    key={index}
                    className="p-2.5 bg-[#F7F5EE]/60 rounded-lg border border-[#123B2A]/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-semibold text-[#123B2A]">{item.productName}</div>
                      <div className="text-[11px] text-[#123B2A]/70 font-mono">
                        {item.quantity} × {item.sellingUnitName} @ GH₵ {item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono font-bold text-[#123B2A]">
                        GH₵ {item.lineTotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove line item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Due Banner */}
            <div className="p-4 bg-[#123B2A] text-white rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#C5A15A] uppercase tracking-wider font-semibold">
                  Total Sale Due
                </div>
                <div className="text-xs text-white/70">
                  {cart.length} line item{cart.length === 1 ? '' : 's'}
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                GH₵ {overallSaleTotal.toFixed(2)}
              </div>
            </div>

            {/* Payment Controls */}
            {cart.length > 0 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-[#123B2A] text-white border-[#123B2A]'
                          : 'bg-white text-[#123B2A] border-[#123B2A]/20 hover:bg-[#F7F5EE]'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Cash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mobile_money')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        paymentMethod === 'mobile_money'
                          ? 'bg-[#123B2A] text-white border-[#123B2A]'
                          : 'bg-white text-[#123B2A] border-[#123B2A]/20 hover:bg-[#F7F5EE]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Mobile Money</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-[#123B2A]">
                      Amount Received (GH₵)
                    </label>
                    <button
                      type="button"
                      onClick={handlePayExact}
                      className="text-[11px] text-[#123B2A] underline font-medium hover:text-[#1b523b]"
                    >
                      Exact Amount
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Enter cash given by customer..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 text-xs font-mono font-bold text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                  />
                </div>

                {/* Change calculation */}
                {numAmountReceived >= overallSaleTotal && overallSaleTotal > 0 && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-900">Change Due to Customer:</span>
                    <span className="font-mono font-bold text-base text-emerald-950">
                      GH₵ {changeDue.toFixed(2)}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={submitting || !access.allowed}
                  onClick={handleCompleteSale}
                  className="w-full py-3.5 bg-[#123B2A] text-white font-bold rounded-lg hover:bg-[#1b523b] transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? 'Recording & Updating Stock...' : 'Complete Sale & Deduct Stock'}
                  <ArrowRight className="w-4 h-4 text-[#C5A15A]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Completed Sale Receipt Modal */}
        {completedSale && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#123B2A]/20 shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-base font-bold text-[#123B2A]">Sale Completed Successfully</div>
                <div className="text-xs text-[#123B2A]/70 font-mono">
                  Ref: {completedSale.sale_reference}
                </div>
              </div>

              <div className="p-3.5 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#123B2A]/70">Total Sale:</span>
                  <span className="font-mono font-bold">GH₵ {Number(completedSale.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#123B2A]/70">Amount Received:</span>
                  <span className="font-mono">GH₵ {Number(completedSale.amount_received).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-[#123B2A]/10 pt-1.5 text-[#123B2A]">
                  <span>Change Given:</span>
                  <span className="font-mono">GH₵ {Number(completedSale.change_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#123B2A]/60 pt-1">
                  <span>Method:</span>
                  <span className="capitalize">{completedSale.payment_method.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#123B2A]/70 text-center">
                Inventory has been updated in PostgreSQL.
              </div>

              <button
                onClick={() => setCompletedSale(null)}
                className="w-full py-2.5 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b]"
              >
                Ready for Next Customer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
