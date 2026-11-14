/**
 * Shop Management Data Service for Samly
 * Interacts directly with Supabase when configured, with real PostgreSQL tables,
 * real Row Level Security, and Realtime event subscriptions.
 *
 * Enforces:
 * - NO MOCK DATA.
 * - Empty database -> 0 records & empty states.
 * - Strict tenant isolation.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Shop,
  UserProfile,
  ShopApplication,
  Category,
  Product,
  SellingUnit,
  StockMovement,
  Sale,
  SaleItem,
  SubscriptionRecord,
  PaymentTransaction,
  SmsLog,
  AuditLog,
} from '../types/database';
import {
  calculateStockBalance,
  calculateBaseUnits,
  calculateLineTotal,
  calculateSaleTotal,
  calculateChange,
} from '../utils/shopCalculations';
import {
  startTrial,
  calculateNewSubscriptionPeriod,
  MONTHLY_SUBSCRIPTION_FEE_GHS,
} from '../utils/subscriptionRules';

// Local storage session key for current user session
const SESSION_STORAGE_KEY = 'samly_active_auth_session';

export interface ActiveSession {
  user: UserProfile;
  shop: Shop | null;
}

// -------------------------------------------------------------
// Authentication & Session Management
// -------------------------------------------------------------

export function getStoredSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredSession(session: ActiveSession | null): void {
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } else {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
}

// -------------------------------------------------------------
// Application & Registration Workflow
// -------------------------------------------------------------

export async function submitRegistrationApplication(data: {
  shopName: string;
  applicantName: string;
  email: string;
  phoneNumber: string;
  location: string;
}): Promise<{ success: boolean; application?: ShopApplication; error?: string }> {
  const application: ShopApplication = {
    id: crypto.randomUUID(),
    shop_name: data.shopName,
    applicant_name: data.applicantName,
    email: data.email,
    phone_number: data.phoneNumber,
    location: data.location,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    // Prefer the server-side endpoint, which uses the Supabase service role key
    // and bypasses Row Level Security for public registration inserts.
    try {
      const response = await fetch('/api/register-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.success) {
        return { success: true, application: (data.application || application) as ShopApplication };
      }
      if (data?.error) {
        return { success: false, error: data.error };
      }
    } catch (err) {
      // Fall through to direct client insert below.
    }

    const { data: inserted, error } = await supabase
      .from('shop_applications')
      .insert([application])
      .select()
      .single();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, application: inserted as ShopApplication };
  }

  // Fallback persistent queue
  const apps = getLocalArray<ShopApplication>('samly_shop_applications');
  apps.push(application);
  setLocalArray('samly_shop_applications', apps);

  return { success: true, application };
}

export async function getShopApplications(): Promise<ShopApplication[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('shop_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data as ShopApplication[];
  }
  return getLocalArray<ShopApplication>('samly_shop_applications');
}

export async function reviewShopApplication(
  applicationId: string,
  decision: 'approved' | 'rejected',
  rejectionReason?: string,
  reviewerId?: string
): Promise<{ success: boolean; shop?: Shop; error?: string }> {
  let appRecord: ShopApplication | undefined;

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('shop_applications')
      .update({
        status: decision,
        rejection_reason: rejectionReason || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId || null,
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error || !data) return { success: false, error: error?.message || 'Application not found' };
    appRecord = data as ShopApplication;

    if (decision === 'approved') {
      // Create new shop record
      const { data: newShop, error: shopErr } = await supabase
        .from('shops')
        .insert([
          {
            name: appRecord.shop_name,
            business_phone: appRecord.phone_number,
            location: appRecord.location,
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: reviewerId || null,
            trial_started_at: null, // Starts only on first dashboard access!
            trial_ends_at: null,
            subscription_status: 'trialing',
            subscription_ends_at: null,
          },
        ])
        .select()
        .single();

      if (shopErr) return { success: false, error: shopErr.message };

      return { success: true, shop: newShop as Shop };
    }
    return { success: true };
  }

  // Local storage handling
  const apps = getLocalArray<ShopApplication>('samly_shop_applications');
  const index = apps.findIndex((a) => a.id === applicationId);
  if (index === -1) return { success: false, error: 'Application not found' };

  apps[index].status = decision;
  apps[index].rejection_reason = rejectionReason;
  apps[index].reviewed_at = new Date().toISOString();
  setLocalArray('samly_shop_applications', apps);

  if (decision === 'approved') {
    const shops = getLocalArray<Shop>('samly_shops');
    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      name: apps[index].shop_name,
      business_phone: apps[index].phone_number,
      location: apps[index].location,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: reviewerId || null,
      trial_started_at: null,
      trial_ends_at: null,
      subscription_status: 'trialing',
      subscription_ends_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    shops.push(newShop);
    setLocalArray('samly_shops', shops);
    return { success: true, shop: newShop };
  }

  return { success: true };
}

// -------------------------------------------------------------
// Trial Activation on First Dashboard Access
// -------------------------------------------------------------

export async function ensureTrialStarted(shop: Shop): Promise<Shop> {
  // If trial has not started yet, start it now!
  if (shop.status === 'approved' && !shop.trial_started_at) {
    const { trialStartedAt, trialEndsAt } = startTrial();
    const updatedShop: Shop = {
      ...shop,
      trial_started_at: trialStartedAt,
      trial_ends_at: trialEndsAt,
      subscription_status: 'trialing',
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('shops')
        .update({
          trial_started_at: trialStartedAt,
          trial_ends_at: trialEndsAt,
          subscription_status: 'trialing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', shop.id);
    } else {
      const shops = getLocalArray<Shop>('samly_shops');
      const idx = shops.findIndex((s) => s.id === shop.id);
      if (idx !== -1) {
        shops[idx] = updatedShop;
        setLocalArray('samly_shops', shops);
      }
    }
    return updatedShop;
  }
  return shop;
}

// -------------------------------------------------------------
// Categories & Products Management
// -------------------------------------------------------------

export async function getCategories(shopId: string): Promise<Category[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .order('name');
    if (data) return data as Category[];
  }
  return getLocalArray<Category>('samly_categories').filter(
    (c) => c.shop_id === shopId && c.is_active
  );
}

export async function createCategory(
  shopId: string,
  name: string,
  description?: string
): Promise<{ success: boolean; category?: Category; error?: string }> {
  const category: Category = {
    id: `cat-${Date.now()}`,
    shop_id: shopId,
    name,
    description: description || null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('categories').insert([category]).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, category: data as Category };
  }

  const list = getLocalArray<Category>('samly_categories');
  list.push(category);
  setLocalArray('samly_categories', list);
  return { success: true, category };
}

export async function getProducts(shopId: string): Promise<Product[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from('products')
      .select('*, selling_units(*), category:categories(*)')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .order('name');
    if (data) return data as Product[];
  }
  const products = getLocalArray<Product>('samly_products').filter(
    (p) => p.shop_id === shopId && p.is_active
  );
  const units = getLocalArray<SellingUnit>('samly_selling_units');
  return products.map((p) => ({
    ...p,
    selling_units: units.filter((u) => u.product_id === p.id),
  }));
}

export async function createProduct(
  shopId: string,
  data: {
    name: string;
    categoryId?: string | null;
    description?: string;
    barcode?: string;
    baseUnit: string;
    purchaseCost: number;
    sellingPrice: number;
    initialStock: number;
    alertThreshold?: number;
    sellingUnits?: {
      unitName: string;
      conversionToBase: number;
      sellingPrice: number;
      isDefault: boolean;
    }[];
  }
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const productId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const product: Product = {
    id: productId,
    shop_id: shopId,
    category_id: data.categoryId || null,
    name: data.name,
    description: data.description || null,
    barcode: data.barcode || null,
    base_unit: data.baseUnit,
    purchase_cost: data.purchaseCost,
    selling_price: data.sellingPrice,
    current_stock: data.initialStock,
    alert_threshold: data.alertThreshold ?? 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const configuredUnits: SellingUnit[] = (data.sellingUnits || []).map((u, i) => ({
    id: `unit-${Date.now()}-${i}`,
    product_id: productId,
    shop_id: shopId,
    unit_name: u.unitName,
    conversion_to_base: u.conversionToBase,
    selling_price: u.sellingPrice,
    is_default: u.isDefault,
    created_at: new Date().toISOString(),
  }));

  // Ensure default base unit exists as option if no custom units
  if (configuredUnits.length === 0) {
    configuredUnits.push({
      id: `unit-${Date.now()}-def`,
      product_id: productId,
      shop_id: shopId,
      unit_name: data.baseUnit,
      conversion_to_base: 1,
      selling_price: data.sellingPrice,
      is_default: true,
      created_at: new Date().toISOString(),
    });
  }

  if (isSupabaseConfigured() && supabase) {
    const { data: inserted, error } = await supabase.from('products').insert([product]).select().single();
    if (error) return { success: false, error: error.message };

    if (configuredUnits.length > 0) {
      await supabase.from('selling_units').insert(configuredUnits);
    }

    // Record opening stock movement if initialStock > 0
    if (data.initialStock > 0) {
      await supabase.from('stock_movements').insert([
        {
          shop_id: shopId,
          product_id: productId,
          movement_type: 'opening_stock',
          quantity_base: data.initialStock,
          unit_cost: data.purchaseCost,
          notes: 'Initial inventory on product creation',
        },
      ]);
    }

    return {
      success: true,
      product: { ...inserted, selling_units: configuredUnits } as Product,
    };
  }

  // Local storage persistence
  const products = getLocalArray<Product>('samly_products');
  products.push(product);
  setLocalArray('samly_products', products);

  const units = getLocalArray<SellingUnit>('samly_selling_units');
  units.push(...configuredUnits);
  setLocalArray('samly_selling_units', units);

  if (data.initialStock > 0) {
    const movements = getLocalArray<StockMovement>('samly_stock_movements');
    movements.push({
      id: `mov-${Date.now()}`,
      shop_id: shopId,
      product_id: productId,
      movement_type: 'opening_stock',
      quantity_base: data.initialStock,
      unit_cost: data.purchaseCost,
      notes: 'Initial inventory on product creation',
      created_at: new Date().toISOString(),
    });
    setLocalArray('samly_stock_movements', movements);
  }

  return { success: true, product: { ...product, selling_units: configuredUnits } };
}

// -------------------------------------------------------------
// Stock Receiving & Movements
// -------------------------------------------------------------

export async function recordStockReceiving(
  shopId: string,
  params: {
    productId: string;
    quantityReceived: number;
    unitCost: number;
    conversionToBase?: number;
    referenceOrInvoice?: string;
    notes?: string;
  }
): Promise<{ success: boolean; newStock?: number; error?: string }> {
  const conversion = params.conversionToBase || 1;
  const quantityBase = calculateBaseUnits(params.quantityReceived, conversion);

  if (isSupabaseConfigured() && supabase) {
    // 1. Fetch current product stock
    const { data: prod, error: fetchErr } = await supabase
      .from('products')
      .select('current_stock, purchase_cost')
      .eq('id', params.productId)
      .eq('shop_id', shopId)
      .single();

    if (fetchErr || !prod) return { success: false, error: 'Product not found' };

    const newStock = Number(prod.current_stock) + quantityBase;

    // 2. Insert movement
    await supabase.from('stock_movements').insert([
      {
        shop_id: shopId,
        product_id: params.productId,
        movement_type: 'stock_received',
        quantity_base: quantityBase,
        unit_cost: params.unitCost,
        reference_id: params.referenceOrInvoice || null,
        notes: params.notes || null,
      },
    ]);

    // 3. Update product current_stock and purchase_cost
    await supabase
      .from('products')
      .update({
        current_stock: newStock,
        purchase_cost: params.unitCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.productId);

    return { success: true, newStock };
  }

  // Local storage
  const products = getLocalArray<Product>('samly_products');
  const pIdx = products.findIndex((p) => p.id === params.productId && p.shop_id === shopId);
  if (pIdx === -1) return { success: false, error: 'Product not found' };

  const newStock = products[pIdx].current_stock + quantityBase;
  products[pIdx].current_stock = newStock;
  products[pIdx].purchase_cost = params.unitCost;
  products[pIdx].updated_at = new Date().toISOString();
  setLocalArray('samly_products', products);

  const movements = getLocalArray<StockMovement>('samly_stock_movements');
  movements.push({
    id: `mov-${Date.now()}`,
    shop_id: shopId,
    product_id: params.productId,
    movement_type: 'stock_received',
    quantity_base: quantityBase,
    unit_cost: params.unitCost,
    reference_id: params.referenceOrInvoice || null,
    notes: params.notes || null,
    created_at: new Date().toISOString(),
  });
  setLocalArray('samly_stock_movements', movements);

  return { success: true, newStock };
}

export async function getStockMovements(shopId: string): Promise<StockMovement[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from('stock_movements')
      .select('*, product:products(name, base_unit)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    if (data) return data as StockMovement[];
  }
  const movements = getLocalArray<StockMovement>('samly_stock_movements').filter((m) => m.shop_id === shopId);
  const products = getLocalArray<Product>('samly_products');
  return movements.map((m) => ({
    ...m,
    product: products.find((p) => p.id === m.product_id),
  }));
}

// -------------------------------------------------------------
// Sales Counter Processing (POS)
// -------------------------------------------------------------

export interface CompleteSaleInput {
  shopId: string;
  items: {
    productId: string;
    productName: string;
    sellingUnitName: string;
    quantity: number;
    conversionToBase: number;
    unitPrice: number;
    unitCost: number;
  }[];
  amountReceived: number;
  paymentMethod: 'cash' | 'mobile_money';
  notes?: string;
  userId?: string;
}

export async function processSale(
  input: CompleteSaleInput
): Promise<{ success: boolean; sale?: Sale; error?: string }> {
  if (input.items.length === 0) {
    return { success: false, error: 'Cannot complete sale with empty items.' };
  }

  // Calculate line totals and overall total
  const calculatedItems = input.items.map((item) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    const totalBaseUnits = calculateBaseUnits(item.quantity, item.conversionToBase);
    return {
      ...item,
      lineTotal,
      totalBaseUnits,
    };
  });

  const totalAmount = calculateSaleTotal(calculatedItems);
  if (input.amountReceived < totalAmount) {
    return {
      success: false,
      error: `Amount received (GH₵${input.amountReceived.toFixed(2)}) is less than total due (GH₵${totalAmount.toFixed(2)}).`,
    };
  }

  const changeAmount = calculateChange(totalAmount, input.amountReceived);
  const saleReference = `SAM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  const saleRecord: Sale = {
    id: `sale-${Date.now()}`,
    shop_id: input.shopId,
    sale_reference: saleReference,
    total_amount: totalAmount,
    amount_received: input.amountReceived,
    change_amount: changeAmount,
    payment_method: input.paymentMethod,
    payment_status: 'completed',
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    created_by: input.userId || null,
  };

  const saleItemRecords: SaleItem[] = calculatedItems.map((item, idx) => ({
    id: `item-${Date.now()}-${idx}`,
    sale_id: saleRecord.id,
    shop_id: input.shopId,
    product_id: item.productId,
    selling_unit_name: item.sellingUnitName,
    quantity: item.quantity,
    units_per_selling_unit: item.conversionToBase,
    total_base_units: item.totalBaseUnits,
    unit_price: item.unitPrice,
    line_total: item.lineTotal,
    cost_price: item.unitCost || 0,
    created_at: new Date().toISOString(),
  }));

  if (isSupabaseConfigured() && supabase) {
    // 1. Insert Sale record
    const { data: insertedSale, error: saleErr } = await supabase
      .from('sales')
      .insert([saleRecord])
      .select()
      .single();

    if (saleErr || !insertedSale) {
      return { success: false, error: saleErr?.message || 'Failed to save sale.' };
    }

    // 2. Insert Sale items
    const itemsWithRealId = saleItemRecords.map((i) => ({
      ...i,
      sale_id: insertedSale.id,
    }));
    await supabase.from('sale_items').insert(itemsWithRealId);

    // 3. Deduct stock & create stock movements
    for (const item of calculatedItems) {
      // Get current stock
      const { data: p } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', item.productId)
        .single();

      if (p) {
        const newStock = Math.max(0, Number(p.current_stock) - item.totalBaseUnits);
        await supabase
          .from('products')
          .update({ current_stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', item.productId);

        await supabase.from('stock_movements').insert([
          {
            shop_id: input.shopId,
            product_id: item.productId,
            movement_type: 'stock_sold',
            quantity_base: item.totalBaseUnits,
            unit_cost: item.unitCost,
            reference_id: saleReference,
            notes: `Sold ${item.quantity} ${item.sellingUnitName}`,
          },
        ]);
      }
    }

    return {
      success: true,
      sale: { ...insertedSale, items: itemsWithRealId } as Sale,
    };
  }

  // Local storage execution
  const sales = getLocalArray<Sale>('samly_sales');
  sales.unshift(saleRecord);
  setLocalArray('samly_sales', sales);

  const saleItems = getLocalArray<SaleItem>('samly_sale_items');
  saleItems.push(...saleItemRecords);
  setLocalArray('samly_sale_items', saleItems);

  // Deduct inventory
  const products = getLocalArray<Product>('samly_products');
  const movements = getLocalArray<StockMovement>('samly_stock_movements');

  for (const item of calculatedItems) {
    const pIdx = products.findIndex((p) => p.id === item.productId);
    if (pIdx !== -1) {
      products[pIdx].current_stock = Math.max(0, products[pIdx].current_stock - item.totalBaseUnits);
      products[pIdx].updated_at = new Date().toISOString();

      movements.push({
        id: `mov-${Date.now()}-${Math.random()}`,
        shop_id: input.shopId,
        product_id: item.productId,
        movement_type: 'stock_sold',
        quantity_base: item.totalBaseUnits,
        unit_cost: item.unitCost,
        reference_id: saleReference,
        notes: `Sold ${item.quantity} ${item.sellingUnitName}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  setLocalArray('samly_products', products);
  setLocalArray('samly_stock_movements', movements);

  return { success: true, sale: { ...saleRecord, items: saleItemRecords } };
}

export async function getSales(shopId: string): Promise<Sale[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from('sales')
      .select('*, items:sale_items(*, product:products(name, base_unit))')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    if (data) return data as Sale[];
  }
  const sales = getLocalArray<Sale>('samly_sales').filter((s) => s.shop_id === shopId);
  const items = getLocalArray<SaleItem>('samly_sale_items');
  const products = getLocalArray<Product>('samly_products');
  return sales.map((s) => ({
    ...s,
    items: items
      .filter((i) => i.sale_id === s.id)
      .map((i) => ({
        ...i,
        product: products.find((p) => p.id === i.product_id),
      })),
  }));
}

// -------------------------------------------------------------
// Subscriptions & Payment Transactions
// -------------------------------------------------------------

export async function recordSuccessfulPaymentAndRenew(
  shopId: string,
  reference: string,
  momoNumber: string
): Promise<{ success: boolean; newExpiry: string; error?: string }> {
  // Fetch current shop status
  let shop: Shop | null = null;

  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from('shops').select('*').eq('id', shopId).single();
    if (data) shop = data as Shop;
  } else {
    const shops = getLocalArray<Shop>('samly_shops');
    shop = shops.find((s) => s.id === shopId) || null;
  }

  if (!shop) return { success: false, newExpiry: '', error: 'Shop not found' };

  const now = new Date();
  const { startDate, endDate } = calculateNewSubscriptionPeriod(now, shop.subscription_ends_at);

  const subRecord: SubscriptionRecord = {
    id: `sub-${Date.now()}`,
    shop_id: shopId,
    plan_name: 'Samly Monthly',
    amount: MONTHLY_SUBSCRIPTION_FEE_GHS,
    start_date: startDate,
    end_date: endDate,
    status: 'active',
    moolre_reference: reference,
    created_at: now.toISOString(),
  };

  const paymentRecord: PaymentTransaction = {
    id: `pay-${Date.now()}`,
    shop_id: shopId,
    transaction_type: 'subscription',
    reference,
    amount: MONTHLY_SUBSCRIPTION_FEE_GHS,
    currency: 'GHS',
    provider: 'moolre',
    status: 'successful',
    customer_phone: momoNumber,
    created_at: now.toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    await supabase.from('subscriptions').insert([subRecord]);
    await supabase
      .from('payment_transactions')
      .update({ status: 'successful' })
      .eq('reference', reference);

    await supabase
      .from('shops')
      .update({
        subscription_status: 'active',
        subscription_ends_at: endDate,
        updated_at: now.toISOString(),
      })
      .eq('id', shopId);

    return { success: true, newExpiry: endDate };
  }

  // Local storage
  const subs = getLocalArray<SubscriptionRecord>('samly_subscriptions');
  subs.push(subRecord);
  setLocalArray('samly_subscriptions', subs);

  const pays = getLocalArray<PaymentTransaction>('samly_payment_transactions');
  pays.push(paymentRecord);
  setLocalArray('samly_payment_transactions', pays);

  const shops = getLocalArray<Shop>('samly_shops');
  const idx = shops.findIndex((s) => s.id === shopId);
  if (idx !== -1) {
    shops[idx].subscription_status = 'active';
    shops[idx].subscription_ends_at = endDate;
    shops[idx].updated_at = now.toISOString();
    setLocalArray('samly_shops', shops);
  }

  return { success: true, newExpiry: endDate };
}

export async function getSubscriptionHistory(shopId: string): Promise<SubscriptionRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });
    if (data) return data as SubscriptionRecord[];
  }
  return getLocalArray<SubscriptionRecord>('samly_subscriptions').filter((s) => s.shop_id === shopId);
}

// -------------------------------------------------------------
// Super Admin Platform Queries
// -------------------------------------------------------------

export async function getPlatformOverview(): Promise<{
  totalShops: number;
  pendingApplications: number;
  approvedShops: number;
  suspendedShops: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalPlatformRevenueGhs: number;
}> {
  let shops: Shop[] = [];
  let apps: ShopApplication[] = [];
  let subs: SubscriptionRecord[] = [];

  if (isSupabaseConfigured() && supabase) {
    const { data: s } = await supabase.from('shops').select('*');
    if (s) shops = s as Shop[];
    const { data: a } = await supabase.from('shop_applications').select('*');
    if (a) apps = a as ShopApplication[];
    const { data: su } = await supabase.from('subscriptions').select('*');
    if (su) subs = su as SubscriptionRecord[];
  } else {
    shops = getLocalArray<Shop>('samly_shops');
    apps = getLocalArray<ShopApplication>('samly_shop_applications');
    subs = getLocalArray<SubscriptionRecord>('samly_subscriptions');
  }

  const nowMs = Date.now();
  let activeSubs = 0;
  let expiredSubs = 0;

  shops.forEach((shop) => {
    if (shop.subscription_status === 'active' && shop.subscription_ends_at) {
      if (new Date(shop.subscription_ends_at).getTime() >= nowMs) {
        activeSubs++;
      } else {
        expiredSubs++;
      }
    }
  });

  const totalRevenue = subs.reduce((acc, sub) => acc + (Number(sub.amount) || 0), 0);

  return {
    totalShops: shops.length,
    pendingApplications: apps.filter((a) => a.status === 'pending').length,
    approvedShops: shops.filter((s) => s.status === 'approved').length,
    suspendedShops: shops.filter((s) => s.status === 'suspended').length,
    activeSubscriptions: activeSubs,
    expiredSubscriptions: expiredSubs,
    totalPlatformRevenueGhs: totalRevenue,
  };
}

export async function getAllShops(): Promise<Shop[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
    if (data) return data as Shop[];
  }
  return getLocalArray<Shop>('samly_shops');
}

export async function updateShopStatus(
  shopId: string,
  newStatus: 'approved' | 'suspended'
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('shops')
      .update({
        status: newStatus,
        subscription_status: newStatus === 'suspended' ? 'suspended' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shopId);
    return !error;
  }
  const shops = getLocalArray<Shop>('samly_shops');
  const idx = shops.findIndex((s) => s.id === shopId);
  if (idx !== -1) {
    shops[idx].status = newStatus;
    shops[idx].subscription_status = newStatus === 'suspended' ? 'suspended' : 'active';
    shops[idx].updated_at = new Date().toISOString();
    setLocalArray('samly_shops', shops);
    return true;
  }
  return false;
}

export async function getSmsLogs(): Promise<SmsLog[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from('sms_logs')
      .select('*')
      .order('sent_at', { ascending: false });
    if (data) return data as SmsLog[];
  }
  return getLocalArray<SmsLog>('samly_sms_logs');
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) return data as AuditLog[];
  }
  return getLocalArray<AuditLog>('samly_audit_logs');
}

// -------------------------------------------------------------
// Helpers: local array helpers for persistent clean state
// Note: initial values are strictly empty arrays [] — ZERO MOCK DATA!
// -------------------------------------------------------------

function getLocalArray<T>(key: string): T[] {
  try {
    const item = localStorage.getItem(key);
    if (!item) return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
}

function setLocalArray<T>(key: string, arr: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (err) {
    console.error('Failed to save to local array', err);
  }
}
