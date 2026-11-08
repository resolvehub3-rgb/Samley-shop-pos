import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ShopDashboard } from './pages/app/ShopDashboard';
import { SalesCounter } from './pages/app/SalesCounter';
import { ProductManagement } from './pages/app/ProductManagement';
import { InventoryManagement } from './pages/app/InventoryManagement';
import { SalesHistory } from './pages/app/SalesHistory';
import { BusinessReports } from './pages/app/BusinessReports';
import { SubscriptionBilling } from './pages/app/SubscriptionBilling';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SamleyAIAssistant } from './components/SamleyAIAssistant';
import {
  ActiveSession,
  getStoredSession,
  saveStoredSession,
  getAllShops,
} from './services/shopService';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [currentDomain, setCurrentDomain] = useState<'marketing' | 'app'>(() => {
    const path = window.location.pathname || '/';
    if (
      path.startsWith('/app') ||
      path.startsWith('/admin') ||
      path === '/login' ||
      path === '/register'
    ) {
      return 'app';
    }
    return 'marketing';
  });

  const [session, setSession] = useState<ActiveSession | null>(() => {
    return getStoredSession();
  });

  // Keep route synced with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-update domain context based on route
    if (
      route.startsWith('/app') ||
      route.startsWith('/admin') ||
      route === '/login' ||
      route === '/register'
    ) {
      setCurrentDomain('app');
    } else {
      setCurrentDomain('marketing');
    }
  };

  const handleLogout = () => {
    saveStoredSession(null);
    setSession(null);
    navigate('/login');
  };

  const handleRefreshSession = async () => {
    if (!session?.shop) return;
    const shops = await getAllShops();
    const updated = shops.find((s) => s.id === session.shop?.id);
    if (updated) {
      const refreshed: ActiveSession = {
        ...session,
        shop: updated,
      };
      setSession(refreshed);
      saveStoredSession(refreshed);
    }
  };

  // Route Rendering Logic
  const renderCurrentPage = () => {
    // 1. Public Marketing Routes
    if (currentRoute === '/') {
      return <HomePage navigate={navigate} setDomain={setCurrentDomain} />;
    }
    if (currentRoute === '/features') {
      return <FeaturesPage navigate={navigate} setDomain={setCurrentDomain} />;
    }
    if (currentRoute === '/how-it-works') {
      return <HowItWorksPage navigate={navigate} setDomain={setCurrentDomain} />;
    }
    if (currentRoute === '/pricing') {
      return <PricingPage navigate={navigate} setDomain={setCurrentDomain} />;
    }
    if (currentRoute === '/contact') {
      return <ContactPage navigate={navigate} setDomain={setCurrentDomain} />;
    }
    if (currentRoute === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (currentRoute === '/terms') {
      return <TermsPage />;
    }

    // 2. Auth Routes
    if (currentRoute === '/register') {
      return <RegisterPage navigate={navigate} setDomain={setCurrentDomain} />;
    }
    if (currentRoute === '/login') {
      return (
        <LoginPage
          navigate={navigate}
          setDomain={setCurrentDomain}
          onLoginSuccess={(newSession) => setSession(newSession)}
        />
      );
    }

    // 3. Super Admin Routes (Protected)
    if (currentRoute.startsWith('/admin')) {
      if (!session || session.user.role !== 'super_admin') {
        return (
          <LoginPage
            navigate={navigate}
            setDomain={setCurrentDomain}
            onLoginSuccess={(newSession) => setSession(newSession)}
          />
        );
      }
      return <AdminDashboard session={session} navigate={navigate} currentRoute={currentRoute} />;
    }

    // 4. Shop Owner SaaS Application Routes (Protected)
    if (currentRoute.startsWith('/app')) {
      if (!session) {
        return (
          <LoginPage
            navigate={navigate}
            setDomain={setCurrentDomain}
            onLoginSuccess={(newSession) => setSession(newSession)}
          />
        );
      }

      if (currentRoute === '/app/sales') {
        return <SalesCounter session={session} navigate={navigate} />;
      }
      if (currentRoute === '/app/products') {
        return <ProductManagement session={session} navigate={navigate} />;
      }
      if (currentRoute === '/app/inventory') {
        return <InventoryManagement session={session} navigate={navigate} />;
      }
      if (currentRoute === '/app/sales-history') {
        return <SalesHistory session={session} navigate={navigate} />;
      }
      if (currentRoute === '/app/reports') {
        return <BusinessReports session={session} navigate={navigate} />;
      }
      if (currentRoute === '/app/subscription') {
        return (
          <SubscriptionBilling
            session={session}
            navigate={navigate}
            onRefreshSession={handleRefreshSession}
          />
        );
      }

      // Default app dashboard
      return <ShopDashboard session={session} navigate={navigate} />;
    }

    // Default Fallback
    return <HomePage navigate={navigate} setDomain={setCurrentDomain} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#123B2A] font-sans antialiased selection:bg-[#C5A15A] selection:text-[#123B2A]">
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        session={session}
        onLogout={handleLogout}
        currentDomain={currentDomain}
        setDomain={setCurrentDomain}
      />

      <main className="flex-1">{renderCurrentPage()}</main>

      {!currentRoute.startsWith('/admin') && !currentRoute.startsWith('/app') && currentRoute !== '/register' && currentRoute !== '/login' && (
        <Footer navigate={navigate} setDomain={setCurrentDomain} />
      )}

      {/* SamleyAI Official Visitor Assistant (Marketing Pages) */}
      {currentDomain === 'marketing' && (
        <SamleyAIAssistant navigate={navigate} setDomain={setCurrentDomain} />
      )}
    </div>
  );
}
