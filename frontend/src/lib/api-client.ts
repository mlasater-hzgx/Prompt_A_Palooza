import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor - will add Bearer token from MSAL
apiClient.interceptors.request.use((config) => {
  // TODO: Get token from MSAL instance
  // const token = msalInstance.getActiveAccount()...
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - unwrap envelope
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
