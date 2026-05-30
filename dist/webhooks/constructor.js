import { WebhookVerifier } from './verifier.js';
import { WebhookVerificationError } from '../errors/index.js';
export class WebhookConstructor {
    verifier;
    constructor(secret) {
        this.verifier = new WebhookVerifier(secret);
    }
    constructEvent(payload, signature, timestamp) {
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
            return event;
        }
        catch (error) {
            throw new WebhookVerificationError('Failed to parse webhook payload');
        }
    }
}
//# sourceMappingURL=constructor.js.map