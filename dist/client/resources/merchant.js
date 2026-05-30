export class MerchantResource {
    httpClient;
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async get(options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: '/api/merchant',
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async getBusinesses(options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: '/api/merchant/businesses',
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
    async getPaymentAccounts(options) {
        const { data: responseData, requestId } = await this.httpClient.request({
            method: 'GET',
            url: '/api/merchant/payment-accounts',
        }, options);
        return {
            success: responseData.success,
            data: responseData.data,
            message: responseData.message,
            requestId,
        };
    }
}
//# sourceMappingURL=merchant.js.map