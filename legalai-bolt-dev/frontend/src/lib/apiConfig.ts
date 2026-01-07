const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    ...apiConfig.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const buildUrl = (endpoint: string): string => {
  const base = apiConfig.baseURL.endsWith('/')
    ? apiConfig.baseURL.slice(0, -1)
    : apiConfig.baseURL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};
