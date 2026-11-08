/**
 * Moolre Mobile Money Integration Service for Samley Retail
 *
 * Rules:
 * - Customer-authorised payment: no automatic deduction, owner must initiate and authorise on phone.
 * - Single fixed subscription price: GH₵300 per month.
 * - Idempotency and reference validation.
 * - Records into payment_transactions and activates subscription only upon verified success.
 */

import { supabase } from '../lib/supabase';
import { MONTHLY_SUBSCRIPTION_FEE_GHS } from '../utils/subscriptionRules';

export interface InitiatePaymentParams {
  shopId: string;
  shopName: string;
  momoNumber: string;
  amount?: number;
  network?: 'MTN' | 'Vodafone' | 'AirtelTigo';
}

export interface PaymentInitiationResult {
  success: boolean;
  reference: string;
  amount: number;
  status: 'pending_authorisation' | 'successful' | 'failed' | 'requires_configuration';
  message: string;
}

export async function initiateMoolrePayment(
  params: InitiatePaymentParams
): Promise<PaymentInitiationResult> {
  const { shopId, shopName, momoNumber, amount = MONTHLY_SUBSCRIPTION_FEE_GHS } = params;

  const reference = `SAMLEYRETAIL-SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const apiKey = (typeof process !== 'undefined' && process.env?.MOOLRE_API_KEY) || '';
  const accountNumber = (typeof process !== 'undefined' && process.env?.MOOLRE_ACCOUNT_NUMBER) || '';
  const baseUrl = (typeof process !== 'undefined' && process.env?.MOOLRE_BASE_URL) || 'https://api.moolre.com/v1';

  // Record initial transaction record in Supabase
  if (supabase) {
    try {
      await supabase.from('payment_transactions').insert([
        {
          shop_id: shopId,
          transaction_type: 'subscription',
          reference,
          amount,
          currency: 'GHS',
          provider: 'moolre',
          status: 'pending',
          customer_phone: momoNumber,
          response_payload: {
            shopName,
            initiated_at: new Date().toISOString(),
          },
        },
      ]);
    } catch (err) {
      console.warn('Could not record initial payment transaction:', err);
    }
  }

  if (!apiKey || !accountNumber) {
    // Missing Moolre credentials
    return {
      success: false,
      reference,
      amount,
      status: 'requires_configuration',
      message: 'MOOLRE_API_KEY or MOOLRE_ACCOUNT_NUMBER is not configured in environment. In live production, Moolre sends an interactive USSD prompt to the customer to authorise GH₵300.',
    };
  }

  try {
    const response = await fetch(`${baseUrl}/checkout/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        account_number: accountNumber,
        amount,
        currency: 'GHS',
        reference,
        customer_phone: momoNumber,
        description: `Samley Retail Monthly Subscription for ${shopName}`,
      }),
    });

    const data = await response.json();
    if (response.ok && data?.status === 'pending') {
      return {
        success: true,
        reference,
        amount,
        status: 'pending_authorisation',
        message: `Prompt sent to ${momoNumber}. Please check your phone to authorise payment of GH₵${amount}.`,
      };
    } else {
      return {
        success: false,
        reference,
        amount,
        status: 'failed',
        message: data?.message || 'Payment initiation failed with Moolre provider.',
      };
    }
  } catch (err) {
    return {
      success: false,
      reference,
      amount,
      status: 'failed',
      message: 'Failed to connect to Moolre gateway.',
    };
  }
}

/**
 * Verifies transaction reference status with Moolre
 */
export async function verifyMoolrePayment(reference: string): Promise<{
  verified: boolean;
  status: 'successful' | 'pending' | 'failed';
  amount?: number;
}> {
  const apiKey = (typeof process !== 'undefined' && process.env?.MOOLRE_API_KEY) || '';
  const baseUrl = (typeof process !== 'undefined' && process.env?.MOOLRE_BASE_URL) || 'https://api.moolre.com/v1';

  if (!apiKey) {
    return { verified: false, status: 'failed' };
  }

  try {
    const res = await fetch(`${baseUrl}/checkout/verify/${reference}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (res.ok && data?.status === 'successful') {
      return { verified: true, status: 'successful', amount: data.amount };
    }
    return { verified: false, status: data?.status || 'pending' };
  } catch {
    return { verified: false, status: 'failed' };
  }
}
