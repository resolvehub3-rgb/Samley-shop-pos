import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Receipt,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  ActiveSession,
  getProducts,
  getStockMovements,
  recordStockReceiving,
} from '../../services/shopService';
import { Product, StockMovement } from '../../types/database';

interface InventoryManagementProps {
  session: ActiveSession;
  navigate: (route: string) => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({ session, navigate }) => {
  const shop = session.shop;
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock Receiving Modal
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyReceived, setQtyReceived] = useState('');
  const [conversionToBase, setConversionToBase] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab: Current Stock vs Stock Movement Ledger
  const [activeTab, setActiveTab] = useState<'current_stock' | 'movements_ledger'>('current_stock');

  useEffect(() => {
    if (!shop) return;
    loadInventory();
  }, [shop?.id]);

  const loadInventory = async () => {
    if (!shop) return;
    setLoading(true);
    const [prods, moves] = await Promise.all([
      getProducts(shop.id),
      getStockMovements(shop.id),
    ]);
    setProducts(prods);
    setMovements(moves);
    setLoading(false);
  };

  const handleReceiveStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shop) return;
    if (!selectedProductId || !qtyReceived || !unitCost) {
      setError('Please select a product and enter quantity received and supplier unit cost.');
      return;
    }

    setSubmitting(true);

    const result = await recordStockReceiving(shop.id, {
      productId: selectedProductId,
      quantityReceived: Number(qtyReceived),
      conversionToBase: Number(conversionToBase) || 1,
      unitCost: Number(unitCost),
      referenceOrInvoice: invoiceRef.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to record stock receiving.');
      return;
    }

    setShowReceiveModal(false);
    setSelectedProductId('');
    setQtyReceived('');
    setUnitCost('');
    setInvoiceRef('');
    setNotes('');
    loadInventory();
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#123B2A]/10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
              Inventory Control & Ledger
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
              Stock Management
            </h1>
            <p className="text-xs text-[#123B2A]/70 mt-0.5">
              Live inventory balances, wholesale supplier deliveries, and auditable movement logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReceiveModal(true)}
              className="px-4 py-2 text-xs font-bold bg-[#123B2A] text-white rounded-lg hover:bg-[#1b523b] flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#C5A15A]" />
              <span>Record Stock Received</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#123B2A]/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('current_stock')}
            className={`pb-3 px-3 transition-colors border-b-2 ${
              activeTab === 'current_stock'
                ? 'border-[#123B2A] text-[#123B2A]'
                : 'border-transparent text-[#123B2A]/60 hover:text-[#123B2A]'
            }`}
          >
            Current Stock Balances ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('movements_ledger')}
            className={`pb-3 px-3 transition-colors border-b-2 ${
              activeTab === 'movements_ledger'
                ? 'border-[#123B2A] text-[#123B2A]'
                : 'border-transparent text-[#123B2A]/60 hover:text-[#123B2A]'
            }`}
          >
            Auditable Stock Ledger ({movements.length})
          </button>
        </div>

        {/* Tab 1: Current Stock */}
        {activeTab === 'current_stock' && (
          <div className="bg-white rounded-xl border border-[#123B2A]/10 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#123B2A]/60">Loading inventory...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F7F5EE] text-[#123B2A]/40 flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#123B2A]">No stock records found</h3>
                <p className="text-xs text-[#123B2A]/70 max-w-sm mx-auto mt-1 mb-4">
                  Register products first to track their opening and ongoing stock quantities.
                </p>
                <button
                  onClick={() => navigate('/app/products')}
                  className="px-4 py-2 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b]"
                >
                  Register Products
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10 font-semibold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Base Unit</th>
                      <th className="p-3 text-right">Available Stock</th>
                      <th className="p-3 text-right">Alert Threshold</th>
                      <th className="p-3 text-right">Purchase Cost (GH₵)</th>
                      <th className="p-3 text-right">Total Stock Value</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                    {products.map((p) => {
                      const isLow = p.current_stock <= p.alert_threshold;
                      const stockValue = p.current_stock * p.purchase_cost;
                      return (
                        <tr key={p.id} className="hover:bg-[#F7F5EE]/30">
                          <td className="p-3 font-sans font-semibold text-[#123B2A]">{p.name}</td>
                          <td className="p-3 font-sans">{p.base_unit}</td>
                          <td className="p-3 text-right font-bold text-[#123B2A]">
                            {p.current_stock}
                          </td>
                          <td className="p-3 text-right text-[#123B2A]/60">{p.alert_threshold}</td>
                          <td className="p-3 text-right">{Number(p.purchase_cost).toFixed(2)}</td>
                          <td className="p-3 text-right font-semibold text-[#123B2A]">
                            GH₵ {stockValue.toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-sans">
                            {p.current_stock === 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Stock Movements Ledger */}
        {activeTab === 'movements_ledger' && (
          <div className="bg-white rounded-xl border border-[#123B2A]/10 overflow-hidden shadow-sm">
            {movements.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#123B2A]/70">
                No stock movements logged yet. Movements are created automatically when sales are processed or when stock is received from suppliers.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10 font-semibold">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Movement Type</th>
                      <th className="p-3 text-right">Base Quantity</th>
                      <th className="p-3 text-right">Unit Cost</th>
                      <th className="p-3">Reference / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                    {movements.map((m) => {
                      const isAddition =
                        m.movement_type === 'opening_stock' ||
                        m.movement_type === 'stock_received' ||
                        m.movement_type === 'returned';
                      return (
                        <tr key={m.id} className="hover:bg-[#F7F5EE]/30">
                          <td className="p-3 font-sans text-[#123B2A]/70">
                            {new Date(m.created_at).toLocaleString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-3 font-sans font-semibold text-[#123B2A]">
                            {m.product?.name || 'Item'}
                          </td>
                          <td className="p-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                                isAddition
                                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                  : 'bg-red-50 text-red-900 border border-red-200'
                              }`}
                            >
                              {m.movement_type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold">
                            <span className={isAddition ? 'text-emerald-700' : 'text-red-700'}>
                              {isAddition ? '+' : '-'}
                              {m.quantity_base} {m.product?.base_unit || ''}
                            </span>
                          </td>
                          <td className="p-3 text-right text-[#123B2A]/70">
                            {m.unit_cost ? `GH₵ ${Number(m.unit_cost).toFixed(2)}` : '—'}
                          </td>
                          <td className="p-3 font-sans text-[#123B2A]/70 text-[11px]">
                            {m.reference_id && <span className="font-mono mr-1">[{m.reference_id}]</span>}
                            {m.notes || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: Record Stock Received */}
        {showReceiveModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#123B2A]/20 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#123B2A]/10">
                <div>
                  <h3 className="text-base font-bold text-[#123B2A]">Record Stock Received</h3>
                  <p className="text-xs text-[#123B2A]/70">
                    Log wholesale delivery from supplier and update inventory.
                  </p>
                </div>
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="text-xs text-[#123B2A]/60 hover:text-[#123B2A]"
                >
                  ✕ Close
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleReceiveStockSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                    Select Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const p = products.find((prod) => prod.id === e.target.value);
                      if (p) setUnitCost(p.purchase_cost.toString());
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-white text-[#123B2A]"
                  >
                    <option value="">-- Choose product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: {p.current_stock} {p.base_unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Packaging Conversion
                    </label>
                    <select
                      value={conversionToBase}
                      onChange={(e) => setConversionToBase(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs bg-white"
                    >
                      <option value="1">Base Units ({selectedProduct?.base_unit || 'Units'})</option>
                      {selectedProduct?.selling_units?.map((u) => (
                        <option key={u.id} value={u.conversion_to_base}>
                          {u.unit_name} ({u.conversion_to_base} {selectedProduct.base_unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Quantity Delivered <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={qtyReceived}
                      onChange={(e) => setQtyReceived(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                    Supplier Purchase Cost (GH₵ / Unit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="e.g. 180.00"
                    className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                    Invoice or Waybill Reference
                  </label>
                  <input
                    type="text"
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    placeholder="e.g. INV-98421"
                    className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                    Supplier Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Delivered by FanMilk Distributor"
                    className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#123B2A]/10">
                  <button
                    type="button"
                    onClick={() => setShowReceiveModal(false)}
                    className="px-4 py-2 border border-[#123B2A]/20 text-xs font-semibold rounded-lg hover:bg-[#F7F5EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#123B2A] text-white text-xs font-bold rounded-lg hover:bg-[#1b523b]"
                  >
                    {submitting ? 'Recording...' : 'Save Stock Receiving'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
