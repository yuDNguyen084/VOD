import axios from 'axios';

// Get API URL from env or fallback to local port
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true, // For refresh token cookies if used
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // We will retrieve the token from localStorage or a generic token store
    // Ensure we run only on the client side
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

    // Handle 401 Unauthorized globally
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh token
        // In a real app we'd call the refresh endpoint here
        // const res = await axios.post(`${baseURL}/auth/refresh`);
        // const newToken = res.data.token;
        // localStorage.setItem('token', newToken);
        // api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        // return api(originalRequest);
        
        // For now, if unauthorized, emit an event or clear local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Optional: window.location.href = '/login';
        }
      } catch (refreshError) {
        // If refresh fails, log out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
