import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Verify the transaction status from Midtrans
    const transactionStatus = data.transaction_status;
    const purchaseId = data.custom_field1; // We'll need to pass this from the frontend
    const orderId = data.order_id;

    if (!purchaseId || !orderId) {
      throw new Error('Missing purchase ID or order ID');
    }

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

    // Update the purchase status in Firestore
    const purchaseRef = doc(db, 'purchases', purchaseId);
    await updateDoc(purchaseRef, {
      status,
      paymentStatus: transactionStatus,
      updatedAt: new Date(),
      paymentDetails: {
        orderId,
        transactionStatus,
        paymentTime: new Date(),
        paymentMethod: data.payment_type,
        ...data
      }
    });

    // Return success response
    return NextResponse.json({ 
      success: true,
      status,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
} 