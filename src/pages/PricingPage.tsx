import React from 'react';
import { Check, ShieldCheck, ArrowRight, Smartphone, AlertCircle } from 'lucide-react';

interface PricingPageProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate, setDomain }) => {
  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
            Single Transparent Plan
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123B2A] mt-2 mb-4">
            Simple, Fixed Monthly Pricing
          </h1>
          <p className="text-sm text-[#123B2A]/80 max-w-xl mx-auto leading-relaxed">
            One single subscription package with everything included. No complicated tiers, no hidden setup fees, and no surprise charges.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl border-2 border-[#123B2A] p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b border-[#123B2A]/10 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-3 py-1 rounded-full mb-3">
                <ShieldCheck className="w-4 h-4 text-[#C5A15A]" />
                <span>Commercial Provision Shop License</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
                Samly Monthly Subscription
              </h2>
              <p className="text-xs sm:text-sm text-[#123B2A]/70 mt-1">
                Full access for one provision shop tenant and authorized shop attendants
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-4xl sm:text-5xl font-black text-[#123B2A] font-mono">
                GH₵ 300
              </div>
              <div className="text-xs text-[#123B2A]/60 mt-1">Billed monthly · GH₵300/shop</div>
            </div>
          </div>

          {/* Trial highlight */}
          <div className="my-6 p-4 bg-[#F7F5EE] rounded-xl border border-[#123B2A]/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#123B2A] text-[#C5A15A] flex items-center justify-center font-bold text-xs">
                7d
              </div>
              <div>
                <div className="text-xs font-bold text-[#123B2A]">Includes 7-Day Free Trial</div>
                <div className="text-[11px] text-[#123B2A]/70">
                  Begins only when you log in to your dashboard for the first time after approval.
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#123B2A] bg-white px-2.5 py-1 rounded border border-[#123B2A]/10">
              GH₵ 0 Upfront
            </span>
          </div>

          {/* Feature Checklist */}
          <div className="py-6 border-b border-[#123B2A]/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A15A] mb-4">
              Included With Your Subscription
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#123B2A]/85">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Access to the Samly provision shop management application</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Full product catalog & category management</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Fast counter POS sales processing with auto change calculation</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Inventory & stock tracking with base unit conversions</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Stock receiving from wholesale suppliers & invoice logging</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Purchase cost & retail selling price management</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Permanent sales records & transaction receipt history</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#123B2A] shrink-0 mt-0.5" />
                <span>Business performance reports & accurate gross profit analysis</span>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="py-6 border-b border-[#123B2A]/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C5A15A] mb-3">
              Payment Method & Security
            </h3>
            <div className="p-4 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10 text-xs text-[#123B2A]/80 leading-relaxed">
              <div className="flex items-center gap-2 font-semibold text-[#123B2A] mb-1">
                <Smartphone className="w-4 h-4 text-[#C5A15A]" />
                <span>Customer-Authorised Moolre Mobile Money</span>
              </div>
              <p>
                We use Moolre for secure Mobile Money payments. The platform never automatically debits your account. When renewing your subscription, you receive an authorisation prompt on your mobile phone (MTN MoMo, Telecel Cash, or AirtelTigo) that you personally approve with your PIN.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#123B2A]/70">
              No long-term contracts. Renew early without losing remaining days.
            </div>
            <button
              onClick={() => {
                setDomain('app');
                navigate('/register');
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#123B2A] text-white font-semibold rounded-lg hover:bg-[#1b523b] transition-all flex items-center justify-center gap-2"
            >
              <span>Register & Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scope Control Disclaimer */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-[#123B2A]/10 text-xs text-[#123B2A]/70 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#C5A15A] shrink-0 mt-0.5" />
          <div>
            <strong>Strict Scope Guarantee:</strong> Samly does not offer Starter, Professional, or Enterprise tiers. Every subscriber gets the exact same complete suite of features for GH₵300 per month.
          </div>
        </div>
      </div>
    </div>
  );
};
