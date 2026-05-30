// ── Client configuration ──────────────────────────────────────────────

export interface PayNexusConfig {
  /** Secret API key (sk_...) for authenticated requests. */
  secretKey: string;
  /** Webhook secret (whsec_...) used for signature verification. */
  webhookSecret?: string;
  /** Base URL of the PayNexus API. Defaults to https://api.paynexus.co.ke/api */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30 000. */
  timeout?: number;
}

// ── Generic API envelope ──────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

// ── Payments ──────────────────────────────────────────────────────────

export interface InitiatePaymentParams {
  /** ID of the merchant payment account to charge through. */
  payment_account_id: number;
  /** Amount in KES (1–150 000). */
  amount: number;
  /** Customer phone number (Safaricom M-Pesa). */
  phone: string;
  /** Optional description shown on the STK prompt. */
  description?: string;
}

export interface PaymentData {
  payment_id: number;
  reference: string;
  checkout_request_id: string;
  merchant_request_id: string;
  amount: number;
  currency: string;
  phone: string;
  status: PaymentStatus;
  response_code: string;
  response_description: string;
  customer_message: string | null;
}

export interface Payment {
  id: number;
  reference: string;
  status: PaymentStatus;
  amount: string;
  currency: string;
  phone: string;
  payment_method: string;
  provider_request_id: string | null;
  provider_reference: string | null;
  provider_transaction_id: string | null;
  description: string | null;
  payer_name: string | null;
  failure_reason: string | null;
  payment_account?: PaymentAccountSummary;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  failed_at: string | null;
}

export interface PaymentAccountSummary {
  id: number;
  provider: string;
  account_name: string;
  type: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired';

export interface StatusByCheckoutIdParams {
  checkout_request_id: string;
}

export interface ListPaymentsParams {
  status?: PaymentStatus;
  payment_method?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number;
  page?: number;
}

// ── Webhooks ──────────────────────────────────────────────────────────

export type WebhookEvent =
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.initiated'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'account.created'
  | 'account.updated'
  | 'subscription.created'
  | 'subscription.canceled';

export interface RegisterWebhookParams {
  name: string;
  url: string;
  events?: WebhookEvent[];
}

export interface UpdateWebhookParams {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  active?: boolean;
}

export interface Webhook {
  id: number;
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  status: string;
  active: boolean;
  last_triggered_at: string | null;
  last_success_at: string | null;
  failure_count?: number;
  created_at?: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

// ── Merchant ──────────────────────────────────────────────────────────

export interface Merchant {
  id: number;
  business_name: string | null;
  status: string;
  subscription_status: string;
  subscription_plan: string | null;
  created_at: string;
}

export interface Business {
  id: number;
  business_name: string;
  business_description: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_website: string | null;
  slug: string | null;
  status: string;
  created_at: string;
}

export interface PaymentAccount {
  id: number;
  provider: string;
  type: string;
  account_name: string;
  account_number: string | null;
  till_number: string | null;
  business_number: string | null;
  currency: string;
  environment: string;
  status: string;
  created_at: string;
}

// ── API Keys ──────────────────────────────────────────────────────────

export interface CreateApiKeyParams {
  name: string;
  payment_account_id: number;
  permissions?: string[];
  allowed_ips?: string[];
  allowed_domains?: string[];
  expires_at?: string;
}

export interface UpdateApiKeyParams {
  name?: string;
  permissions?: string[];
  allowed_ips?: string[];
  allowed_domains?: string[];
  status?: 'active' | 'inactive' | 'revoked';
  expires_at?: string;
}

export interface ApiKey {
  id: number;
  name: string;
  api_key?: string;
  permissions: string[] | null;
  allowed_ips: string[] | null;
  allowed_domains: string[] | null;
  status?: string;
  payment_account?: {
    id: number;
    provider: string;
    account_name: string;
  };
  last_used_at?: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at?: string;
}

// ── Request options ───────────────────────────────────────────────────

export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
}
