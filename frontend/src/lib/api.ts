const rawUrl = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'undefined') 
  ? process.env.NEXT_PUBLIC_API_URL 
  : 'https://debugr-backend-production.up.railway.app';

// Sanitize URL: Ensure it starts with https:// if it doesn't already have a protocol
const sanitizeUrl = (url: string) => {
  if (!url) return '';
  let sanitized = url.trim();
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = `https://${sanitized}`;
  }
  // Remove trailing slashes
  return sanitized.replace(/\/+$/, '');
};

export const API_URL = sanitizeUrl(rawUrl);

if (typeof window !== 'undefined') {
  console.log('🌐 [Debugr] Using API URL:', API_URL);
}

// Cookie Helpers
export function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  if (name === 'debugr_token' && typeof window !== 'undefined') {
    localStorage.setItem(name, value);
  }
}

export function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
  
  // Hardened Fallback for Debugr Token
  if (name === 'debugr_token' && typeof window !== 'undefined') {
    return localStorage.getItem(name) || '';
  }
  
  return '';
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  if (name === 'debugr_token' && typeof window !== 'undefined') {
    localStorage.removeItem(name);
  }
}

/**
 * Enhanced fetch with Bearer token authentication
 * Retrieves token from Cookies -> LocalStorage
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Try cookie first, then localStorage
  let token = typeof window !== 'undefined' ? getCookie('debugr_token') : null;
  
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('debugr_token');
  }
  
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  // Development logging to catch auth issues early
  if (process.env.NODE_ENV === 'development' && !token) {
    console.warn(`⚠️ [Auth Shield] No token found for request: ${endpoint}. This may fail on protected routes.`);
  }

  // Only set Content-Type if not already specified and not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      deleteCookie('debugr_token');
      localStorage.removeItem('debugr_token');
    }
  }

  return response;
}


export const API_ENDPOINTS = {
  REPORTS: '/api/reports',
  MY_REPORTS: '/api/reports/my-reports',
  LEADERBOARD: '/api/users/leaderboard',
  PROFILE: '/api/users/profile/me',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
};
