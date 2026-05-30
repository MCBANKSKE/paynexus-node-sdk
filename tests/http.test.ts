import { jest } from '@jest/globals';
import { HttpClient } from '../src/http.js';
import { AuthenticationError, NotFoundError, ValidationError, RateLimitError, PayNexusError } from '../src/errors/index.js';

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

describe('HttpClient', () => {
  let http: HttpClient;

  beforeEach(() => {
    mockFetch.mockReset();
    http = new HttpClient({
      baseUrl: 'https://api.paynexus.co.ke/api',
      secretKey: 'sk_test_abc123',
      timeout: 5000,
    });
  });

  it('sends GET with correct headers', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: { id: 1 } }));

    const result = await http.get('/merchant');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.paynexus.co.ke/api/merchant');
    expect((init?.headers as Record<string, string>)['X-API-Key']).toBe('sk_test_abc123');
    expect((init?.headers as Record<string, string>)['Accept']).toBe('application/json');
    expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init?.method).toBe('GET');
    expect(result.success).toBe(true);
  });

  it('sends GET with query params', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    await http.get('/payments', { status: 'completed', per_page: 10 });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('status=completed');
    expect(url).toContain('per_page=10');
  });

  it('sends POST with JSON body', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: { payment_id: 42 } }));

    await http.post('/payments/initiate', { amount: 100, phone: '254712345678' });

    const [, init] = mockFetch.mock.calls[0];
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual({ amount: 100, phone: '254712345678' });
  });

  it('sends PUT with JSON body', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true }));

    await http.put('/webhooks/1', { name: 'updated' });

    const [, init] = mockFetch.mock.calls[0];
    expect(init?.method).toBe('PUT');
  });

  it('sends DELETE', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true }));

    await http.delete('/webhooks/1');

    const [, init] = mockFetch.mock.calls[0];
    expect(init?.method).toBe('DELETE');
    expect(init?.body).toBeUndefined();
  });

  it('throws AuthenticationError on 401', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(401, { success: false, error: 'Unauthorized', message: 'Invalid API key' }));

    await expect(http.get('/merchant')).rejects.toThrow(AuthenticationError);
  });

  it('throws NotFoundError on 404', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(404, { success: false, error: 'Not found' }));

    await expect(http.get('/payments/nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('throws ValidationError on 422', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(422, {
      success: false,
      error: 'Validation failed',
      message: 'amount is required',
      errors: { amount: ['The amount field is required'] },
    }));

    try {
      await http.post('/payments/initiate', {});
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).errors).toEqual({ amount: ['The amount field is required'] });
    }
  });

  it('throws RateLimitError on 429', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(429, { message: 'Too many requests' }));

    await expect(http.get('/merchant')).rejects.toThrow(RateLimitError);
  });

  it('throws PayNexusError on other status codes', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(500, { message: 'Internal error' }));

    try {
      await http.get('/merchant');
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PayNexusError);
      expect((err as PayNexusError).status).toBe(500);
    }
  });

  it('throws on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    try {
      await http.get('/merchant');
      fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PayNexusError);
      expect((err as PayNexusError).code).toBe('network_error');
    }
  });

  it('omits undefined query params', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    await http.get('/payments', { status: undefined, per_page: 20 });

    const [url] = mockFetch.mock.calls[0];
    expect(url).not.toContain('status');
    expect(url).toContain('per_page=20');
  });

  it('strips trailing slash from base URL', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.paynexus.co.ke/api/',
      secretKey: 'sk_test',
      timeout: 5000,
    });
    mockFetch.mockResolvedValueOnce(jsonResponse(200, { success: true }));

    await client.get('/merchant');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.paynexus.co.ke/api/merchant');
  });
});
