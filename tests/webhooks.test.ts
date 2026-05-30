import { createHmac } from 'crypto';
import { WebhookVerifier } from '../src/webhooks/verifier';
import { WebhookConstructor } from '../src/webhooks/constructor';
import { WebhookVerificationError } from '../src/errors/WebhookVerificationError';

describe('WebhookVerifier', () => {
  const secret = 'whsec_test_secret_123';

  it('verifies a valid signature', () => {
    const verifier = new WebhookVerifier(secret);
    const payload = JSON.stringify({ event: 'payment.completed', data: {} });
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    expect(verifier.verify(payload, signature)).toBe(true);
  });

  it('rejects an invalid signature', () => {
    const verifier = new WebhookVerifier(secret);
    const payload = JSON.stringify({ event: 'payment.completed', data: {} });

    expect(verifier.verify(payload, 'invalid_signature')).toBe(false);
  });

  it('rejects when signature is empty', () => {
    const verifier = new WebhookVerifier(secret);
    const payload = JSON.stringify({ event: 'payment.completed' });

    expect(verifier.verify(payload, '')).toBe(false);
  });

  it('allows any signature in dev mode (no secret)', () => {
    const verifier = new WebhookVerifier('');
    const payload = JSON.stringify({ event: 'payment.completed' });

    expect(verifier.verify(payload, 'any_signature')).toBe(true);
  });

  it('calculates signature using HMAC-SHA256 with the secret', () => {
    const verifier = new WebhookVerifier(secret);
    const payload = 'test_payload';
    const expected = createHmac('sha256', secret).update(payload).digest('hex');

    expect(verifier.calculateSignature(payload)).toBe(expected);
  });

  it('produces different signatures for different secrets', () => {
    const verifier1 = new WebhookVerifier('secret_a');
    const verifier2 = new WebhookVerifier('secret_b');
    const payload = 'same_payload';

    expect(verifier1.calculateSignature(payload)).not.toBe(
      verifier2.calculateSignature(payload)
    );
  });

  describe('validateTimestamp', () => {
    it('accepts a recent timestamp', () => {
      const verifier = new WebhookVerifier(secret);
      const timestamp = Date.now().toString();

      expect(verifier.validateTimestamp(timestamp)).toBe(true);
    });

    it('rejects an old timestamp', () => {
      const verifier = new WebhookVerifier(secret);
      const oldTimestamp = (Date.now() - 600000).toString(); // 10 minutes ago

      expect(verifier.validateTimestamp(oldTimestamp)).toBe(false);
    });

    it('allows null timestamp', () => {
      const verifier = new WebhookVerifier(secret);

      expect(verifier.validateTimestamp(null)).toBe(true);
    });

    it('respects custom tolerance', () => {
      const verifier = new WebhookVerifier(secret);
      const timestamp = (Date.now() - 2000).toString(); // 2 seconds ago

      expect(verifier.validateTimestamp(timestamp, 1000)).toBe(false);
      expect(verifier.validateTimestamp(timestamp, 5000)).toBe(true);
    });
  });
});

describe('WebhookConstructor', () => {
  const secret = 'whsec_test_secret';

  it('constructs a valid event', () => {
    const constructor = new WebhookConstructor(secret);
    const payload = JSON.stringify({
      event: 'payment.completed',
      data: { payment: { amount: 1000 }, transaction_id: 'tx_123', provider_reference: 'ref_456' },
    });
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    const event = constructor.constructEvent(payload, signature);
    expect(event.event).toBe('payment.completed');
  });

  it('throws on invalid signature', () => {
    const constructor = new WebhookConstructor(secret);
    const payload = JSON.stringify({ event: 'payment.completed', data: {} });

    expect(() => constructor.constructEvent(payload, 'bad_sig')).toThrow(
      WebhookVerificationError
    );
  });

  it('throws on invalid JSON payload', () => {
    const constructor = new WebhookConstructor(secret);
    const payload = 'not-json';
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    expect(() => constructor.constructEvent(payload, signature)).toThrow(
      WebhookVerificationError
    );
  });

  it('validates timestamp when provided', () => {
    const constructor = new WebhookConstructor(secret);
    const payload = JSON.stringify({ event: 'payment.completed', data: {} });
    const signature = createHmac('sha256', secret).update(payload).digest('hex');
    const oldTimestamp = (Date.now() - 600000).toString();

    expect(() => constructor.constructEvent(payload, signature, oldTimestamp)).toThrow(
      WebhookVerificationError
    );
  });
});
