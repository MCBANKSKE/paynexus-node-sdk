import { PayNexusError } from './PayNexusError.js';

export class WebhookVerificationError extends PayNexusError {
  constructor(message = 'Webhook signature verification failed') {
    super(message, 400, 'webhook_verification_error');
    this.name = 'WebhookVerificationError';
  }
}
