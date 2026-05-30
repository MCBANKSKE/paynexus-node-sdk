export const SDK_VERSION = '1.0.0';

export const DEFAULT_CONFIG = {
  baseUrl: 'https://paynexus.co.ke',
  currency: 'KES',
  timeout: 30000, // 30 seconds
  retries: 2,
  logLevel: 'info' as const,
  autoIdempotency: true,
  pollInterval: 3000, // 3 seconds
  pollTimeout: 120000, // 2 minutes
  webhookTolerance: 300000, // 5 minutes in milliseconds
} as const;

export const WEBHOOK_TOLERANCE = 300000; // 5 minutes in milliseconds

export const HTTP_HEADERS = {
  ACCEPT: 'Accept',
  CONTENT_TYPE: 'Content-Type',
  JSON: 'application/json',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
} as const;

export const WEBHOOK_EVENTS = {
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
} as const;
