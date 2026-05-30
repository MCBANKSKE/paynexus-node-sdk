import { HttpClient } from '../http.js';
import type { InitiatePaymentData, PaymentResponse, PaymentsListResponse, PaymentFilters, PollOptions, RequestOptions } from '../../types/index.js';
export declare class PaymentsResource {
    private httpClient;
    private autoIdempotency;
    constructor(httpClient: HttpClient, autoIdempotency?: boolean);
    initiate(data: InitiatePaymentData, options?: RequestOptions): Promise<PaymentResponse>;
    verify(checkoutRequestId: string, options?: RequestOptions): Promise<PaymentResponse>;
    getByReference(reference: string, options?: RequestOptions): Promise<PaymentResponse>;
    getById(paymentId: number, options?: RequestOptions): Promise<PaymentResponse>;
    list(filters?: PaymentFilters, options?: RequestOptions): Promise<PaymentsListResponse>;
    poll(checkoutRequestId: string, pollOptions?: PollOptions, requestOptions?: RequestOptions): Promise<PaymentResponse>;
    private delay;
}
//# sourceMappingURL=payments.d.ts.map