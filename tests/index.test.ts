import { PayNexus } from '../src/index.js';

describe('PayNexus', () => {
  it('requires secretKey', () => {
    expect(() => new PayNexus({ secretKey: '' })).toThrow('secretKey is required');
  });

  it('exposes resource accessors', () => {
    const client = new PayNexus({ secretKey: 'sk_test_abc' });
    expect(client.payments).toBeDefined();
    expect(client.webhooks).toBeDefined();
    expect(client.merchant).toBeDefined();
    expect(client.apiKeys).toBeDefined();
  });

  it('verifyWebhook throws when webhookSecret is not configured', () => {
    const client = new PayNexus({ secretKey: 'sk_test_abc' });
    expect(() => client.verifyWebhook('{}', 'sig', '12345')).toThrow('webhookSecret is required');
  });
});
