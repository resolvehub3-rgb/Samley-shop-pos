import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  ArrowRight,
  Eye,
  Calendar,
  CreditCard,
  Coins,
} from 'lucide-react';
import { ActiveSession, getSales } from '../../services/shopService';
import { Sale } from '../../types/database';

interface SalesHistoryProps {
  session: ActiveSession;
  navigate: (route: string) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ session, navigate }) => {
  const shop = session.shop;
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchRef, setSearchRef] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop) return;
    loadSales();
  }, [shop?.id]);

  const loadSales = async () => {
    if (!shop) return;
    setLoading(true);
    const data = await getSales(shop.id);
    setSales(data);
    setLoading(false);
  };

  const filteredSales = sales.filter((s) => {
    if (!searchRef.trim()) return true;
    return s.sale_reference.toLowerCase().includes(searchRef.toLowerCase().trim());
  });

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#123B2A]/10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
              Transactions & Invoices
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
              Sales Records
            </h1>
            <p className="text-xs text-[#123B2A]/70 mt-0.5">
              Itemized history of all completed transactions processed at the shop counter.
            </p>
          </div>

          <button
            onClick={() => navigate('/app/sales')}
            className="px-4 py-2 bg-[#123B2A] text-white text-xs font-bold rounded-lg hover:bg-[#1b523b] shadow-sm flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-[#C5A15A]" />
            <span>Open Sales Counter</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-[#123B2A]/10 flex items-center justify-between shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="Search by receipt reference (e.g. SAM-123456)..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
            />
          </div>
          <span className="text-xs text-[#123B2A]/70">
            Total Recorded: <strong className="font-mono text-[#123B2A]">{sales.length}</strong> sales
          </span>
        </div>

        {/* Table or Empty */}
        <div className="bg-white rounded-xl border border-[#123B2A]/10 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#123B2A]/60">Loading sales records...</div>
          ) : sales.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F7F5EE] text-[#123B2A]/40 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#123B2A]">No sales records yet</h3>
              <p className="text-xs text-[#123B2A]/70 max-w-sm mx-auto mt-1 mb-4">
                Completed transactions from your sales terminal will appear here with itemized line items and payment details.
              </p>
              <button
                onClick={() => navigate('/app/sales')}
                className="px-4 py-2 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b]"
              >
                Go to Sales Counter
              </button>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#123B2A]/70">
              No sales found matching reference "{searchRef}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10 font-semibold">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3 text-right">Items</th>
                    <th className="p-3 text-right">Total Amount</th>
                    <th className="p-3 text-right">Received</th>
                    <th className="p-3 text-right">Change</th>
                    <th className="p-3 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#F7F5EE]/40">
                      <td className="p-3 font-semibold text-[#123B2A]">{sale.sale_reference}</td>
                      <td className="p-3 font-sans text-[#123B2A]/70">
                        {new Date(sale.created_at).toLocaleString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 font-sans capitalize">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#123B2A]/5 text-[#123B2A]">
                          {sale.payment_method === 'cash' ? (
                            <Coins className="w-3 h-3 text-[#C5A15A]" />
                          ) : (
                            <CreditCard className="w-3 h-3 text-[#C5A15A]" />
                          )}
                          <span>{sale.payment_method.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right font-sans text-[#123B2A]/70">
                        {sale.items?.length || 0}
                      </td>
                      <td className="p-3 text-right font-bold text-[#123B2A]">
                        GH₵ {Number(sale.total_amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-[#123B2A]/70">
                        GH₵ {Number(sale.amount_received).toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-[#123B2A]/70">
                        GH₵ {Number(sale.change_amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#123B2A] bg-[#123B2A]/5 hover:bg-[#123B2A]/10 rounded"
                        >
                          View Items
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Line Items Modal */}
        {selectedSale && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#123B2A]/20 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#123B2A]/10">
                <div>
                  <h3 className="text-sm font-bold text-[#123B2A]">Sale Receipt Breakdown</h3>
                  <div className="text-xs text-[#123B2A]/60 font-mono">
                    Ref: {selectedSale.sale_reference}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-xs text-[#123B2A]/60 hover:text-[#123B2A]"
                >
                  ✕ Close
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedSale.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-[#F7F5EE] rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#123B2A]">
                        {item.product?.name || 'Product'}
                      </div>
                      <div className="text-[11px] text-[#123B2A]/70 font-mono">
                        {item.quantity} × {item.selling_unit_name} @ GH₵ {Number(item.unit_price).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-[#123B2A]">
                      GH₵ {Number(item.line_total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#123B2A] text-white rounded-lg space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Amount:</span>
                  <span className="font-mono font-bold">
                    GH₵ {Number(selectedSale.total_amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Amount Received:</span>
                  <span className="font-mono">
                    GH₵ {Number(selectedSale.amount_received).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#C5A15A] pt-1 border-t border-white/10">
                  <span>Change Given:</span>
                  <span className="font-mono">
                    GH₵ {Number(selectedSale.change_amount).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSale(null)}
                className="w-full py-2 bg-[#F7F5EE] text-[#123B2A] text-xs font-semibold rounded-lg hover:bg-[#EFECE2]"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
