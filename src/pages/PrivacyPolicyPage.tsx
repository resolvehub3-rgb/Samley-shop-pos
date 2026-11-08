import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-[#123B2A]/10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#123B2A] bg-[#123B2A]/5 px-3 py-1 rounded-full w-fit mb-4">
          <Shield className="w-3.5 h-3.5 text-[#C5A15A]" />
          <span>Legal & Data Protection</span>
        </div>

        <h1 className="text-3xl font-bold text-[#123B2A] mb-2">Privacy Policy</h1>
        <p className="text-xs text-[#123B2A]/60 mb-6">
          Last Updated: March 2026 · Samley Retail, operated by SamTeck Digital.
        </p>

        <div className="p-3.5 bg-[#F7F5EE] rounded-lg border border-[#C5A15A]/30 text-xs text-[#123B2A]/80 mb-8">
          <strong>Review Notice:</strong> This privacy policy sets forth how Samley Retail collects, uses, and protects business and personal data. This document reflects actual implemented platform architecture and should be reviewed by legal counsel before high-scale production deployment.
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-[#123B2A]/80 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">1. Information We Collect</h2>
            <p>
              When you register a provision shop on Samley Retail, we collect:
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-[#123B2A]/75">
              <li><strong>Personal Information:</strong> Full name, email address, phone number, and encrypted authentication credentials.</li>
              <li><strong>Shop Information:</strong> Provision shop trade name, physical address/location in Ghana, and business contact phone.</li>
              <li><strong>Transaction & Inventory Records:</strong> Products added, custom categories, stock adjustments, supplier receiving invoices, and counter sales transaction logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">2. Phone Verification & SMS Processing (SasuSync)</h2>
            <p>
              We integrate with <strong>SasuSync</strong> to deliver critical transactional SMS messages, including one-time registration verification codes (OTP), application review status notifications, free trial expiration warnings, and payment receipts. We do not use your phone number for unsolicited marketing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">3. Payment Processing via Moolre</h2>
            <p>
              All subscription transactions (GH₵300/month) are handled through <strong>Moolre</strong> for customer-authorised Mobile Money payments. Samley Retail does NOT store your Mobile Money PIN or financial credentials. Every payment is initiated explicitly by the shop owner and verified via secure server-side webhooks.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">4. Data Storage, Isolation & Security</h2>
            <p>
              Samley Retail employs a genuine multi-tenant architecture with PostgreSQL Row Level Security (RLS). Each provision shop tenant operates within isolated database boundaries. One shop owner cannot inspect, alter, or access another shop’s sales, products, margins, or customer records.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">5. Data Retention & User Rights</h2>
            <p>
              Shop records are retained for the lifetime of your account. If your subscription expires, your historical products and sales records remain safely preserved and will not be deleted. You retain the right to export your transaction history or request account deactivation by contacting SamTeck Digital.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#123B2A] mb-1.5">6. Contact for Privacy Enquiries</h2>
            <p>
              For questions concerning this Privacy Policy, please contact SamTeck Digital via our official contact channel at <strong>app.samleyretail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
