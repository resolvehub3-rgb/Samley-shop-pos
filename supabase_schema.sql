-- =========================================================================
-- SAMLEYRETAIL — PROVISION SHOP MANAGEMENT SAAS DATABASE SCHEMA
-- Multi-Tenant PostgreSQL Schema with Row Level Security (RLS)
-- Provider: Supabase
-- Smarter Shops, Better Business
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SHOPS (TENANTS)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    trial_started_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    subscription_status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (subscription_status IN ('pending_approval', 'trialing', 'active', 'expired', 'suspended')),
    subscription_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'shop_owner' CHECK (role IN ('super_admin', 'shop_owner')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. SHOP APPLICATIONS (Registration Review Pipeline)
CREATE TABLE IF NOT EXISTS public.shop_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT NOT NULL,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT CATEGORIES (Tenant-Scoped)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCTS (Tenant-Scoped)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    barcode TEXT,
    base_unit TEXT NOT NULL DEFAULT 'Piece',
    purchase_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    alert_threshold NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SELLING UNITS (Configurable selling formats with base conversions)
CREATE TABLE IF NOT EXISTS public.selling_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    unit_name TEXT NOT NULL,
    conversion_to_base NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    selling_price NUMERIC(10, 2) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. STOCK MOVEMENTS (Auditable Inventory Ledger)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('opening_stock', 'stock_received', 'stock_sold', 'damaged', 'expired', 'returned', 'adjustment')),
    quantity_base NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2),
    reference_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id)
);

-- 8. SALES (Counter POS Transactions)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    sale_reference TEXT NOT NULL UNIQUE,
    total_amount NUMERIC(10, 2) NOT NULL,
    amount_received NUMERIC(10, 2) NOT NULL,
    change_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mobile_money')),
    payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES auth.users(id)
);

-- 9. SALE ITEMS
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    selling_unit_name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    units_per_selling_unit NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    total_base_units NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. SUBSCRIPTIONS (Fixed GH₵300/mo)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL DEFAULT 'Samley Retail Monthly',
    amount NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'expired')),
    moolre_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. PAYMENT TRANSACTIONS (Moolre MoMo & Counter Records)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'shop_sale')),
    reference TEXT NOT NULL UNIQUE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GHS',
    provider TEXT NOT NULL CHECK (provider IN ('moolre', 'cash', 'manual')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
    customer_phone TEXT,
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. SMS LOGS (SasuSync Dispatched Messages)
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL,
    message_text TEXT NOT NULL,
    provider_status TEXT NOT NULL DEFAULT 'queued',
    provider_reference TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selling_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get tenant shop_id for current authenticated user
CREATE OR REPLACE FUNCTION public.current_shop_id()
RETURNS UUID AS $$
DECLARE
    s_id UUID;
BEGIN
    SELECT shop_id INTO s_id FROM public.user_profiles
    WHERE id = auth.uid();
    RETURN s_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Profiles: Users can read their own profile, super admins can read all
DROP POLICY IF EXISTS "Users read own profile" ON public.user_profiles;
CREATE POLICY "Users read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Shops: Tenant owners can read their own shop; super admins can manage all
DROP POLICY IF EXISTS "Tenant read own shop" ON public.shops;
CREATE POLICY "Tenant read own shop" ON public.shops
    FOR SELECT USING (id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant update own shop" ON public.shops;
CREATE POLICY "Tenant update own shop" ON public.shops
    FOR UPDATE USING (id = public.current_shop_id() OR public.is_super_admin());

-- Products & Categories & Units: Strictly scoped to tenant shop_id
DROP POLICY IF EXISTS "Tenant manage categories" ON public.categories;
CREATE POLICY "Tenant manage categories" ON public.categories
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant manage products" ON public.products;
CREATE POLICY "Tenant manage products" ON public.products
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant manage selling_units" ON public.selling_units;
CREATE POLICY "Tenant manage selling_units" ON public.selling_units
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant manage stock_movements" ON public.stock_movements;
CREATE POLICY "Tenant manage stock_movements" ON public.stock_movements
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant manage sales" ON public.sales;
CREATE POLICY "Tenant manage sales" ON public.sales
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant manage sale_items" ON public.sale_items;
CREATE POLICY "Tenant manage sale_items" ON public.sale_items
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant manage subscriptions" ON public.subscriptions;
CREATE POLICY "Tenant manage subscriptions" ON public.subscriptions
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant manage transactions" ON public.payment_transactions;
CREATE POLICY "Tenant manage transactions" ON public.payment_transactions
    FOR ALL USING (shop_id = public.current_shop_id() OR public.is_super_admin());

-- Shop Applications: Super Admin reads/manages; Public/Anon can insert on registration
DROP POLICY IF EXISTS "Public insert shop_applications" ON public.shop_applications;
CREATE POLICY "Public insert shop_applications" ON public.shop_applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Super admin view applications" ON public.shop_applications;
CREATE POLICY "Super admin view applications" ON public.shop_applications
    FOR SELECT USING (public.is_super_admin());

DROP POLICY IF EXISTS "Super admin update applications" ON public.shop_applications;
CREATE POLICY "Super admin update applications" ON public.shop_applications
    FOR UPDATE USING (public.is_super_admin());

-- SMS & Audit logs: Read by super admin and shop owner (for their own shop)
DROP POLICY IF EXISTS "Read sms_logs" ON public.sms_logs;
CREATE POLICY "Read sms_logs" ON public.sms_logs
    FOR SELECT USING (shop_id = public.current_shop_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Read audit_logs" ON public.audit_logs;
CREATE POLICY "Read audit_logs" ON public.audit_logs
    FOR SELECT USING (shop_id = public.current_shop_id() OR public.is_super_admin());

-- =========================================================================
-- SEED: Platform Super Admin (no test shop data)
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  admin_uid uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'samley@gmail.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
    VALUES (admin_uid, 'samley@gmail.com', crypt('GoodGod1$', gen_salt('bf')), now(), 'authenticated', 'authenticated');

    INSERT INTO public.user_profiles (id, shop_id, full_name, email, phone_number, role)
    VALUES (admin_uid, NULL, 'Platform Super Admin', 'samley@gmail.com', '0000000000', 'super_admin');
  END IF;
END $$;
