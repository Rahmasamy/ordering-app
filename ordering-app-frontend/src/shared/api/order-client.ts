import axios from 'axios';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Create a custom orderApi client with credentials automatically enabled for httpOnly cookies
export const orderApi = axios.create({
  baseURL: import.meta.env.VITE_API_ORDER_BASE_URL || '/orderApi',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure standard interceptor for logging/JWT/cookie refreshes
orderApi.interceptors.request.use(
  (config) => {
    // Inject the X-Region header required by the ordering-service sharding router
    const region = localStorage.getItem('active_region') || 'eg';
    config.headers['X-Region'] = region;

    // Inject Idempotency-Key header for state-mutating requests (POST, PATCH, PUT)
    if (['post', 'patch', 'put'].includes(config.method?.toLowerCase() || '')) {
      if (!config.headers['Idempotency-Key']) {
        config.headers['Idempotency-Key'] = generateUUID();
      }
    }

    // In a real environment, the browser sends HTTP-only cookies automatically.
    // If we use JWT in localstorage as fallback, we could set headers here:
    // const token = localStorage.getItem('auth_token');
    // if (token) { config.headers.Authorization = `Bearer ${token}`; }
    console.log(`[orderApi Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('[orderApi Request Error]', error);
    return Promise.reject(error);
  }
);

orderApi.interceptors.response.use(
  (response) => {
    console.log(`[orderApi Response] Success: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('[orderApi Response Error]', error.response?.status, error.response?.data || error.message);
    
    // Global error interceptor handling (e.g. redirect to login on 401 unauthenticated)
    if (error.response?.status === 401) {
      console.warn('Authentication token expired or missing. Session ended.');
    }
    
    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected orderApi error occurred',
      originalError: error,
    });
  }
);
export default orderApi;
