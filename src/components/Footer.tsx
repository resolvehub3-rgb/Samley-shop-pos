import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
  setDomain: (domain: 'marketing' | 'app') => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, setDomain }) => {
  return (
    <footer className="bg-[#123B2A] text-[#F7F5EE] border-t border-[#C5A15A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#C5A15A] text-[#123B2A] flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#F7F5EE]">Samly</span>
            </div>
            <p className="text-sm text-[#F7F5EE]/80 max-w-md leading-relaxed mb-4">
              A specialized multi-tenant SaaS management platform designed for traditional provision shops in Ghana.
              Streamline product registration, configurable selling units, fast counter sales, inventory tracking, and business performance.
            </p>
            <div className="text-xs text-[#C5A15A] font-medium tracking-wide">
              Samly — A product by SamTeck Digital.
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-[#F7F5EE]/80">
              <li>
                <button
                  onClick={() => {
                    setDomain('marketing');
                    navigate('/');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setDomain('marketing');
                    navigate('/features');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setDomain('marketing');
                    navigate('/how-it-works');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setDomain('marketing');
                    navigate('/pricing');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setDomain('marketing');
                    navigate('/contact');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Access & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C5A15A] mb-3">
              Access & Legal
            </h4>
            <ul className="space-y-2 text-sm text-[#F7F5EE]/80">
              <li>
                <button
                  onClick={() => {
                    setDomain('app');
                    navigate('/login');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Login to Shop
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setDomain('app');
                    navigate('/register');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Register Shop
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setDomain('marketing');
                    navigate('/privacy-policy');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setDomain('marketing');
                    navigate('/terms');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#F7F5EE]/10 flex flex-col sm:flex-row justify-between items-center text-xs text-[#F7F5EE]/60 gap-4">
          <div>
            © {new Date().getFullYear()} Samly. All rights reserved. Operating in Ghana under SamTeck Digital.
          </div>
          <div className="flex items-center gap-4">
            <span>Primary Deep Green: #123B2A</span>
            <span>·</span>
            <span>Secondary Warm Ivory: #F7F5EE</span>
            <span>·</span>
            <span>Accent Muted Gold: #C5A15A</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
