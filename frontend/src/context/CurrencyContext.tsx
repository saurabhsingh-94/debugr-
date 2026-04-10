"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  rate: number;
  formatPrice: (usdPrice: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rate, setRate] = useState<number>(83.5); // Default fallback
  const [loading, setLoading] = useState(true);

  // Load preference from local storage
  useEffect(() => {
    const saved = localStorage.getItem('debugr_currency') as Currency;
    if (saved && (saved === 'USD' || saved === 'INR')) {
      setCurrency(saved);
    }
  }, []);

  // Fetch live rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setLoading(true);
        // Using a reliable free API for exchange rates
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.data && response.data.rates && response.data.rates.INR) {
          setRate(response.data.rates.INR);
          console.log(`🌐 [Currency] Live rate updated: 1 USD = ${response.data.rates.INR} INR`);
        }
      } catch (error) {
        console.error('Failed to fetch live currency rate:', error);
        // Fallback to average rate already in state
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
    // Refresh rate every hour
    const interval = setInterval(fetchRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  const toggleCurrency = () => {
    const next: Currency = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(next);
    localStorage.setItem('debugr_currency', next);
  };

  const formatPrice = (usdPrice: number) => {
    if (currency === 'INR') {
      const inrValue = usdPrice * rate;
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(inrValue);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(usdPrice);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, rate, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
