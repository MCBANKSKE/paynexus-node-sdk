import { HttpClient } from './http.js';
import { PaymentsResource } from './resources/payments.js';
import { MerchantResource } from './resources/merchant.js';
import { WebhooksResource } from './resources/webhooks.js';
import { PayNexusEventEmitter } from '../events/EventEmitter.js';
import type { PayNexusConfig } from '../types/index.js';
export declare class PayNexusClient extends PayNexusEventEmitter {
    private httpClient;
    payments: PaymentsResource;
    merchant: MerchantResource;
    webhooks: WebhooksResource;
    private logger;
    constructor(config: PayNexusConfig);
    getHttpClient(): HttpClient;
}
//# sourceMappingURL=PayNexusClient.d.ts.map