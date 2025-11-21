/**
 * Axios client configuration with interceptors and error handling
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', error);

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 401:
          console.error('Unauthorized');
          // Redirect to login if needed
          break;
        case 403:
          console.error('Forbidden');
          break;
        case 404:
          console.error('Not Found');
          break;
        case 422:
          console.error('Validation Error:', data.detail);
          break;
        case 500:
          console.error('Server Error');
          break;
        default:
          console.error(`Error ${status}:`, data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server. Check if backend is running.');
    } else {
      // Error in request configuration
      console.error('Request configuration error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    if (axiosError.response?.data?.detail) {
      if (typeof axiosError.response.data.detail === 'string') {
        return axiosError.response.data.detail;
      }
      if (Array.isArray(axiosError.response.data.detail)) {
        return axiosError.response.data.detail
          .map((err: any) => err.msg || err.message)
          .join(', ');
      }
    }
    
    return axiosError.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};
