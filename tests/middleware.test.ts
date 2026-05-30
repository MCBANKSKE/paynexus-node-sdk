import { jest } from '@jest/globals';
import { createHmac } from 'node:crypto';
import { webhookMiddleware } from '../src/webhooks/middleware.js';

const SECRET = 'whsec_test_middleware_secret';

function sign(body: string): string {
  return createHmac('sha256', SECRET).update(body).digest('hex');
}

function nowEpoch(): string {
  return String(Math.floor(Date.now() / 1000));
}

describe('webhookMiddleware', () => {
  const middleware = webhookMiddleware({ secret: SECRET });

  it('passes valid webhook and attaches payload to req', (done) => {
    const body = JSON.stringify({ event: 'payment.completed', timestamp: new Date().toISOString(), data: {} });
    const req = {
      body,
      headers: {
        'x-paynexus-signature': sign(body),
        'x-paynexus-timestamp': nowEpoch(),
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    middleware(req, res, (err?: unknown) => {
      expect(err).toBeUndefined();
      expect((req as Record<string, unknown>).webhookPayload).toBeDefined();
      expect(((req as Record<string, unknown>).webhookPayload as Record<string, unknown>).event).toBe('payment.completed');
      done();
    });
  });

  it('handles Buffer body (express.raw())', (done) => {
    const bodyStr = JSON.stringify({ event: 'payment.failed', timestamp: new Date().toISOString(), data: {} });
    const req = {
      body: Buffer.from(bodyStr),
      headers: {
        'x-paynexus-signature': sign(bodyStr),
        'x-paynexus-timestamp': nowEpoch(),
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    middleware(req, res, (err?: unknown) => {
      expect(err).toBeUndefined();
      expect(((req as Record<string, unknown>).webhookPayload as Record<string, unknown>).event).toBe('payment.failed');
      done();
    });
  });

  it('rejects invalid signature with 400', () => {
    const body = JSON.stringify({ event: 'payment.completed', timestamp: new Date().toISOString(), data: {} });
    const req = {
      body,
      headers: {
        'x-paynexus-signature': 'invalid',
        'x-paynexus-timestamp': nowEpoch(),
      },
    };
    const jsonFn = jest.fn();
    const res = {
      status: jest.fn().mockReturnValue({ json: jsonFn }),
      json: jsonFn,
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'webhook_verification_failed' }),
    );
  });

  it('handles object body (already parsed by body-parser)', (done) => {
    const bodyObj = { event: 'payment.completed', timestamp: new Date().toISOString(), data: { id: 1 } };
    const bodyStr = JSON.stringify(bodyObj);
    const req = {
      body: bodyObj,
      headers: {
        'x-paynexus-signature': sign(bodyStr),
        'x-paynexus-timestamp': nowEpoch(),
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    middleware(req, res, (err?: unknown) => {
      expect(err).toBeUndefined();
      done();
    });
  });
});
