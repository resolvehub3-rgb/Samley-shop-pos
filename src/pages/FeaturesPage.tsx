import React from 'react';
import {
  Package,
  Receipt,
  Layers,
  TrendingUp,
  Tag,
  Clock,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

interface FeaturesPageProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ navigate, setDomain }) => {
  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
            Capabilities Built for Ghana
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123B2A] mt-2 mb-4">
            Samley Retail Platform Features
          </h1>
          <p className="text-sm text-[#123B2A]/80 leading-relaxed">
            Every feature in Samley Retail solves a concrete problem in traditional provision shop daily operations.
            No unnecessary complexity, no fake AI add-ons.
          </p>
        </div>

        {/* The 7 Core Features */}
        <div className="space-y-12">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl border border-[#123B2A]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-2.5 py-1 rounded mb-3">
                <Package className="w-3.5 h-3.5 text-[#C5A15A]" />
                <span>Feature 01</span>
              </div>
              <h2 className="text-xl font-bold text-[#123B2A] mb-2">Product Management</h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-4">
                Shop owners can register products, maintain catalog records, associate items with custom categories, and configure base units (pieces, tins, bottles, bags, eggs). Supports barcodes or quick-search titles for rapid recall at the counter.
              </p>
              <div className="text-xs font-medium text-[#123B2A]/60 space-y-1">
                <div>✓ Custom category assignment</div>
                <div>✓ Barcode & name search indexing</div>
                <div>✓ Base unit definition</div>
              </div>
            </div>
            <div className="bg-[#F7F5EE] p-5 rounded-lg border border-[#123B2A]/10 text-xs">
              <div className="font-semibold text-[#123B2A] mb-2">Real Provision Examples</div>
              <ul className="space-y-1.5 text-[#123B2A]/70">
                <li>• Ideal Evaporated Milk (160g)</li>
                <li>• Royal Aroma Perfumed Rice (5kg)</li>
                <li>• Farm Fresh Grade A Eggs</li>
                <li>• Gino Tomato Paste Sachet (70g)</li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl border border-[#123B2A]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-2.5 py-1 rounded mb-3">
                <Receipt className="w-3.5 h-3.5 text-[#C5A15A]" />
                <span>Feature 02</span>
              </div>
              <h2 className="text-xl font-bold text-[#123B2A] mb-2">Fast Sales Processing</h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-4">
                The core counter workflow. Shop attendants collect items from shelves and hand them to the owner at the counter. The owner selects the item, picks the selling unit, enters the quantity, sees line totals and running sale total update instantly, enters cash or Mobile Money received, and calculates change.
              </p>
              <div className="text-xs font-medium text-[#123B2A]/60 space-y-1">
                <div>✓ Automatic line-total calculations</div>
                <div>✓ Exact customer change calculation</div>
                <div>✓ Atomic inventory deduction in PostgreSQL</div>
              </div>
            </div>
            <div className="bg-[#F7F5EE] p-5 rounded-lg border border-[#123B2A]/10 text-xs">
              <div className="font-semibold text-[#123B2A] mb-2">Built for Rush Hours</div>
              <p className="text-[#123B2A]/70 leading-relaxed">
                Zero lag, keyboard-friendly entry, and clear visual confirmation so you can serve lines of morning or evening customers smoothly.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl border border-[#123B2A]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-2.5 py-1 rounded mb-3">
                <Layers className="w-3.5 h-3.5 text-[#C5A15A]" />
                <span>Feature 03</span>
              </div>
              <h2 className="text-xl font-bold text-[#123B2A] mb-2">Inventory Management & Unit Conversion</h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-4">
                Monitor current available stock and record stock movements. Products sold in multiple units (e.g. 1 carton containing 24 tins) convert cleanly into base units upon sale or receipt. Prevents overselling and records low-stock alerts.
              </p>
              <div className="text-xs font-medium text-[#123B2A]/60 space-y-1">
                <div>✓ Exact package-to-base unit conversion</div>
                <div>✓ Damaged, expired, and returned stock tracking</div>
                <div>✓ Permanent auditable movement history</div>
              </div>
            </div>
            <div className="bg-[#F7F5EE] p-5 rounded-lg border border-[#123B2A]/10 text-xs">
              <div className="font-semibold text-[#123B2A] mb-2">Conversion Accuracy</div>
              <p className="text-[#123B2A]/70 leading-relaxed font-mono">
                1 Carton = 24 Tins
                <br />
                Sell 1 Carton + 2 Tins
                <br />
                = 26 Base Tins Deducted
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-xl border border-[#123B2A]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-2.5 py-1 rounded mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-[#C5A15A]" />
                <span>Feature 04</span>
              </div>
              <h2 className="text-xl font-bold text-[#123B2A] mb-2">Stock Receiving</h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-4">
                Record products received from wholesale suppliers and distributors. Capture supplier invoice references, delivery dates, and actual cost per unit to update your inventory balance and cost-of-goods.
              </p>
              <div className="text-xs font-medium text-[#123B2A]/60 space-y-1">
                <div>✓ Supplier delivery & invoice logging</div>
                <div>✓ Automatic cost-price updating</div>
                <div>✓ Direct stock replenishment</div>
              </div>
            </div>
            <div className="bg-[#F7F5EE] p-5 rounded-lg border border-[#123B2A]/10 text-xs">
              <div className="font-semibold text-[#123B2A] mb-2">Supplier Traceability</div>
              <p className="text-[#123B2A]/70 leading-relaxed">
                Keep an exact digital ledger of how much you paid each supplier and when stock entered the shop.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-xl border border-[#123B2A]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-2.5 py-1 rounded mb-3">
                <Tag className="w-3.5 h-3.5 text-[#C5A15A]" />
                <span>Feature 05</span>
              </div>
              <h2 className="text-xl font-bold text-[#123B2A] mb-2">Selling Price & Purchase Cost Management</h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-4">
                Maintain accurate purchase cost and retail selling prices. Configure custom prices for different packaging (e.g. single egg vs complete crate; individual tin vs full carton).
              </p>
              <div className="text-xs font-medium text-[#123B2A]/60 space-y-1">
                <div>✓ Multi-unit pricing tiers</div>
                <div>✓ Profit margin transparency</div>
                <div>✓ Real cost tracking</div>
              </div>
            </div>
            <div className="bg-[#F7F5EE] p-5 rounded-lg border border-[#123B2A]/10 text-xs">
              <div className="font-semibold text-[#123B2A] mb-2">Pricing Discipline</div>
              <p className="text-[#123B2A]/70 leading-relaxed">
                Update prices quickly when wholesale costs fluctuate in the market so your margins stay protected.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-xl border border-[#123B2A]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-2.5 py-1 rounded mb-3">
                <Clock className="w-3.5 h-3.5 text-[#C5A15A]" />
                <span>Feature 06</span>
              </div>
              <h2 className="text-xl font-bold text-[#123B2A] mb-2">Sales Records & Receipts</h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-4">
                Maintain complete records of all completed transactions with itemized breakdowns, payment method (Cash or Mobile Money), timestamps, and receipt references.
              </p>
              <div className="text-xs font-medium text-[#123B2A]/60 space-y-1">
                <div>✓ Search past sales by reference</div>
                <div>✓ Cash vs Mobile Money payment breakdown</div>
                <div>✓ Permanent auditable transaction trail</div>
              </div>
            </div>
            <div className="bg-[#F7F5EE] p-5 rounded-lg border border-[#123B2A]/10 text-xs">
              <div className="font-semibold text-[#123B2A] mb-2">Dispute Resolution</div>
              <p className="text-[#123B2A]/70 leading-relaxed">
                If a customer asks about a transaction from yesterday morning, pull up the exact timestamp and line items instantly.
              </p>
            </div>
          </div>

          {/* Feature 7 */}
          <div className="bg-white p-8 rounded-xl border border-[#123B2A]/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-2.5 py-1 rounded mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-[#C5A15A]" />
                <span>Feature 07</span>
              </div>
              <h2 className="text-xl font-bold text-[#123B2A] mb-2">Business Reports & Performance</h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-4">
                Provides honest, transparent business intelligence calculated strictly from recorded transactions. Accurately distinguishes total revenue from gross profit so you never confuse cash flow with earnings.
              </p>
              <div className="text-xs font-medium text-[#123B2A]/60 space-y-1">
                <div>✓ True gross profit calculation: Revenue − Purchase Cost</div>
                <div>✓ Fast daily and monthly period filtering</div>
                <div>✓ Zero fake numbers or fabricated charts</div>
              </div>
            </div>
            <div className="bg-[#F7F5EE] p-5 rounded-lg border border-[#123B2A]/10 text-xs">
              <div className="font-semibold text-[#123B2A] mb-2">Strict Data Integrity</div>
              <p className="text-[#123B2A]/70 leading-relaxed">
                When your database has 0 transactions, your reports show 0. All metrics reflect your actual recorded sales.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => {
              setDomain('app');
              navigate('/register');
            }}
            className="px-8 py-3.5 bg-[#123B2A] text-white font-semibold rounded-lg shadow-sm hover:bg-[#1b523b] transition-all inline-flex items-center gap-2"
          >
            <span>Register Your Shop Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
