import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap client
const snap = new midtransClient.Snap({
  isProduction: false, // Set to true for production
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || ''
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      itemName,
      firstName,
      lastName,
      email,
      phone
    } = body;

    // Create transaction token
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      item_details: [{
        id: orderId,
        price: amount,
        quantity: 1,
        name: itemName
      }],
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone
      },
      credit_card: {
        secure: true
      }
    };

    const token = await snap.createTransaction(parameter);

    return NextResponse.json({ token: token.token }, { status: 200 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { message: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 