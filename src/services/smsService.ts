/**
 * SasuSync SMS Integration Service for Samly
 * Handles transactional SMS events: OTP, Application Status, Trial & Subscription Reminders, Payment Receipts
 */

import { SmsLog } from '../types/database';
import { supabase } from '../lib/supabase';

export interface SendSmsParams {
  shopId?: string | null;
  recipientPhone: string;
  messageType:
    | 'otp'
    | 'application_received'
    | 'admin_new_reg'
    | 'approval'
    | 'rejection'
    | 'trial_reminder_d5'
    | 'trial_reminder_d6'
    | 'trial_expiry_d7'
    | 'sub_reminder_d5'
    | 'sub_reminder_d2'
    | 'sub_expiry'
    | 'payment_success'
    | 'account_status';
  messageText: string;
}

export interface SmsResult {
  success: boolean;
  status: 'sent' | 'queued' | 'simulated_missing_credentials' | 'failed';
  reference?: string;
  error?: string;
}

export async function sendSmsNotification(params: SendSmsParams): Promise<SmsResult> {
  const { shopId, recipientPhone, messageType, messageText } = params;

  // SasuSync server configuration check
  const apiKey = (typeof process !== 'undefined' && process.env?.SASUSYNC_API_KEY) || '';
  const senderId = (typeof process !== 'undefined' && process.env?.SASUSYNC_SENDER_ID) || 'Samly';
  const baseUrl = (typeof process !== 'undefined' && process.env?.SASUSYNC_BASE_URL) || 'https://api.sasusync.com/v1';

  let providerStatus = 'queued';
  let providerReference = `SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (!apiKey) {
    providerStatus = 'logged_missing_credentials';
  } else {
    // When live credentials exist, dispatch to SasuSync endpoint
    try {
      const response = await fetch(`${baseUrl}/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          sender_id: senderId,
          recipient: recipientPhone,
          message: messageText,
        }),
      });
      const data = await response.json();
      if (response.ok && data?.reference) {
        providerReference = data.reference;
        providerStatus = 'delivered';
      } else {
        providerStatus = 'failed';
      }
    } catch (err: unknown) {
      providerStatus = 'delivery_error';
      console.warn('SasuSync delivery dispatch note:', err);
    }
  }

  // Record into persistent SMS log table in Supabase if connected
  if (supabase) {
    try {
      await supabase.from('sms_logs').insert([
        {
          shop_id: shopId || null,
          recipient_phone: recipientPhone,
          message_type: messageType,
          message_text: messageText,
          provider_status: providerStatus,
          provider_reference: providerReference,
          sent_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Could not record SMS log in Supabase:', err);
    }
  }

  return {
    success: providerStatus === 'delivered' || providerStatus === 'logged_missing_credentials',
    status: providerStatus as SmsResult['status'],
    reference: providerReference,
    error: !apiKey ? 'SASUSYNC_API_KEY is not configured in server environment.' : undefined,
  };
}

/**
 * Message templates per official specification
 */
export const SmsTemplates = {
  registrationOtp: (otp: string) =>
    `Your Samly verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,

  applicationReceived: (shopName: string) =>
    `Hello, your registration application for "${shopName}" has been received and is under review by Samly Admin. You will receive an SMS update once reviewed.`,

  adminNewRegistrationAlert: (shopName: string, applicant: string) =>
    `[Samly Admin] New shop registration application submitted: "${shopName}" by ${applicant}. Review at app.samly.com.`,

  approval: (shopName: string, loginUrl: string) =>
    `Congratulations! Your provision shop "${shopName}" has been approved on Samly. Log in at ${loginUrl} to begin your 7-day free trial.`,

  rejection: (shopName: string, reason?: string) =>
    `Hello, your registration application for "${shopName}" was not approved at this time.${reason ? ` Reason: ${reason}` : ''} Contact Samly support for assistance.`,

  trialDay5: (daysRemaining: number) =>
    `Samly Reminder: You have ${daysRemaining} days left on your free trial. Subscribe for GH₵300/month to keep your shop operations uninterrupted.`,

  trialDay6: () =>
    `Samly Reminder: Your 7-day free trial expires tomorrow. Keep your products and sales active by renewing for GH₵300/month.`,

  trialDay7Expiry: () =>
    `Samly Alert: Your 7-day free trial has expired. Please subscribe for GH₵300/month to resume sales and inventory modifications. Your data is safely preserved.`,

  subReminderDay5: () =>
    `Samly Reminder: Your monthly subscription expires in 5 days. Renew now for GH₵300/month to ensure uninterrupted access.`,

  subReminderDay2: () =>
    `Samly Reminder: Your monthly subscription expires in 2 days. Authorise your GH₵300 payment to continue uninterrupted.`,

  subExpiry: () =>
    `Samly Alert: Your monthly subscription has expired. Please make your GH₵300 renewal payment to resume processing sales.`,

  paymentSuccess: (amountGhs: number, expiryDate: string) =>
    `Samly: Payment of GH₵${amountGhs} received successfully. Your subscription is active until ${new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. Thank you!`,
};
