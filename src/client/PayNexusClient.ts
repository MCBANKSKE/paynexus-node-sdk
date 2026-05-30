import { HttpClient } from './http.js';
import { PaymentsResource } from './resources/payments.js';
import { MerchantResource } from './resources/merchant.js';
import { WebhooksResource } from './resources/webhooks.js';
import { PayNexusEventEmitter } from '../events/EventEmitter.js';
import { Logger } from '../utils/logger.js';
import type { PayNexusConfig } from '../types/index.js';
import { DEFAULT_CONFIG } from '../utils/constants.js';

export class PayNexusClient extends PayNexusEventEmitter {
  private httpClient: HttpClient;
  public payments: PaymentsResource;
  public merchant: MerchantResource;
  public webhooks: WebhooksResource;
  private logger: Logger;

  constructor(config: PayNexusConfig) {
    super();

    const baseUrl = config.baseUrl || DEFAULT_CONFIG.baseUrl;
    const timeout = config.timeout || DEFAULT_CONFIG.timeout;
    const retries = config.retries || DEFAULT_CONFIG.retries;
    const logLevel = config.logLevel || DEFAULT_CONFIG.logLevel;
    const autoIdempotency = config.autoIdempotency !== undefined ? config.autoIdempotency : DEFAULT_CONFIG.autoIdempotency;

    this.logger = new Logger(logLevel);

    this.httpClient = new HttpClient(
      config.secretKey,
      baseUrl,
      timeout,
      retries,
      logLevel,
      config.httpClient,
      config.publicKey
    );

    this.payments = new PaymentsResource(this.httpClient, autoIdempotency);
    this.merchant = new MerchantResource(this.httpClient);
    this.webhooks = new WebhooksResource(this.httpClient, config.webhookSecret);

    this.logger.info('PayNexus client initialized', {
      baseUrl,
      autoIdempotency,
    });
  }

  getHttpClient(): HttpClient {
    return this.httpClient;
  }
}
