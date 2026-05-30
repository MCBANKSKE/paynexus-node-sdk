import express from 'express';
import PayNexus from 'paynexus';
import { createWebhookMiddleware } from 'paynexus/webhooks';

const app = express();

// Initialize client
const client = new PayNexus({
  secretKey: process.env.PAYNEXUS_SECRET_KEY || 'your-secret-key',
  baseUrl: 'https://paynexus.co.ke',
  webhookSecret: process.env.PAYNEXUS_WEBHOOK_SECRET || 'your-webhook-secret'
});

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Webhook endpoint
app.post('/webhook/paynexus',
  createWebhookMiddleware({
    secret: process.env.PAYNEXUS_WEBHOOK_SECRET || 'your-webhook-secret',
    client: client
  })
);

// Payment initiation endpoint
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const result = await client.payments.initiate(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Listen to events
client.on('payment.completed', (data) => {
  console.log('Payment completed!', data);
  // Update your database, send email, etc.
});

client.on('payment.failed', (data) => {
  console.log('Payment failed!', data);
  // Handle failed payment
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
