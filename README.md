# paynexus

The official Node.js SDK for [PayNexus](https://www.paynexus.co.ke) — a payment orchestration platform that lets merchants accept M-Pesa STK Push payments routed directly into their own accounts.

Built with TypeScript. Designed to feel like Stripe's SDK.

## Installation

```bash
npm install paynexus
```

**Requirements:** Node.js 18 or later.

## Quick Start

```typescript
import PayNexus from 'paynexus';

// 1. Create a client
const paynexus = new PayNexus({
  secretKey: 'sk_live_your_secret_key',
  baseUrl: 'https://paynexus.co.ke',
});

// 2. Initiate a payment (M-Pesa STK Push)
const result = await paynexus.payments.initiate({
  amount: 1500,
  phone: '254712345678',
  description: 'Order #123',
});

if (result.success) {
  console.log('STK Push sent:', result.data?.checkout_request_id);

  // 3. Wait for the customer to confirm on their phone
  const final = await paynexus.payments.poll(
    result.data!.checkout_request_id!,
    { timeout: 120_000, interval: 3_000 }
  );

  console.log('Payment status:', final.data?.status); // 'completed' | 'failed' | 'timeout'
}
```

## How It Works

```
Your App  ──▶  PayNexus API  ──▶  M-Pesa (Daraja)
                   │                     │
                   │◀── callback ───────▶│
                   │                     │
                   ▼                     ▼
            Payment status         Customer pays via
            updated + webhook      STK Push on their phone
            sent to your app
```

Money flows directly from the customer to the merchant's M-Pesa account. PayNexus orchestrates the payment — it never holds funds.

## Configuration

```typescript
import PayNexus from 'paynexus';

const paynexus = new PayNexus({
  // Required
  secretKey: 'sk_live_...',          // Your API secret key (from PayNexus dashboard)

  // Optional
  baseUrl: 'https://paynexus.co.ke', // API base URL (default)
  publicKey: 'pk_live_...',          // For client-side operations
  webhookSecret: 'whsec_...',       // For verifying webhook signatures
  timeout: 30_000,                   // Request timeout in ms (default: 30s)
  retries: 2,                        // Retry failed requests (default: 2)
  logLevel: 'info',                  // 'debug' | 'info' | 'warn' | 'error'
  autoIdempotency: true,             // Auto-generate idempotency keys (default: true)
  httpClient: customAxiosInstance,   // Bring your own Axios instance
});
```

## Payments

### Initiate a Payment

Sends an M-Pesa STK Push prompt to the customer's phone:

```typescript
const result = await paynexus.payments.initiate({
  amount: 1500,                         // Amount in KES
  phone: '254712345678',                // Customer phone (M-Pesa format)
  description: 'Order #123',            // Shown to customer (optional)
  accountReference: 'order-123',        // Your internal reference (optional)
  paymentAccountId: 1,                  // Which payment account to use (optional)
  metadata: { orderId: 123 },           // Custom data stored with payment (optional)
  idempotencyKey: 'my-custom-key',      // Prevent duplicate charges (auto-generated if omitted)
});

// result.success    → boolean
// result.data       → PaymentData (checkout_request_id, reference, status, etc.)
// result.requestId  → unique request ID for debugging
// result.message    → human-readable status message
```

### Verify a Payment

Check the status of a payment by its checkout request ID:

```typescript
const payment = await paynexus.payments.verify('ws_CO_123456789');
console.log(payment.data?.status); // 'pending' | 'completed' | 'failed' | 'timeout'
```

### Poll Until Complete

Wait for a payment to reach a terminal state. Useful after initiating an STK Push:

```typescript
const final = await paynexus.payments.poll('ws_CO_123456789', {
  timeout: 120_000,  // Stop polling after 2 minutes (default)
  interval: 3_000,   // Check every 3 seconds (default)
});

if (final.data?.status === 'completed') {
  console.log('Paid!', final.data.transaction_id);
}
```

### Look Up Payments

```typescript
// By reference
const payment = await paynexus.payments.getByReference('PAY-ABC123');

// By ID
const payment = await paynexus.payments.getById(42);

// List with filters
const payments = await paynexus.payments.list({
  status: 'completed',
  phone: '254712345678',
  page: 1,
  per_page: 20,
});
// payments.data       → PaymentData[]
// payments.pagination → { page, per_page, total }
```

## Error Handling

The SDK throws specific error types so you can handle each case:

```typescript
import PayNexus, {
  AuthenticationError,
  ValidationError,
  RateLimitError,
  APIConnectionError,
} from 'paynexus';

try {
  await paynexus.payments.initiate({ amount: 1500, phone: '254712345678' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    // 401 — invalid or missing API key
    console.error('Bad API key:', error.message);
  } else if (error instanceof ValidationError) {
    // 400 — invalid request data
    console.error('Invalid data:', error.message);
  } else if (error instanceof RateLimitError) {
    // 429 — too many requests
    console.error('Slow down:', error.message);
  } else if (error instanceof APIConnectionError) {
    // Network error — could not reach PayNexus
    console.error('Network issue:', error.message);
  }

  // All PayNexus errors include a requestId for debugging
  if (error instanceof PayNexusError) {
    console.error('Request ID:', error.requestId);
  }
}
```

| Error Class | HTTP Status | When |
|---|---|---|
| `AuthenticationError` | 401 | Invalid or missing API key |
| `ValidationError` | 400 | Invalid request parameters |
| `RateLimitError` | 429 | Too many requests |
| `APIConnectionError` | 503 | Cannot reach PayNexus API |
| `WebhookVerificationError` | 403 | Invalid webhook signature |

## Webhooks

PayNexus sends webhook events to your server when payment status changes. The SDK provides a Stripe-like `constructEvent()` method to verify and parse them.

### Verify and Parse Webhook Events

```typescript
import PayNexus, { WebhookVerificationError } from 'paynexus';

const paynexus = new PayNexus({
  secretKey: 'sk_live_...',
  webhookSecret: 'whsec_your_webhook_secret',
});

app.post('/webhooks/paynexus', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-paynexus-signature'] as string;
  const timestamp = req.headers['x-paynexus-timestamp'] as string;

  try {
    // Verifies HMAC-SHA256 signature + timestamp, then parses JSON
    const event = paynexus.webhooks.constructEvent(
      req.body.toString(),
      signature,
      timestamp
    );

    switch (event.event) {
      case 'payment.completed':
        const { payment, transaction_id } = event.data;
        console.log(`Payment ${payment.reference} completed (${transaction_id})`);
        break;

      case 'payment.failed':
        console.log(`Payment failed: ${event.data.failure_reason}`);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      res.status(403).json({ error: 'Invalid signature' });
    } else {
      res.status(500).json({ error: 'Internal error' });
    }
  }
});
```

### Express Middleware (Alternative)

For a simpler setup, use the built-in middleware:

```typescript
import express from 'express';
import PayNexus from 'paynexus';
import { createWebhookMiddleware } from 'paynexus/webhooks';

const app = express();

const paynexus = new PayNexus({
  secretKey: 'sk_live_...',
  webhookSecret: 'whsec_...',
});

app.post(
  '/webhooks/paynexus',
  express.raw({ type: 'application/json' }),
  createWebhookMiddleware({
    secret: 'whsec_...',
    client: paynexus,  // Optional — enables event emitter
  })
);

// If you passed `client`, you can listen for events:
paynexus.on('webhook.received', (event) => {
  console.log('Webhook:', event.event, event.data);
});
```

### Test Webhooks Locally

Generate a valid signature for local testing:

```typescript
const payload = JSON.stringify({
  event: 'payment.completed',
  data: {
    payment: { reference: 'PAY-TEST-123', amount: 1500, status: 'completed' },
    transaction_id: 'tx_test_456',
  },
});

const signature = paynexus.webhooks.generateTestSignature(payload);

// Use this signature in your test HTTP request:
// curl -X POST http://localhost:3000/webhooks/paynexus \
//   -H "x-paynexus-signature: $signature" \
//   -H "Content-Type: application/json" \
//   -d "$payload"
```

### Webhook Event Types

| Event | Description |
|---|---|
| `payment.completed` | Payment confirmed by M-Pesa |
| `payment.failed` | Payment failed or was cancelled |

### Manage Webhooks via API

```typescript
// Register a new webhook endpoint
await paynexus.webhooks.register(
  'My Webhook',
  'https://example.com/webhooks/paynexus',
  ['payment.completed', 'payment.failed']
);

// List all webhooks
const webhooks = await paynexus.webhooks.list();

// Update a webhook
await paynexus.webhooks.update(1, {
  url: 'https://example.com/new-webhook-url',
  events: ['payment.completed'],
});

// Delete a webhook
await paynexus.webhooks.delete(1);
```

## Merchant Info

```typescript
// Get your merchant profile
const merchant = await paynexus.merchant.get();

// List your businesses
const businesses = await paynexus.merchant.getBusinesses();

// List your payment accounts (M-Pesa till numbers, etc.)
const accounts = await paynexus.merchant.getPaymentAccounts();
```

## Event Emitter

The client extends an event emitter. Listen for events programmatically:

```typescript
paynexus.onPaymentCompleted((data) => {
  console.log('Payment completed:', data.payment.reference);
});

paynexus.onPaymentFailed((data) => {
  console.log('Payment failed:', data.reason);
});

paynexus.onWebhookReceived((event) => {
  console.log('Webhook event:', event.event);
});
```

## CLI Tools

The SDK includes CLI commands for local webhook development:

```bash
# Listen for webhooks on port 3000
npx paynexus listen --port 3000

# Forward webhooks to your local server
npx paynexus forward http://localhost:3000/webhooks/paynexus

# Listen and forward in one command
npx paynexus listen --forward-to http://localhost:3000/webhooks/paynexus
```

## Advanced Usage

### Cancel a Request

```typescript
const controller = new AbortController();

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5_000);

const result = await paynexus.payments.initiate(
  { amount: 1500, phone: '254712345678' },
  { signal: controller.signal }
);
```

### Custom HTTP Client

Bring your own Axios instance for proxies, custom TLS, or logging:

```typescript
import axios from 'axios';
import PayNexus from 'paynexus';

const httpClient = axios.create({
  httpsAgent: new https.Agent({ ca: customCA }),
  proxy: { host: '10.0.0.1', port: 8080 },
});

const paynexus = new PayNexus({
  secretKey: 'sk_live_...',
  httpClient,
});
```

### Idempotency

By default, every `payments.initiate()` call gets an auto-generated idempotency key to prevent duplicate charges. You can also pass your own:

```typescript
await paynexus.payments.initiate({
  amount: 1500,
  phone: '254712345678',
  idempotencyKey: 'order-123-attempt-1',  // Your own key
});
```

To disable auto-idempotency:

```typescript
const paynexus = new PayNexus({
  secretKey: 'sk_live_...',
  autoIdempotency: false,
});
```

## TypeScript

The SDK is written in TypeScript and exports all types:

```typescript
import type {
  PayNexusConfig,
  InitiatePaymentData,
  PaymentData,
  PaymentResponse,
  PaymentsListResponse,
  PaymentFilters,
  PollOptions,
  RequestOptions,
  MerchantResponse,
  WebhookResponse,
  WebhookEvent,
  PaymentCompletedWebhook,
  PaymentFailedWebhook,
} from 'paynexus';
```

## License

MIT

## Support

- Email: support@paynexus.co.ke
- Website: https://www.paynexus.co.ke
- Issues: https://github.com/PAYNEXUS-SOLUTIONS/paynexus/issues
