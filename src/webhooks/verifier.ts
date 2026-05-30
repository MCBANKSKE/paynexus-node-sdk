import { createHmac } from 'crypto';
import { DEFAULT_CONFIG } from '../utils/constants.js';

export class WebhookVerifier {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  verify(payload: string, signature: string): boolean {
    if (!this.secret) {
      return true; // Allow if no secret configured (development)
    }

    if (!signature) {
      return false;
    }

    const expected = this.calculateSignature(payload);

    // Use timing-safe comparison to prevent timing attacks
    return this.timingSafeEqual(expected, signature);
  }

  calculateSignature(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('hex');
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  validateTimestamp(timestamp: string | null, toleranceMs: number = DEFAULT_CONFIG.webhookTolerance): boolean {
    if (!timestamp) {
      return true; // Allow if no timestamp provided
    }

    const timestampMs = parseInt(timestamp, 10);
    const now = Date.now();
    const diff = Math.abs(now - timestampMs);

    return diff <= toleranceMs;
  }
}
