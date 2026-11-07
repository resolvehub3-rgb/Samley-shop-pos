import test from 'node:test';
import assert from 'node:assert/strict';
import {
  startTrial,
  addOneCalendarMonth,
  calculateNewSubscriptionPeriod,
  hasOperationalAccess,
  MONTHLY_SUBSCRIPTION_FEE_GHS,
  TRIAL_DURATION_DAYS,
} from './subscriptionRules';

test('MONTHLY_SUBSCRIPTION_FEE_GHS is fixed at 300 GHS', () => {
  assert.equal(MONTHLY_SUBSCRIPTION_FEE_GHS, 300);
  assert.equal(TRIAL_DURATION_DAYS, 7);
});

test('startTrial creates exact 7-day period', () => {
  const baseDate = new Date('2026-03-01T10:00:00.000Z');
  const trial = startTrial(baseDate);
  const start = new Date(trial.trialStartedAt);
  const end = new Date(trial.trialEndsAt);

  const diffMs = end.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  assert.equal(diffDays, 7);
});

test('addOneCalendarMonth respects variable month lengths', () => {
  // Jan 15 -> Feb 15
  const jan15 = new Date('2026-01-15T12:00:00.000Z');
  const feb15 = addOneCalendarMonth(jan15);
  assert.equal(feb15.getMonth(), 1); // February (0-indexed)
  assert.equal(feb15.getDate(), 15);

  // Jan 31 -> Feb 28 (clamps to end of Feb in non-leap year)
  const jan31 = new Date('2026-01-31T12:00:00.000Z');
  const febEnd = addOneCalendarMonth(jan31);
  assert.equal(febEnd.getMonth(), 1);
  assert.equal(febEnd.getDate(), 28);
});

test('calculateNewSubscriptionPeriod preserves remaining paid days on early renewal', () => {
  const now = new Date('2026-12-03T10:00:00.000Z');
  const currentExpiry = '2026-12-07T10:00:00.000Z';

  const newPeriod = calculateNewSubscriptionPeriod(now, currentExpiry);
  // Starts on the existing expiry date: 2026-12-07
  assert.equal(new Date(newPeriod.startDate).toISOString(), currentExpiry);
  // Ends 1 calendar month later: 2027-01-07
  const expectedEnd = new Date('2027-01-07T10:00:00.000Z').toISOString();
  assert.equal(newPeriod.endDate, expectedEnd);
});

test('calculateNewSubscriptionPeriod starts on payment date if previously expired', () => {
  const paymentDate = new Date('2026-12-15T10:00:00.000Z');
  const expiredExpiry = '2026-12-07T10:00:00.000Z';

  const newPeriod = calculateNewSubscriptionPeriod(paymentDate, expiredExpiry);
  assert.equal(new Date(newPeriod.startDate).toISOString(), paymentDate.toISOString());
});

test('hasOperationalAccess controls access correctly', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');

  // Active subscription before expiry
  assert.deepEqual(
    hasOperationalAccess({
      status: 'active',
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionEndsAt: '2026-07-01T00:00:00.000Z',
    }, now),
    { allowed: true }
  );

  // Active subscription but past expiry
  assert.deepEqual(
    hasOperationalAccess({
      status: 'active',
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionEndsAt: '2026-06-01T00:00:00.000Z',
    }, now),
    { allowed: false, reason: 'expired' }
  );

  // Suspended account
  assert.deepEqual(
    hasOperationalAccess({
      status: 'suspended',
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionEndsAt: '2026-07-01T00:00:00.000Z',
    }, now),
    { allowed: false, reason: 'suspended' }
  );
});
