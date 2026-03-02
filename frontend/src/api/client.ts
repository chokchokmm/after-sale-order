import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const AUTH_STORAGE_KEY = "auth_user";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add username header
api.interceptors.request.use(
  (config) => {
    // Add X-Username header from localStorage (URL encoded for non-ASCII chars)
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.username) {
          // Encode username to handle non-ASCII characters (e.g., Chinese)
          config.headers["X-Username"] = encodeURIComponent(user.username);
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data as { message?: string } | undefined;
    const message = data?.message || error.message || "An error occurred";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
