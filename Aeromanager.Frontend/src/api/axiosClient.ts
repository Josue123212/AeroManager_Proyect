import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5140/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aeromanager_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aeromanager_token');
      localStorage.removeItem('aeromanager_user');
    }
    return Promise.reject(error);
  }
);

/**
 * Extrae el mensaje de error legible devuelto por ExceptionHandlingMiddleware (detail)
 * o por las validaciones de FluentValidation / ModelState.
 */
export function extractApiError(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (data?.errors && typeof data.errors === 'object') {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey][0]) {
      return data.errors[firstKey][0];
    }
  }
  if (typeof data?.title === 'string' && data.title.trim()) return data.title;
  return fallback;
}

export default axiosClient;
