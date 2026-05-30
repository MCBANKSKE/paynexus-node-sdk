import { jest } from '@jest/globals';
import { PayNexus } from '../src/index.js';

// Mock global fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: new Headers(),
  } as Response;
}

describe('PaymentsResource', () => {
  let client: PayNexus;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PayNexus({ secretKey: 'sk_test_abc' });
  });

  it('initiate sends POST /payments/initiate', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: {
        payment_id: 1,
        reference: 'PAY-123',
        checkout_request_id: 'ws_CO_123',
        merchant_request_id: 'mr_123',
        amount: 100,
        currency: 'KES',
        phone: '254712345678',
        status: 'pending',
        response_code: '0',
        response_description: 'Success',
        customer_message: 'Enter PIN',
      },
      message: 'Payment initiated successfully',
    }));

    const result = await client.payments.initiate({
      payment_account_id: 1,
      amount: 100,
      phone: '254712345678',
    });

    expect(result.success).toBe(true);
    expect(result.data?.payment_id).toBe(1);
    expect(result.data?.status).toBe('pending');

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/payments/initiate');
    expect(init?.method).toBe('POST');
    const body = JSON.parse(init?.body as string);
    expect(body.amount).toBe(100);
    expect(body.phone).toBe('254712345678');
  });

  it('getByReference sends GET /payments/:reference', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: { id: 1, reference: 'PAY-123', status: 'completed' },
    }));

    const result = await client.payments.getByReference('PAY-123');
    expect(result.data?.reference).toBe('PAY-123');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/payments/PAY-123');
  });

  it('getById sends GET /payments/:id/status-by-id', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: { id: 42, reference: 'PAY-42', status: 'pending' },
    }));

    const result = await client.payments.getById(42);
    expect(result.data?.id).toBe(42);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/payments/42/status-by-id');
  });

  it('getByCheckoutId sends POST /payments/status-by-checkout-id', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: { id: 1, status: 'completed' },
    }));

    await client.payments.getByCheckoutId({ checkout_request_id: 'ws_CO_123' });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/payments/status-by-checkout-id');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string).checkout_request_id).toBe('ws_CO_123');
  });

  it('list sends GET /payments with filters', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: [],
      pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1, from: null, to: null },
    }));

    await client.payments.list({ status: 'completed', per_page: 10 });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('status=completed');
    expect(url).toContain('per_page=10');
  });
});

describe('WebhooksResource', () => {
  let client: PayNexus;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PayNexus({ secretKey: 'sk_test_abc' });
  });

  it('register sends POST /webhooks/register', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: { id: 1, name: 'My Webhook', url: 'https://example.com/hook', secret: 'whsec_abc', events: ['payment.completed'] },
    }));

    const result = await client.webhooks.register({
      name: 'My Webhook',
      url: 'https://example.com/hook',
      events: ['payment.completed'],
    });

    expect(result.data?.secret).toBe('whsec_abc');
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/webhooks/register');
    expect(init?.method).toBe('POST');
  });

  it('update sends PUT /webhooks/:id', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: { id: 1 } }));

    await client.webhooks.update(1, { name: 'Updated' });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/webhooks/1');
    expect(init?.method).toBe('PUT');
  });

  it('delete sends DELETE /webhooks/:id', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true }));

    await client.webhooks.delete(1);

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/webhooks/1');
    expect(init?.method).toBe('DELETE');
  });

  it('list sends GET /webhooks', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    await client.webhooks.list();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/webhooks');
  });
});

describe('MerchantResource', () => {
  let client: PayNexus;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PayNexus({ secretKey: 'sk_test_abc' });
  });

  it('get sends GET /merchant', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: { id: 1, business_name: 'Test Co', status: 'approved' },
    }));

    const result = await client.merchant.get();
    expect(result.data?.business_name).toBe('Test Co');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/merchant');
  });

  it('businesses sends GET /merchant/businesses', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    await client.merchant.businesses();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/merchant/businesses');
  });

  it('paymentAccounts sends GET /merchant/payment-accounts', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    await client.merchant.paymentAccounts();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/merchant/payment-accounts');
  });
});

describe('ApiKeysResource', () => {
  let client: PayNexus;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new PayNexus({ secretKey: 'sk_test_abc' });
  });

  it('create sends POST /api-keys', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, {
      success: true,
      data: { id: 1, name: 'New Key', api_key: 'sk_abc123' },
    }));

    const result = await client.apiKeys.create({
      name: 'New Key',
      payment_account_id: 1,
      permissions: ['payments.create'],
    });

    expect(result.data?.api_key).toBe('sk_abc123');
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/api-keys');
    expect(init?.method).toBe('POST');
  });

  it('list sends GET /api-keys', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    await client.apiKeys.list();

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/api-keys');
  });

  it('update sends PUT /api-keys/:id', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: { id: 1 } }));

    await client.apiKeys.update(1, { name: 'Renamed', status: 'inactive' });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/api-keys/1');
    expect(init?.method).toBe('PUT');
  });

  it('delete sends DELETE /api-keys/:id', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true }));

    await client.apiKeys.delete(1);

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/api-keys/1');
    expect(init?.method).toBe('DELETE');
  });
});
