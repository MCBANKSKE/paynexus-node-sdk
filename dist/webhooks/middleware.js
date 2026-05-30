import { WebhookVerifier } from './verifier.js';
import { WebhookVerificationError } from '../errors/index.js';
export function createWebhookMiddleware(options) {
    const verifier = new WebhookVerifier(options.secret);
    return async (req, res, _next) => {
        try {
            const signature = req.headers['x-paynexus-signature'];
            const timestamp = req.headers['x-paynexus-timestamp'];
            const payload = req.body;
            if (!signature) {
                throw new WebhookVerificationError('Missing webhook signature');
            }
            // Verify signature
            if (!verifier.verify(payload, signature)) {
                throw new WebhookVerificationError('Invalid webhook signature');
            }
            // Validate timestamp if provided
            if (timestamp && !verifier.validateTimestamp(timestamp)) {
                throw new WebhookVerificationError('Webhook timestamp outside tolerance window');
            }
            // Parse payload
            const event = JSON.parse(payload);
            // Emit event if client is provided
            if (options.client) {
                options.client.emitWebhookReceived(event);
            }
            res.json({ received: true });
        }
        catch (error) {
            if (error instanceof WebhookVerificationError) {
                res.status(403).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };
}
//# sourceMappingURL=middleware.js.map