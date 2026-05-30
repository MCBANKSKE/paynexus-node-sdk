import { PayNexusError } from './PayNexusError.js';
export class WebhookVerificationError extends PayNexusError {
    constructor(message = 'Webhook signature verification failed', requestId) {
        super(message, 403, requestId);
        this.name = 'WebhookVerificationError';
        Object.setPrototypeOf(this, WebhookVerificationError.prototype);
    }
}
//# sourceMappingURL=WebhookVerificationError.js.map