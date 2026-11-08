import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldAlert, Store, Shield } from 'lucide-react';
import {
  ActiveSession,
  saveStoredSession,
  getAllShops,
  ensureTrialStarted,
} from '../services/shopService';

interface LoginPageProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
  onLoginSuccess: (session: ActiveSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  navigate,
  setDomain,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your registered email address and password.');
      return;
    }

    setLoading(true);

    // Check if Super Admin login
    if (email.toLowerCase() === 'samley@gmail.com' && password === 'GoodGod1$') {
      const adminSession: ActiveSession = {
        user: {
          id: 'usr-admin-01',
          shop_id: null,
          full_name: 'Platform Super Admin',
          email: email.trim(),
          phone_number: '0240000000',
          role: 'super_admin',
          created_at: new Date().toISOString(),
        },
        shop: null,
      };
      saveStoredSession(adminSession);
      onLoginSuccess(adminSession);
      navigate('/admin');
      setLoading(false);
      return;
    }

    // Check approved shops
    const shops = await getAllShops();
    const approvedShop = shops.find((s) => s.status === 'approved');

    if (shops.length > 0 && !approvedShop) {
      const pendingShop = shops.find((s) => s.status === 'pending');
      if (pendingShop) {
        setError(
          `Your registration application for "${pendingShop.name}" is still pending Super Admin review. You will receive an SMS upon approval.`
        );
        setLoading(false);
        return;
      }
    }

    if (!approvedShop) {
      setError('No approved shop account found. Please register your shop and wait for Super Admin approval.');
      setLoading(false);
      return;
    }

    // Start 7-day trial on first successful dashboard access
    const activeShop = await ensureTrialStarted(approvedShop);

    const ownerSession: ActiveSession = {
      user: {
        id: `usr-${Date.now()}`,
        shop_id: activeShop.id,
        full_name: 'Shop Owner',
        email: email.trim(),
        phone_number: activeShop.business_phone,
        role: 'shop_owner',
        created_at: new Date().toISOString(),
      },
      shop: activeShop,
    };

    saveStoredSession(ownerSession);
    onLoginSuccess(ownerSession);
    navigate('/app/dashboard');
    setLoading(false);
  };

  return (
    <div className="bg-[#F7F5EE] text-[#123B2A] min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#123B2A]/15 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#123B2A]/5 text-[#123B2A] rounded-full text-xs font-semibold mb-3">
            <span>app.samleyretail.com</span>
            <span className="text-[#C5A15A]">·</span>
            <span>Private Application</span>
          </div>
          <h1 className="text-2xl font-bold text-[#123B2A]">Login to Samley Retail</h1>
          <p className="text-xs text-[#123B2A]/70 mt-1">
            Access your provision shop management system or administrative portal.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#123B2A] mb-1">
              Registered Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#123B2A]/40 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kwame@provision.gh"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#123B2A]/20 bg-[#F7F5EE]/40 text-xs text-[#123B2A] focus:outline-none focus:ring-2 focus:ring-[#123B2A]"
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#123B2A] text-white font-semibold rounded-lg hover:bg-[#1b523b] transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#123B2A]/70">
          Need a provision shop account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-bold underline text-[#123B2A]"
          >
            Register shop here
          </button>
        </div>
      </div>
    </div>
  );
};
