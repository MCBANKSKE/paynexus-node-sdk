import { Request, Response, NextFunction } from 'express';
import { WebhookVerifier } from './verifier.js';
import { WebhookVerificationError } from '../errors/index.js';
import type { PayNexusClient } from '../client/PayNexusClient.js';

export interface WebhookMiddlewareOptions {
  secret: string;
  client?: PayNexusClient;
}

export function createWebhookMiddleware(options: WebhookMiddlewareOptions) {
  const verifier = new WebhookVerifier(options.secret);

  return async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const signature = req.headers['x-paynexus-signature'] as string;
      const timestamp = req.headers['x-paynexus-timestamp'] as string;
      const payload = req.body as string;

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
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
