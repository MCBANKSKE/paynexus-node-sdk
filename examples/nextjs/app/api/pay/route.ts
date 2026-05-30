import { NextResponse } from 'next/server';
import PayNexus from 'paynexus';

const client = new PayNexus({
  secretKey: process.env.PAYNEXUS_SECRET_KEY || 'your-secret-key',
  baseUrl: 'https://paynexus.co.ke'
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await client.payments.initiate({
      amount: body.amount,
      phone: body.phone,
      description: body.description
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
