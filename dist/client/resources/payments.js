import { generateIdempotencyKey } from '../../utils/idempotency.js';
import { DEFAULT_CONFIG } from '../../utils/constants.js';
export class PaymentsResource {
    httpClient;
    autoIdempotency;
    constructor(httpClient, autoIdempotency = true) {
        this.httpClient = httpClient;
        this.autoIdempotency = autoIdempotency;
    }
    async initiate(data, options) {
        // Auto-generate idempotency key if not provided and autoIdempotency is enabled
        if (this.autoIdempotency && !data.idempotencyKey) {
            data.idempotencyKey = generateIdempotencyKey();
        }
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'POST',
            url: '/api/payments/initiate',
            data: {
                amount: data.amount,
                phone: data.phone,
                description: data.description || 'Payment via PayNexus',
                account_reference: data.accountReference,
                payment_account_id: data.paymentAccountId,
                idempotency_key: data.idempotencyKey,
                metadata: data.metadata,
            },
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async verify(checkoutRequestId, options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: `/api/payments/checkout/${checkoutRequestId}`,
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async getByReference(reference, options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: `/api/payments/reference/${reference}`,
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async getById(paymentId, options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: `/api/payments/${paymentId}`,
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async list(filters, options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: '/api/payments',
            params: filters,
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
            pagination: responseData.pagination,
        };
    }
    async poll(checkoutRequestId, pollOptions, requestOptions) {
        const timeout = pollOptions?.timeout || DEFAULT_CONFIG.pollTimeout;
        const interval = pollOptions?.interval || DEFAULT_CONFIG.pollInterval;
        const start = Date.now();
        while (true) {
            const result = await this.verify(checkoutRequestId, requestOptions);
            const status = result.data?.status;
            if (status === 'completed' || status === 'failed' || status === 'timeout') {
                return result;
            }
            if (Date.now() - start >= timeout) {
                return {
                    success: false,
                    message: `Polling timed out after ${timeout}ms`,
                    requestId: result.requestId,
                    data: result.data,
                };
            }
            await this.delay(interval);
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=payments.js.map