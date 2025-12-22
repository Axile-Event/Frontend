import axios from "axios";
import useAuthStore from "../store/authStore";

const api = axios.create({
  // Prefer NEXT_PUBLIC_API_URL from environment; fall back to the provided endpoint
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if the error is specifically about the token being invalid
      const errorMessage =
        error.response.data?.detail || error.response.data?.code;
      if (
        errorMessage === "Given token not valid for any token type" ||
        errorMessage === "token_not_valid"
      ) {
        useAuthStore.getState().logout();
        // Optionally redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
