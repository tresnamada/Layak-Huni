// Define types for Midtrans Snap
interface SnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status: string;
  pdf_url?: string;
  finish_redirect_url?: string;
}

interface Snap {
  pay(token: string, options?: {
    onSuccess?(result: SnapResult): void;
    onPending?(result: SnapResult): void;
    onError?(result: SnapResult): void;
    onClose?(): void;
  }): void;
}

declare global {
  interface Window {
    snap: Snap;
  }
}

interface PaymentDetails {
  orderId: string;
  amount: number;
  itemName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const initializeMidtransPayment = async (paymentDetails: PaymentDetails) => {
  try {
    // Call your backend API to get the transaction token
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentDetails),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    // Load Midtrans Snap library
    const snap = window.snap;
    
    // Open Midtrans Snap payment page
    snap.pay(data.token, {
      onSuccess: function(result: SnapResult) {
        console.log('Payment success:', result);
        // Only redirect on success
        window.location.href = '/Profile?tab=purchases';
      },
      onPending: function(result: SnapResult) {
        console.log('Payment pending:', result);
        // Show pending message to user
        alert('Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.');
      },
      onError: function(result: SnapResult) {
        console.error('Payment error:', result);
        // Show error message to user
        alert('Terjadi kesalahan saat pembayaran. Silakan coba lagi.');
      },
      onClose: function() {
        console.log('Customer closed the popup without finishing the payment');
        // Show message to user
        alert('Pembayaran dibatalkan. Silakan coba lagi jika ingin melanjutkan pembelian.');
      }
    });

  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
}; 