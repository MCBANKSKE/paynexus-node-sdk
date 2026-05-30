import PayNexusClient, {
  HttpClient,
  PaymentsResource,
  MerchantResource,
  WebhooksResource,
  PayNexusEventEmitter,
  WebhookVerifier,
  WebhookConstructor,
  createWebhookMiddleware,
  PayNexusError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  APIConnectionError,
  WebhookVerificationError,
  DEFAULT_CONFIG,
  SDK_VERSION,
  PAYMENT_STATUS,
  WEBHOOK_EVENTS,
  generateIdempotencyKey,
  Logger,
} from '../src/index';

describe('SDK exports', () => {
  it('exports PayNexusClient as default', () => {
    expect(PayNexusClient).toBeDefined();
    expect(typeof PayNexusClient).toBe('function');
  });

  it('exports all client classes', () => {
    expect(HttpClient).toBeDefined();
    expect(PaymentsResource).toBeDefined();
    expect(MerchantResource).toBeDefined();
    expect(WebhooksResource).toBeDefined();
    expect(PayNexusEventEmitter).toBeDefined();
  });

  it('exports webhook utilities', () => {
    expect(WebhookVerifier).toBeDefined();
    expect(WebhookConstructor).toBeDefined();
    expect(createWebhookMiddleware).toBeDefined();
  });

  it('exports all error classes', () => {
    expect(PayNexusError).toBeDefined();
    expect(AuthenticationError).toBeDefined();
    expect(ValidationError).toBeDefined();
    expect(RateLimitError).toBeDefined();
    expect(APIConnectionError).toBeDefined();
    expect(WebhookVerificationError).toBeDefined();
  });

  it('exports constants', () => {
    expect(DEFAULT_CONFIG).toBeDefined();
    expect(SDK_VERSION).toBe('1.0.0');
    expect(PAYMENT_STATUS).toBeDefined();
    expect(WEBHOOK_EVENTS).toBeDefined();
  });

  it('exports utilities', () => {
    expect(generateIdempotencyKey).toBeDefined();
    expect(Logger).toBeDefined();
  });
});
