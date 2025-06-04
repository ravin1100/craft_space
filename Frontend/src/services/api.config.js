import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://192.168.1.227:8080/api', // Directly point to backend server
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies/auth
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Store the original URL for logging
    const originalUrl = config.url;
    
    // Don't modify the URL if it's already absolute or already has /api prefix
    if (config.url.startsWith('http') || config.url.startsWith('/api')) {
      return config;
    }
    
    // Add leading slash if not present
    if (!config.url.startsWith('/')) {
      config.url = `/${config.url}`;
    }
    
    // Add auth token for all requests except auth endpoints
    const isAuthEndpoint = originalUrl?.includes('/login');
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('notion_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Ensure we have the right content type
    if (!config.headers['Content-Type'] && (config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Add CORS headers
    config.headers['Accept'] = 'application/json';
    
    // Log request in development
    // if (import.meta.env.DEV) {
    //   console.log(`%c ${config.method?.toUpperCase()} ${originalUrl} -> ${config.url}`, 'color: #4CAF50; font-weight: bold', {
    //     baseURL: config.baseURL,
    //     url: config.url,
    //     method: config.method,
    //     headers: {
    //       ...config.headers,
    //       // Don't log the token if it exists
    //       Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : undefined,
    //     },
    //     data: config.data,
    //     params: config.params
    //   });
    // }

    console.log('config', config);
    
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // if (import.meta.env.DEV) {
    //   console.log(`%c ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, 'color: #4CAF50; font-weight: bold', {
    //     status: response.status,
    //     statusText: response.statusText,
    //     data: response.data,
    //     headers: response.headers,
    //     config: {
    //       baseURL: response.config.baseURL,
    //       url: response.config.url,
    //       method: response.config.method,
    //       headers: response.config.headers,
    //     }
    //   });
    // }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        response: error.response?.data,
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        },
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        stack: error.stack
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Handle token expiration or invalid token
      if (error.config && !error.config.__isRetryRequest) {
        // TODO: Handle token refresh if needed
      }

      // Clear auth data and redirect to login
      localStorage.removeItem('notion_token');
      localStorage.removeItem('notion_user');
      window.location.href = '/login';

      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    if (!error.config?.skipErrorHandler) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api; 