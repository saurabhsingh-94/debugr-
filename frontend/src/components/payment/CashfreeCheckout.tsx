'use client';

import { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import axios from 'axios';

interface CashfreeCheckoutProps {
  amount: number;
  customerDetails: {
    customer_id: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone: string;
  };
  onSuccess?: (data: Record<string, unknown>) => void;
  onError?: (error: string) => void;
}

export default function CashfreeCheckout({ amount, customerDetails, onSuccess, onError }: CashfreeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Create order on our backend to get payment_session_id
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://debugr-backend-production.up.railway.app'}/api/payments/create-order`,
        {
          orderAmount: amount,
          orderCurrency: 'INR',
          customerDetails
        },
        { withCredentials: true }
      );

      const { payment_session_id } = res.data.data;

      // 2. Initialize Cashfree SDK
      // By default Cashfree loads either sandbox or prod based on the mode
      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PROD' ? 'production' : 'sandbox'
      });

      // 3. Initiate checkout
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        returnUrl: `${window.location.origin}/add-funds/status?order_id={order_id}`
      };

      cashfree.checkout(checkoutOptions);

    } catch (error: unknown) {
      const msg = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : (error instanceof Error ? error.message : 'Failed to initiate payment');
      setErrorMsg(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#1c1c1c', borderRadius: '12px', border: '1px solid #333' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: '#f0f0f0' }}>Add Funds with Cashfree</h3>
      
      {errorMsg && (
        <div style={{ padding: '12px', background: 'rgba(229, 51, 75, 0.1)', color: '#e5334b', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#e5334b',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s'
        }}
      >
        {loading ? 'Processing...' : `Pay \u20B9${amount}`}
      </button>
    </div>
  );
}
