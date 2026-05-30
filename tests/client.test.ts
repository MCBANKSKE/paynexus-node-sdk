import { PayNexusClient } from '../src/client/PayNexusClient';
import { HttpClient } from '../src/client/http';
import { PaymentsResource } from '../src/client/resources/payments';
import { MerchantResource } from '../src/client/resources/merchant';
import { WebhooksResource } from '../src/client/resources/webhooks';

describe('PayNexusClient', () => {
  it('initializes with required config', () => {
    const client = new PayNexusClient({
      secretKey: 'sk_test_123',
    });

    expect(client).toBeInstanceOf(PayNexusClient);
    expect(client.payments).toBeInstanceOf(PaymentsResource);
    expect(client.merchant).toBeInstanceOf(MerchantResource);
    expect(client.webhooks).toBeInstanceOf(WebhooksResource);
  });

  it('initializes with full config', () => {
    const client = new PayNexusClient({
      secretKey: 'sk_test_123',
      publicKey: 'pk_test_456',
      baseUrl: 'https://api.example.com',
      webhookSecret: 'whsec_test',
      timeout: 60000,
      retries: 5,
      logLevel: 'debug',
      autoIdempotency: false,
    });

    expect(client).toBeInstanceOf(PayNexusClient);
  });

  it('exposes the underlying HTTP client', () => {
    const client = new PayNexusClient({
      secretKey: 'sk_test_123',
    });

    expect(client.getHttpClient()).toBeInstanceOf(HttpClient);
  });

  it('defaults autoIdempotency to true', () => {
    const client = new PayNexusClient({
      secretKey: 'sk_test_123',
    });

    expect(client.payments).toBeDefined();
  });
});
