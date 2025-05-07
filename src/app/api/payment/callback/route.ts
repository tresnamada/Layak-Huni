import { NextResponse } from 'next/server';
import { updatePurchaseStatus } from '@/services/purchaseService';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Verify the transaction status from Midtrans
    const transactionStatus = data.transaction_status;
    const purchaseId = data.custom_field1; // We'll need to pass this from the frontend

    // Update purchase status based on transaction status
    let status: 'completed' | 'cancelled' | 'pending';
    switch (transactionStatus) {
      case 'capture':
      case 'settlement':
        status = 'completed';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        status = 'cancelled';
        break;
      default:
        status = 'pending';
    }

    // Update the purchase status in our database
    await updatePurchaseStatus(purchaseId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 