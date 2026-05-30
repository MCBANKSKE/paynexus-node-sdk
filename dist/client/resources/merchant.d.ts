import { HttpClient } from '../http.js';
import type { MerchantResponse, BusinessesResponse, PaymentAccountsResponse, RequestOptions } from '../../types/index.js';
export declare class MerchantResource {
    private httpClient;
    constructor(httpClient: HttpClient);
    get(options?: RequestOptions): Promise<MerchantResponse>;
    getBusinesses(options?: RequestOptions): Promise<BusinessesResponse>;
    getPaymentAccounts(options?: RequestOptions): Promise<PaymentAccountsResponse>;
}
//# sourceMappingURL=merchant.d.ts.map