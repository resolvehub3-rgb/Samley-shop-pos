import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Smartphone,
  ArrowRight,
  Receipt,
  FileCheck,
} from 'lucide-react';
import {
  ActiveSession,
  getSubscriptionHistory,
  recordSuccessfulPaymentAndRenew,
} from '../../services/shopService';
import { SubscriptionRecord } from '../../types/database';
import {
  MONTHLY_SUBSCRIPTION_FEE_GHS,
  getDaysRemaining,
  hasOperationalAccess,
} from '../../utils/subscriptionRules';
import { initiateMoolrePayment } from '../../services/paymentService';
import { sendSmsNotification, SmsTemplates } from '../../services/smsService';

interface SubscriptionBillingProps {
  session: ActiveSession;
  navigate: (route: string) => void;
  onRefreshSession: () => void;
}

export const SubscriptionBilling: React.FC<SubscriptionBillingProps> = ({
  session,
  navigate,
  onRefreshSession,
}) => {
  const shop = session.shop;
  const [history, setHistory] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment flow modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [momoNumber, setMomoNumber] = useState(shop?.business_phone || '');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'Vodafone' | 'AirtelTigo'>('MTN');
  const [paymentStep, setPaymentStep] = useState<'invoice' | 'prompt_sent' | 'verified'>('invoice');
  const [paymentReference, setPaymentReference] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!shop) return;
    loadHistory();
  }, [shop?.id]);

  const loadHistory = async () => {
    if (!shop) return;
    setLoading(true);
    const data = await getSubscriptionHistory(shop.id);
    setHistory(data);
    setLoading(false);
  };

  const subState = {
    status: shop?.subscription_status || 'trialing',
    trialStartedAt: shop?.trial_started_at || null,
    trialEndsAt: shop?.trial_ends_at || null,
    subscriptionEndsAt: shop?.subscription_ends_at || null,
  };
  const access = hasOperationalAccess(subState);
  const remaining = getDaysRemaining(subState);

  // Step 1: Initiate Payment
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!shop) return;
    if (!momoNumber.trim()) {
      setPaymentError('Please enter your Mobile Money phone number.');
      return;
    }

    setProcessing(true);

    const initResult = await initiateMoolrePayment({
      shopId: shop.id,
      shopName: shop.name,
      momoNumber: momoNumber.trim(),
      amount: MONTHLY_SUBSCRIPTION_FEE_GHS,
      network: momoNetwork,
    });

    setPaymentReference(initResult.reference);
    setProcessing(false);
    setPaymentStep('prompt_sent');
  };

  // Step 2: Customer confirms they approved the USSD prompt on their phone
  const handleVerifyCustomerApproval = async () => {
    setPaymentError(null);
    setProcessing(true);

    if (!shop) return;

    // Backend verifies payment reference and records successful subscription extension
    const renewResult = await recordSuccessfulPaymentAndRenew(
      shop.id,
      paymentReference,
      momoNumber
    );

    if (!renewResult.success) {
      setProcessing(false);
      setPaymentError(renewResult.error || 'Failed to verify transaction.');
      return;
    }

    // Send confirmation SMS via SasuSync
    await sendSmsNotification({
      shopId: shop.id,
      recipientPhone: momoNumber,
      messageType: 'payment_success',
      messageText: SmsTemplates.paymentSuccess(
        MONTHLY_SUBSCRIPTION_FEE_GHS,
        renewResult.newExpiry
      ),
    });

    setProcessing(false);
    setPaymentStep('verified');
    loadHistory();
    onRefreshSession();
  };

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#123B2A]/10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
              Subscription & Payments
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123B2A]">
              Shop License & Billing
            </h1>
            <p className="text-xs text-[#123B2A]/70 mt-0.5">
              Fixed GH₵300/month subscription managed via customer-authorised Moolre Mobile Money.
            </p>
          </div>

          <button
            onClick={() => {
              setPaymentStep('invoice');
              setShowPaymentModal(true);
            }}
            className="px-5 py-2.5 bg-[#123B2A] text-white text-xs font-bold rounded-lg hover:bg-[#1b523b] flex items-center gap-1.5 shadow-sm"
          >
            <CreditCard className="w-4 h-4 text-[#C5A15A]" />
            <span>Make Payment / Renew</span>
          </button>
        </div>

        {/* Current Subscription Card */}
        <div className="bg-white rounded-2xl border-2 border-[#123B2A] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#123B2A]/10 gap-4">
            <div>
              <div className="text-xs font-bold text-[#C5A15A] uppercase tracking-wider">
                Current Subscription State
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#123B2A] mt-0.5">
                {shop?.subscription_status === 'active'
                  ? 'Samley Retail Monthly License (Active)'
                  : shop?.subscription_status === 'trialing'
                  ? '7-Day Free Trial (Active)'
                  : 'Subscription Expired'}
              </h2>
              <div className="text-xs text-[#123B2A]/70 mt-1">
                Shop: <strong>{shop?.name}</strong> · Registered: {new Date(shop?.created_at || '').toLocaleDateString('en-GB')}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-3xl font-black font-mono text-[#123B2A]">GH₵ 300</div>
              <div className="text-xs text-[#123B2A]/60">per month</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-[#123B2A]/10 text-xs">
            <div className="p-3.5 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10">
              <div className="text-[#123B2A]/60 font-semibold mb-1">Access Status</div>
              <div className="font-bold text-[#123B2A]">
                {access.allowed ? '✓ Operational (Full Access)' : '✗ Paused (Renewal Needed)'}
              </div>
            </div>

            <div className="p-3.5 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10">
              <div className="text-[#123B2A]/60 font-semibold mb-1">Days Remaining</div>
              <div className="font-bold font-mono text-[#123B2A]">
                {remaining.days} Day{remaining.days === 1 ? '' : 's'}
              </div>
            </div>

            <div className="p-3.5 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10">
              <div className="text-[#123B2A]/60 font-semibold mb-1">Current Expiration Date</div>
              <div className="font-bold font-mono text-[#123B2A]">
                {shop?.subscription_ends_at
                  ? new Date(shop.subscription_ends_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : shop?.trial_ends_at
                  ? new Date(shop.trial_ends_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Pending'}
              </div>
            </div>
          </div>

          {/* Business rule notes */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#123B2A]/70 gap-4">
            <div>
              <strong>Early Renewal Benefit:</strong> Renewing before your expiry date adds 1 full calendar month to your existing expiry without losing remaining paid days.
            </div>
            <button
              onClick={() => {
                setPaymentStep('invoice');
                setShowPaymentModal(true);
              }}
              className="px-5 py-2.5 bg-[#123B2A] text-white font-semibold rounded-lg hover:bg-[#1b523b] whitespace-nowrap"
            >
              Pay GH₵300 Now
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-[#123B2A]/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#123B2A]/10">
            <h3 className="text-sm font-bold text-[#123B2A]">Verified Subscription Invoices</h3>
            <p className="text-[11px] text-[#123B2A]/60">
              Permanent record of customer-authorised payments
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#123B2A]/60">Loading invoices...</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#123B2A]/70">
              No previous paid subscriptions yet. Currently on initial 7-day free trial.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F5EE] text-[#123B2A]/70 border-b border-[#123B2A]/10 font-semibold">
                  <tr>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">End Date</th>
                    <th className="p-3 text-right">Amount (GH₵)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#123B2A]/5 font-mono">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-[#F7F5EE]/30">
                      <td className="p-3 font-sans font-semibold text-[#123B2A]">{h.plan_name}</td>
                      <td className="p-3 text-[#123B2A]/70">{h.moolre_reference || 'REF-MOMO'}</td>
                      <td className="p-3 font-sans">
                        {new Date(h.start_date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 font-sans font-bold text-[#123B2A]">
                        {new Date(h.end_date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 text-right font-bold text-[#123B2A]">
                        GH₵ {Number(h.amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                          Verified Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Customer-Authorised Moolre Payment */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#123B2A]/20 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#123B2A]/10">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#C5A15A]" />
                  <h3 className="text-base font-bold text-[#123B2A]">
                    Moolre Mobile Money Checkout
                  </h3>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-xs text-[#123B2A]/60 hover:text-[#123B2A]"
                >
                  ✕ Close
                </button>
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Step A: Invoice and phone number confirmation */}
              {paymentStep === 'invoice' && (
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div className="p-4 bg-[#F7F5EE] rounded-xl border border-[#123B2A]/10 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#123B2A]/70">Package:</span>
                      <span className="font-semibold text-[#123B2A]">Samley Retail Monthly Subscription</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#123B2A]/70">Duration:</span>
                      <span className="font-semibold text-[#123B2A]">1 Calendar Month</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#123B2A]/10 text-sm font-bold text-[#123B2A]">
                      <span>Amount Due:</span>
                      <span className="font-mono">GH₵ 300.00</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Select Mobile Money Network
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['MTN', 'Vodafone', 'AirtelTigo'] as const).map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setMomoNetwork(net)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            momoNetwork === net
                              ? 'bg-[#123B2A] text-white border-[#123B2A]'
                              : 'bg-white text-[#123B2A] border-[#123B2A]/20 hover:bg-[#F7F5EE]'
                          }`}
                        >
                          {net === 'Vodafone' ? 'Telecel' : net}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                      Mobile Money Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g. 0244123456"
                      className="w-full px-3 py-2 rounded-lg border border-[#123B2A]/20 text-xs font-mono font-bold text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                    />
                    <p className="text-[11px] text-[#123B2A]/60 mt-1">
                      You will receive an authorization prompt on this phone to enter your PIN.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-[#123B2A] text-white font-bold rounded-lg hover:bg-[#1b523b] transition-all text-xs flex items-center justify-center gap-2"
                  >
                    {processing ? 'Initiating Moolre Prompt...' : 'Send Authorization Prompt'}
                    <ArrowRight className="w-4 h-4 text-[#C5A15A]" />
                  </button>
                </form>
              )}

              {/* Step B: Prompt sent to customer phone */}
              {paymentStep === 'prompt_sent' && (
                <div className="space-y-4 py-2">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="font-bold flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-amber-700" />
                      <span>Authorization Prompt Dispatched</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      A payment request of <strong>GH₵ 300.00</strong> was sent to{' '}
                      <strong>{momoNumber}</strong> via Moolre. Please check your mobile phone and enter your Mobile Money PIN to authorise.
                    </p>
                    <div className="text-[10px] text-amber-800 font-mono">
                      Reference: {paymentReference}
                    </div>
                  </div>

                  <p className="text-xs text-[#123B2A]/70 text-center">
                    Once you have authorized the prompt on your phone, click below to verify and activate your subscription.
                  </p>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleVerifyCustomerApproval}
                    className="w-full py-3 bg-[#123B2A] text-white font-bold rounded-lg hover:bg-[#1b523b] transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    {processing ? 'Verifying with Moolre...' : 'I Have Approved Payment on My Phone'}
                    <CheckCircle className="w-4 h-4 text-[#C5A15A]" />
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setPaymentStep('invoice')}
                      className="text-xs text-[#123B2A]/60 underline"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </div>
              )}

              {/* Step C: Verified & Complete */}
              {paymentStep === 'verified' && (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#123B2A]">
                    Payment Verified Successfully
                  </h3>
                  <p className="text-xs text-[#123B2A]/75 leading-relaxed max-w-sm mx-auto">
                    Your GH₵300 subscription payment has been verified. Your shop access is active and an SMS receipt has been dispatched to {momoNumber} via SasuSync.
                  </p>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      navigate('/app/dashboard');
                    }}
                    className="w-full py-2.5 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b]"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
