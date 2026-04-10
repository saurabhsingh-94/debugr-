'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

import { API_URL } from '@/lib/api';

interface CashfreePayment {
  payment_status: string;
  [key: string]: unknown;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(orderId ? 'loading' : 'failed');
  const [message, setMessage] = useState(orderId ? '' : 'No order ID found');

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/api/payments/verify`,
          { orderId },
          { withCredentials: true }
        );

        const payments = res.data.data;
        const isSuccess = payments.some((p: CashfreePayment) => p.payment_status === 'SUCCESS');

        if (isSuccess) {
          setStatus('success');
          setMessage('Your payment was successful!');
        } else {
          setStatus('failed');
          setMessage('Payment failed or is still pending.');
        }
      } catch (error) {
        setStatus('failed');
        if (axios.isAxiosError(error)) {
          setMessage(error.response?.data?.error || error.message || 'Payment verification failed');
        } else if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage('Payment verification failed due to an unknown error');
        }
      }
    };

    verifyPayment();
  }, [orderId]);

  return (
    <div style={{ background: '#111111', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar />
      
      <main style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        {status === 'loading' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Verifying Payment...</h1>
            <p style={{ color: '#888', marginTop: '16px' }}>Please do not refresh the page.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>
              ✓
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Payment Successful!</h1>
            <p style={{ color: '#888', marginTop: '16px', marginBottom: '32px' }}>{message}</p>
            <Link href="/dashboard" style={{
              padding: '12px 24px', background: '#333', color: '#fff', borderRadius: '6px', textDecoration: 'none'
            }}>Return to Dashboard</Link>
          </div>
        )}

        {status === 'failed' && (
          <div>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(229, 51, 75, 0.1)', color: '#e5334b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>
              !
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Payment Failed</h1>
            <p style={{ color: '#888', marginTop: '16px', marginBottom: '32px' }}>{message}</p>
            <Link href="/add-funds" style={{
              padding: '12px 24px', background: '#e5334b', color: '#fff', borderRadius: '6px', textDecoration: 'none'
            }}>Try Again</Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#111111', minHeight: '100vh', color: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Loading...</h1>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
