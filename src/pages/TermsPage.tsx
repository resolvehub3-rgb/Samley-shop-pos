import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-[#123B2A]/10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-3 py-1 rounded-full w-fit mb-4">
          <FileText className="w-3.5 h-3.5 text-[#C5A15A]" />
          <span>User Agreement</span>
        </div>

        <h1 className="text-3xl font-bold text-[#123B2A] mb-2">Terms of Service</h1>
        <p className="text-xs text-[#123B2A]/60 mb-6">
          Effective Date: March 2026 · Samly — Operated by SamTeck Digital.
        </p>

        <div className="p-3.5 bg-[#F7F5EE] rounded-lg border border-[#C5A15A]/30 text-xs text-[#123B2A]/80 mb-8">
          <strong>Notice:</strong> These terms govern the use of the Samly provision shop management SaaS platform. Please review carefully.
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-[#123B2A]/80 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">1. Account Registration & Approval</h2>
            <p>
              To register a provision shop on Samly, you must provide accurate personal and business details and verify your phone number using the SasuSync SMS OTP. All applications are subject to manual review and approval by the Samly Super Admin to safeguard platform integrity.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">2. Seven-Day Free Trial</h2>
            <p>
              Approved shops receive a single 7-day free trial. The trial begins exclusively upon your first successful login and dashboard access following Super Admin approval. No financial information or credit card is required to begin the trial.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">3. Subscription & Pricing</h2>
            <p>
              Following the free trial, continued access requires a monthly subscription fee of <strong>GH₵300 per shop</strong>. There are no additional tiers, hidden transaction cuts, or annual commitments.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">4. Customer-Authorised Mobile Money Payments</h2>
            <p>
              Subscription payments are processed through Moolre Mobile Money. Samly will never automatically deduct money from your account. The shop owner must actively initiate the renewal and authorise the prompt on their phone with their personal Mobile Money PIN.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">5. Subscription Expiry Policy</h2>
            <p>
              If a monthly subscription expires without renewal:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-[#123B2A]/75">
              <li>Normal shop operations (processing new counter sales, modifying stock, receiving supplier goods) will be restricted.</li>
              <li>All historical business data, product records, and sales reports remain safely preserved and will NOT be deleted.</li>
              <li>Access to the renewal payment screen and past payment invoices remains available.</li>
              <li>Operational access is restored automatically once a valid GH₵300 renewal is verified.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">6. Acceptable Platform Usage & Suspension</h2>
            <p>
              Shop owners agree to use Samly solely for legitimate retail shop operations. SamTeck Digital reserves the right to suspend or deactivate accounts found engaging in fraudulent transactions, abusive OTP requests, or unauthorized system exploitation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">7. Service Availability & Support</h2>
            <p>
              While Samly strives for high uptime, we provide the platform on an as-available commercial basis. Technical support is provided by SamTeck Digital for active subscribers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
