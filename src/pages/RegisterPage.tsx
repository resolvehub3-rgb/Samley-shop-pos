import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Building2,
  User,
  Lock,
} from 'lucide-react';
import { submitRegistrationApplication } from '../services/shopService';
import { sendSmsNotification, SmsTemplates } from '../services/smsService';

interface RegisterPageProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate, setDomain }) => {
  // Step state: 1 = Personal Info, 2 = Shop Info, 3 = Phone OTP Verification, 4 = Success Pending
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Session 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Session 2: Shop Info
  const [shopName, setShopName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [location, setLocation] = useState('');

  // Session 3: OTP Verification
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Session 1 validation
  const handleProceedToShopInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !password || !confirmPassword) {
      setError('Please fill out all personal information fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusinessPhone(phoneNumber); // Default shop business phone to owner's phone
    setStep(2);
  };

  // Session 2 -> Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!shopName.trim() || !businessPhone.trim() || !location.trim()) {
      setError('Please fill out all provision shop details.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setLoading(false);
        setError(data.error || 'Failed to send verification code.');
        return;
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to send verification code. Please try again.');
      return;
    }

    setResendCooldown(45); // 45 seconds cooldown
    setLoading(false);
    setStep(3);
  };

  // Verify OTP and Submit Application
  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!enteredOtp.trim()) {
      setError('Please enter the verification code sent to your phone.');
      return;
    }

    setLoading(true);

    // Verify OTP server-side
    try {
      const verifyResponse = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp: enteredOtp.trim() }),
      });
      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || !verifyData.success) {
        setLoading(false);
        setError(verifyData.error || 'Invalid verification code.');
        return;
      }
    } catch (err) {
      setLoading(false);
      setError('Verification failed. Please try again.');
      return;
    }

    // 1. Submit application to backend/Supabase
    const result = await submitRegistrationApplication({
      shopName,
      applicantName: fullName,
      email,
      phoneNumber,
      location,
    });

    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Failed to submit application.');
      return;
    }

    // 2. Dispatch SMS notifications
    // A. Confirmation to applicant
    await sendSmsNotification({
      recipientPhone: phoneNumber,
      messageType: 'application_received',
      messageText: SmsTemplates.applicationReceived(shopName),
    });

    // B. Alert to Super Admin
    await sendSmsNotification({
      recipientPhone: '0240000000', // Super Admin alert line
      messageType: 'admin_new_reg',
      messageText: SmsTemplates.adminNewRegistrationAlert(shopName, fullName),
    });

    setLoading(false);
    setStep(4);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setLoading(false);
        setError(data.error || 'Failed to resend verification code.');
        return;
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to resend verification code. Please try again.');
      return;
    }
    setResendCooldown(45);
    setLoading(false);
  };

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#123B2A]/15 p-8 shadow-sm">
        {/* Progress tracker */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#123B2A]/10 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#123B2A]">
            <span className="w-5 h-5 rounded-full bg-[#123B2A] text-white flex items-center justify-center text-[10px]">
              {step === 4 ? '✓' : step}
            </span>
            <span>
              {step === 1
                ? 'Personal Info'
                : step === 2
                ? 'Shop Info'
                : step === 3
                ? 'Phone OTP'
                : 'Submitted'}
            </span>
          </div>
          <span className="text-[#123B2A]/60">Step {step} of 4</span>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <form onSubmit={handleProceedToShopInfo} className="space-y-4">
            <div>
              <div className="text-xl font-bold text-[#123B2A] mb-1">Owner Registration</div>
              <p className="text-xs text-[#123B2A]/70 mb-4">
                Enter your personal credentials to manage your provision shop account.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kofi Boateng"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kofi@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                Phone Number (For Samley Retail OTP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0244123456"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-[#123B2A] text-white font-semibold rounded-lg hover:bg-[#1b523b] transition-all text-xs flex items-center justify-center gap-2"
            >
              <span>Next: Shop Information</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-[#123B2A]/70 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold underline text-[#123B2A]"
              >
                Log in here
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Shop Info */}
        {step === 2 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <div className="text-xl font-bold text-[#123B2A] mb-1">Provision Shop Details</div>
              <p className="text-xs text-[#123B2A]/70 mb-4">
                Provide your shop trade name and location in Ghana for Super Admin verification.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Aseda Provision Store"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                Business Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="e.g. 0244123456"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                Shop Location / Address in Ghana <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Madina Market, near Post Office, Accra"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 border border-[#123B2A]/20 text-[#123B2A] text-xs font-semibold rounded-lg hover:bg-[#F7F5EE]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b] transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Sending OTP...' : 'Send SMS OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Phone Verification via Samley Retail OTP */}
        {step === 3 && (
          <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#123B2A]/5 text-[#123B2A] flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-[#C5A15A]" />
              </div>
              <div className="text-xl font-bold text-[#123B2A] mb-1">Verify Your Phone</div>
              <p className="text-xs text-[#123B2A]/70 mb-2">
                We sent a 6-digit Samley Retail OTP to{' '}
                <span className="font-semibold text-[#123B2A]">{phoneNumber}</span>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B2A] mb-1 text-center">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-mono py-2.5 rounded-lg border-2 border-[#123B2A]/30 bg-[#F7F5EE]/40 text-[#123B2A] focus:outline-none focus:border-[#123B2A]"
              />
            </div>

            <div className="text-center text-xs">
              {resendCooldown > 0 ? (
                <span className="text-[#123B2A]/60">Resend code in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#123B2A] font-semibold underline"
                >
                  Resend SMS OTP
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 border border-[#123B2A]/20 text-[#123B2A] text-xs font-semibold rounded-lg hover:bg-[#F7F5EE]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b] transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting Application...' : 'Verify & Submit'}
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success / Pending Approval */}
        {step === 4 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#123B2A] text-[#C5A15A] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-[#123B2A]">
              Application Submitted Successfully
            </h3>

            <div className="p-4 bg-[#F7F5EE] rounded-lg border border-[#123B2A]/10 text-xs text-[#123B2A]/80 text-left space-y-2">
              <div>
                <strong>Shop Name:</strong> {shopName}
              </div>
              <div>
                <strong>Applicant:</strong> {fullName}
              </div>
              <div>
                <strong>Review Status:</strong>{' '}
                <span className="font-semibold text-amber-700">Pending Super Admin Review</span>
              </div>
              <div>
                <strong>SMS Confirmation:</strong> Sent to {phoneNumber} via SasuSync.
              </div>
            </div>

            <p className="text-xs text-[#123B2A]/70 leading-relaxed max-w-sm mx-auto">
              You will receive an official approval SMS containing your login URL once the Super Admin completes the review. Your 7-day free trial will begin when you log in for the first time.
            </p>

            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-[#123B2A] text-white text-xs font-semibold rounded-lg hover:bg-[#1b523b]"
              >
                Go to Login Page
              </button>
              <button
                onClick={() => {
                  setDomain('marketing');
                  navigate('/');
                }}
                className="w-full py-2 border border-[#123B2A]/20 text-[#123B2A] text-xs font-semibold rounded-lg hover:bg-[#F7F5EE]"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
