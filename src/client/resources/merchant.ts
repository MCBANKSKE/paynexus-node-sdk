import { HttpClient } from '../http.js';
import type {
  MerchantResponse,
  BusinessesResponse,
  PaymentAccountsResponse,
  RequestOptions,
} from '../../types/index.js';

export class MerchantResource {
  constructor(private httpClient: HttpClient) {}

  async get(options?: RequestOptions): Promise<MerchantResponse> {
    const { data: responseData, requestId } = await this.httpClient.request<any>({
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

  async getBusinesses(options?: RequestOptions): Promise<BusinessesResponse> {
    const { data: responseData, requestId } = await this.httpClient.request<any>({
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

  async getPaymentAccounts(options?: RequestOptions): Promise<PaymentAccountsResponse> {
    const { data: responseData, requestId } = await this.httpClient.request<any>({
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
