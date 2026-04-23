import axios from 'axios';
import toast from 'react-hot-toast';

// Get API URL from env or fallback to local port
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true, // For refresh token cookies if used
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (e.g., 401s)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Global UI Error Toasts (400, 500, etc.) except for 401 which is handled by refresh logic
    if (error.response && error.response.status !== 401) {
      const message = error.response.data?.message || 'Lỗi kết nối Server';
      toast.error(message);
    }

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        // Note: we use axios directly to avoid interceptor loop
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const newToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Only redirect to login if we are actually trying to access a protected route
          // Don't forcefully kick out guests browsing the homepage or feed
          const isPublicRoute = originalRequest.url?.includes('/videos') && originalRequest.method?.toLowerCase() === 'get';
          if (!isPublicRoute) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
