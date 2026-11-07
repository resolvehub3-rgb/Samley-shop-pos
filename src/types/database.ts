/**
 * Database types for Samly Provision Shop Management SaaS
 */

export type ShopStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type SubscriptionStatus = 'pending_approval' | 'trialing' | 'active' | 'expired' | 'suspended';
export type UserRole = 'super_admin' | 'shop_owner';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type MovementType =
  | 'opening_stock'
  | 'stock_received'
  | 'stock_sold'
  | 'damaged'
  | 'expired'
  | 'returned'
  | 'adjustment';
export type PaymentMethod = 'cash' | 'mobile_money';
export type PaymentStatus = 'completed' | 'cancelled';
export type TransactionStatus = 'pending' | 'successful' | 'failed' | 'cancelled';

export interface Shop {
  id: string;
  name: string;
  business_phone: string;
  location: string;
  status: ShopStatus;
  approved_at: string | null;
  approved_by: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  shop_id: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface ShopApplication {
  id: string;
  shop_name: string;
  applicant_name: string;
  email: string;
  phone_number: string;
  location: string;
  status: ApplicationStatus;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  shop_id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  description?: string | null;
  barcode?: string | null;
  base_unit: string;
  purchase_cost: number;
  selling_price: number;
  current_stock: number;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined or nested
  category?: Category | null;
  selling_units?: SellingUnit[];
}

export interface SellingUnit {
  id: string;
  product_id: string;
  shop_id: string;
  unit_name: string;
  conversion_to_base: number;
  selling_price: number;
  is_default: boolean;
  created_at: string;
}

export interface StockMovement {
  id: string;
  shop_id: string;
  product_id: string;
  movement_type: MovementType;
  quantity_base: number;
  unit_cost?: number | null;
  reference_id?: string | null;
  notes?: string | null;
  created_at: string;
  created_by?: string | null;
  product?: Product;
}

export interface Sale {
  id: string;
  shop_id: string;
  sale_reference: string;
  total_amount: number;
  amount_received: number;
  change_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  created_by?: string | null;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  shop_id: string;
  product_id: string;
  selling_unit_name: string;
  quantity: number;
  units_per_selling_unit: number;
  total_base_units: number;
  unit_price: number;
  line_total: number;
  cost_price: number;
  created_at: string;
  product?: Product;
}

export interface SubscriptionRecord {
  id: string;
  shop_id: string;
  plan_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: 'trialing' | 'active' | 'expired';
  moolre_reference?: string | null;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  shop_id: string | null;
  transaction_type: 'subscription' | 'shop_sale';
  reference: string;
  amount: number;
  currency: string;
  provider: 'moolre' | 'cash' | 'manual';
  status: TransactionStatus;
  customer_phone?: string | null;
  response_payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface SmsLog {
  id: string;
  shop_id: string | null;
  recipient_phone: string;
  message_type: string;
  message_text: string;
  provider_status: string;
  provider_reference?: string | null;
  sent_at: string;
}

export interface AuditLog {
  id: string;
  shop_id: string | null;
  user_id: string | null;
  action: string;
  details?: string | null;
  ip_address?: string | null;
  created_at: string;
}
