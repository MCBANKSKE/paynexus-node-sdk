import type { AxiosInstance } from 'axios';
export type { PaymentFilters } from './payments.js';
export interface PayNexusConfig {
    secretKey: string;
    publicKey?: string;
    baseUrl?: string;
    webhookSecret?: string;
    currency?: string;
    timeout?: number;
    retries?: number;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    autoIdempotency?: boolean;
    httpClient?: AxiosInstance;
}
export interface InitiatePaymentData {
    amount: number;
    phone: string;
    description?: string;
    accountReference?: string;
    paymentAccountId?: number;
    metadata?: Record<string, any>;
    idempotencyKey?: string;
}
export interface PaymentData {
    payment_id?: number;
    reference?: string;
    checkout_request_id?: string;
    merchant_request_id?: string;
    transaction_id?: string;
    amount: number;
    currency: string;
    phone: string;
    description?: string;
    account_reference?: string;
    status: 'pending' | 'completed' | 'failed' | 'timeout';
    provider_reference?: string;
    failure_reason?: string;
    payer_name?: string;
    verified_amount?: number;
    verified_phone?: string;
    verified_date?: string;
    verification_method?: string;
    user_message?: string;
    retry_possible?: boolean;
    confirmed_manually?: boolean;
    confirmed_at?: string;
    confirmed_by?: string;
    metadata?: Record<string, any>;
}
export interface PaymentResponse {
    success: boolean;
    data?: PaymentData;
    message?: string;
    requestId: string;
}
export interface PaymentsListResponse {
    success: boolean;
    data?: PaymentData[];
    message?: string;
    requestId: string;
    pagination?: {
        page: number;
        per_page: number;
        total: number;
    };
}
export interface MerchantData {
    id: number;
    name: string;
    email: string;
    phone: string;
    business_name: string;
    status: string;
    created_at: string;
    updated_at: string;
}
export interface MerchantResponse {
    success: boolean;
    data?: MerchantData;
    message?: string;
    requestId: string;
}
export interface BusinessData {
    id: number;
    name: string;
    type: string;
    status: string;
}
export interface BusinessesResponse {
    success: boolean;
    data?: BusinessData[];
    message?: string;
    requestId: string;
}
export interface PaymentAccountData {
    id: number;
    name: string;
    provider: string;
    account_number: string;
    status: string;
    is_default: boolean;
}
export interface PaymentAccountsResponse {
    success: boolean;
    data?: PaymentAccountData[];
    message?: string;
    requestId: string;
}
export interface WebhookData {
    id: number;
    name: string;
    url: string;
    events: string[];
    status: string;
    created_at: string;
    updated_at: string;
}
export interface WebhookResponse {
    success: boolean;
    data?: WebhookData;
    message?: string;
    requestId: string;
}
export interface WebhooksListResponse {
    success: boolean;
    data?: WebhookData[];
    message?: string;
    requestId: string;
}
export interface UpdateWebhookData {
    name?: string;
    url?: string;
    events?: string[];
    status?: string;
}
export interface DeleteResponse {
    success: boolean;
    message?: string;
    requestId: string;
}
export interface PollOptions {
    timeout?: number;
    interval?: number;
}
export interface RequestOptions {
    signal?: AbortSignal;
    usePublicKey?: boolean;
}
//# sourceMappingURL=index.d.ts.map