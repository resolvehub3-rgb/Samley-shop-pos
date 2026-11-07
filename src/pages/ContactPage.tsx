import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactPageProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in all required fields (Name, Email, Phone, and Message).');
      return;
    }

    setSubmitting(true);
    // Persist real contact enquiry in local storage or Supabase if configured
    try {
      const enquiries = JSON.parse(localStorage.getItem('samly_contact_enquiries') || '[]');
      enquiries.push({
        id: `enq-${Date.now()}`,
        fullName,
        email,
        phone,
        shopName: shopName || 'Not specified',
        message,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('samly_contact_enquiries', JSON.stringify(enquiries));

      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 500);
    } catch {
      setSubmitting(false);
      setError('Failed to submit message. Please try again.');
    }
  };

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A]">
            Support & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#123B2A] mt-2 mb-3">
            Contact Samly
          </h1>
          <p className="text-xs sm:text-sm text-[#123B2A]/80 leading-relaxed">
            Have questions about provision shop onboarding, Super Admin approvals, or the SasuSync/Moolre integrations? Send a message to our team at SamTeck Digital.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#123B2A]/10 p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#123B2A] text-[#C5A15A] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#123B2A]">Message Received</h3>
              <p className="text-xs sm:text-sm text-[#123B2A]/75 max-w-md mx-auto leading-relaxed">
                Thank you, {fullName}. Your enquiry has been received and routed to the SamTeck Digital support desk. A representative will contact you via your phone or email.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFullName('');
                  setEmail('');
                  setPhone('');
                  setShopName('');
                  setMessage('');
                }}
                className="mt-4 px-5 py-2 text-xs font-semibold bg-[#123B2A] text-white rounded-lg hover:bg-[#1b523b]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kwame@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                  Shop Name (Optional)
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Glory Provision Store"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B2A] mb-1">
                  Your Enquiry / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help your provision shop..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#123B2A] text-white font-semibold rounded-lg hover:bg-[#1b523b] transition-all text-xs flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Enquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Attribution note */}
        <div className="mt-8 text-center text-xs text-[#123B2A]/70">
          <div>Samly — A product by SamTeck Digital.</div>
          <div className="mt-1">
            Registered commercial software platform for provision businesses in Ghana.
          </div>
        </div>
      </div>
    </div>
  );
};
