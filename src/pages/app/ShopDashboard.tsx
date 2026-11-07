import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  Layers,
  TrendingUp,
  Receipt,
  ArrowRight,
  AlertTriangle,
  Clock,
  CreditCard,
  Plus,
} from 'lucide-react';
import {
  ActiveSession,
  getProducts,
  getSales,
} from '../../services/shopService';
import { Product, Sale } from '../../types/database';
import { getDaysRemaining, hasOperationalAccess } from '../../utils/subscriptionRules';

interface ShopDashboardProps {
  session: ActiveSession;
  navigate: (route: string) => void;
}

export const ShopDashboard: React.FC<ShopDashboardProps> = ({ session, navigate }) => {
  const shop = session.shop;
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop) return;
    loadDashboardData();
  }, [shop?.id]);

  const loadDashboardData = async () => {
    if (!shop) return;
    setLoading(true);
    const [prods, sList] = await Promise.all([
      getProducts(shop.id),
      getSales(shop.id),
    ]);
    setProducts(prods);
    setSales(sList);
    setLoading(false);
  };

  // Operational access & subscription status
  const subState = {
    status: shop?.subscription_status || 'trialing',
    trialStartedAt: shop?.trial_started_at || null,
    trialEndsAt: shop?.trial_ends_at || null,
    subscriptionEndsAt: shop?.subscription_ends_at || null,
  };
  const access = hasOperationalAccess(subState);
  const remaining = getDaysRemaining(subState);

  // Real calculations (0 if empty — NO MOCK NUMBERS!)
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
  const completedSalesCount = sales.length;
  const lowStockProducts = products.filter((p) => p.current_stock <= p.alert_threshold);

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Subscription Status Banner */}
        {!access.allowed && access.reason === 'expired' && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-red-900">Subscription Expired</div>
                <div className="text-xs text-red-800">
                  Your 7-day trial or monthly period has concluded. Operational actions (new sales, stock adjustments) are paused. Your records remain safe.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/app/subscription')}
              className="px-4 py-2 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b] whitespace-nowrap"
            >
              Renew for GH₵300 →
            </button>
          </div>
        )}

        {access.allowed && remaining.type === 'trial' && (
          <div className="p-4 bg-[#123B2A] text-[#F7F5EE] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#C5A15A]/30">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#C5A15A] shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">
                  7-Day Free Trial Active · {remaining.days} Day{remaining.days === 1 ? '' : 's'} Remaining
                </div>
                <div className="text-xs text-[#F7F5EE]/70">
                  Full unrestricted access to products, counter POS, and inventory ledger.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/app/subscription')}
              className="px-4 py-2 bg-[#C5A15A] text-[#123B2A] text-xs font-bold rounded-lg hover:bg-[#b39049] whitespace-nowrap"
            >
              Subscribe for GH₵300/mo
            </button>
          </div>
        )}

        {/* Dashboard Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#123B2A]/10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
              Provision Shop Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
              {shop?.name || 'My Provision Shop'}
            </h1>
            <p className="text-xs text-[#123B2A]/70 mt-0.5">
              Location: {shop?.location || 'Ghana'} · Contact: {shop?.business_phone}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/sales')}
              className="px-5 py-2.5 bg-[#123B2A] text-white text-xs font-bold rounded-lg hover:bg-[#1b523b] transition-all flex items-center gap-2 shadow-sm"
            >
              <Receipt className="w-4 h-4 text-[#C5A15A]" />
              <span>Open Counter Sales POS</span>
            </button>
          </div>
        </div>

        {/* Real Statistics Grid (Calculated from real records, 0 if empty) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#123B2A]/10">
            <div className="flex items-center justify-between text-xs text-[#123B2A]/70 mb-2">
              <span>Total Sales Revenue</span>
              <TrendingUp className="w-4 h-4 text-[#C5A15A]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#123B2A]">
              GH₵ {totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#123B2A]/60 mt-1">
              From {completedSalesCount} recorded transaction{completedSalesCount === 1 ? '' : 's'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#123B2A]/10">
            <div className="flex items-center justify-between text-xs text-[#123B2A]/70 mb-2">
              <span>Registered Products</span>
              <Package className="w-4 h-4 text-[#123B2A]/60" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#123B2A]">
              {products.length}
            </div>
            <div className="text-[11px] text-[#123B2A]/60 mt-1">
              Active items in catalog
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#123B2A]/10">
            <div className="flex items-center justify-between text-xs text-[#123B2A]/70 mb-2">
              <span>Completed Sales</span>
              <Receipt className="w-4 h-4 text-[#123B2A]/60" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#123B2A]">
              {completedSalesCount}
            </div>
            <div className="text-[11px] text-[#123B2A]/60 mt-1">
              Counter checkout receipts
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#123B2A]/10">
            <div className="flex items-center justify-between text-xs text-[#123B2A]/70 mb-2">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#123B2A]">
              {lowStockProducts.length}
            </div>
            <div className="text-[11px] text-[#123B2A]/60 mt-1">
              Items at or below threshold
            </div>
          </div>
        </div>

        {/* Operational Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/app/sales')}
            className="p-5 bg-white rounded-xl border border-[#123B2A]/10 hover:border-[#123B2A] cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#123B2A] flex items-center gap-1.5 mb-1">
                <Receipt className="w-4 h-4 text-[#C5A15A]" />
                <span>Sales Counter Terminal</span>
              </div>
              <div className="text-xs text-[#123B2A]/70">
                Process customer orders, auto-calc line totals & change
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#123B2A]/40" />
          </div>

          <div
            onClick={() => navigate('/app/products')}
            className="p-5 bg-white rounded-xl border border-[#123B2A]/10 hover:border-[#123B2A] cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#123B2A] flex items-center gap-1.5 mb-1">
                <Package className="w-4 h-4 text-[#C5A15A]" />
                <span>Product Management</span>
              </div>
              <div className="text-xs text-[#123B2A]/70">
                Register items, set costs, prices & package units
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#123B2A]/40" />
          </div>

          <div
            onClick={() => navigate('/app/inventory')}
            className="p-5 bg-white rounded-xl border border-[#123B2A]/10 hover:border-[#123B2A] cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-[#123B2A] flex items-center gap-1.5 mb-1">
                <Layers className="w-4 h-4 text-[#C5A15A]" />
                <span>Receive Supplier Stock</span>
              </div>
              <div className="text-xs text-[#123B2A]/70">
                Log wholesale cartons delivered & update cost ledger
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#123B2A]/40" />
          </div>
        </div>

        {/* Low Stock Warning Box (only if items are low) */}
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Low Inventory Stock Attention Required</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="bg-white p-3 rounded border border-amber-200">
                  <div className="font-semibold text-[#123B2A] truncate">{p.name}</div>
                  <div className="text-[11px] text-[#123B2A]/70 font-mono mt-0.5">
                    Remaining: <span className="font-bold text-amber-700">{p.current_stock}</span> {p.base_unit} (Alert at {p.alert_threshold})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl border border-[#123B2A]/10 overflow-hidden">
          <div className="p-4 border-b border-[#123B2A]/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#123B2A]">Recent Sales Transactions</h2>
              <p className="text-[11px] text-[#123B2A]/60">
                Completed sales at your shop counter
              </p>
            </div>
            {sales.length > 0 && (
              <button
                onClick={() => navigate('/app/sales-history')}
                className="text-xs font-semibold text-[#123B2A] hover:underline"
              >
                View all sales →
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#123B2A]/60">Loading records...</div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F7F5EE] text-[#123B2A]/40 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#123B2A]">No sales recorded yet</h3>
              <p className="text-xs text-[#123B2A]/70 max-w-sm mx-auto mt-1 mb-4">
                Open the counter sales interface to process your first customer sale and track inventory automatically.
              </p>
              <button
                onClick={() => navigate('/app/sales')}
                className="px-4 py-2 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b]"
              >
                Open Sales Counter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10 font-semibold">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3 text-right">Items</th>
                    <th className="p-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                  {sales.slice(0, 5).map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#F7F5EE]/30">
                      <td className="p-3 font-semibold text-[#123B2A]">{sale.sale_reference}</td>
                      <td className="p-3 font-sans text-[#123B2A]/70">
                        {new Date(sale.created_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 font-sans capitalize">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#123B2A]/5 text-[#123B2A] font-medium">
                          {sale.payment_method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans text-[#123B2A]/70">
                        {sale.items?.length || 0}
                      </td>
                      <td className="p-3 text-right font-bold text-[#123B2A]">
                        GH₵ {Number(sale.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
