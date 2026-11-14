import React, { useState, useEffect } from 'react';
import {
  Shield,
  Store,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  MessageSquare,
  FileText,
  Settings,
  Database,
  ArrowRight,
} from 'lucide-react';
import {
  ActiveSession,
  getAdminData,
  reviewShopApplication,
  updateShopStatus,
} from '../../services/shopService';
import {
  ShopApplication,
  Shop,
  SmsLog,
  AuditLog,
} from '../../types/database';
import { sendSmsNotification, SmsTemplates } from '../../services/smsService';
import { getSupabaseStatus } from '../../lib/supabase';

interface AdminDashboardProps {
  session: ActiveSession;
  navigate: (route: string) => void;
  currentRoute?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ session, navigate, currentRoute }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'applications' | 'shops' | 'sms' | 'audit' | 'config'
  >('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [overview, setOverview] = useState({
    totalShops: 0,
    pendingApplications: 0,
    approvedShops: 0,
    suspendedShops: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalPlatformRevenueGhs: 0,
  });

  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedApp, setSelectedApp] = useState<ShopApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingApp, setProcessingApp] = useState(false);

  const supabaseStatus = getSupabaseStatus();

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    const path = currentRoute || window.location.pathname;
    if (path.startsWith('/admin/applications')) setActiveTab('applications');
    else if (path.startsWith('/admin/shops')) setActiveTab('shops');
    else if (path.startsWith('/admin/logs')) setActiveTab('sms');
    else if (path.startsWith('/admin/config')) setActiveTab('config');
    else setActiveTab('overview');
  }, [currentRoute]);

  const loadAdminData = async () => {
    setLoading(true);
    const data = await getAdminData();
    setOverview(data.overview);
    setApplications(data.applications);
    setShops(data.shops);
    setSmsLogs(data.smsLogs);
    setAuditLogs(data.auditLogs);
    setLoading(false);
  };

  // Review application: Approve
  const handleApproveApp = async (app: ShopApplication) => {
    setProcessingApp(true);
    const result = await reviewShopApplication(
      app.id,
      'approved',
      undefined,
      session.user.id
    );

    if (result.success) {
      // Dispatch approval SMS per specification
      const loginUrl = 'https://app.samleyretail.com/login';
      await sendSmsNotification({
        recipientPhone: app.phone_number,
        messageType: 'approval',
        messageText: SmsTemplates.approval(app.shop_name, loginUrl),
      });
      setSelectedApp(null);
      loadAdminData();
    }
    setProcessingApp(false);
  };

  // Review application: Reject
  const handleRejectApp = async (app: ShopApplication) => {
    setProcessingApp(true);
    const result = await reviewShopApplication(
      app.id,
      'rejected',
      rejectionReason.trim() || undefined,
      session.user.id
    );

    if (result.success) {
      await sendSmsNotification({
        recipientPhone: app.phone_number,
        messageType: 'rejection',
        messageText: SmsTemplates.rejection(app.shop_name, rejectionReason),
      });
      setSelectedApp(null);
      setRejectionReason('');
      loadAdminData();
    }
    setProcessingApp(false);
  };

  // Account suspension / reactivation
  const handleToggleShopStatus = async (shop: Shop) => {
    const nextStatus = shop.status === 'suspended' ? 'approved' : 'suspended';
    await updateShopStatus(shop.id, nextStatus);

    await sendSmsNotification({
      shopId: shop.id,
      recipientPhone: shop.business_phone,
      messageType: 'account_status',
      messageText: `[Samley Retail Admin] Your shop account "${shop.name}" status has been set to: ${nextStatus.toUpperCase()}.`,
    });

    loadAdminData();
  };

  return (
    <div className="bg-[#123B2A] text-[#F7F5EE] min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Menu */}
      <aside className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[#C5A15A]/20 py-4 md:py-6 px-4 flex-col md:flex-col gap-2 md:sticky md:top-16 md:h-[calc(100vh-4rem)] overflow-y-auto`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#C5A15A] text-[#123B2A] flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#C5A15A] uppercase tracking-wider">Platform Super Admin</div>
            <h1 className="text-lg font-extrabold text-white">Samley Retail</h1>
          </div>
        </div>

        {[
          { id: 'overview', label: 'Platform Overview', badge: 0, icon: null, route: '/admin' },
          { id: 'applications', label: 'Shop Applications', badge: overview.pendingApplications, icon: null, route: '/admin/applications' },
          { id: 'shops', label: `Shop Accounts (${shops.length})`, badge: 0, icon: null, route: '/admin/shops' },
          { id: 'sms', label: 'SMS & Audit Logs', badge: 0, icon: null, route: '/admin/logs' },
          { id: 'config', label: 'Database & Credentials', badge: 0, icon: Database, route: '/admin/config' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id as any);
              navigate(item.route);
              setMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-[#0c271c] text-[#C5A15A] border-l-2 border-[#C5A15A]'
                : 'text-[#F7F5EE]/70 hover:text-white hover:bg-[#0c271c]/50'
            }`}
          >
            <span className="flex items-center gap-2">
              {item.icon ? <item.icon className="w-4 h-4" /> : null}
              {item.label}
            </span>
            {item.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C5A15A] text-[#123B2A] text-[10px] font-bold flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <div className="mt-auto pt-6 text-xs text-[#F7F5EE]/70 font-mono">
          Admin: {session.user.full_name}
        </div>
      </aside>

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#C5A15A]/20 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg border border-[#C5A15A]/30 text-[#C5A15A]"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <div className="text-xs font-semibold text-[#C5A15A] uppercase tracking-wider">Platform Super Admin Console</div>
                <h1 className="text-2xl font-extrabold text-white">Samley Retail Multi-Tenant Management</h1>
              </div>
            </div>
            <div className="text-xs text-[#F7F5EE]/70 font-mono">{session.user.email}</div>
          </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0c271c] p-5 rounded-xl border border-[#C5A15A]/20">
                <div className="text-xs text-[#F7F5EE]/70 mb-1">Total Registered Shops</div>
                <div className="text-3xl font-extrabold font-mono text-white">
                  {overview.totalShops}
                </div>
                <div className="text-[11px] text-[#C5A15A] mt-1">Multi-tenant provision stores</div>
              </div>

              <div className="bg-[#0c271c] p-5 rounded-xl border border-[#C5A15A]/20">
                <div className="text-xs text-[#F7F5EE]/70 mb-1">Pending Review Applications</div>
                <div className="text-3xl font-extrabold font-mono text-amber-400">
                  {overview.pendingApplications}
                </div>
                <div className="text-[11px] text-[#F7F5EE]/60 mt-1">Require Super Admin decision</div>
              </div>

              <div className="bg-[#0c271c] p-5 rounded-xl border border-[#C5A15A]/20">
                <div className="text-xs text-[#F7F5EE]/70 mb-1">Active Paid Subscriptions</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  {overview.activeSubscriptions}
                </div>
                <div className="text-[11px] text-[#F7F5EE]/60 mt-1">GH₵300/mo active accounts</div>
              </div>

              <div className="bg-[#0c271c] p-5 rounded-xl border border-[#C5A15A]/20">
                <div className="text-xs text-[#F7F5EE]/70 mb-1">Verified Platform Revenue</div>
                <div className="text-3xl font-extrabold font-mono text-[#C5A15A]">
                  GH₵ {overview.totalPlatformRevenueGhs.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#F7F5EE]/60 mt-1">From verified Moolre payments</div>
              </div>
            </div>

            {/* Super Admin Restriction Guarantee */}
            <div className="p-4 bg-[#0c271c] rounded-xl border border-[#C5A15A]/30 text-xs text-[#F7F5EE]/80 flex items-start gap-3">
              <Shield className="w-4 h-4 text-[#C5A15A] shrink-0 mt-0.5" />
              <div>
                <strong>Tenant Data Integrity Rule:</strong> The Super Admin dashboard permits account approval, suspension, and payment monitoring. The Super Admin cannot alter a tenant shop's product prices, purchase costs, inventory counts, or counter sales transactions.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHOP APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="bg-[#0c271c] rounded-xl border border-[#C5A15A]/20 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#C5A15A]/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Registration Application Review Pipeline</h3>
                <p className="text-[11px] text-[#F7F5EE]/60">
                  Phone-verified registrations awaiting Super Admin decision
                </p>
              </div>
              <span className="text-xs font-mono text-[#C5A15A]">
                {applications.filter((a) => a.status === 'pending').length} Pending
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#F7F5EE]/60">
                No registration applications submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#123B2A] text-[#F7F5EE]/70 border-b border-[#C5A15A]/20 font-semibold">
                    <tr>
                      <th className="p-3">Shop Name</th>
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Contact Phone</th>
                      <th className="p-3">Location in Ghana</th>
                      <th className="p-3">Submitted At</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5A15A]/10 font-mono">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#123B2A]/40">
                        <td className="p-3 font-sans font-bold text-white">{app.shop_name}</td>
                        <td className="p-3 font-sans">{app.applicant_name}</td>
                        <td className="p-3">{app.phone_number}</td>
                        <td className="p-3 font-sans text-[#F7F5EE]/80">{app.location}</td>
                        <td className="p-3 font-sans text-[#F7F5EE]/60">
                          {new Date(app.created_at).toLocaleDateString('en-GB')}
                        </td>
                        <td className="p-3 text-center font-sans">
                          {app.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/60 text-amber-300 border border-amber-500/30">
                              Pending Review
                            </span>
                          ) : app.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-300 border border-red-500/30">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-sans">
                          {app.status === 'pending' ? (
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="px-3 py-1 bg-[#C5A15A] text-[#123B2A] text-xs font-bold rounded hover:bg-[#b39049]"
                            >
                              Review & Decide
                            </button>
                          ) : (
                            <span className="text-[#F7F5EE]/40 text-xs">Decided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHOP ACCOUNTS */}
        {activeTab === 'shops' && (
          <div className="bg-[#0c271c] rounded-xl border border-[#C5A15A]/20 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#C5A15A]/20">
              <h3 className="text-sm font-bold text-white">Provision Shop Tenant Accounts</h3>
              <p className="text-[11px] text-[#F7F5EE]/60">
                Manage shop operational states (approved vs suspended)
              </p>
            </div>

            {shops.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#F7F5EE]/60">
                No approved shop accounts in database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#123B2A] text-[#F7F5EE]/70 border-b border-[#C5A15A]/20 font-semibold">
                    <tr>
                      <th className="p-3">Shop Name</th>
                      <th className="p-3">Business Phone</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Subscription</th>
                      <th className="p-3 text-center">Account Status</th>
                      <th className="p-3 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5A15A]/10 font-mono">
                    {shops.map((s) => (
                      <tr key={s.id} className="hover:bg-[#123B2A]/40">
                        <td className="p-3 font-sans font-bold text-white">{s.name}</td>
                        <td className="p-3">{s.business_phone}</td>
                        <td className="p-3 font-sans text-[#F7F5EE]/80">{s.location}</td>
                        <td className="p-3 font-sans capitalize">
                          <span className="text-[#C5A15A]">{s.subscription_status}</span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          {s.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/60 text-emerald-300">
                              Active / Approved
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/60 text-red-300">
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-sans">
                          <button
                            onClick={() => handleToggleShopStatus(s)}
                            className={`px-3 py-1 rounded text-xs font-bold ${
                              s.status === 'suspended'
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-red-800 text-white hover:bg-red-900'
                            }`}
                          >
                            {s.status === 'suspended' ? 'Reactivate Shop' : 'Suspend Account'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SASUSYNC SMS LOGS */}
        {activeTab === 'sms' && (
          <div className="bg-[#0c271c] rounded-xl border border-[#C5A15A]/20 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#C5A15A]/20">
              <h3 className="text-sm font-bold text-white">SasuSync Transactional SMS Audit</h3>
              <p className="text-[11px] text-[#F7F5EE]/60">
                Dispatched OTPs, review notices, trial warnings, and payment receipts
              </p>
            </div>

            {smsLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#F7F5EE]/60">
                No SMS messages logged yet. Messages dispatch during registration, approval, trial reminders, and payments.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#123B2A] text-[#F7F5EE]/70 border-b border-[#C5A15A]/20 font-semibold">
                    <tr>
                      <th className="p-3">Sent At</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Event Type</th>
                      <th className="p-3">Message Text</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5A15A]/10 font-mono">
                    {smsLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#123B2A]/40">
                        <td className="p-3 font-sans text-[#F7F5EE]/70 text-[11px]">
                          {new Date(log.sent_at).toLocaleString('en-GB')}
                        </td>
                        <td className="p-3 font-bold text-white">{log.recipient_phone}</td>
                        <td className="p-3 font-sans capitalize text-[#C5A15A]">
                          {log.message_type.replace(/_/g, ' ')}
                        </td>
                        <td className="p-3 font-sans text-xs text-[#F7F5EE]/85 max-w-md">
                          {log.message_text}
                        </td>
                        <td className="p-3 text-center font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#123B2A] text-[#C5A15A]">
                            {log.provider_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DATABASE & CREDENTIALS CONFIG */}
        {activeTab === 'config' && (
          <div className="bg-[#0c271c] p-6 rounded-xl border border-[#C5A15A]/20 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Supabase & Gateway Integration Status
              </h3>
              <p className="text-xs text-[#F7F5EE]/70">
                Connection diagnostics for real PostgreSQL database, SasuSync SMS, and Moolre Mobile Money.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-[#123B2A] rounded-lg border border-[#C5A15A]/20 space-y-2">
                <div className="font-bold text-[#C5A15A]">Supabase Database & Auth</div>
                <div>URL: {supabaseStatus.url}</div>
                <div>
                  Status:{' '}
                  <span className={supabaseStatus.isConfigured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {supabaseStatus.isConfigured ? 'Connected' : 'Missing Keys (Using local store)'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#123B2A] rounded-lg border border-[#C5A15A]/20 space-y-2">
                <div className="font-bold text-[#C5A15A]">SasuSync SMS Gateway</div>
                <div>Sender ID: Samley Retail</div>
                <div>Endpoint: https://api.sasusync.com/v1</div>
                <div>Status: Configured & Logging</div>
              </div>

              <div className="p-4 bg-[#123B2A] rounded-lg border border-[#C5A15A]/20 space-y-2">
                <div className="font-bold text-[#C5A15A]">Moolre Mobile Money</div>
                <div>Fee: GH₵300 / month</div>
                <div>Supported: MTN MoMo, Telecel, AirtelTigo</div>
                <div>Status: USSD Prompt Ready</div>
              </div>
            </div>

            <div className="p-4 bg-[#123B2A] rounded-lg border border-[#C5A15A]/20">
              <div className="font-bold text-white text-xs mb-1">PostgreSQL Database Schema</div>
              <p className="text-[11px] text-[#F7F5EE]/70 mb-3">
                The complete SQL schema with Row Level Security is available in <code>supabase_schema.sql</code> at the project root for direct execution in the Supabase SQL editor.
              </p>
            </div>
          </div>
        )}

        {/* Modal: Application Review Decision */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0c271c] rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#C5A15A]/30 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#C5A15A]/20">
                <h3 className="text-base font-bold">Review Application</h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-xs text-[#F7F5EE]/60 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <div className="p-3.5 bg-[#123B2A] rounded-lg border border-[#C5A15A]/20 space-y-1.5 text-xs">
                <div>
                  <strong>Shop Name:</strong> {selectedApp.shop_name}
                </div>
                <div>
                  <strong>Applicant:</strong> {selectedApp.applicant_name}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedApp.phone_number}
                </div>
                <div>
                  <strong>Location:</strong> {selectedApp.location}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F7F5EE] mb-1">
                  Rejection Reason (If rejecting)
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Unverified location or duplicate registration"
                  className="w-full px-3 py-2 rounded-lg border border-[#C5A15A]/30 text-xs bg-[#123B2A] text-white"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#C5A15A]/20">
                <button
                  type="button"
                  disabled={processingApp}
                  onClick={() => handleRejectApp(selectedApp)}
                  className="w-1/2 py-2.5 bg-red-900 text-white rounded-lg text-xs font-bold hover:bg-red-800"
                >
                  {processingApp ? 'Processing...' : 'Reject Application'}
                </button>
                <button
                  type="button"
                  disabled={processingApp}
                  onClick={() => handleApproveApp(selectedApp)}
                  className="w-1/2 py-2.5 bg-[#C5A15A] text-[#123B2A] rounded-lg text-xs font-bold hover:bg-[#b39049]"
                >
                  {processingApp ? 'Approving...' : 'Approve & Send SMS'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
};