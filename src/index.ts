import { HttpClient } from './http.js';
import { PaymentsResource } from './resources/payments.js';
import { WebhooksResource } from './resources/webhooks.js';
import { MerchantResource } from './resources/merchant.js';
import { ApiKeysResource } from './resources/apiKeys.js';
import { verifyWebhookSignature } from './webhooks/verify.js';
import type { PayNexusConfig, WebhookPayload } from './types.js';
import type { VerifyOptions } from './webhooks/verify.js';

const DEFAULT_BASE_URL = 'https://api.paynexus.co.ke/api';
const DEFAULT_TIMEOUT = 30_000;

export class PayNexus {
  readonly payments: PaymentsResource;
  readonly webhooks: WebhooksResource;
  readonly merchant: MerchantResource;
  readonly apiKeys: ApiKeysResource;

  private readonly webhookSecret?: string;

  constructor(config: PayNexusConfig) {
    if (!config.secretKey) {
      throw new Error('PayNexus: secretKey is required');
    }

    const http = new HttpClient({
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      secretKey: config.secretKey,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    });

    this.payments = new PaymentsResource(http);
    this.webhooks = new WebhooksResource(http);
    this.merchant = new MerchantResource(http);
    this.apiKeys = new ApiKeysResource(http);
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Verify and parse an incoming webhook.
   *
   * @param rawBody   Raw request body string.
   * @param signature Value of the `X-PayNexus-Signature` header.
   * @param timestamp Value of the `X-PayNexus-Timestamp` header.
   * @param options   Optional settings (e.g. custom tolerance).
   */
  verifyWebhook(rawBody: string, signature: string, timestamp: string, options?: VerifyOptions): WebhookPayload {
    if (!this.webhookSecret) {
      throw new Error('PayNexus: webhookSecret is required to verify webhooks');
    }
    return verifyWebhookSignature(rawBody, signature, timestamp, this.webhookSecret, options);
  }
}

// Default export for convenient `import PayNexus from 'paynexus'`
export default PayNexus;

// Re-export everything consumers might need
export type {
  PayNexusConfig,
  ApiResponse,
  Pagination,
  InitiatePaymentParams,
  PaymentData,
  Payment,
  PaymentAccountSummary,
  PaymentStatus,
  StatusByCheckoutIdParams,
  ListPaymentsParams,
  WebhookEvent,
  RegisterWebhookParams,
  UpdateWebhookParams,
  Webhook,
  WebhookPayload,
  Merchant,
  Business,
  PaymentAccount,
  CreateApiKeyParams,
  UpdateApiKeyParams,
  ApiKey,
  RequestOptions,
} from './types.js';

export {
  PayNexusError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
  WebhookVerificationError,
} from './errors/index.js';

export { verifyWebhookSignature } from './webhooks/verify.js';
export { webhookMiddleware, type WebhookMiddlewareOptions } from './webhooks/middleware.js';
export type { VerifyOptions } from './webhooks/verify.js';
