import { createHmac } from 'node:crypto';
import { verifyWebhookSignature } from '../src/webhooks/verify.js';
import { WebhookVerificationError } from '../src/errors/WebhookVerificationError.js';

const SECRET = 'whsec_test_secret_1234567890abcdef';

function sign(body: string, secret: string = SECRET): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

function nowEpoch(): string {
  return String(Math.floor(Date.now() / 1000));
}

describe('verifyWebhookSignature', () => {
  const payload = JSON.stringify({
    event: 'payment.completed',
    timestamp: new Date().toISOString(),
    data: { payment_id: 1, amount: 500 },
  });

  it('verifies a valid signature', () => {
    const sig = sign(payload);
    const ts = nowEpoch();
    const result = verifyWebhookSignature(payload, sig, ts, SECRET);
    expect(result.event).toBe('payment.completed');
    expect(result.data.payment_id).toBe(1);
  });

  it('rejects wrong signature', () => {
    const ts = nowEpoch();
    expect(() => verifyWebhookSignature(payload, 'badsig', ts, SECRET)).toThrow(WebhookVerificationError);
    expect(() => verifyWebhookSignature(payload, 'badsig', ts, SECRET)).toThrow('Signature mismatch');
  });

  it('rejects wrong secret', () => {
    const sig = sign(payload, 'wrong_secret');
    const ts = nowEpoch();
    expect(() => verifyWebhookSignature(payload, sig, ts, SECRET)).toThrow('Signature mismatch');
  });

  it('rejects tampered body', () => {
    const sig = sign(payload);
    const ts = nowEpoch();
    const tampered = payload.replace('500', '999');
    expect(() => verifyWebhookSignature(tampered, sig, ts, SECRET)).toThrow('Signature mismatch');
  });

  it('rejects expired timestamp', () => {
    const sig = sign(payload);
    const oldTs = String(Math.floor(Date.now() / 1000) - 600); // 10 min ago
    expect(() => verifyWebhookSignature(payload, sig, oldTs, SECRET)).toThrow('too old');
  });

  it('accepts timestamp within custom tolerance', () => {
    const sig = sign(payload);
    const ts = String(Math.floor(Date.now() / 1000) - 400); // 6m40s ago
    // Default 5min tolerance should reject, but 10min should accept
    expect(() => verifyWebhookSignature(payload, sig, ts, SECRET)).toThrow('too old');
    const result = verifyWebhookSignature(payload, sig, ts, SECRET, { tolerance: 600_000 });
    expect(result.event).toBe('payment.completed');
  });

  it('rejects invalid timestamp', () => {
    const sig = sign(payload);
    expect(() => verifyWebhookSignature(payload, sig, 'notanumber', SECRET)).toThrow('Invalid timestamp');
  });

  it('rejects missing body', () => {
    expect(() => verifyWebhookSignature('', 'sig', nowEpoch(), SECRET)).toThrow('Missing webhook body');
  });

  it('rejects missing signature', () => {
    expect(() => verifyWebhookSignature(payload, '', nowEpoch(), SECRET)).toThrow('Missing X-PayNexus-Signature');
  });

  it('rejects missing timestamp', () => {
    const sig = sign(payload);
    expect(() => verifyWebhookSignature(payload, sig, '', SECRET)).toThrow('Missing X-PayNexus-Timestamp');
  });

  it('rejects missing secret', () => {
    const sig = sign(payload);
    expect(() => verifyWebhookSignature(payload, sig, nowEpoch(), '')).toThrow('Missing webhook secret');
  });

  it('rejects invalid JSON body (valid sig but bad JSON)', () => {
    const bad = 'not json';
    const sig = sign(bad);
    expect(() => verifyWebhookSignature(bad, sig, nowEpoch(), SECRET)).toThrow('Invalid JSON');
  });
});
