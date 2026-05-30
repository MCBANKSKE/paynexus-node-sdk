<div align="center">

# 💳 PayNexus Node.js SDK

**Official Node.js SDK for the [PayNexus](https://www.paynexus.co.ke) payment platform**

Accept M-Pesa STK Push payments, manage webhooks, and query merchant data from your Node.js application.

[![npm version](https://badge.fury.io/js/paynexus.svg)](https://www.npmjs.com/package/paynexus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)

</div>

---

## ✨ Features

- 🚀 **Simple & Intuitive** - Clean, developer-friendly API design
- 🔒 **Type-Safe** - Full TypeScript support with exported types
- ⚡ **Fast & Reliable** - Built on modern HTTP with timeout handling
- 🔔 **Webhook Support** - Easy webhook verification with middleware
- 🛡️ **Error Handling** - Typed errors for precise error handling
- 📱 **M-Pesa Integration** - Seamless STK Push payment processing
- 🔑 **API Key Management** - Create, update, and manage API keys
- 📊 **Merchant Data** - Query businesses and payment accounts

---

## 📦 Installation

```bash
npm install paynexus
```

**Requirements:** Node.js 18 or later

---

## 🚀 Quick Start

### 🔑 Setup

Get your API keys from the [PayNexus dashboard](https://www.paynexus.co.ke).

#### 1️⃣ Create a `.env` file

```bash
# .env
PAYNEXUS_SECRET_KEY=sk_live_your_secret_key
PAYNEXUS_WEBHOOK_SECRET=whsec_your_webhook_secret   # Only needed if using webhooks
```

#### 2️⃣ Install `dotenv`

```bash
npm install dotenv
```

#### 3️⃣ Initialise the client

```typescript
import 'dotenv/config';
import PayNexus from 'paynexus';

const paynexus = new PayNexus({
  secretKey: process.env.PAYNEXUS_SECRET_KEY!,
  webhookSecret: process.env.PAYNEXUS_WEBHOOK_SECRET,
});
```

> 💡 **Framework users:** Next.js, Nuxt, and Remix load `.env` automatically — skip `dotenv`.

---

### 💰 Accept a Payment

```typescript
const payment = await paynexus.payments.initiate({
  payment_account_id: 1,       // Your M-Pesa payment account ID
  amount: 500,                 // Amount in KES (1–150 000)
  phone: '254712345678',       // Customer phone number
  description: 'Order #1234',
});

console.log(payment.data);
// {
//   payment_id: 42,
//   reference: 'PAY-abc123',
//   checkout_request_id: 'ws_CO_...',
//   status: 'pending',
//   customer_message: 'Success. Request accepted for processing',
//   ...
// }
```

---

## 📚 API Reference

### 💳 Payments

```typescript
// Initiate STK Push
const result = await paynexus.payments.initiate({
  payment_account_id: 1,
  amount: 500,
  phone: '254712345678',
  description: 'Order payment',
});

// Check payment status by reference
const byRef = await paynexus.payments.getByReference('PAY-abc123');

// Check payment status by ID
const byId = await paynexus.payments.getById(42);

// Check payment status by M-Pesa CheckoutRequestID
const byCheckout = await paynexus.payments.getByCheckoutId({
  checkout_request_id: 'ws_CO_123456',
});

// List payments (with optional filters)
const list = await paynexus.payments.list({
  status: 'completed',
  payment_method: 'mpesa',
  from_date: '2025-01-01',
  to_date: '2025-12-31',
  per_page: 50,
});
```

### 🔔 Webhooks

```typescript
// Register a new webhook
const hook = await paynexus.webhooks.register({
  name: 'Payment alerts',
  url: 'https://example.com/webhooks/paynexus',
  events: ['payment.completed', 'payment.failed'],
});
// hook.data.secret → save this, it is only shown once

// Update a webhook
await paynexus.webhooks.update(hook.data!.id, {
  events: ['payment.completed', 'payment.failed', 'invoice.paid'],
});

// List all webhooks
const hooks = await paynexus.webhooks.list();

// Delete a webhook
await paynexus.webhooks.delete(hook.data!.id);
```

**Available webhook events:**

| Event | Description |
|-------|-------------|
| `payment.completed` | Payment succeeded |
| `payment.failed` | Payment failed |
| `payment.initiated` | STK Push sent to customer |
| `invoice.created` | Invoice created |
| `invoice.paid` | Invoice paid |
| `invoice.overdue` | Invoice overdue |
| `account.created` | Account created |
| `account.updated` | Account updated |
| `subscription.created` | Subscription created |
| `subscription.canceled` | Subscription canceled |

### 🏪 Merchant

```typescript
// Get your merchant info
const me = await paynexus.merchant.get();

// List your businesses
const businesses = await paynexus.merchant.businesses();

// List your M-Pesa payment accounts
const accounts = await paynexus.merchant.paymentAccounts();
```

### 🔑 API Keys

```typescript
// Create a new API key
const key = await paynexus.apiKeys.create({
  name: 'Production key',
  payment_account_id: 1,
  permissions: ['payments.create', 'payments.read'],
});
// key.data.api_key → save this, it is only shown once

// List API keys
const keys = await paynexus.apiKeys.list();

// Update an API key
await paynexus.apiKeys.update(key.data!.id, {
  name: 'Renamed key',
  status: 'inactive',
});

// Delete an API key
await paynexus.apiKeys.delete(key.data!.id);
```

---

## 🔐 Webhook Verification

PayNexus signs every webhook with HMAC-SHA256. Verify incoming webhooks to ensure they are authentic:

### Option A — Manual Verification

```typescript
import PayNexus from 'paynexus';

const paynexus = new PayNexus({
  secretKey: process.env.PAYNEXUS_SECRET_KEY!,
  webhookSecret: process.env.PAYNEXUS_WEBHOOK_SECRET!,
});

// In your webhook handler:
const rawBody = req.body;  // raw string or Buffer
const signature = req.headers['x-paynexus-signature'];
const timestamp = req.headers['x-paynexus-timestamp'];

const event = paynexus.verifyWebhook(rawBody, signature, timestamp);

switch (event.event) {
  case 'payment.completed':
    console.log('Payment completed:', event.data);
    break;
  case 'payment.failed':
    console.log('Payment failed:', event.data);
    break;
}
```

### Option B — Express Middleware

```typescript
import express from 'express';
import { webhookMiddleware } from 'paynexus/webhooks';

const app = express();

app.post(
  '/webhooks/paynexus',
  express.raw({ type: 'application/json' }),
  webhookMiddleware({ secret: process.env.PAYNEXUS_WEBHOOK_SECRET! }),
  (req, res) => {
    const event = req.webhookPayload;
    console.log(`Received ${event.event}:`, event.data);
    res.json({ received: true });
  },
);
```

### Option C — Standalone Function

```typescript
import { verifyWebhookSignature } from 'paynexus';

const event = verifyWebhookSignature(rawBody, signature, timestamp, webhookSecret, {
  tolerance: 300_000,  // 5 minutes (default)
});
```

---

## ⚠️ Error Handling

The SDK throws typed errors you can catch individually:

```typescript
import PayNexus, {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  PayNexusError,
} from 'paynexus';

try {
  await paynexus.payments.initiate({ ... });
} catch (err) {
  if (err instanceof AuthenticationError) {
    // 401 — Invalid or missing API key
  } else if (err instanceof ValidationError) {
    // 422 — Invalid input; err.errors has field-level details
    console.log(err.errors); // { phone: ['Invalid phone number'] }
  } else if (err instanceof NotFoundError) {
    // 404 — Resource not found
  } else if (err instanceof RateLimitError) {
    // 429 — Too many requests
  } else if (err instanceof PayNexusError) {
    // Other API error; check err.status and err.code
  }
}
```

---

## ⚙️ Configuration

```typescript
const paynexus = new PayNexus({
  secretKey: 'sk_live_...',           // Required
  webhookSecret: 'whsec_...',        // For webhook verification
  baseUrl: 'https://api.paynexus.co.ke/api',  // Default
  timeout: 30_000,                    // Request timeout in ms (default: 30s)
});
```

All resource methods accept an optional `RequestOptions` parameter:

```typescript
const controller = new AbortController();

const payment = await paynexus.payments.getByReference('PAY-123', {
  signal: controller.signal,  // AbortSignal for cancellation
  timeout: 10_000,            // Per-request timeout override
});
```

---

## 🔑 Authentication

The SDK authenticates using your secret API key (`sk_...`) sent via the `X-API-Key` header. Secret keys have write access (payments, webhooks, API key management). Never expose your secret key in client-side code.

---

## 📘 TypeScript

The SDK is written in TypeScript and exports all types:

```typescript
import type {
  PayNexusConfig,
  InitiatePaymentParams,
  Payment,
  PaymentData,
  PaymentStatus,
  Webhook,
  WebhookEvent,
  WebhookPayload,
  Merchant,
  Business,
  PaymentAccount,
  ApiKey,
  ApiResponse,
  Pagination,
} from 'paynexus';
```

---

## 📄 License

MIT © [PayNexus](https://www.paynexus.co.ke)

---

## 🤝 Support

- 📖 [Documentation](https://www.paynexus.co.ke/docs)
- 🐛 [Report Issues](https://github.com/paynexus/paynexus-node-sdk/issues)
- 💬 [Contact Support](https://www.paynexus.co.ke/contact)

---

<div align="center">

**Built with ❤️ by [PayNexus](https://www.paynexus.co.ke)**

</div>
