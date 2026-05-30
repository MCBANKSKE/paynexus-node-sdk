import { WebhookVerifier } from './verifier.js';
import { WebhookVerificationError } from '../errors/index.js';
import type { WebhookEvent } from '../types/webhooks.js';

export class WebhookConstructor {
  private verifier: WebhookVerifier;

  constructor(secret: string) {
    this.verifier = new WebhookVerifier(secret);
  }

  constructEvent(payload: string, signature: string, timestamp?: string): WebhookEvent {
    // Verify signature
    if (!this.verifier.verify(payload, signature)) {
      throw new WebhookVerificationError('Invalid webhook signature');
    }

    // Validate timestamp if provided
    if (timestamp && !this.verifier.validateTimestamp(timestamp)) {
      throw new WebhookVerificationError('Webhook timestamp outside tolerance window');
    }

    // Parse payload
    try {
      const event = JSON.parse(payload);
      return event as WebhookEvent;
    } catch (error) {
      throw new WebhookVerificationError('Failed to parse webhook payload');
    }
  }
}
