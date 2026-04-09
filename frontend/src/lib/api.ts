const API_BASE = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'undefined') 
  ? process.env.NEXT_PUBLIC_API_URL 
  : ''; // Relative to current domain or hardcoded

export const API_URL = API_BASE || 'https://debugr-backend-production.up.railway.app';

if (typeof window !== 'undefined') {
  console.log('🌐 [Debugr] Using API URL:', API_URL);
}

// Cookie Helpers
export function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? getCookie('debugr_token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      deleteCookie('debugr_token');
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
