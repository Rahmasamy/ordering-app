import axios from 'axios';

// Create a custom API client with credentials automatically enabled for httpOnly cookies
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure standard interceptor for logging/JWT/cookie refreshes
api.interceptors.request.use(
  (config) => {
    // In a real environment, the browser sends HTTP-only cookies automatically.
    // If we use JWT in localstorage as fallback, we could set headers here:
    // const token = localStorage.getItem('auth_token');
    // if (token) { config.headers.Authorization = `Bearer ${token}`; }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] Success: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.response?.data || error.message);
    
    // Global error interceptor handling (e.g. redirect to login on 401 unauthenticated)
    if (error.response?.status === 401) {
      console.warn('Authentication token expired or missing. Session ended.');
    }
    
    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected API error occurred',
      originalError: error,
    });
  }
);
export default api;
