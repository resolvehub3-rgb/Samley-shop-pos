import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Package,
  Layers,
  TrendingUp,
  Clock,
  Shield,
  Smartphone,
  Receipt,
} from 'lucide-react';

interface HomePageProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, setDomain }) => {
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  const toggleFaq = (idx: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const faqs = [
    {
      q: 'What is Samly?',
      a: 'Samly is a commercial provision shop management SaaS platform operated by SamTeck Digital. It is specifically designed around the real operating workflow of traditional Ghanaian provision shops to track products, inventory, counter sales, and business performance.',
    },
    {
      q: 'Who can use Samly?',
      a: 'Any traditional provision shop owner in Ghana. It supports owners who manage the central counter and POS while shop attendants retrieve items from the shelves.',
    },
    {
      q: 'How do I register my provision shop?',
      a: 'Registration is a 2-step structured process: First enter your personal contact details, then enter your shop information (shop name, location, and business phone). You then verify your phone number via a SasuSync SMS OTP before submitting.',
    },
    {
      q: 'Why does my application require approval?',
      a: 'To maintain high platform security and verify bona fide provision shop businesses, every registration is manually reviewed by the Samly Super Admin before account activation.',
    },
    {
      q: 'How long is the free trial?',
      a: 'Every approved shop receives one 7-day free trial. The trial begins only when you successfully log in and access your dashboard for the first time after approval.',
    },
    {
      q: 'How much does Samly cost?',
      a: 'There is a single transparent subscription fee of GH₵300 per shop per month. There are no complicated tiers, hidden setup charges, or surprise fees.',
    },
    {
      q: 'How do I pay?',
      a: 'Payments are made through customer-authorised Moolre Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money). The system never automatically deducts funds; you actively authorise the prompt on your phone.',
    },
    {
      q: 'What happens when my subscription expires?',
      a: 'If a subscription expires without renewal, new sales and stock adjustments are paused, but all existing shop records, products, and history remain safely preserved. Full access is restored immediately upon completing your renewal payment.',
    },
  ];

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen">
      {/* Hero Section — 2-Column Split Layout */}
      <section className="relative pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headline, Description, CTAs, and Pricing note */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#123B2A]/5 border border-[#123B2A]/10 rounded-full text-xs font-semibold text-[#123B2A] mb-4">
              <span>Official Launch</span>
              <span className="text-[#C5A15A]">·</span>
              <span>Commercial SaaS for Ghanaian Provision Shops</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#123B2A] leading-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              Run Your Provision Shop Smarter with Samly.
            </h1>

            <p className="text-sm sm:text-base text-[#123B2A]/80 leading-relaxed mb-6">
              Samly helps provision shop owners manage products, track stock, process sales and understand their business performance from one simple digital platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
              <button
                onClick={() => {
                  setDomain('app');
                  navigate('/register');
                }}
                className="px-6 py-3.5 bg-[#123B2A] text-white font-semibold rounded-lg shadow-sm hover:bg-[#1b523b] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>Register Your Shop</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setDomain('app');
                  navigate('/login');
                }}
                className="px-6 py-3.5 bg-white text-[#123B2A] font-semibold rounded-lg border border-[#123B2A]/20 hover:bg-[#F7F5EE] transition-all text-xs sm:text-sm text-center"
              >
                Login to Account
              </button>
            </div>

            <div className="text-xs text-[#123B2A]/70 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Includes 7-day free trial on first dashboard access</span>
              <span>·</span>
              <span className="font-semibold text-[#123B2A]">GH₵300/month thereafter</span>
            </div>
          </div>

          {/* Right Column: app.samly.com/app/sales — Counter Sales Terminal / Samly POS dashboard */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#123B2A]/15 bg-white shadow-xl overflow-hidden">
              {/* Mock Window Top Bar */}
              <div className="bg-[#123B2A] text-[#F7F5EE] px-4 py-2.5 flex items-center justify-between border-b border-[#C5A15A]/30">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs font-medium text-[#C5A15A] truncate">
                    app.samly.com/app/sales — Counter Sales Terminal
                  </span>
                </div>
                <span className="text-[11px] text-[#F7F5EE]/80 font-mono shrink-0">Samly POS</span>
              </div>

              {/* UI Component Representation of the Sales Counter Terminal */}
              <div className="p-4 sm:p-5 bg-[#F7F5EE]/50 space-y-3.5">
                {/* Active Items Table */}
                <div className="bg-white p-3.5 rounded-lg border border-[#123B2A]/10 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#123B2A]/70 uppercase tracking-wider">
                      Active Counter Items
                    </span>
                    <span className="text-[10px] font-mono font-medium text-[#123B2A]/60">
                      Operator: Shop Owner
                    </span>
                  </div>
                  <div className="border border-[#123B2A]/10 rounded overflow-hidden">
                    <table className="w-full text-[11px] sm:text-xs text-left">
                      <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10">
                        <tr>
                          <th className="p-2 font-medium">Product</th>
                          <th className="p-2 font-medium">Selling Unit</th>
                          <th className="p-2 font-medium text-right">Qty</th>
                          <th className="p-2 font-medium text-right">Price</th>
                          <th className="p-2 font-medium text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                        <tr>
                          <td className="p-2 font-sans font-medium text-[#123B2A] truncate max-w-[120px] sm:max-w-none">
                            Ideal Evaporated Milk (160g)
                          </td>
                          <td className="p-2 font-sans text-[#123B2A]/70">Carton (24 tins)</td>
                          <td className="p-2 text-right">1</td>
                          <td className="p-2 text-right">180.00</td>
                          <td className="p-2 text-right font-semibold">180.00</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-sans font-medium text-[#123B2A] truncate max-w-[120px] sm:max-w-none">
                            Local Long Grain Rice (5kg)
                          </td>
                          <td className="p-2 font-sans text-[#123B2A]/70">Bag</td>
                          <td className="p-2 text-right">2</td>
                          <td className="p-2 text-right">125.00</td>
                          <td className="p-2 text-right font-semibold">250.00</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-sans font-medium text-[#123B2A] truncate max-w-[120px] sm:max-w-none">
                            Farm Fresh Eggs
                          </td>
                          <td className="p-2 font-sans text-[#123B2A]/70">Crate (30 eggs)</td>
                          <td className="p-2 text-right">1</td>
                          <td className="p-2 text-right">55.00</td>
                          <td className="p-2 text-right font-semibold">55.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Counter Totals & Payment Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-lg border border-[#123B2A]/10 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#123B2A]/60 mb-1.5">
                        Inventory Deduction
                      </div>
                      <p className="text-[11px] text-[#123B2A]/75 leading-relaxed">
                        Automatic base unit ledger update: 24 tins + 2 bags + 30 eggs deducted atomically in PostgreSQL.
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#123B2A]/10 text-[10px] font-medium text-[#123B2A]/60">
                      ✓ Zero math errors at counter
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-[#123B2A]/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#123B2A]/70">Total Due:</span>
                      <span className="font-mono text-base font-bold text-[#123B2A]">GH₵ 485.00</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[#123B2A]/70 pt-1 border-t border-[#123B2A]/5">
                      <span>Amount Received:</span>
                      <span className="font-mono font-medium">GH₵ 500.00</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[#123B2A]/70">
                      <span className="font-semibold text-[#123B2A]">Change Due:</span>
                      <span className="font-mono font-bold text-emerald-700">GH₵ 15.00</span>
                    </div>
                    <div className="pt-2 border-t border-[#123B2A]/10">
                      <div className="w-full py-1.5 bg-[#123B2A] text-white text-[11px] font-semibold rounded text-center">
                        Sale Complete — Receipt Logged
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white border-y border-[#123B2A]/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B2A] mb-4">
            Designed for How Ghanaian Provision Shops Really Operate
          </h2>
          <p className="text-base text-[#123B2A]/80 leading-relaxed mb-8">
            Traditional provision shops have a unique workflow: customers place items on the counter, shop attendants fetch stock from shelves, and the owner calculates totals and collects money. Samly replaces mental calculations and handwritten notebook records with a structured, reliable digital counter POS.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10">
              <div className="w-9 h-9 rounded-md bg-[#123B2A] text-[#C5A15A] flex items-center justify-center mb-3">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123B2A] text-sm mb-1.5">No Math Errors at the Counter</h3>
              <p className="text-xs text-[#123B2A]/70 leading-relaxed">
                Line totals, aggregate amounts, and customer change are calculated instantly to avoid undercharging or confusion during busy hours.
              </p>
            </div>

            <div className="p-5 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10">
              <div className="w-9 h-9 rounded-md bg-[#123B2A] text-[#C5A15A] flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123B2A] text-sm mb-1.5">Configurable Selling Units</h3>
              <p className="text-xs text-[#123B2A]/70 leading-relaxed">
                Sell items the way your shop actually sells them: by single tins, crates of eggs, bags of rice, or cartons with automatic base stock conversions.
              </p>
            </div>

            <div className="p-5 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10">
              <div className="w-9 h-9 rounded-md bg-[#123B2A] text-[#C5A15A] flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#123B2A] text-sm mb-1.5">True Profit Knowledge</h3>
              <p className="text-xs text-[#123B2A]/70 leading-relaxed">
                Record your actual purchase costs so your daily and monthly reports reveal real gross profit rather than confusing sales revenue with take-home earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Benefits and Features Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#123B2A] mb-3">
            Core Operational Capabilities
          </h2>
          <p className="text-sm text-[#123B2A]/70">
            Every feature in Samly was built exclusively for traditional provision shops. No bloated supermarket modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg border border-[#123B2A]/10 hover:border-[#123B2A]/30 transition-all">
            <div className="w-10 h-10 rounded bg-[#123B2A]/5 text-[#123B2A] flex items-center justify-center mb-4">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#123B2A] mb-2">Product Management</h3>
            <p className="text-xs text-[#123B2A]/70 leading-relaxed">
              Register products, assign them to your custom shop categories, define barcodes or quick names, and configure both purchase cost and retail selling prices.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#123B2A]/10 hover:border-[#123B2A]/30 transition-all">
            <div className="w-10 h-10 rounded bg-[#123B2A]/5 text-[#123B2A] flex items-center justify-center mb-4">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#123B2A] mb-2">Fast Counter Sales Processing</h3>
            <p className="text-xs text-[#123B2A]/70 leading-relaxed">
              Designed for speed during rush hours. Select products, pick the unit, enter quantity, receive cash or MoMo, calculate change, and complete the sale.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#123B2A]/10 hover:border-[#123B2A]/30 transition-all">
            <div className="w-10 h-10 rounded bg-[#123B2A]/5 text-[#123B2A] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#123B2A] mb-2">Inventory & Stock Ledger</h3>
            <p className="text-xs text-[#123B2A]/70 leading-relaxed">
              Track remaining quantities in base units. Every sale, damaged item, expired tin, or manual count is logged permanently in an auditable ledger.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#123B2A]/10 hover:border-[#123B2A]/30 transition-all">
            <div className="w-10 h-10 rounded bg-[#123B2A]/5 text-[#123B2A] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#123B2A] mb-2">Stock Receiving from Suppliers</h3>
            <p className="text-xs text-[#123B2A]/70 leading-relaxed">
              When suppliers deliver new cartons, crates, or bags, record the quantities and purchase costs to update both stock and cost-of-goods accurately.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#123B2A]/10 hover:border-[#123B2A]/30 transition-all">
            <div className="w-10 h-10 rounded bg-[#123B2A]/5 text-[#123B2A] flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#123B2A] mb-2">Sales Records & Receipts</h3>
            <p className="text-xs text-[#123B2A]/70 leading-relaxed">
              Look up any past transaction, verify payments received via cash or mobile money, and inspect line items for complete peace of mind.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#123B2A]/10 hover:border-[#123B2A]/30 transition-all">
            <div className="w-10 h-10 rounded bg-[#123B2A]/5 text-[#123B2A] flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#123B2A] mb-2">Real Business Performance Reports</h3>
            <p className="text-xs text-[#123B2A]/70 leading-relaxed">
              Reports generated strictly from completed sales and verified purchase costs. Distinguishes total revenue from gross profit so you know exactly where you stand.
            </p>
          </div>
        </div>
      </section>

      {/* How Samly Works Summary */}
      <section className="py-16 bg-[#123B2A] text-[#F7F5EE] px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How Samly Works</h2>
            <p className="text-sm text-[#F7F5EE]/70 max-w-xl mx-auto">
              From registration to everyday counter sales, here is the customer journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0c271c] p-5 rounded-lg border border-[#C5A15A]/20">
              <div className="text-xs font-bold text-[#C5A15A] mb-2 font-mono">01. REGISTER</div>
              <h4 className="font-bold text-sm mb-1 text-white">Enter Personal & Shop Info</h4>
              <p className="text-xs text-[#F7F5EE]/70">
                Provide your name, email, phone number, and provision shop address.
              </p>
            </div>

            <div className="bg-[#0c271c] p-5 rounded-lg border border-[#C5A15A]/20">
              <div className="text-xs font-bold text-[#C5A15A] mb-2 font-mono">02. VERIFY PHONE</div>
              <h4 className="font-bold text-sm mb-1 text-white">SasuSync OTP</h4>
              <p className="text-xs text-[#F7F5EE]/70">
                Receive an immediate SMS verification code on your phone to confirm ownership.
              </p>
            </div>

            <div className="bg-[#0c271c] p-5 rounded-lg border border-[#C5A15A]/20">
              <div className="text-xs font-bold text-[#C5A15A] mb-2 font-mono">03. APPROVAL</div>
              <h4 className="font-bold text-sm mb-1 text-white">Super Admin Review</h4>
              <p className="text-xs text-[#F7F5EE]/70">
                Our team reviews your application. Upon approval, you receive an SMS with your login link.
              </p>
            </div>

            <div className="bg-[#0c271c] p-5 rounded-lg border border-[#C5A15A]/20">
              <div className="text-xs font-bold text-[#C5A15A] mb-2 font-mono">04. OPERATE & SUBSCRIBE</div>
              <h4 className="font-bold text-sm mb-1 text-white">7-Day Free Trial</h4>
              <p className="text-xs text-[#F7F5EE]/70">
                Your 7-day trial begins on your first login. Continue for GH₵300/mo via Moolre MoMo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#123B2A] mb-3">Simple, Transparent Pricing</h2>
          <p className="text-sm text-[#123B2A]/70">
            One single plan with all features included. No setup fees.
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#123B2A] p-8 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#123B2A]/10 gap-4">
            <div>
              <span className="text-xs font-semibold text-[#C5A15A] uppercase tracking-wider">
                Full Provision Shop License
              </span>
              <h3 className="text-2xl font-bold text-[#123B2A] mt-1">Samly Monthly Subscription</h3>
              <p className="text-xs text-[#123B2A]/70 mt-1">
                For traditional Ghanaian provision shop owners
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl font-extrabold text-[#123B2A] font-mono">GH₵ 300</div>
              <div className="text-xs text-[#123B2A]/60">per shop / month</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs text-[#123B2A]/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#123B2A]" />
              <span>Seven (7) days free trial included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#123B2A]" />
              <span>Full product catalog & category management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#123B2A]" />
              <span>Fast counter POS sales terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#123B2A]" />
              <span>Stock receiving & supplier invoice recording</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#123B2A]" />
              <span>Configurable selling units & conversions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#123B2A]" />
              <span>Customer-authorised Moolre Mobile Money payment</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#123B2A]/10 gap-4">
            <button
              onClick={() => navigate('/pricing')}
              className="text-xs font-semibold text-[#123B2A] underline hover:text-[#1b523b]"
            >
              View detailed pricing terms →
            </button>
            <button
              onClick={() => {
                setDomain('app');
                navigate('/register');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b] transition-all"
            >
              Start Free 7-Day Trial
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions — 2-Column Grid with Animated Accordion */}
      <section className="py-16 bg-white border-y border-[#123B2A]/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#123B2A] mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#123B2A]/70">
              Clear answers regarding registration, approvals, pricing, and system rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {faqs.map((faq, idx) => {
              const isOpen = !!openFaqs[idx];
              return (
                <div
                  key={idx}
                  className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'border-[#123B2A] bg-white shadow-sm ring-1 ring-[#123B2A]/10'
                      : 'border-[#123B2A]/15 bg-white/80 hover:border-[#123B2A]/30 hover:bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-sm text-[#123B2A] leading-snug">
                      {faq.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'bg-[#123B2A] text-white rotate-180'
                          : 'bg-[#123B2A]/5 text-[#123B2A]/70 hover:bg-[#123B2A]/10 rotate-0'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    </div>
                  </button>

                  {/* Smooth Animated Accordion via CSS Grid Height Transition */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-[#123B2A]/80 leading-relaxed border-t border-[#123B2A]/5">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-[#123B2A] mb-4">
          Ready to Modernize Your Provision Shop?
        </h2>
        <p className="text-sm text-[#123B2A]/80 max-w-xl mx-auto mb-8">
          Register your shop today, verify your phone, and start your 7-day free trial as soon as your application is approved.
        </p>
        <button
          onClick={() => {
            setDomain('app');
            navigate('/register');
          }}
          className="px-8 py-3.5 bg-[#123B2A] text-white font-semibold rounded-lg shadow-md hover:bg-[#1b523b] transition-all inline-flex items-center gap-2"
        >
          <span>Register Your Provision Shop</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
