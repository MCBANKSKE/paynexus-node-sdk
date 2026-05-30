import { verifyWebhookSignature, type VerifyOptions } from './verify.js';
import type { WebhookPayload } from '../types.js';

// Express-compatible types so we don't require the express import at compile time
interface Req {
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  json(body: unknown): void;
}
type NextFn = (err?: unknown) => void;

export interface WebhookMiddlewareOptions extends VerifyOptions {
  secret: string;
}

/**
 * Express middleware that verifies incoming PayNexus webhooks.
 *
 * Attach the parsed `WebhookPayload` to `req.webhookPayload`.
 *
 * **Important**: The middleware needs the _raw_ request body. Make sure you
 * configure Express to provide it, e.g.:
 *
 * ```ts
 * app.use('/webhooks', express.raw({ type: 'application/json' }));
 * ```
 *
 * or use `express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } })`.
 */
export function webhookMiddleware(opts: WebhookMiddlewareOptions) {
  return (req: Req, res: Res, next: NextFn): void => {
    try {
      const rawBody = getRawBody(req);
      const signature = getHeader(req, 'x-paynexus-signature');
      const timestamp = getHeader(req, 'x-paynexus-timestamp');

      const payload = verifyWebhookSignature(rawBody, signature, timestamp, opts.secret, opts);

      // Attach to request for downstream handlers
      (req as Req & { webhookPayload: WebhookPayload }).webhookPayload = payload;

      next();
    } catch (err) {
      res.status(400).json({
        error: 'webhook_verification_failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };
}

function getRawBody(req: Req): string {
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString('utf8');
  }
  if (typeof req.body === 'string') {
    return req.body;
  }
  if (typeof req.body === 'object' && req.body !== null) {
    // body-parser already parsed JSON — re-serialize for verification
    return JSON.stringify(req.body);
  }
  throw new Error('Cannot extract raw body from request. Use express.raw() or provide rawBody.');
}

function getHeader(req: Req, name: string): string {
  const val = req.headers[name];
  if (Array.isArray(val)) return val[0] ?? '';
  return val ?? '';
}
