"use client";

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { motion } from 'framer-motion';
import { IndianRupee, DollarSign, RefreshCw } from 'lucide-react';

const CurrencySwitcher = () => {
  const { currency, toggleCurrency, loading } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="relative group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all duration-300 backdrop-blur-md overflow-hidden"
      title={`Switch to ${currency === 'USD' ? 'INR' : 'USD'}`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-center gap-1.5">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500">
          {currency === 'USD' ? (
            <DollarSign className="w-3 h-3" />
          ) : (
            <IndianRupee className="w-3 h-3" />
          )}
        </div>
        
        <span className="text-xs font-mono font-bold text-white/70 group-hover:text-amber-400 transition-colors">
          {currency}
        </span>

        <motion.div
          animate={{ rotate: loading ? 360 : 0 }}
          transition={{ repeat: loading ? Infinity : 0, duration: 1, ease: "linear" }}
        >
          <RefreshCw className={`w-3 h-3 text-white/30 group-hover:text-amber-500/50 transition-colors ${loading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </motion.div>
      </div>

      {/* Subtle border shine */}
      <div className="absolute inset-0 rounded-full border border-white/0 group-hover:border-amber-500/20 transition-all duration-500" />
    </button>
  );
};

export default CurrencySwitcher;
