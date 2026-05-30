import { PayNexusError } from './PayNexusError.js';

export class WebhookVerificationError extends PayNexusError {
  constructor(message: string = 'Webhook signature verification failed', requestId?: string) {
    super(message, 403, requestId);
    this.name = 'WebhookVerificationError';
    Object.setPrototypeOf(this, WebhookVerificationError.prototype);
  }
}
