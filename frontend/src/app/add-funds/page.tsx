'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import CashfreeCheckout from '@/components/payment/CashfreeCheckout';

export default function AddFundsPage() {
  const [amount, setAmount] = useState<number>(1000);
  const [phone, setPhone] = useState<string>('9999999999');

  return (
    <div style={{ background: '#111111', minHeight: '100vh', color: '#f0f0f0' }}>
      <Navbar />
      
      <main style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Add Funds</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>
          Deposit funds to your company account to pay out bounties.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
            Amount (INR)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1c1c1c',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ccc' }}>
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1c1c1c',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        <CashfreeCheckout 
          amount={amount} 
          customerDetails={{
            customer_id: 'cust_12345', 
            customer_phone: phone,
            customer_name: 'Test Company' // Replace with actual logged-in user details
          }} 
        />
      </main>
    </div>
  );
}
