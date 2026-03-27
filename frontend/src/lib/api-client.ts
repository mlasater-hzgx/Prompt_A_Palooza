import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dev user switching support
let devUserId: string | null = null;

export function setDevUserId(id: string | null) {
  devUserId = id;
}

export function getDevUserId(): string | null {
  return devUserId;
}

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  // In dev mode, send the switched user ID header
  if (devUserId) {
    config.headers['X-Dev-User-Id'] = devUserId;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
