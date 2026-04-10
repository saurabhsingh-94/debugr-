'use client';

import { useState } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Rocket, AlertCircle, Loader2 } from 'lucide-react';
import Magnetic from '@/components/animation/Magnetic';

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
        `${API_URL}/api/payments/create-order`,
        {
          orderAmount: amount,
          orderCurrency: 'INR',
          customerDetails
        },
        { withCredentials: true }
      );

      if (!res.data.success || !res.data.data.payment_session_id) {
        throw new Error(res.data.error || 'Failed to initialize session');
      }

      const { payment_session_id, order_id } = res.data.data;

      // 2. Initialize Cashfree SDK
      const cashfree = await load({
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PROD' ? 'production' : 'sandbox'
      });

      // 3. Initiate checkout
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        returnUrl: `${window.location.origin}/add-funds/status?order_id=${order_id}`
      };

      await cashfree.checkout(checkoutOptions);

    } catch (error: unknown) {
      console.error("Payment Error:", error);
      const msg = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : (error instanceof Error ? error.message : 'Failed to initiate payment');
      
      // Check for specific Cashfree config error
      if (msg.includes('gateway') || msg.includes('credential')) {
        setErrorMsg('Payment Gateway not configured correctly. Please contact administrator.');
      } else {
        setErrorMsg(msg);
      }
      
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-start gap-4"
          >
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Security Fault</p>
              <p className="text-xs font-medium italic text-red-500/60 leading-relaxed">{errorMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Magnetic strength={0.1}>
        <motion.button
          onClick={handlePayment}
          disabled={loading || amount <= 0}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            w-full py-8 px-10 rounded-[32px] font-black uppercase tracking-[0.4em] italic text-xs 
            flex items-center justify-center gap-4 transition-all overflow-hidden relative group
            ${loading ? 'bg-white/10 text-white/20' : 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.15)] hover:shadow-[0_25px_50px_rgba(255,255,255,0.2)]'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Protocol...
            </>
          ) : (
            <>
              Inject Capital <Rocket size={18} />
            </>
          )}
          
          {/* Subtle reflection effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </motion.button>
      </Magnetic>
      
      <div className="flex items-center justify-center gap-6 opacity-20 filter grayscale">
         <div className="flex items-center gap-2">
            <CreditCard size={12} />
            <span className="text-[8px] font-mono font-black uppercase tracking-widest italic">Visa / MC</span>
         </div>
         <div className="w-1 h-1 rounded-full bg-white/20" />
         <div className="flex items-center gap-2">
            <Rocket size={12} />
            <span className="text-[8px] font-mono font-black uppercase tracking-widest italic">UPI Nodes</span>
         </div>
      </div>
    </div>
  );
}
