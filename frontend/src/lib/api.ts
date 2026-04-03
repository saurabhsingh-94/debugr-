const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('debugr_token') : null;
  
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
    // Optional: Redirect to login or clear token
    if (typeof window !== 'undefined') {
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
