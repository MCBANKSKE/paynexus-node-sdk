import type { HttpClient } from '../http.js';
import type {
  ApiResponse,
  InitiatePaymentParams,
  ListPaymentsParams,
  Payment,
  PaymentData,
  RequestOptions,
  StatusByCheckoutIdParams,
} from '../types.js';

export class PaymentsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Initiate an M-Pesa STK Push payment.
   *
   * The customer will receive a prompt on their phone to enter their M-Pesa PIN.
   */
  async initiate(params: InitiatePaymentParams, options?: RequestOptions): Promise<ApiResponse<PaymentData>> {
    return this.http.post<PaymentData>('/payments/initiate', params as unknown as Record<string, unknown>, options);
  }

  /**
   * Get payment status by its PayNexus reference string.
   */
  async getByReference(reference: string, options?: RequestOptions): Promise<ApiResponse<Payment>> {
    return this.http.get<Payment>(`/payments/${encodeURIComponent(reference)}`, undefined, options);
  }

  /**
   * Get payment status by its numeric ID.
   */
  async getById(id: number, options?: RequestOptions): Promise<ApiResponse<Payment>> {
    return this.http.get<Payment>(`/payments/${id}/status-by-id`, undefined, options);
  }

  /**
   * Get payment status by M-Pesa CheckoutRequestID.
   */
  async getByCheckoutId(params: StatusByCheckoutIdParams, options?: RequestOptions): Promise<ApiResponse<Payment>> {
    return this.http.post<Payment>('/payments/status-by-checkout-id', params as unknown as Record<string, unknown>, options);
  }

  /**
   * List payments for the authenticated merchant.
   */
  async list(params?: ListPaymentsParams, options?: RequestOptions): Promise<ApiResponse<Payment[]>> {
    return this.http.get<Payment[]>('/payments', params as unknown as Record<string, string | number | undefined>, options);
  }
}
