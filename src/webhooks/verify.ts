import { createHmac, timingSafeEqual } from 'node:crypto';
import { WebhookVerificationError } from '../errors/WebhookVerificationError.js';
import type { WebhookPayload } from '../types.js';

/**
 * Default tolerance window for webhook timestamps: 5 minutes (in ms).
 */
const DEFAULT_TOLERANCE_MS = 300_000;

export interface VerifyOptions {
  /** Max allowed age of the webhook timestamp in milliseconds. Default 300 000 (5 min). */
  tolerance?: number;
}

/**
 * Verify and parse an incoming PayNexus webhook.
 *
 * The PayNexus backend sends:
 *   - `X-PayNexus-Signature` — HMAC-SHA256 hex digest of the raw JSON body
 *   - `X-PayNexus-Timestamp` — Unix epoch seconds when the webhook was sent
 *
 * @param rawBody  The raw request body string (unparsed JSON).
 * @param signature  Value of the `X-PayNexus-Signature` header.
 * @param timestamp  Value of the `X-PayNexus-Timestamp` header.
 * @param secret  The webhook secret (`whsec_...`).
 * @param options  Optional verification settings.
 * @returns  The parsed webhook payload.
 * @throws  WebhookVerificationError  if verification fails.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secret: string,
  options?: VerifyOptions,
): WebhookPayload {
  if (!rawBody) {
    throw new WebhookVerificationError('Missing webhook body');
  }
  if (!signature) {
    throw new WebhookVerificationError('Missing X-PayNexus-Signature header');
  }
  if (!timestamp) {
    throw new WebhookVerificationError('Missing X-PayNexus-Timestamp header');
  }
  if (!secret) {
    throw new WebhookVerificationError('Missing webhook secret');
  }

  // Verify timestamp freshness
  const tolerance = options?.tolerance ?? DEFAULT_TOLERANCE_MS;
  const ts = Number(timestamp);
  if (Number.isNaN(ts)) {
    throw new WebhookVerificationError('Invalid timestamp');
  }
  const age = Math.abs(Date.now() - ts * 1000);
  if (age > tolerance) {
    throw new WebhookVerificationError(
      `Webhook timestamp too old (age: ${Math.round(age / 1000)}s, tolerance: ${Math.round(tolerance / 1000)}s)`,
    );
  }

  // Compute expected signature: HMAC-SHA256(body, secret)
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');

  // Constant-time comparison
  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new WebhookVerificationError('Signature mismatch');
  }

  try {
    return JSON.parse(rawBody) as WebhookPayload;
  } catch {
    throw new WebhookVerificationError('Invalid JSON in webhook body');
  }
}
