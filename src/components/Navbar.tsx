import React from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, Globe, Store } from 'lucide-react';
import { ActiveSession } from '../services/shopService';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  session: ActiveSession | null;
  onLogout: () => void;
  currentDomain: 'marketing' | 'app';
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  session,
  onLogout,
  currentDomain,
  setDomain,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#123B2A]/10">
      {/* Domain Indicator & Switcher Strip */}
      <div className="bg-[#123B2A] text-[#F7F5EE] text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-[#C5A15A]/20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#C5A15A]">Samley Retail</span>
          <span className="opacity-60">·</span>
          <span className="opacity-80">Smarter Shops, Better Business</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#0c271c] rounded-md p-0.5 border border-[#C5A15A]/30">
            <button
              onClick={() => {
                setDomain('marketing');
                navigate('/');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                currentDomain === 'marketing'
                  ? 'bg-[#C5A15A] text-[#123B2A] font-semibold'
                  : 'text-[#F7F5EE]/80 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>www.samleyretail.com</span>
            </button>
            <button
              onClick={() => {
                setDomain('app');
                if (!session) {
                  navigate('/login');
                } else if (session.user.role === 'super_admin') {
                  navigate('/admin');
                } else {
                  navigate('/app/dashboard');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                currentDomain === 'app'
                  ? 'bg-[#C5A15A] text-[#123B2A] font-semibold'
                  : 'text-[#F7F5EE]/80 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>app.samleyretail.com</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Navigation Bar (Top Bar Contract: Brand — 4-5 Nav Links — 1 Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => {
            if (currentDomain === 'marketing') {
              navigate('/');
            } else if (session?.user.role === 'super_admin') {
              navigate('/admin');
            } else if (session) {
              navigate('/app/dashboard');
            } else {
              navigate('/login');
            }
          }}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-[#123B2A] flex items-center justify-center text-[#C5A15A] shadow-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#123B2A] whitespace-nowrap">
              Samley Retail
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        {currentDomain === 'marketing' ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#123B2A]/80">
            <button
              onClick={() => navigate('/')}
              className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                currentRoute === '/' ? 'text-[#123B2A] font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/features')}
              className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                currentRoute === '/features' ? 'text-[#123B2A] font-semibold' : ''
              }`}
            >
              Features
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                currentRoute === '/how-it-works' ? 'text-[#123B2A] font-semibold' : ''
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                currentRoute === '/pricing' ? 'text-[#123B2A] font-semibold' : ''
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => navigate('/contact')}
              className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                currentRoute === '/contact' ? 'text-[#123B2A] font-semibold' : ''
              }`}
            >
              Contact
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-[#123B2A]/80">
            {session?.user.role === 'super_admin' ? (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/admin' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  Platform Overview
                </button>
                <button
                  onClick={() => navigate('/admin/applications')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/admin/applications' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  Shop Applications
                </button>
                <button
                  onClick={() => navigate('/admin/shops')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/admin/shops' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  Shop Accounts
                </button>
                <button
                  onClick={() => navigate('/admin/logs')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/admin/logs' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  SMS & Audit Logs
                </button>
              </>
            ) : session ? (
              <>
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/app/dashboard' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/app/sales')}
                  className={`px-3 py-1 bg-[#123B2A] text-white rounded font-medium hover:bg-[#1b523b] transition-colors whitespace-nowrap ${
                    currentRoute === '/app/sales' ? 'ring-2 ring-[#C5A15A]' : ''
                  }`}
                >
                  Sales Counter
                </button>
                <button
                  onClick={() => navigate('/app/products')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/app/products' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => navigate('/app/inventory')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/app/inventory' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => navigate('/app/reports')}
                  className={`hover:text-[#123B2A] transition-colors whitespace-nowrap ${
                    currentRoute === '/app/reports' ? 'text-[#123B2A] font-semibold' : ''
                  }`}
                >
                  Reports
                </button>
              </>
            ) : null}
          </nav>
        )}

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-[#123B2A]">{session.user.full_name}</div>
                <div className="text-[11px] text-[#123B2A]/70">
                  {session.user.role === 'super_admin' ? 'Super Admin' : session.shop?.name || 'Shop Owner'}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-3.5 py-2 text-xs font-medium text-[#123B2A] bg-transparent border border-[#123B2A]/30 rounded-lg hover:bg-[#123B2A]/5 transition-colors whitespace-nowrap shrink-0"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDomain('app');
                  navigate('/login');
                }}
                className="px-3.5 py-2 text-xs font-medium text-[#123B2A] hover:text-[#123B2A] hover:bg-[#123B2A]/5 rounded-lg transition-colors whitespace-nowrap"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setDomain('app');
                  navigate('/register');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#123B2A] hover:bg-[#1b523b] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Register Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
