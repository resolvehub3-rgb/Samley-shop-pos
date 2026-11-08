import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksPageProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ navigate, setDomain }) => {
  const steps = [
    {
      num: '01',
      title: 'Register Your Provision Shop',
      desc: 'Fill out our 2-step structured registration form. Enter your personal details (full name, email, phone number, and password) followed by your shop name and location.',
      details: 'Takes less than 3 minutes. Password is encrypted securely.',
    },
    {
      num: '02',
      title: 'Verify Phone Number via Samley Retail OTP',
      desc: 'Receive a secure 6-digit SMS OTP on your registered phone number. Enter the code to verify your phone and protect the platform against bot registrations.',
      details: 'Powered by SasuSync transactional SMS gateway.',
    },
    {
      num: '03',
      title: 'Application Review by Super Admin',
      desc: 'Once your phone is verified, your registration application enters the review pipeline. You receive an immediate SMS acknowledging that your application has been received.',
      details: 'Super Admin receives an alert to review shop details.',
    },
    {
      num: '04',
      title: 'Approval & Account Provisioning',
      desc: 'The Samley Retail platform Super Admin reviews your shop application details to verify legitimate shop ownership. Upon approval, your tenant shop account is activated.',
      details: 'Multi-tenant database schema ensures your shop data is isolated.',
    },
    {
      num: '05',
      title: 'Approval SMS Notification',
      desc: 'You receive an approval SMS containing your official confirmation and the direct login URL (https://app.samleyretail.com/login). Never contains your password for security.',
      details: 'Instant delivery via SasuSync SMS.',
    },
    {
      num: '06',
      title: 'Log In to Samley Retail',
      desc: 'Visit app.samleyretail.com/login and enter your registered email address and secure password to access your dedicated provision shop management portal.',
      details: 'Protected session management with role-based authorization.',
    },
    {
      num: '07',
      title: 'Start Your Seven-Day Free Trial',
      desc: 'Your 7-day free trial officially begins on your first successful dashboard access after approval (not at registration). Enjoy full access to all features with zero upfront payment.',
      details: 'Friendly SMS reminders on Day 5, Day 6, and Day 7 expiry.',
    },
    {
      num: '08',
      title: 'Subscribe for GH₵300 Per Month',
      desc: 'Before or at the end of your trial, renew your monthly access for GH₵300 using customer-authorised Moolre Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo).',
      details: 'You actively authorise the prompt on your phone; no auto-debit.',
    },
  ];

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
            Customer Onboarding Journey
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123B2A] mt-2 mb-4">
            How Samley Retail Works
          </h1>
          <p className="text-sm text-[#123B2A]/80 max-w-2xl mx-auto leading-relaxed">
            A clear, transparent 8-step journey from initial registration to everyday shop operations and monthly subscription.
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-7 rounded-xl border border-[#123B2A]/10 flex flex-col sm:flex-row gap-6 items-start shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-[#123B2A] text-[#C5A15A] font-bold text-lg font-mono flex items-center justify-center shrink-0">
                {step.num}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#123B2A] mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#123B2A]/75 leading-relaxed mb-3">
                  {step.desc}
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-[#123B2A]/60 bg-[#F7F5EE] px-3 py-1 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A15A]" />
                  <span>{step.details}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-[#123B2A] text-white p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Ready to Start Step 1?</h2>
          <p className="text-xs text-[#F7F5EE]/80 max-w-lg mx-auto mb-6">
            Register your provision shop now to take advantage of your 7-day free trial upon approval.
          </p>
          <button
            onClick={() => {
              setDomain('app');
              navigate('/register');
            }}
            className="px-8 py-3.5 bg-[#C5A15A] text-[#123B2A] font-bold rounded-lg hover:bg-[#b39049] transition-all inline-flex items-center gap-2 text-sm"
          >
            <span>Register Your Provision Shop</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
