import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ActiveSession, getSales, getProducts } from '../../services/shopService';
import { Sale, Product } from '../../types/database';
import { calculateGrossProfit } from '../../utils/shopCalculations';

interface BusinessReportsProps {
  session: ActiveSession;
  navigate: (route: string) => void;
}

export const BusinessReports: React.FC<BusinessReportsProps> = ({ session, navigate }) => {
  const shop = session.shop;
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [period, setPeriod] = useState<'all' | 'today' | 'month'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop) return;
    loadData();
  }, [shop?.id]);

  const loadData = async () => {
    if (!shop) return;
    setLoading(true);
    const [sList, prods] = await Promise.all([
      getSales(shop.id),
      getProducts(shop.id),
    ]);
    setSales(sList);
    setProducts(prods);
    setLoading(false);
  };

  // Filter sales by selected period
  const filteredSales = sales.filter((s) => {
    if (period === 'all') return true;
    const saleDate = new Date(s.created_at);
    const now = new Date();

    if (period === 'today') {
      return (
        saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === 'month') {
      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Calculate real metrics strictly from database records
  const totalRevenue = filteredSales.reduce((acc, s) => acc + Number(s.total_amount), 0);
  const totalAmountReceived = filteredSales.reduce((acc, s) => acc + Number(s.amount_received), 0);

  // Calculate real purchase cost of goods sold where recorded
  let totalCostOfGoodsSold = 0;
  let hasMissingCost = false;

  filteredSales.forEach((s) => {
    s.items?.forEach((item) => {
      if (item.cost_price && item.cost_price > 0) {
        totalCostOfGoodsSold += Number(item.cost_price) * Number(item.quantity);
      } else {
        hasMissingCost = true;
      }
    });
  });

  const grossProfit = calculateGrossProfit(totalRevenue, totalCostOfGoodsSold);

  // Product sales volume ranking
  const productVolumeMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  filteredSales.forEach((s) => {
    s.items?.forEach((item) => {
      const pName = item.product?.name || item.selling_unit_name || 'Item';
      if (!productVolumeMap[pName]) {
        productVolumeMap[pName] = { name: pName, qty: 0, revenue: 0 };
      }
      productVolumeMap[pName].qty += Number(item.quantity);
      productVolumeMap[pName].revenue += Number(item.line_total);
    });
  });

  const topProducts = Object.values(productVolumeMap).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#123B2A]/10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
              Analytics & Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
              Business Performance Reports
            </h1>
            <p className="text-xs text-[#123B2A]/70 mt-0.5">
              Calculated exclusively from recorded counter transactions and verified purchase costs.
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#123B2A]/15 text-xs">
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                period === 'all'
                  ? 'bg-[#123B2A] text-white'
                  : 'text-[#123B2A]/70 hover:text-[#123B2A]'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                period === 'today'
                  ? 'bg-[#123B2A] text-white'
                  : 'text-[#123B2A]/70 hover:text-[#123B2A]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                period === 'month'
                  ? 'bg-[#123B2A] text-white'
                  : 'text-[#123B2A]/70 hover:text-[#123B2A]'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Financial Separation Summary (Revenue vs Cash vs Cost vs Profit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#123B2A]/10">
            <div className="text-xs text-[#123B2A]/70 mb-1">Sales Revenue</div>
            <div className="text-2xl font-bold font-mono text-[#123B2A]">
              GH₵ {totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#123B2A]/60 mt-1">
              Total invoiced at counter
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#123B2A]/10">
            <div className="text-xs text-[#123B2A]/70 mb-1">Cash / MoMo Received</div>
            <div className="text-2xl font-bold font-mono text-[#123B2A]">
              GH₵ {totalAmountReceived.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#123B2A]/60 mt-1">
              Physical & digital money collected
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#123B2A]/10">
            <div className="text-xs text-[#123B2A]/70 mb-1">Cost of Goods Sold</div>
            <div className="text-2xl font-bold font-mono text-[#123B2A]">
              GH₵ {totalCostOfGoodsSold.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#123B2A]/60 mt-1">
              Wholesale purchase expense
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border-2 border-[#123B2A]">
            <div className="text-xs font-semibold text-[#C5A15A] uppercase tracking-wider mb-1">
              Gross Profit
            </div>
            <div className="text-2xl font-black font-mono text-[#123B2A]">
              GH₵ {grossProfit.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#123B2A]/70 mt-1">
              Revenue minus Purchase Cost
            </div>
          </div>
        </div>

        {/* Notice on Gross vs Net Profit */}
        <div className="p-4 bg-white rounded-xl border border-[#123B2A]/10 text-xs text-[#123B2A]/80 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#C5A15A] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Accounting Transparency:</strong> Gross profit is calculated exclusively as Sales Revenue minus recorded wholesale purchase cost. Operating overheads (e.g. shop rent, electricity, attendant wages) are not subtracted; this figure represents gross margin on sold inventory.
          </div>
        </div>

        {/* Product Sales Breakdown */}
        <div className="bg-white rounded-xl border border-[#123B2A]/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#123B2A]/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#123B2A]">Product Sales Performance</h2>
            <span className="text-xs text-[#123B2A]/60">
              Period: {period === 'all' ? 'All Time' : period === 'today' ? 'Today' : 'This Month'}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#123B2A]/60">Generating report...</div>
          ) : topProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#123B2A]/70">
              No sales recorded for this period yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10 font-semibold">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-right">Packages Sold</th>
                    <th className="p-3 text-right">Total Revenue</th>
                    <th className="p-3 text-right">% of Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                  {topProducts.map((p, idx) => {
                    const share = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-[#F7F5EE]/30">
                        <td className="p-3 font-sans font-semibold text-[#123B2A]">{p.name}</td>
                        <td className="p-3 text-right">{p.qty}</td>
                        <td className="p-3 text-right font-bold text-[#123B2A]">
                          GH₵ {p.revenue.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-[#123B2A]/70">
                          {share.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
