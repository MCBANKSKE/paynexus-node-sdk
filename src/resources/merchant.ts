import type { HttpClient } from '../http.js';
import type {
  ApiResponse,
  Business,
  Merchant,
  PaymentAccount,
  RequestOptions,
} from '../types.js';

export class MerchantResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get details about the currently authenticated merchant.
   */
  async get(options?: RequestOptions): Promise<ApiResponse<Merchant>> {
    return this.http.get<Merchant>('/merchant', undefined, options);
  }

  /**
   * List businesses belonging to the authenticated merchant.
   */
  async businesses(options?: RequestOptions): Promise<ApiResponse<Business[]>> {
    return this.http.get<Business[]>('/merchant/businesses', undefined, options);
  }

  /**
   * List payment accounts (M-Pesa till/paybill numbers) for the authenticated merchant.
   */
  async paymentAccounts(options?: RequestOptions): Promise<ApiResponse<PaymentAccount[]>> {
    return this.http.get<PaymentAccount[]>('/merchant/payment-accounts', undefined, options);
  }
}
