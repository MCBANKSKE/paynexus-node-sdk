import PayNexus from 'paynexus';

const client = new PayNexus({
  secretKey: process.env.PAYNEXUS_SECRET_KEY || 'your-secret-key',
  baseUrl: 'https://paynexus.co.ke',
  autoIdempotency: true
});

async function main() {
  try {
    // Initiate payment
    const result = await client.payments.initiate({
      amount: 1500,
      phone: '254712345678',
      description: 'Payment for order #123'
    });

    console.log('Payment initiated:', result);

    if (result.success && result.data) {
      // Poll for completion
      const final = await client.payments.poll(result.data.checkout_request_id || '', {
        timeout: 120000,
        interval: 3000
      });
      console.log('Final status:', final);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
