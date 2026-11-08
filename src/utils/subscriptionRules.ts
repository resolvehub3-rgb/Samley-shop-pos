/**
 * Subscription & Free Trial Business Rules for Samley Retail
 *
 * Rules:
 * - One fixed price: GH₵300 per month
 * - 7-day free trial starting on first dashboard access after approval
 * - Calendar-month calculation (handles month boundaries correctly)
 * - Early renewal extends from existing expiry (preserving remaining days)
 * - Post-expiry renewal starts from current payment verification date
 * - Reminders:
 *   - Trial: Day 5, Day 6, Day 7
 *   - Subscription: 5 days prior, 2 days prior, on expiry
 */

export const MONTHLY_SUBSCRIPTION_FEE_GHS = 300;
export const TRIAL_DURATION_DAYS = 7;

export interface ShopSubscriptionState {
  status: 'pending_approval' | 'trialing' | 'active' | 'expired' | 'suspended';
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  subscriptionEndsAt: string | null;
}

/**
 * Initializes a 7-day trial starting at the moment of first dashboard access.
 */
export function startTrial(firstAccessDate: Date = new Date()): {
  trialStartedAt: string;
  trialEndsAt: string;
} {
  const start = new Date(firstAccessDate);
  const end = new Date(start.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
  return {
    trialStartedAt: start.toISOString(),
    trialEndsAt: end.toISOString(),
  };
}

/**
 * Adds one calendar month to a given base date.
 * Accurately handles variable month lengths (e.g. Jan 31 + 1 month = Feb 28/29).
 */
export function addOneCalendarMonth(baseDate: Date): Date {
  const result = new Date(baseDate.getTime());
  const expectedMonth = (result.getMonth() + 1) % 12;
  result.setMonth(result.getMonth() + 1);

  // If the day rolled over to the next month due to shorter month (e.g. Feb 30 -> Mar 2), clamp to last day of target month
  if (result.getMonth() !== expectedMonth) {
    result.setDate(0);
  }
  return result;
}

/**
 * Calculates new subscription period upon verified GH₵300 payment.
 *
 * Case A: Renewal before existing subscription expiry -> extends from existing expiry date.
 * Case B: First payment after trial expiry or renewal after expiry -> starts from payment date.
 */
export function calculateNewSubscriptionPeriod(
  paymentDate: Date,
  currentExpiryIso: string | null
): { startDate: string; endDate: string } {
  let startDate: Date;

  if (currentExpiryIso) {
    const currentExpiry = new Date(currentExpiryIso);
    if (currentExpiry.getTime() > paymentDate.getTime()) {
      // Early renewal: preserves remaining days, starts exactly after previous expiry
      startDate = currentExpiry;
    } else {
      // Expired: starts from payment date
      startDate = paymentDate;
    }
  } else {
    // First subscription: starts from payment date
    startDate = paymentDate;
  }

  const endDate = addOneCalendarMonth(startDate);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Checks whether the shop currently has operational access.
 * When expired or suspended, operational access (sales, stock modification) is blocked.
 */
export function hasOperationalAccess(
  state: ShopSubscriptionState,
  now: Date = new Date()
): { allowed: boolean; reason?: 'expired' | 'suspended' | 'pending_approval' } {
  if (state.status === 'suspended') {
    return { allowed: false, reason: 'suspended' };
  }
  if (state.status === 'pending_approval') {
    return { allowed: false, reason: 'pending_approval' };
  }

  const nowMs = now.getTime();

  if (state.status === 'trialing') {
    if (state.trialEndsAt) {
      const trialEndMs = new Date(state.trialEndsAt).getTime();
      if (nowMs > trialEndMs) {
        return { allowed: false, reason: 'expired' };
      }
      return { allowed: true };
    }
    return { allowed: true };
  }

  if (state.status === 'active') {
    if (state.subscriptionEndsAt) {
      const subEndMs = new Date(state.subscriptionEndsAt).getTime();
      if (nowMs > subEndMs) {
        return { allowed: false, reason: 'expired' };
      }
      return { allowed: true };
    }
  }

  return { allowed: false, reason: 'expired' };
}

/**
 * Determines days remaining in current trial or subscription
 */
export function getDaysRemaining(
  state: ShopSubscriptionState,
  now: Date = new Date()
): { type: 'trial' | 'subscription' | 'none'; days: number } {
  const nowMs = now.getTime();

  if (state.status === 'trialing' && state.trialEndsAt) {
    const endMs = new Date(state.trialEndsAt).getTime();
    const diffDays = Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24));
    return { type: 'trial', days: Math.max(0, diffDays) };
  }

  if (state.status === 'active' && state.subscriptionEndsAt) {
    const endMs = new Date(state.subscriptionEndsAt).getTime();
    const diffDays = Math.ceil((endMs - nowMs) / (1000 * 60 * 60 * 24));
    return { type: 'subscription', days: Math.max(0, diffDays) };
  }

  return { type: 'none', days: 0 };
}
